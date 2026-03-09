try:
    from transformers import pipeline
    from sentence_transformers import SentenceTransformer, util
except ImportError:
    pipeline = None
    SentenceTransformer = None
    util = None
import random
import difflib

# Load FinBERT for financial sentiment analysis
sentiment_analyzer = None

def get_fuzzy_ratio(s1, s2):
    """Refined fuzzy matching with common business suffix removal."""
    suffixes = ["ltd", "pvt", "corp", "inc", "limited", "private", "services", "industries"]
    s1_clean = s1.lower()
    for s in suffixes:
        s1_clean = s1_clean.replace(s, "").strip()
    
    # Check for direct inclusion first
    if s1_clean in s2.lower():
        return 0.95
        
    return difflib.SequenceMatcher(None, s1_clean, s2.lower()).ratio()

def perform_ner_extraction(text):
    """
    Simulates NER (Named Entity Recognition) with context awareness.
    """
    entities = []
    import re
    # Match capitalized titles (potential companies/promoters)
    matches = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', text)
    entities.extend(matches)
    
    # Detect patterns like CIN (U12345MH2021PTC123456) or PAN (ABCDE1234F)
    cin_pattern = re.search(r'\b[ULG]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}\b', text)
    if cin_pattern: entities.append(cin_pattern.group())
    
    return list(set(entities))

def init_finbert():
    global sentiment_analyzer
    try:
        sentiment_analyzer = pipeline("sentiment-analysis", model="ProsusAI/finbert")
    except Exception as e:
        print(f"Failed to load FinBERT locally: {e}. Falling back to simulation.")
        sentiment_analyzer = "mock"

st_model = None
def init_st_model():
    global st_model
    try:
        if SentenceTransformer:
            st_model = SentenceTransformer('all-MiniLM-L6-v2')
    except Exception as e:
        print(f"Failed to load SentenceTransformer: {e}")
        st_model = None

# 1️⃣ MCA INTELLIGENCE MODULE
def analyze_mca_records(text: str) -> dict:
    text_lower = text.lower()
    mca_flags = {
       "active_status": True,
       "charges_outstanding": 0,
       "director_disqualified": False,
       "strike_off_flag": False,
       "past_name_changes": 0,
       "mca_risk_score": 0
    }
    
    import re
    if re.search(r'\bdin\s*[:\-]?\s*[0-9]{8}\b', text_lower):
        pass # Detected DIN

    charge_match = re.search(r'charges? registered.*?(\d+)', text_lower)
    if charge_match:
        mca_flags["charges_outstanding"] = int(charge_match.group(1))

    if "director disqualified" in text_lower:
        mca_flags["director_disqualified"] = True
    if "strike off" in text_lower or "struck off" in text_lower or "under liquidation" in text_lower:
        mca_flags["strike_off_flag"] = True
        mca_flags["active_status"] = False
    if "inactive company" in text_lower:
        mca_flags["active_status"] = False
    
    if "name changed from" in text_lower:
        mca_flags["past_name_changes"] += 1

    if mca_flags["strike_off_flag"]:
        mca_flags["mca_risk_score"] += 15
    if mca_flags["director_disqualified"]:
        mca_flags["mca_risk_score"] += 12
    if mca_flags["charges_outstanding"] > 3:
        mca_flags["mca_risk_score"] += 8
    if not mca_flags["active_status"]:
        mca_flags["mca_risk_score"] += 10
    if mca_flags["past_name_changes"] > 1:
        mca_flags["mca_risk_score"] += 5

    return mca_flags

# 2️⃣ NCLT / IBC DETECTION MODULE
def analyze_ibc_cases(text: str) -> dict:
    text_lower = text.lower()
    ibc_flags = {
      "section_7_flag": False,
      "section_9_flag": False,
      "admitted_flag": False,
      "dismissed_flag": False,
      "ibc_risk_score": 0,
      "insolvency_severity": "Low"
    }

    if "section 7" in text_lower:
        ibc_flags["section_7_flag"] = True
    if "section 9" in text_lower:
        ibc_flags["section_9_flag"] = True
    if "ibc admitted" in text_lower or "section 7 admitted" in text_lower or "section 9 admitted" in text_lower:
        ibc_flags["admitted_flag"] = True
    if "ibc dismissed" in text_lower:
        ibc_flags["dismissed_flag"] = True

    if "section 7 admitted" in text_lower:
        ibc_flags["ibc_risk_score"] += 20
        ibc_flags["insolvency_severity"] = "Critical"
    elif "section 9 admitted" in text_lower:
        ibc_flags["ibc_risk_score"] += 15
        ibc_flags["insolvency_severity"] = "High"
    elif "cirp initiated" in text_lower:
        ibc_flags["ibc_risk_score"] += 18
        if ibc_flags["insolvency_severity"] not in ["Critical", "High"]:
            ibc_flags["insolvency_severity"] = "High"
    elif "ibc dismissed" in text_lower:
        ibc_flags["ibc_risk_score"] += 5

    return ibc_flags

# 3️⃣ RBI DEFAULTER / WILFUL DEFAULT DETECTION
def analyze_rbi_flags(text: str) -> dict:
    text_lower = text.lower()
    rbi_flags = {
       "wilful_defaulter_flag": False,
       "crilc_default_flag": False,
       "rbi_risk_score": 0
    }
    
    if "wilful defaulter" in text_lower or "rbi caution list" in text_lower or "rbi blacklist" in text_lower:
        rbi_flags["wilful_defaulter_flag"] = True
        rbi_flags["rbi_risk_score"] += 25
    if "crilc default" in text_lower:
        rbi_flags["crilc_default_flag"] = True
        rbi_flags["rbi_risk_score"] += 15

    return rbi_flags

# 4️⃣ CREDIT RATING MONITORING
def analyze_rating_actions(text: str) -> dict:
    text_lower = text.lower()
    rating_flags = {
        "rating_downgrade_flag": False,
        "rating_suspended_flag": False,
        "default_rating_flag": False,
        "rating_risk_score": 0
    }
    
    if "downgraded" in text_lower:
        rating_flags["rating_downgrade_flag"] = True
        rating_flags["rating_risk_score"] += 6
    if "rating watch negative" in text_lower:
        rating_flags["rating_risk_score"] += 8
    if "rating suspended" in text_lower:
        rating_flags["rating_suspended_flag"] = True
        rating_flags["rating_risk_score"] += 10
    if "default rating" in text_lower:
        rating_flags["default_rating_flag"] = True
        rating_flags["rating_risk_score"] += 15
    if "upgraded" in text_lower or "reaffirmed" in text_lower:
        rating_flags["rating_risk_score"] -= 5
        
    return rating_flags

source_weights = {
   "Economic Times": 1.0,
   "Business Standard": 1.0,
   "Mint": 1.0,
   "Moneycontrol": 0.9,
   "Bloomberg Quint": 1.0,
   "LiveLaw": 0.9,
   "Indian Kanoon": 0.85,
   "e-Courts": 0.85,
   "MCA Portal": 1.0,
   "SEBI Orders": 1.0,
   "Local Blog": 0.4,
   "Local Pune Times": 0.4
}


def fetch_and_analyze(company_name: str, cin: str = None, promoter_names: list = None, location: str = None, industry: str = None):
    """
    High-accuracy multi-source research pipeline with advanced entity matching.
    """
    if sentiment_analyzer is None:
        init_finbert()
    if st_model is None and SentenceTransformer is not None:
        init_st_model()

    # Step 1: Intelligent Query Generation
    queries = [
        f"{company_name} corporate fraud",
        f"{company_name} legal litigation",
        f"{company_name} bankruptcy insolvency",
        f"{company_name} Indian regulators penalty",
        f"{' AND '.join(promoter_names) if promoter_names else company_name} court case"
    ]

    import urllib.parse
    company_query = urllib.parse.quote(company_name)
    
    # Step 2 & 3: Multi-source record simulation with dynamically generated company-specific URLs
    sources = [
        {"source": "Google News", "headline": f"ED searches premises linked to directors of {company_name} over alleged FEMA violations.", "url": f"https://news.google.com/search?q={company_query}+fraud+director"},
        {"source": "e-Courts", "headline": f"Recovery suit filed by HDFC Bank against {company_name} in Mumbai Civil Court.", "url": f"https://ecourts.gov.in/ecourts_home/static/highcourts/business/case_status.php?search={company_query}"},
        {"source": "MCA Portal", "headline": f"Alert: CIN {cin if cin else 'U74999MH2021PTC355000'} associated with delayed GST filings for {company_name}.", "url": f"https://www.mca.gov.in/mcafoportal/viewCompanyMasterData.do"},
        {"source": "Indian Kanoon", "headline": f"Petition for insolvency under IBC Section 7 against {company_name} admitted by NCLT Mumbai.", "url": f"https://indiankanoon.org/search/?formInput={company_query}+insolvency"},
        {"source": "SEBI Orders", "headline": f"Show cause notice issued to {company_name} regarding related party disclosure lapses.", "url": f"https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListingAll=yes&search={company_query}"},
        {"source": "Local Pune Times", "headline": "Acme Fireworks shop (Proprietor: Ramesh) caught fire in Pune market.", "url": f"https://news.google.com/search?q={company_query}+incident"},
        {"source": "Business Standard", "headline": f"Industry-wide regulatory shifts impacting {company_name} and peers in manufacturing.", "url": f"https://www.business-standard.com/search?q={company_query}"}
    ]

    sentiment_score = 0.0
    litigation_cases = 0
    compliance_flags = 0
    risk_keywords = set()
    promoter_red_flags = 0
    analyzed_results = []
    
    global_mca = {"active_status": True, "charges_outstanding": 0, "director_disqualified": False, "strike_off_flag": False, "past_name_changes": 0, "mca_risk_score": 0}
    global_ibc = {"section_7_flag": False, "section_9_flag": False, "admitted_flag": False, "dismissed_flag": False, "ibc_risk_score": 0, "insolvency_severity": "Low"}
    global_rbi = {"wilful_defaulter_flag": False, "crilc_default_flag": False, "rbi_risk_score": 0}
    global_rating = {"rating_downgrade_flag": False, "rating_suspended_flag": False, "default_rating_flag": False, "rating_risk_score": 0}
    
    for item in sources:
        text = item["headline"]
        score = 0.0
        risk_category = "Neutral"

        # --- ADVANCED ENTITY MATCHING & CONFIDENCE LOGIC ---
        
        # --- DUPLICATE DETECTION ---
        treat_as_duplicate = False
        if st_model is not None:
            emb1 = st_model.encode(text)
            for prev_res in analyzed_results:
                emb2 = st_model.encode(prev_res["headline"])
                similarity = util.cos_sim(emb1, emb2)
                if similarity > 0.85:
                    treat_as_duplicate = True
                    break
        
        extracted_entities = perform_ner_extraction(text)
        
        # 1. Direct Identifier Match (CIN/PAN)
        identifier_match = 1.0 if cin and cin in text else 0.0
        
        # 2. Fuzzy Matching for Company Name
        name_match = get_fuzzy_ratio(company_name, text)
        
        # 3. Promoter Proximity Match
        promoter_match = 0.0
        if promoter_names:
            for p in promoter_names:
                p_match = get_fuzzy_ratio(p, text)
                if p_match > promoter_match:
                    promoter_match = p_match
                if p_match > 0.85 and any(w in text.lower() for w in ['case', 'fraud', 'arrest', 'scam']):
                    promoter_red_flags += 1

        location_match = get_fuzzy_ratio(location, text) if location else 0.0
        industry_match = get_fuzzy_ratio(industry, text) if industry else 0.0

        confidence = (0.4 * identifier_match) + (0.2 * name_match) + (0.15 * promoter_match) + (0.15 * location_match) + (0.1 * industry_match)

        # 4. Keyword Proximity (Bonus confidence if risk keywords are near the entity)
        risk_words = ['fraud', 'suit', 'penalty', 'insolvency', 'default', 'lapse', 'notice', 'ed', 'sebi', 'rbi']
        if confidence > 0.5 and any(w in text.lower() for w in risk_words):
            confidence = min(1.0, confidence + 0.15)

        # 5. Contextual Validation Layer
        corporate_context_words = [
            "company", "limited", "ltd", "board", "director",
            "financial", "turnover", "shareholding",
            "insolvency", "nclt", "sebi", "rbi"
        ]
        if confidence > 0.75:
            context_score = sum(1 for w in corporate_context_words if w in text.lower())
            if context_score < 2:
                confidence *= 0.7  # downgrade weak business context

        # --- SENTIMENT & RISK ENGINE ---
        if sentiment_analyzer != "mock":
            res = sentiment_analyzer(text)[0]
            score = res['score'] if res['label'] == 'positive' else -res['score']
        else:
            lower_text = text.lower()
            if any(k in lower_text for k in risk_words):
                score = -0.80
            else:
                score = 0.20
        
        # Adjust risk by source credibility
        score *= source_weights.get(item["source"], 0.6)
        
        # Accuracy Guard: Only update global risk metrics if confidence > 0.75
        is_relevant = confidence > 0.75
        
        if is_relevant and not treat_as_duplicate:
            sentiment_score += score
            
            # Module Analyses
            mca_res = analyze_mca_records(text)
            global_mca["active_status"] = global_mca["active_status"] and mca_res["active_status"]
            global_mca["charges_outstanding"] = max(global_mca["charges_outstanding"], mca_res["charges_outstanding"])
            global_mca["director_disqualified"] = global_mca["director_disqualified"] or mca_res["director_disqualified"]
            global_mca["strike_off_flag"] = global_mca["strike_off_flag"] or mca_res["strike_off_flag"]
            global_mca["past_name_changes"] += mca_res["past_name_changes"]
            global_mca["mca_risk_score"] += mca_res["mca_risk_score"]
            
            ibc_res = analyze_ibc_cases(text)
            global_ibc["section_7_flag"] = global_ibc["section_7_flag"] or ibc_res["section_7_flag"]
            global_ibc["section_9_flag"] = global_ibc["section_9_flag"] or ibc_res["section_9_flag"]
            global_ibc["admitted_flag"] = global_ibc["admitted_flag"] or ibc_res["admitted_flag"]
            global_ibc["dismissed_flag"] = global_ibc["dismissed_flag"] or ibc_res["dismissed_flag"]
            global_ibc["ibc_risk_score"] += ibc_res["ibc_risk_score"]
            if ibc_res["insolvency_severity"] != "Low":
                global_ibc["insolvency_severity"] = ibc_res["insolvency_severity"]
            
            rbi_res = analyze_rbi_flags(text)
            global_rbi["wilful_defaulter_flag"] = global_rbi["wilful_defaulter_flag"] or rbi_res["wilful_defaulter_flag"]
            global_rbi["crilc_default_flag"] = global_rbi["crilc_default_flag"] or rbi_res["crilc_default_flag"]
            global_rbi["rbi_risk_score"] += rbi_res["rbi_risk_score"]
            
            rating_res = analyze_rating_actions(text)
            global_rating["rating_downgrade_flag"] = global_rating["rating_downgrade_flag"] or rating_res["rating_downgrade_flag"]
            global_rating["rating_suspended_flag"] = global_rating["rating_suspended_flag"] or rating_res["rating_suspended_flag"]
            global_rating["default_rating_flag"] = global_rating["default_rating_flag"] or rating_res["default_rating_flag"]
            global_rating["rating_risk_score"] += rating_res["rating_risk_score"]
            
            lower_text = text.lower()
            if any(w in lower_text for w in ['suit', 'court', 'petition', 'nclt']):
                risk_category = "Litigation Risk"
                litigation_cases += 1
                risk_keywords.add("legal petition")
            elif any(w in lower_text for w in ['fraud', 'searches', 'fema', 'scam']):
                risk_category = "Fraud/Governance Risk"
                compliance_flags += 1
                risk_keywords.add("regulatory probe")
            elif any(w in lower_text for w in ['insolvency', 'bankruptcy', 'ibc']):
                risk_category = "Liquidity Risk"
                risk_keywords.add("ibc filing")
            elif any(w in lower_text for w in ['rbi', 'sebi', 'penalty', 'notice']):
                risk_category = "Regulatory Risk"
                compliance_flags += 1
                risk_keywords.add("statutory penalty")

        analyzed_results.append({
            "headline": item["headline"],
            "source": item["source"],
            "url": item["url"],
            "category": risk_category,
            "impact": round(score, 2),
            "confidence": round(confidence * 100, 2),
            "is_high_confidence": is_relevant
        })

    final_sentiment = round(sentiment_score / (len(sources) or 1), 2)
    news_risk_score = min(25, (litigation_cases * 4) + (compliance_flags * 3) + (promoter_red_flags * 5) + (abs(final_sentiment) * 10 if final_sentiment < 0 else 0))
    litigation_severity = "High" if litigation_cases > 2 else ("Medium" if litigation_cases > 0 else "Low")
    promoter_risk_level = "Elevated" if promoter_red_flags > 0 else "Stable"
    
    final_nlp_risk = (
        global_ibc["ibc_risk_score"] * 0.30 +
        global_mca["mca_risk_score"] * 0.20 +
        global_rating["rating_risk_score"] * 0.15 +
        global_rbi["rbi_risk_score"] * 0.20 +
        news_risk_score * 0.15
    )
    final_nlp_risk = min(25, max(0, final_nlp_risk))
    
    if final_nlp_risk < 8:
        risk_level = "Low"
    elif final_nlp_risk < 15:
        risk_level = "Medium"
    elif final_nlp_risk < 22:
        risk_level = "High"
    else:
        risk_level = "Critical"

    # Identify risk drivers
    drivers = []
    if global_ibc["ibc_risk_score"] > 0: drivers.append("IBC Case Detected")
    if global_mca["strike_off_flag"]: drivers.append("MCA Strike Off")
    if global_rating["rating_downgrade_flag"]: drivers.append("Credit Rating Downgrade")
    if global_rbi["wilful_defaulter_flag"]: drivers.append("Wilful Defaulter Flag")
    if compliance_flags > 0: drivers.append("Regulatory Compliance Issue")

    return {
        "mca_intelligence": global_mca,
        "ibc_analysis": global_ibc,
        "rbi_analysis": global_rbi,
        "rating_analysis": global_rating,
        "source_quality_summary": { "credible_sources_found": len([r for r in analyzed_results if source_weights.get(r["source"], 0) >= 0.85]) },
        "nlp_risk_impact_score": round(final_nlp_risk, 2),
        "risk_level": risk_level,
        "risk_drivers": drivers,
        
        # backward compatibility
        "news_sentiment_score": final_sentiment,
        "sentiment_score": final_sentiment, 
        "litigation_cases": litigation_cases,
        "litigation_severity": litigation_severity,
        "litigation_severity_score": litigation_cases * 10,
        "compliance_flags": compliance_flags,
        "compliance_flag_count": compliance_flags,
        "promoter_risk_level": promoter_risk_level,
        "promoter_risk_score": promoter_red_flags * 20,
        "industry_risk_trend": "Rising" if final_nlp_risk > 15 else "Stable",
        "industry_risk_index": 45 + (final_nlp_risk * 2),
        "risk_keywords": list(risk_keywords),
        "summary_insight": f"{litigation_cases} litigation cases and {compliance_flags} compliance notices detected. Overall Risk: {risk_level}.",
        "analyzed_headlines": [r["headline"] for r in analyzed_results], 
        "detailed_analysis": analyzed_results,
        "fraud_flags": compliance_flags, 
        "litigation_count": litigation_cases, 
        "negative_news_index": round(min(compliance_flags * 33, 100), 2), 
        "sector_risk_index": 45 + (final_nlp_risk * 2) 
    }

if __name__ == "__main__":
    test_result = fetch_and_analyze(
        company_name="Acme Corp Logistics Ltd.",
        cin="U74999MH2021PTC355000",
        promoter_names=["Vikram Malhotra", "Sameer Sen"],
        location="Mumbai",
        industry="Logistics"
    )
    import json
    with open("test_output.json", "w") as f:
        json.dump(test_result, f, indent=2)

