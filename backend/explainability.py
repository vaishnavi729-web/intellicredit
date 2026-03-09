import shap
import pandas as pd
import numpy as np
from risk_model import risk_model_instance
from feature_engineering import get_feature_names

explainer = None

def init_explainer():
    global explainer
    if not risk_model_instance.is_trained:
        risk_model_instance.train()
    # TreeExplainer is best for RandomForest
    explainer = shap.TreeExplainer(risk_model_instance.model)

def explain_decision(features_dict, pd_score):
    global explainer
    if explainer is None:
        init_explainer()
        
    df = pd.DataFrame([features_dict], columns=get_feature_names())
    
    # Calculate SHAP values
    shap_values = explainer.shap_values(df)
    
    # Extract values for the positive class (Default)
    if isinstance(shap_values, list): # Older SHAP behavior
        shap_vals = shap_values[1][0]
    else: # Newer SHAP behavior
        if len(shap_values.shape) == 3:
            shap_vals = shap_values[0, :, 1]
        else:
            shap_vals = shap_values[0]

    # Map SHAP values to feature names
    feature_names = get_feature_names()
    importance = {feature_names[i]: float(shap_vals[i]) for i in range(len(feature_names))}
    
    # Extract top drivers
    top_5 = sorted(importance.items(), key=lambda x: abs(x[1]), reverse=True)[:5]

    # Friendly names mapping for dashboard visualization
    friendly_names = {
        "ibc_risk_score": "IBC/NCLT Risk Score",
        "rating_risk_score": "Credit Rating Risk",
        "promoter_network_score": "Promoter Network Risk",
        "negative_news_index": "Negative News Sentiment",
        "strike_off_flag": "Strike Off Status",
        "section_7_count": "IBC Section 7 Cases",
        "litigation_count": "Litigation Volume"
    }

    top_risk_drivers = []
    for f, imp in top_5:
        if abs(imp) > 0.01: # Only include if it has a meaningful impact
            dir_str = "increased" if imp > 0 else "decreased"
            name = friendly_names.get(f, f.replace('_', ' ').title())
            top_risk_drivers.append(f"{name} {dir_str} risk")

    if pd_score < 0.25:
        risk_level = "Low"
    elif pd_score < 0.50:
        risk_level = "Medium"
    elif pd_score < 0.75:
        risk_level = "High"
    else:
        risk_level = "Critical"

    return {
        "probability_of_default": round(float(pd_score), 4),
        "risk_level": risk_level,
        "top_risk_drivers": top_risk_drivers,
        "feature_importance": {k: round(v, 4) for k, v in importance.items()}
    }
