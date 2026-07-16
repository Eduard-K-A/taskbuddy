"""TaskBuddy recommendation model training.

Trains the production Random Forest (the winner of the model comparison run:
Config A, ~0.81 accuracy / ~0.88 ROC-AUC over 100 group-aware splits) and
saves a versioned artifact for app/main.py to serve.

Usage:
    python train_model.py                 # sanity-check eval, then fit on all rows
    python train_model.py --skip-eval     # fit on all rows only (faster)
    python train_model.py --data other.csv
"""

import argparse
import json
import platform
import time
from datetime import datetime, timezone
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.compose import ColumnTransformer
from sklearn.decomposition import TruncatedSVD
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score
from sklearn.model_selection import GroupShuffleSplit
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OrdinalEncoder

SEED = 42
MODEL_VERSION = "rf-a-v1"
TEXT_SVD_COMPONENTS = 20

# Baseline from the 100-iteration comparison experiment; the sanity-check eval
# warns when a retrain lands notably below these.
BASELINE_ACCURACY = 0.81
BASELINE_ROC_AUC = 0.88
BASELINE_TOLERANCE = 0.03

NUMERIC_COLS = [
    "skills_match",
    "distance_km",
    "provider_avg_rating",
    "provider_completed_jobs",
    "provider_availability",
    "job_idle_duration_hrs",
    "provider_response_time_hrs",
    "provider_years_experience",
    "hour_posted",
]
CATEGORICAL_COLS = ["provider_skill_category", "day_of_week", "job_urgency"]
TEXT_COLS = ["job_description", "provider_bio"]
INPUT_COLS = NUMERIC_COLS + CATEGORICAL_COLS + TEXT_COLS

RF_PARAMS = {
    "n_estimators": 50,
    "max_depth": 10,
    "max_features": "sqrt",
    "min_samples_split": 5,
    "class_weight": "balanced",
    "random_state": SEED,
}


def make_preprocessor() -> ColumnTransformer:
    """All preprocessing lives inside the pipeline so raw feature records can be
    scored directly and nothing is ever fit outside the training data."""
    text_transformers = [
        (
            f"tfidf_{col}",
            Pipeline(
                [
                    ("tfidf", TfidfVectorizer(sublinear_tf=True)),
                    ("svd", TruncatedSVD(n_components=TEXT_SVD_COMPONENTS, random_state=SEED)),
                ]
            ),
            col,
        )
        for col in TEXT_COLS
    ]
    return ColumnTransformer(
        [
            ("numeric", "passthrough", NUMERIC_COLS),
            (
                "categorical",
                OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1),
                CATEGORICAL_COLS,
            ),
        ]
        + text_transformers
    )


def make_pipeline() -> Pipeline:
    return Pipeline(
        [
            ("features", make_preprocessor()),
            ("model", RandomForestClassifier(**RF_PARAMS)),
        ]
    )


def load_dataset(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    required = set(INPUT_COLS) | {"is_recommended", "job_id"}
    missing = required - set(df.columns)
    if missing:
        raise SystemExit(f"Dataset is missing required columns: {sorted(missing)}")
    print(f"Loaded {len(df):,} rows from {path}")
    return df


def sanity_check_eval(df: pd.DataFrame) -> dict:
    """One group-aware holdout evaluation to catch a broken dataset/environment
    before an artifact ships. Groups by job_id so candidates of one job never
    straddle the train/test boundary."""
    X, y, groups = df[INPUT_COLS], df["is_recommended"], df["job_id"]
    splitter = GroupShuffleSplit(n_splits=1, test_size=0.30, random_state=SEED)
    train_idx, test_idx = next(splitter.split(X, y, groups=groups))

    pipeline = make_pipeline()
    pipeline.fit(X.iloc[train_idx], y.iloc[train_idx])

    y_pred = pipeline.predict(X.iloc[test_idx])
    y_scores = pipeline.predict_proba(X.iloc[test_idx])[:, 1]
    metrics = {
        "accuracy": round(accuracy_score(y.iloc[test_idx], y_pred), 4),
        "f1_macro": round(f1_score(y.iloc[test_idx], y_pred, average="macro"), 4),
        "roc_auc": round(roc_auc_score(y.iloc[test_idx], y_scores), 4),
        "test_rows": len(test_idx),
    }
    print(
        f"Holdout eval — accuracy {metrics['accuracy']:.4f} | "
        f"f1-macro {metrics['f1_macro']:.4f} | roc-auc {metrics['roc_auc']:.4f}"
    )

    if (
        metrics["accuracy"] < BASELINE_ACCURACY - BASELINE_TOLERANCE
        or metrics["roc_auc"] < BASELINE_ROC_AUC - BASELINE_TOLERANCE
    ):
        print(
            f"WARNING: metrics fall notably below the experiment baseline "
            f"(~{BASELINE_ACCURACY} accuracy / ~{BASELINE_ROC_AUC} ROC-AUC). "
            f"Check the dataset and library versions before deploying this artifact."
        )
    return metrics


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the TaskBuddy recommendation model")
    parser.add_argument("--data", default="taskbuddy_synthetic_dataset.csv")
    parser.add_argument("--out-dir", default="model")
    parser.add_argument("--skip-eval", action="store_true", help="skip the holdout sanity check")
    args = parser.parse_args()

    base_dir = Path(__file__).resolve().parent
    data_path = Path(args.data) if Path(args.data).is_absolute() else base_dir / args.data
    out_dir = Path(args.out_dir) if Path(args.out_dir).is_absolute() else base_dir / args.out_dir
    out_dir.mkdir(parents=True, exist_ok=True)

    np.random.seed(SEED)
    df = load_dataset(data_path)

    eval_metrics = None if args.skip_eval else sanity_check_eval(df)

    # Final model: fit on ALL rows (evaluation is already settled; production
    # scoring benefits from every labeled example).
    print(f"Fitting final {MODEL_VERSION} on all {len(df):,} rows...")
    start = time.time()
    pipeline = make_pipeline()
    pipeline.fit(df[INPUT_COLS], df["is_recommended"])
    fit_seconds = round(time.time() - start, 1)
    print(f"Fit complete in {fit_seconds}s")

    artifact_path = out_dir / f"{MODEL_VERSION}.joblib"
    joblib.dump(pipeline, artifact_path, compress=3)

    meta = {
        "model_version": MODEL_VERSION,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "training_rows": len(df),
        "input_columns": INPUT_COLS,
        "rf_params": RF_PARAMS,
        "holdout_eval": eval_metrics,
        "fit_seconds": fit_seconds,
        "sklearn_version": sklearn.__version__,
        "pandas_version": pd.__version__,
        "python_version": platform.python_version(),
    }
    meta_path = out_dir / f"{MODEL_VERSION}.meta.json"
    meta_path.write_text(json.dumps(meta, indent=2))

    size_mb = artifact_path.stat().st_size / 1e6
    print(f"Saved {artifact_path} ({size_mb:.1f} MB) and {meta_path.name}")


if __name__ == "__main__":
    main()
