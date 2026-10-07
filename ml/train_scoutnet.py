#!/usr/bin/env python3
from __future__ import annotations
import argparse, json
from pathlib import Path
import joblib, numpy as np, pandas as pd
from sklearn.base import clone
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.metrics import accuracy_score, f1_score, mean_absolute_error, r2_score
from sklearn.model_selection import KFold, StratifiedKFold
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder
from sklearn.svm import LinearSVC

TEXT_COLUMNS=["Thesis / Company","Sparse thesis / tagline","Category"]
CLASS_COLUMN="Blue Ocean class (hypothesis)"
PRIORITY_COLUMN="Research priority"

def texts(df):
    return (df[TEXT_COLUMNS[0]].fillna("").astype(str)+" | "+df[TEXT_COLUMNS[1]].fillna("").astype(str)+" | "+df[TEXT_COLUMNS[2]].fillna("").astype(str)).tolist()

def classifiers():
    return {
      "logreg":Pipeline([("tfidf",TfidfVectorizer(ngram_range=(1,2),min_df=2,max_features=3000,sublinear_tf=True)),("clf",LogisticRegression(max_iter=3000,class_weight="balanced",C=2.0))]),
      "linear_svc":Pipeline([("tfidf",TfidfVectorizer(ngram_range=(1,2),min_df=2,max_features=3000,sublinear_tf=True)),("clf",LinearSVC(class_weight="balanced",C=1.0))]),
      "mlp_64":Pipeline([("tfidf",TfidfVectorizer(ngram_range=(1,2),min_df=2,max_features=1200,sublinear_tf=True)),("clf",MLPClassifier(hidden_layer_sizes=(64,),alpha=.02,max_iter=350,random_state=42))]),
      "mlp_128_32":Pipeline([("tfidf",TfidfVectorizer(ngram_range=(1,2),min_df=2,max_features=1200,sublinear_tf=True)),("clf",MLPClassifier(hidden_layer_sizes=(128,32),alpha=.05,max_iter=350,random_state=42))]),
    }

def regressors():
    return {
      "ridge":Pipeline([("tfidf",TfidfVectorizer(ngram_range=(1,2),min_df=2,max_features=3000,sublinear_tf=True)),("reg",Ridge(alpha=10.0))]),
      "mlp_reg_64":Pipeline([("tfidf",TfidfVectorizer(ngram_range=(1,2),min_df=2,max_features=1200,sublinear_tf=True)),("reg",MLPRegressor(hidden_layer_sizes=(64,),alpha=.05,max_iter=500,random_state=42))]),
    }

def main():
    p=argparse.ArgumentParser(); p.add_argument("--input",required=True); p.add_argument("--sheet",default="Master Universe"); p.add_argument("--out",default="ml/artifacts/scoutnet"); a=p.parse_args()
    path=Path(a.input)
    df=pd.read_excel(path,sheet_name=a.sheet) if path.suffix.lower() in {".xlsx",".xls"} else pd.read_csv(path)
    x=texts(df); enc=LabelEncoder(); yc=enc.fit_transform(df[CLASS_COLUMN].astype(str)); yr=df[PRIORITY_COLUMN].astype(float).to_numpy()

    cv=StratifiedKFold(5,shuffle=True,random_state=42); cresults={}
    for name,m in classifiers().items():
        pred=np.empty_like(yc)
        for tr,te in cv.split(x,yc):
            f=clone(m); f.fit([x[i] for i in tr],yc[tr]); pred[te]=f.predict([x[i] for i in te])
        cresults[name]={"accuracy":float(accuracy_score(yc,pred)),"macro_f1":float(f1_score(yc,pred,average="macro")),"weighted_f1":float(f1_score(yc,pred,average="weighted"))}

    cv2=KFold(5,shuffle=True,random_state=42); rresults={}
    for name,m in regressors().items():
        pred=np.zeros(len(yr))
        for tr,te in cv2.split(x):
            f=clone(m); f.fit([x[i] for i in tr],yr[tr]); pred[te]=f.predict([x[i] for i in te])
        rresults[name]={"mae":float(mean_absolute_error(yr,pred)),"r2":float(r2_score(yr,pred))}

    best_c=max(cresults,key=lambda n:cresults[n]["macro_f1"]); best_r=min(rresults,key=lambda n:rresults[n]["mae"])
    out=Path(a.out); out.mkdir(parents=True,exist_ok=True)
    cm=classifiers()[best_c].fit(x,yc); rm=regressors()[best_r].fit(x,yr)
    joblib.dump({"model":cm,"label_encoder":enc},out/"classifier.joblib"); joblib.dump(rm,out/"priority.joblib")
    report={"weak_supervision":True,"rows":len(df),"classifiers":cresults,"regressors":rresults,"promoted_classifier":best_c,"promoted_priority_regressor":best_r,"warning":"Teacher imitation only; not PMF prediction."}
    (out/"training_report.json").write_text(json.dumps(report,indent=2),encoding="utf-8"); print(json.dumps(report,indent=2))

if __name__=="__main__": main()
