def get_feature_names():
    return [
        "debt_to_equity", "interest_coverage", "net_profit_margin",
        "revenue_growth_pct", "gst_mismatch_pct", "contingent_liab_ratio",
        "auditor_risk_flag", "industry_risk_index", "litigation_count",
        "promoter_score", "working_capital_gap", "current_ratio",
        "dscr", "quick_ratio", "revenue_cagr"
    ]

def extract_features(raw_data: dict) -> dict:
    """
    Transforms raw application and document data into a 
    normalized numerical feature vector for the ML model.
    """
    # 1. Financials (from doc_intelligence)
    fin = raw_data.get("financials", {})
    ratios = raw_data.get("ratios", {})
    trends = raw_data.get("trends", {})
    cross = raw_data.get("cross_verification", {})
    auditor = raw_data.get("auditor_analysis", {})
    
    # Calculate derived features if not present
    rev = fin.get("revenue", 100)
    
    features = {
        "debt_to_equity": float(ratios.get("debt_to_equity", 1.5)),
        "interest_coverage": float(ratios.get("interest_coverage", 2.5)),
        "net_profit_margin": float(ratios.get("net_profit_margin", 10.0)),
        "revenue_growth_pct": float(trends.get("revenue_growth", 5.0)),
        "gst_mismatch_pct": float(cross.get("mismatch_pct", 5.0)),
        "contingent_liab_ratio": float(fin.get("contingent_liabilities", 0) / rev if rev else 0),
        "auditor_risk_flag": 1.0 if auditor.get("is_flagged") else 0.0,
        "industry_risk_index": float(raw_data.get("industry_risk_index", 50)),
        "litigation_count": float(raw_data.get("litigation_count", 0)),
        "promoter_score": float(raw_data.get("promoter_score", 70)),
        "working_capital_gap": float(raw_data.get("utilization_pct", 60)),
        "current_ratio": float(ratios.get("current_ratio", 1.5)),
        "dscr": float(ratios.get("dscr", 1.2)),
        "quick_ratio": float(ratios.get("quick_ratio", 1.0)),
        "revenue_cagr": float(trends.get("revenue_cagr", 8.0))
    }
    
    return features
