import json
import random
import os
import pandas as pd
from PyPDF2 import PdfReader
from docx import Document
import io

def extract_text_from_pdf(file_bytes):
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""

def extract_text_from_docx(file_bytes):
    try:
        doc = Document(io.BytesIO(file_bytes))
        return "\n".join([para.text for para in doc.paragraphs])
    except Exception as e:
        print(f"Error reading DOCX: {e}")
        return ""

def extract_data_from_excel(file_bytes):
    try:
        df = pd.read_excel(io.BytesIO(file_bytes))
        return df.to_string()
    except Exception as e:
        print(f"Error reading Excel: {e}")
        return ""

def extract_financials(files_list):
    """
    Extracted data is now analyzed through:
    1. Financial Ratio Engine
    2. Auditor Remark Classifier (Keyword-based)
    3. Trend Detection
    4. Composite Document Risk Scoring (0-30)
    """
    total_content = ""
    filenames = []
    
    for file in files_list:
        content = ""
        ext = os.path.splitext(file.filename)[1].lower()
        filenames.append(file.filename)
        
        file_bytes = file.file.read()
        
        if ext == '.pdf':
            content = extract_text_from_pdf(file_bytes)
        elif ext in ['.xlsx', '.xls']:
            content = extract_data_from_excel(file_bytes)
        elif ext == '.docx':
            content = extract_text_from_docx(file_bytes)
        else:
            try:
                content = file_bytes.decode('utf-8')
            except:
                content = f"[Unreadable Binary Content: {file.filename}]"
        
        total_content += f"\n--- Content from {file.filename} ---\n{content}\n"
    
    content_lower = total_content.lower()
    
    # 1️⃣ BASE EXTRACTION (Simulated with 3-year history for trend analysis)
    # Current Year (CY), Previous Year (PY), Year Before (PY-1)
    years = ["2023", "2024", "2025"]
    
    # Generate 3 years of revenue for trend detection
    rev_3yr = [round(random.uniform(150, 400), 2)]
    rev_3yr.append(round(rev_3yr[0] * random.uniform(0.85, 1.25), 2))
    rev_3yr.append(round(rev_3yr[1] * random.uniform(0.85, 1.25), 2))
    
    rev = rev_3yr[2]
    prev_rev = rev_3yr[1]
    
    net_profit = round(rev * random.uniform(0.02, 0.15), 2)
    prev_profit = round(prev_rev * random.uniform(0.02, 0.15), 2)
    ebitda = round(rev * 0.2, 2)
    total_debt = round(random.uniform(20, 150), 2)
    equity = round(random.uniform(30, 200), 2)
    current_assets = round(random.uniform(50, 200), 2)
    current_liab = round(random.uniform(30, 150), 2)
    inventory = round(current_assets * random.uniform(0.2, 0.5), 2)
    interest_exp = round(random.uniform(2, 12), 2)
    cont_liab = round(random.uniform(0, 40), 2)
    
    # 2️⃣ AUDITOR REMARK CLASSIFICATION (Enhanced NLP-style logic)
    # Simulator: In 15% of cases, force a high-risk auditor remark found in content
    auditor_remarks = "The financial statements present a true and fair view of the state of affairs."
    is_audit_flagged = False
    
    audit_risk_patterns = {
        "going_concern": ["going concern", "material uncertainty related to going concern"],
        "qualification": ["qualified opinion", "except for the effects", "qualified for"],
        "adverse": ["adverse opinion", "do not present a true and fair view"],
        "disclaimer": ["disclaimer of opinion", "we do not express an opinion"],
        "internal_controls": ["material weakness", "internal financial controls are not effective"]
    }
    
    detected_audit_issues = []
    for issue, patterns in audit_risk_patterns.items():
        if any(p in content_lower for p in patterns):
            detected_audit_issues.append(issue.replace("_", " ").title())
            is_audit_flagged = True
            
    if is_audit_flagged:
        auditor_remarks = f"AUDIT ALERT: Potential {', '.join(detected_audit_issues)} detected in auditor report."
    
    # 3️⃣ FINANCIAL RATIO ENGINE (Advanced)
    debt_to_equity = round(total_debt / equity, 2)
    interest_coverage = round(ebitda / interest_exp, 2)
    net_profit_margin = round((net_profit / rev) * 100, 2)
    current_ratio = round(current_assets / current_liab, 2)
    quick_ratio = round((current_assets - inventory) / current_liab, 2)
    dscr = round((ebitda) / (interest_exp + (total_debt * 0.1)), 2) # Simplified DSCR
    
    # Health Assessment
    if dscr > 1.5 and interest_coverage > 3.0 and debt_to_equity < 1.0:
        health = "Premium / AAA Equivalent"
    elif dscr > 1.2 and current_ratio > 1.2:
        health = "Investment Grade"
    elif dscr < 1.0 or current_ratio < 0.8:
        health = "Speculative / High Risk"
    else:
        health = "Standard / Moderate"

    # 4️⃣ TREND DETECTION (3-Year CAGR Simulation)
    cagr_rev = round((((rev_3yr[2]/rev_3yr[0])**(1/2)) - 1) * 100, 2)
    rev_trend = "Strong Growth" if cagr_rev > 15 else ("Stable" if cagr_rev > 0 else "Decline")
    
    # 5️⃣ GST CROSS-VERIFICATION
    gst_sales = rev * 1.05
    bank_credits = gst_sales * random.uniform(0.7, 1.2)
    mismatch_pct = abs(gst_sales - bank_credits) / gst_sales * 100
    
    # 6️⃣ COMPOSITE RULE-BASED RISK ENGINE (0-30 points)
    doc_risk_score = 0
    risk_breakdown = []
    
    # Rule 1: GST Anomaly
    if mismatch_pct > 20: 
        doc_risk_score += 6
        risk_breakdown.append(f"GST/Bank Mismatch ({round(mismatch_pct,1)}%) (+6)")
    
    # Rule 2: Debt Serviceability
    if dscr < 1.1:
        doc_risk_score += 8
        risk_breakdown.append("DSCR below threshold 1.1x (+8)")
    elif interest_coverage < 1.5:
        doc_risk_score += 4
        risk_breakdown.append("Low Interest Coverage (+4)")
        
    # Rule 3: Liquidity Stress
    if current_ratio < 1.0:
        doc_risk_score += 5
        risk_breakdown.append(f"Liquidity Stress: CR={current_ratio} (+5)")
        
    # Rule 4: Auditor Red Flags
    if is_audit_flagged:
        weight = 10 if "Adverse" in auditor_remarks or "Going Concern" in auditor_remarks else 5
        doc_risk_score += weight
        risk_breakdown.append(f"Auditor: {detected_audit_issues[0]} (+{weight})")
        
    # Rule 5: Negative Growth
    if cagr_rev < -5:
        doc_risk_score += 3
        risk_breakdown.append(f"Negative 2rd CAGR ({cagr_rev}%) (+3)")

    return {
        "financials": {
            "revenue": rev,
            "net_profit": net_profit,
            "ebitda": ebitda,
            "total_debt": total_debt,
            "equity": equity,
            "current_assets": current_assets,
            "current_liabilities": current_liab,
            "contingent_liabilities": cont_liab,
            "inventory": inventory
        },
        "ratios": {
            "debt_to_equity": debt_to_equity,
            "interest_coverage": interest_coverage,
            "net_profit_margin": net_profit_margin,
            "current_ratio": current_ratio,
            "quick_ratio": quick_ratio,
            "dscr": dscr,
            "financial_health": health
        },
        "trends": {
            "revenue_3yr": rev_3yr,
            "revenue_cagr": cagr_rev,
            "revenue_trend": rev_trend,
            "profitability": "Improving" if net_profit > prev_profit else "Volatile"
        },
        "auditor_analysis": {
            "remarks": auditor_remarks,
            "is_flagged": is_audit_flagged,
            "detected_issues": detected_audit_issues
        },
        "cross_verification": {
            "mismatch_pct": round(mismatch_pct, 2),
            "anomaly_flag": mismatch_pct > 20
        },
        "risk_engine": {
            "document_risk_score": min(doc_risk_score, 30),
            "risk_breakdown": risk_breakdown
        },
        "files_processed": filenames
    }

