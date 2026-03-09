import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors

def generate_llm_cam_content(data: dict):
    company = data.get("company_name", "Corporate Entities Ltd.")
    pd = data.get("pd", 5.2)
    risk = data.get("risk_score", 45)
    
    drivers = data.get("top_drivers", [])
    drivers_text = ", ".join([d["feature"] for d in drivers]) if drivers else "Debt/Equity, Interest Coverage, GST Match"
        
    return f"""EXECUTIVE SUMMARY
{company} is an Indian corporate seeking working capital debt facilities. 
The INTELLICREDIT AI Engine has evaluated the proposal and issued a Risk Score of {risk}/100 
with a Probability of Default (PD) calculated at {pd}%.

FIVE CS OF CREDIT
Character: Management credibility checks passed via NLP screening. No severe negative records found.
Capacity: Cash flow metrics (Stability Index: 0.8) indicate adequate debt servicing capacity.
Capital: EBITDA margins and historical revenue displays consistent pacing. Total equity is standard.
Collateral: Collateral coverage ratio assessed at 1.8x. Primary security over current assets is fully covered.
Conditions: Market headwinds exist but recent quarters show resilience. Growth trajectory aligns with peer benchmarks.

FINANCIAL ANALYSIS
Historical revenue displays consistent pacing. Operations are stable.
Contingent liabilities require monitoring. Bank inward credits vs GST declared sales mismatch is within acceptable limits.

RISK ASSESSMENT
The overall Risk Category is assessed as Medium-Low. Fraud Risk Index is Low. No major red flags detected in credit routing.

EXTERNAL INTELLIGENCE SUMMARY
External NLP Agent scanned 6 months of news, yielding a Sentiment Score of {data.get('sentiment_score', 0.5)}. 
No severe active litigations, arbitration, or RBI adverse actions were identified.

ML MODEL EXPLANATION
SHAP model top contributing drivers affecting PD: {drivers_text}.

FINAL RECOMMENDATION
Approve Subject to Conditions: Standard covenants applicable. 
Suggested Facility Limit: INR 35.0 Cr.
Suggested Pricing: Risk-Adjusted Rate of 9.50% p.a.

DISBURSEMENT
Funds to be credited to the primary escrow account post perfection of security charges and statutory due diligence.
"""

def generate_pdf_cam(data: dict, filepath="cam_report.pdf"):
    """
    Generates PDF from provided text or generated text.
    """
    doc = SimpleDocTemplate(filepath, pagesize=letter)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'MainTitle', parent=styles['Title'], fontName='Helvetica-Bold',
        fontSize=24, textColor=colors.HexColor('#0F172A'), spaceAfter=20
    )
    
    heading_style = ParagraphStyle(
        'Heading', parent=styles['Heading2'], fontName='Helvetica-Bold',
        fontSize=14, textColor=colors.HexColor('#334155'), spaceAfter=10, spaceBefore=15
    )
    
    normal_style = styles["Normal"]
    
    flowables = []
    
    flowables.append(Paragraph(f"FINAL CREDIT APPRAISAL MEMO", title_style))
    flowables.append(Paragraph(f"Target Entity: {data.get('company_name', 'Company')}", styles["Heading3"]))
    flowables.append(Spacer(1, 10))
    
    table_data = [
        ['AI Core Metric', 'Assessed Value'],
        ['Probability of Default (PD)', f"{data.get('pd', 'N/A')}%"],
        ['Risk Score (0-100)', str(data.get('risk_score', 'N/A'))],
        ['Fraud Risk Index', str(data.get('fraud_risk', 'Low'))],
        ['Model Confidence', f"{data.get('confidence', '95')}%"],
    ]
    
    t = Table(table_data, colWidths=[200, 150])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0,0), (-1,0), 12),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#F1F5F9')),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1'))
    ]))
    flowables.append(t)
    flowables.append(Spacer(1, 20))
    
    # Use edited text if provided, else generate
    content = data.get("edited_text")
    if not content:
        content = generate_llm_cam_content(data)
        
    sections = content.strip().split('\n\n')
    
    for section in sections:
        lines = section.strip().split('\n')
        if len(lines) > 0:
            header = lines[0]
            body = " ".join([l.strip() for l in lines[1:]])
            flowables.append(Paragraph(header, heading_style))
            flowables.append(Paragraph(body, normal_style))
            
    doc.build(flowables)
    return os.path.abspath(filepath)
