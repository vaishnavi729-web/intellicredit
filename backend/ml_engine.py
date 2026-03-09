import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import shap
import json

model = None
explainer = None
feature_names = [
    'debt_equity', 'interest_coverage', 'revenue_growth', 'cash_flow_stability',
    'gst_mismatch_pct', 'utilization_pct', 'collateral_coverage',
    'news_sentiment_score', 'litigation_cases', 'litigation_severity_score', 
    'compliance_flag_count', 'promoter_risk_score', 'industry_risk_index', 
    'nlp_risk_impact_score'
]

def train_model():
    global model, explainer
    # Generate some realistic synthetic data to train a real RF model for Indian Mid-market companies
    np.random.seed(42)
    # 500 companies
    X = pd.DataFrame(np.random.normal(size=(500, len(feature_names))), columns=feature_names)
    
    # Introduce real correlations for typical default patterns
    y = ((X['debt_equity'] * 0.3) - (X['interest_coverage'] * 0.4) + 
         (X['nlp_risk_impact_score'] * 0.5) + (X['gst_mismatch_pct'] * 0.8) +
         (X['promoter_risk_score'] * 0.4) > 1.2).astype(int)
    
    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X, y)
    
    # Needs background data for SHAP TreeExplainer
    explainer = shap.TreeExplainer(model)
    return True

def risk_calculator(features: dict):
    if model is None:
        train_model()
        
    df = pd.DataFrame([features])
    
    # Predict PD
    pd_proba = model.predict_proba(df)[0][1] * 100 # percentage
    
    # Calculate SHAP values
    shap_values = explainer.shap_values(df)
    # Random Forest shap_values is a list for each class. We want class=1 (default)
    shap_vals = shap_values[1][0] if isinstance(shap_values, list) else shap_values[0]
    
    # Extract top 5 drivers
    impacts = {feature_names[i]: float(shap_vals[i]) for i in range(len(feature_names))}
    top_5 = sorted(impacts.items(), key=lambda x: abs(x[1]), reverse=True)[:5]
    
    risk_score = min(max(int(pd_proba * 1.5), 0), 100) # scale to 0-100 score appropriately
    
    if risk_score < 30:
        category = "Low"
    elif risk_score < 70:
        category = "Medium"
    else:
        category = "High"

    fraud_index = "Medium" if features.get("gst_mismatch_pct", 0) > 15 else "Low"

    return {
        "probability_of_default": round(pd_proba, 2),
        "risk_score": risk_score,
        "risk_category": category,
        "fraud_risk_index": fraud_index,
        "confidence_level": round(np.max(model.predict_proba(df)[0]) * 100, 2), # Add Model Confidence %
        "top_drivers": [{"feature": k, "impact": round(v, 4)} for k, v in top_5],
        "shap_values": impacts
    }
