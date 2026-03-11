import shap
import pandas as pd
import numpy as np
import io
import base64
import matplotlib.pyplot as plt
from risk_model import risk_model_instance
from feature_engineering import get_feature_names

explainer = None

def init_explainer():
    """Initializes TreeExplainer for SHAP. Stores for faster inference."""
    global explainer
    if not risk_model_instance.is_trained:
        risk_model_instance.train()
    
    # Needs some background data for certain SHAP modes; 
    # using simple TreeExplainer for RandomForest is efficient.
    explainer = shap.TreeExplainer(risk_model_instance.model)

def explain_decision(features_dict, pd_score):
    """
    Returns full explainability breakdown with top 5 drivers 
    and feature-wise contribution indicators.
    """
    global explainer
    if explainer is None:
        init_explainer()
    
    df = pd.DataFrame([features_dict], columns=get_feature_names())
    
    # Calculate SHAP values
    shap_values = explainer.shap_values(df)
    
    # RF output: list for [Class 0, Class 1]. We want Class 1 (Default).
    if isinstance(shap_values, list): # Traditional SHAP behavior
        shap_vals = shap_values[1][0]
    else: # Newer SHAP behavior
        if len(shap_values.shape) == 3: # (samples, features, classes)
            shap_vals = shap_values[0, :, 1]
        else:
            shap_vals = shap_values[0]

    feature_names = get_feature_names()
    contributions = {feature_names[i]: float(shap_vals[i]) for i in range(len(feature_names))}
    
    # Extract top 5 risk drivers (sorted by absolute impact)
    top_5_items = sorted(contributions.items(), key=lambda x: abs(x[1]), reverse=True)[:5]
    top_risk_drivers = []
    
    for feature, impact in top_5_items:
        # Indicator for Risk Level Change
        if impact > 0.005: 
            direction = "Increased Risk"
            icon = "trending-up"
        elif impact < -0.005: 
            direction = "Reduced Risk"
            icon = "trending-down"
        else:
            direction = "Neutral Impact"
            icon = "minus"
            
        friendly_name = feature.replace('_', ' ').capitalize()
        top_risk_drivers.append({
            "feature": feature,
            "friendly_name": friendly_name,
            "impact_direction": direction,
            "impact_magnitude": round(impact, 4),
            "icon": icon
        })

    # Risk level classification
    if pd_score < 0.15:
        risk_level = "Low"
    elif pd_score < 0.35:
        risk_level = "Medium"
    elif pd_score < 0.65:
        risk_level = "High"
    else:
        risk_level = "Critical"

    return {
        "probability_of_default": round(float(pd_score), 4),
        "risk_level": risk_level,
        "top_risk_drivers": top_risk_drivers,
        "feature_contributions": {k: round(v, 4) for k, v in contributions.items()},
        "base_value": float(explainer.expected_value[1]) if isinstance(explainer.expected_value, np.ndarray) else float(explainer.expected_value)
    }

def get_force_plot_base64(features_dict):
    """Generates a SHAP force plot and returns it as a Base64 encoded string."""
    global explainer
    if explainer is None:
        init_explainer()
    
    df = pd.DataFrame([features_dict], columns=get_feature_names())
    shap_values = explainer.shap_values(df)
    
    # Use Class 1
    if isinstance(shap_values, list):
        sv = shap_values[1]
        ev = explainer.expected_value[1]
    else:
        sv = shap_values[..., 1]
        ev = explainer.expected_value[1]

    # Generate plot using Matplotlib (force plot natively depends on JS, 
    # so we'll use a summary plot/bar plot logic for a safe image or static bar)
    plt.figure(figsize=(10, 6))
    shap.bar_plot(sv[0], feature_names=get_feature_names(), show=False)
    
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    plt.close()
    buf.seek(0)
    image_base64 = base64.b64encode(buf.read()).decode('utf-8')
    return image_base64
