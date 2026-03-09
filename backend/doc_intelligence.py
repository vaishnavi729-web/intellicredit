import json
import random

def extract_financials(filenames):
    """
    Simulates OCR & LLM Extraction from multiple document types:
    - PDF (Annual Reports, Financials)
    - Excel (PnL, Balance Sheets, Schedules)
    - Word (Director Reports, Auditor Notes)
    - Images (Scanned copies, Collateral photos)
    """
    if not filenames:
        return {"error": "No files provided for extraction"}

    # Define supported extensions
    SUPPORTED_EXTENSIONS = {
        'pdf': 'Portable Document Format',
        'xlsx': 'Excel Spreadsheet',
        'xls': 'Legacy Excel Spreadsheet',
        'docx': 'Word Document',
        'doc': 'Legacy Word Document',
        'jpg': 'Image/Scan',
        'jpeg': 'Image/Scan',
        'png': 'Image/Scan',
        'csv': 'CSV Data'
    }

    processed_files = []
    has_gst = False
    
    for f in filenames:
        ext = f.split('.')[-1].lower() if '.' in f else 'unknown'
        is_supported = ext in SUPPORTED_EXTENSIONS
        
        if "gst" in f.lower() or "gstr" in f.lower():
            has_gst = True
            
        processed_files.append({
            "filename": f,
            "type": SUPPORTED_EXTENSIONS.get(ext, "Unknown Format"),
            "status": "Processed" if is_supported else "Unsupported Format",
            "extraction_method": "OCR/LLM" if ext == 'pdf' or ext in ['jpg', 'png', 'jpeg'] else "Direct Parser"
        })

    # Financial metrics generation (simulated)
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
        "cross_verification": cross_verification,
        "processed_documents": processed_files,
        "supported_formats_found": list(set([p["type"] for p in processed_files if p["status"] == "Processed"]))
    }
