"""TaskBuddy recommendation model service — PLACEHOLDER.

The trained Random Forest (rf-a-v1) is still under development. This stub
locks in the /score API contract (BACKEND_SCHEMA.md §8–§9) so the backend
flow can run end-to-end today; swap `score_records` for the real model later
(see README.md).
"""

import os

from fastapi import FastAPI
from pydantic import BaseModel, Field

MODEL_VERSION = "stub-v0"

app = FastAPI(title="TaskBuddy Recommendation Service (stub)", version=MODEL_VERSION)


class FeatureRecord(BaseModel):
    """One job–provider pair. Field names must match the ML training columns exactly."""

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


def score_records(records: list[FeatureRecord]) -> list[float]:
    """Deterministic heuristic standing in for pipeline.predict_proba(df)[:, 1].

    Produces a sane, stable ranking: category match and rating help,
    distance and slow response time hurt. Clamped to (0, 1).
    """
    scores = []
    for r in records:
        score = 0.30
        score += 0.25 * r.skills_match
        score += 0.06 * (r.provider_avg_rating - 3.0)          # -0.12 .. +0.12
        score -= 0.01 * min(r.distance_km, 30.0)               # up to -0.30
        score -= 0.02 * min(r.provider_response_time_hrs, 10)  # up to -0.20
        score += 0.005 * min(r.provider_completed_jobs, 40)    # up to +0.20
        score += 0.004 * min(r.provider_years_experience, 25)  # up to +0.10
        scores.append(round(min(max(score, 0.01), 0.99), 5))
    return scores


@app.get("/health")
def health():
    return {"status": "ok", "model_version": MODEL_VERSION}


@app.post("/score", response_model=ScoreResponse)
def score(request: ScoreRequest) -> ScoreResponse:
    return ScoreResponse(
        model_version=MODEL_VERSION,
        scores=score_records(request.records),
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
