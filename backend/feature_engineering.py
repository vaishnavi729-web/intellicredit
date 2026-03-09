def extract_features(raw_data: dict) -> dict:
    """
    Converts raw rule-based intelligence into a flattened dictionary of numerical ML-ready features.
    """
    mca = raw_data.get("mca", {})
    ibc = raw_data.get("ibc", {})
    rating = raw_data.get("rating", {})
    nlp = raw_data.get("nlp", {})
    promoter = raw_data.get("promoter", {})

    # MCA Features
    features = {
        "active_status": 1 if mca.get("status") == "Active" else 0,
        "strike_off_flag": 1 if mca.get("status") == "Struck Off" else 0,
        "director_disqualified": int(mca.get("director_disqualified", 0)),
        "charges_outstanding": float(mca.get("charges_outstanding", 0.0)),
        "past_name_changes": int(mca.get("past_name_changes", 0)),
        "mca_risk_score": float(mca.get("mca_risk_score", 0.0)),
        
        # IBC / Insolvency Features
        "section_7_count": int(ibc.get("section_7_count", 0)),
        "section_9_count": int(ibc.get("section_9_count", 0)),
        "admitted_cases": int(ibc.get("admitted_cases", 0)),
        "dismissed_cases": int(ibc.get("dismissed_cases", 0)),
        "ibc_risk_score": float(ibc.get("ibc_risk_score", 0.0)),
        "ibc_severity_encoded": {"Low": 1, "Medium": 2, "High": 3}.get(ibc.get("ibc_severity_encoded", "Low"), 1),

        # Credit Rating Features
        "rating_downgrade_flag": int(rating.get("rating_downgrade_flag", 0)),
        "rating_suspended_flag": int(rating.get("rating_suspended_flag", 0)),
        "default_rating_flag": int(rating.get("default_rating_flag", 0)),
        "rating_risk_score": float(rating.get("rating_risk_score", 0.0)),

        # NLP News Features
        "news_sentiment_score": float(nlp.get("news_sentiment_score", 0.0)),
        "litigation_count": int(nlp.get("litigation_count", 0)),
        "compliance_flags": int(nlp.get("compliance_flags", 0)),
        "fraud_mentions": int(nlp.get("fraud_mentions", 0)),
        "negative_news_index": float(nlp.get("negative_news_index", 0.0)),
        "time_weighted_risk_score": float(nlp.get("time_weighted_risk_score", 0.0)),

        # Promoter Network Features
        "insolvency_links": int(promoter.get("insolvency_links", 0)),
        "struck_off_companies": int(promoter.get("struck_off_companies", 0)),
        "director_disqualification_links": int(promoter.get("director_disqualification_links", 0)),
        "promoter_network_score": float(promoter.get("promoter_network_score", 0.0)),
    }
    return features

def get_feature_names():
    return [
        "active_status", "strike_off_flag", "director_disqualified", "charges_outstanding",
        "past_name_changes", "mca_risk_score", "section_7_count", "section_9_count",
        "admitted_cases", "dismissed_cases", "ibc_risk_score", "ibc_severity_encoded",
        "rating_downgrade_flag", "rating_suspended_flag", "default_rating_flag", "rating_risk_score",
        "news_sentiment_score", "litigation_count", "compliance_flags", "fraud_mentions",
        "negative_news_index", "time_weighted_risk_score", "insolvency_links",
        "struck_off_companies", "director_disqualification_links", "promoter_network_score"
    ]
