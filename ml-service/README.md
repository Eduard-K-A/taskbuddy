# TaskBuddy ML Service (placeholder)

FastAPI service that scores job–provider pairs for the recommendation engine.
**The trained Random Forest is still under development** — this stub returns
heuristic scores (`model_version: "stub-v0"`) using the exact same API contract,
so the backend works end-to-end today and the real model drops in later without
any backend changes.

## Run

```bash
cd ml-service
python -m venv .venv
.venv\Scripts\activate        # Windows (source .venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
uvicorn app.main:app --port 8000
```

Health check: `GET http://localhost:8000/health`

## API contract

### `POST /score`

Request — one record per job–provider pair, with **exactly** the 14 raw feature
columns the model was trained on (BACKEND_SCHEMA.md §8; the backend builds these
via the `fn_job_provider_features` SQL function):

```json
{
  "records": [
    {
      "skills_match": 1,
      "distance_km": 3.42,
      "provider_avg_rating": 4.5,
      "provider_completed_jobs": 12,
      "provider_availability": 1,
      "job_idle_duration_hrs": 0.17,
      "provider_response_time_hrs": 1.25,
      "provider_years_experience": 4.0,
      "hour_posted": 14,
      "provider_skill_category": "Plumbing",
      "day_of_week": "Monday",
      "job_urgency": "urgent",
      "job_description": "Tumutulo yung gripo sa kusina...",
      "provider_bio": "Licensed plumber po ako, 4 years na..."
    }
  ]
}
```

Response — scores in the same order as the request records:

```json
{ "model_version": "stub-v0", "scores": [0.7342] }
```

## Replacing the stub with the trained model

When the TaskBuddy ML model is ready:

1. Fit the winning pipeline on the full `taskbuddy_synthetic_dataset.csv`
   (drop the `hire_probability` audit column):
   shared `ColumnTransformer` (passthrough numerics, `OrdinalEncoder` for the
   3 categoricals, per-text-column `TfidfVectorizer(sublinear_tf=True)` →
   `TruncatedSVD(n_components=20, random_state=42)`) followed by
   `RandomForestClassifier(n_estimators=50, max_depth=10, max_features='sqrt',
   min_samples_split=5, class_weight='balanced', random_state=42)`.
2. Save it: `joblib.dump(pipeline, "model/rf-a-v1.joblib")`.
3. Add `scikit-learn`, `pandas`, `joblib` to `requirements.txt`.
4. In `app/main.py`, load the artifact at startup and replace `score_records`
   with `pipeline.predict_proba(pd.DataFrame([r.model_dump() for r in records]))[:, 1]`
   — the pipeline selects columns **by name**, so the field names above must not change.
5. Set `MODEL_VERSION = "rf-a-v1"`.

Runs scored by this stub are recorded with `model_version = 'stub-v0'` in
`recommendation_runs`, so they can be excluded from future retraining exports.

## Deploy

Any Python host works (Railway, Render, Fly.io, a VPS). Start command:

```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Then point the backend's `ML_SERVICE_URL` at it.
