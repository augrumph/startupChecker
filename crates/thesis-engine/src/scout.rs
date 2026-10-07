use std::{collections::{BTreeMap, HashMap}, sync::OnceLock};
use serde::{Deserialize, Serialize};

pub const SCOUT_MODEL_VERSION: &str = "scoutnet-v1-ultra";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SparseThesisInput { pub name:String, pub tagline:String, #[serde(default)] pub category:String }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScoutPrediction {
    pub model_version:String, pub teacher:String, pub blue_ocean_class:String,
    pub class_scores:BTreeMap<String,f64>, pub research_priority:f64,
    pub teacher_only:bool, pub can_change_rust_decision:bool, pub note:String,
}

#[derive(Debug, Deserialize)]
struct Artifact { version:String, teacher:String, terms:Vec<String>, idf:Vec<f64>, classifier:Classifier, priority:Regressor, guardrail:String }
#[derive(Debug, Deserialize)]
struct Classifier { classes:Vec<String>, coef:Vec<Vec<f64>>, intercept:Vec<f64> }
#[derive(Debug, Deserialize)]
struct Regressor { coef:Vec<f64>, intercept:f64 }

static MODEL:OnceLock<Artifact>=OnceLock::new();
fn model()->&'static Artifact { MODEL.get_or_init(|| serde_json::from_str(include_str!("../models/scoutnet_v1_ultra.json")).expect("valid embedded ScoutNet")) }

fn tokenize(text:&str)->Vec<String>{
    text.to_lowercase().split(|c:char|!(c.is_alphanumeric()||c=='_'))
        .filter(|t|t.chars().count()>=2).map(ToOwned::to_owned).collect()
}
fn vectorize(input:&SparseThesisInput,a:&Artifact)->Vec<f64>{
    let text=format!("{} | {} | {}",input.name,input.tagline,input.category);
    let tokens=tokenize(&text); let mut counts:HashMap<String,usize>=HashMap::new();
    for t in &tokens { *counts.entry(t.clone()).or_insert(0)+=1; }
    for p in tokens.windows(2){ *counts.entry(format!("{} {}",p[0],p[1])).or_insert(0)+=1; }
    let mut v=vec![0.0;a.terms.len()];
    for (i,t) in a.terms.iter().enumerate(){ if let Some(c)=counts.get(t){ v[i]=(1.0+(*c as f64).ln())*a.idf[i]; } }
    let n=v.iter().map(|x|x*x).sum::<f64>().sqrt(); if n>0.0 { for x in &mut v { *x/=n; } } v
}
fn dot(a:&[f64],b:&[f64])->f64{a.iter().zip(b).map(|(x,y)|x*y).sum()}
fn r1(v:f64)->f64{(v*10.0).round()/10.0}
fn r4(v:f64)->f64{(v*10000.0).round()/10000.0}

pub fn scout_sparse_thesis(input:&SparseThesisInput)->ScoutPrediction{
    let a=model(); let v=vectorize(input,a); let mut scores=BTreeMap::new();
    let mut winner=0usize; let mut best=f64::NEG_INFINITY;
    for (i,class) in a.classifier.classes.iter().enumerate(){
        let s=dot(&a.classifier.coef[i],&v)+a.classifier.intercept[i];
        scores.insert(class.clone(),r4(s)); if s>best {best=s;winner=i;}
    }
    let priority=dot(&a.priority.coef,&v)+a.priority.intercept;
    ScoutPrediction{model_version:a.version.clone(),teacher:a.teacher.clone(),
        blue_ocean_class:a.classifier.classes[winner].clone(),class_scores:scores,
        research_priority:r1(priority.clamp(0.0,100.0)),teacher_only:true,
        can_change_rust_decision:false,note:a.guardrail.clone()}
}