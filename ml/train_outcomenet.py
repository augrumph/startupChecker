#!/usr/bin/env python3
from __future__ import annotations
import argparse, json
from pathlib import Path
import pandas as pd

MIN_LABELED_ROWS=200
MIN_PAID_POSITIVES=40
REQUIRED={"thesis_id","sparse_text","paid","value_observed","repurchased_or_expanded","days_to_first_payment","final_label"}

def main():
    p=argparse.ArgumentParser(); p.add_argument("--input",default="ml/data/outcomes.csv"); a=p.parse_args()
    path=Path(a.input)
    if not path.exists(): raise SystemExit(f"OutcomeNet LOCKED: {path} does not exist")
    df=pd.read_csv(path); missing=REQUIRED-set(df.columns)
    if missing: raise SystemExit(f"OutcomeNet LOCKED: missing {sorted(missing)}")
    labeled=df[df["final_label"].notna()].copy()
    paid=int(labeled["paid"].astype(str).str.upper().isin(["TRUE","SIM","1"]).sum())
    gate={"rows":len(df),"labeled_rows":len(labeled),"paid_positive_rows":paid,"minimum_labeled_rows":MIN_LABELED_ROWS,"minimum_paid_positive_rows":MIN_PAID_POSITIVES}
    if len(labeled)<MIN_LABELED_ROWS or paid<MIN_PAID_POSITIVES:
        print(json.dumps({"status":"LOCKED",**gate},indent=2)); raise SystemExit(2)
    print(json.dumps({"status":"READY_FOR_TRAINING",**gate,"next":"benchmark linear, CatBoost/GBM, MLP/TabM and TabPFN; calibrate; promote only out-of-sample winner"},indent=2))

if __name__=="__main__": main()
