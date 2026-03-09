import json
import random

def extract_financials(filenames):
    """
    Simulates OCR & LLM Extraction from PnL, Balance Sheets, GST, etc.
    Now includes GST vs Bank Cross-Verification.
    """
    has_gst = any("gst" in f.lower() for f in filenames) or len(filenames) > 0
    
    # Financial metrics
    extracted = {
        "revenue_3y_avg": round(random.uniform(50, 400), 2),
        "net_profit": round(random.uniform(5, 40), 2),
        "ebitda": round(random.uniform(10, 80), 2),
        "total_debt": round(random.uniform(20, 150), 2),
        "equity": round(random.uniform(30, 200), 2),
        "interest_expense": round(random.uniform(1, 15), 2),
        "contingent_liabilities": round(random.uniform(0, 10), 2),
        "cash_flow": round(random.uniform(5, 30), 2),
        "auditor_remarks": "No material qualification observed. Emphasis of matter on old tax demands.",
        "risk_disclosures": "Dependence on top 3 suppliers. Currency fluctuation risk."
    }
    
    # GST vs Bank Cross-Verification Simulation
    gst_sales = extracted["revenue_3y_avg"] * 1.05 # slight variance
    bank_credits = gst_sales * random.uniform(0.7, 1.1)
    mismatch_pct = abs(gst_sales - bank_credits) / gst_sales * 100
    
    cross_verification = {
        "gst_sales_declared": round(gst_sales, 2),
        "bank_inward_credits": round(bank_credits, 2),
        "mismatch_pct": round(mismatch_pct, 2),
        "anomaly_flag": mismatch_pct > 20
    }
    
    if has_gst:
       extracted["gst_mismatch_pct"] = round(mismatch_pct, 2)
       
    return {
        "financials": extracted,
        "cross_verification": cross_verification
    }
