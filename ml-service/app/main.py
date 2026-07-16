"""TaskBuddy recommendation model service.

Serves the trained Random Forest pipeline (see train_model.py). The /score
contract matches BACKEND_SCHEMA.md §8: 14 raw feature columns per
job–provider pair; all preprocessing happens inside the persisted pipeline.
"""

import json
import logging
import os
import time
from contextlib import asynccontextmanager
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field

logger = logging.getLogger("uvicorn.error")

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = Path(os.getenv("MODEL_PATH", BASE_DIR / "model" / "rf-a-v1.joblib"))

state: dict = {"pipeline": None, "meta": {}, "started_at": time.time()}


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if MODEL_PATH.exists():
        state["pipeline"] = joblib.load(MODEL_PATH)
        meta_path = MODEL_PATH.parent / f"{MODEL_PATH.stem}.meta.json"
        if meta_path.exists():
            state["meta"] = json.loads(meta_path.read_text())
        logger.info(
            "Loaded model %s from %s",
            state["meta"].get("model_version", MODEL_PATH.stem),
            MODEL_PATH,
        )
    else:
        # Fail fast at scoring time, not silently: /score returns 503 and
        # /health reports model_loaded=false until an artifact is provided.
        logger.error("Model artifact not found at %s — run train_model.py", MODEL_PATH)
    yield


app = FastAPI(title="TaskBuddy Recommendation Service", lifespan=lifespan)


def model_version() -> str:
    return state["meta"].get("model_version", MODEL_PATH.stem)


class FeatureRecord(BaseModel):
    """One job–provider pair. Field names must match the training columns exactly
    — the pipeline selects DataFrame columns by name."""

    skills_match: int = Field(ge=0, le=1)
    distance_km: float
    provider_avg_rating: float
    provider_completed_jobs: int
    provider_availability: int = Field(ge=0, le=1)
    job_idle_duration_hrs: float
    provider_response_time_hrs: float
    provider_years_experience: float
    hour_posted: int = Field(ge=0, le=23)
    provider_skill_category: str
    day_of_week: str
    job_urgency: str
    job_description: str
    provider_bio: str


class ScoreRequest(BaseModel):
    records: list[FeatureRecord]


class ScoreResponse(BaseModel):
    model_version: str
    scores: list[float]


@app.get("/", response_class=HTMLResponse)
def status_page() -> str:
    """Minimalist status page (mirrors the backend's) for opening in a browser."""
    loaded = state["pipeline"] is not None
    meta = state["meta"]
    uptime = int(time.time() - state["started_at"])
    uptime_str = (
        f"{uptime}s" if uptime < 60
        else f"{uptime // 60}m {uptime % 60}s" if uptime < 3600
        else f"{uptime // 3600}h {(uptime % 3600) // 60}m"
    )
    rows = [
        ("service", "up", "running"),
        (
            "model",
            "up" if loaded else "down",
            f"{model_version()} · {meta.get('training_rows', '?'):,} rows"
            if loaded
            else "artifact not loaded",
        ),
    ]
    if loaded and meta.get("holdout_eval"):
        ev = meta["holdout_eval"]
        rows.append(
            ("holdout metrics", "up", f"acc {ev['accuracy']} · roc-auc {ev['roc_auc']}")
        )
    rows_html = "".join(
        f'<div class="row"><span class="dot {cls}"></span>'
        f'<span class="name">{name}</span><span class="meta">{detail}</span></div>'
        for name, cls, detail in rows
    )
    title = "all systems go" if loaded else "degraded"
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>TaskBuddy ML — {"OK" if loaded else "Degraded"}</title>
<style>
  :root {{ color-scheme: light dark; }}
  * {{ box-sizing: border-box; margin: 0; }}
  body {{
    font: 15px/1.6 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    background: #fafafa; color: #1a1a1a;
    display: grid; place-items: center; min-height: 100vh; padding: 24px;
  }}
  @media (prefers-color-scheme: dark) {{ body {{ background: #111; color: #eee; }} }}
  main {{ width: 100%; max-width: 420px; }}
  h1 {{ font-size: 17px; font-weight: 600; letter-spacing: .02em; }}
  .sub {{ opacity: .55; font-size: 13px; margin: 4px 0 28px; }}
  .row {{
    display: flex; align-items: center; gap: 10px;
    padding: 12px 0; border-top: 1px solid rgba(128,128,128,.25);
  }}
  .row:last-of-type {{ border-bottom: 1px solid rgba(128,128,128,.25); }}
  .name {{ flex: 1; }}
  .meta {{ opacity: .55; font-size: 13px; text-align: right; }}
  .dot {{ width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }}
  .dot.up {{ background: #22c55e; }}
  .dot.down {{ background: #ef4444; }}
  footer {{ margin-top: 28px; font-size: 12px; opacity: .45; }}
  a {{ color: inherit; }}
</style>
</head>
<body>
<main>
  <h1>TaskBuddy ML · {title}</h1>
  <p class="sub">uptime {uptime_str} · trained {meta.get("trained_at", "—")}</p>
  {rows_html}
  <footer>JSON: <a href="/health">/health</a> · scoring: POST /score</footer>
</main>
</body>
</html>"""


@app.get("/health")
def health():
    loaded = state["pipeline"] is not None
    return {
        "status": "ok" if loaded else "degraded",
        "model_loaded": loaded,
        "model_version": model_version() if loaded else None,
        "trained_at": state["meta"].get("trained_at"),
    }


@app.post("/score", response_model=ScoreResponse)
def score(request: ScoreRequest) -> ScoreResponse:
    if state["pipeline"] is None:
        raise HTTPException(
            status_code=503,
            detail="Model artifact not loaded — train and deploy model/rf-a-v1.joblib",
        )
    if not request.records:
        return ScoreResponse(model_version=model_version(), scores=[])

    df = pd.DataFrame([record.model_dump() for record in request.records])
    probabilities = state["pipeline"].predict_proba(df)[:, 1]
    return ScoreResponse(
        model_version=model_version(),
        scores=[round(float(p), 5) for p in probabilities],
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
