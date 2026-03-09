import streamlit as st
import time
import requests
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import os

# Set page config FIRST
st.set_page_config(page_title="INTELLICREDIT AI", layout="wide", initial_sidebar_state="expanded")

# --- CSS STYLING ---
st.markdown("""
<style>
    /* Dark Mode Global Variables */
    :root {
        --primary: #3B82F6;
        --success: #10B981;
        --warning: #F59E0B;
        --danger: #EF4444;
        --bg-color: #0F172A;
        --panel-bg: #1E293B;
        --text-main: #F8FAFC;
        --text-muted: #94A3B8;
    }
    
    .stApp {
        background-color: var(--bg-color);
        color: var(--text-main);
    }
    
    .css-1d391kg { background-color: var(--panel-bg); }
    
    h1, h2, h3 { color: var(--text-main); font-family: 'Inter', sans-serif; font-weight: 700; }
    
    .metric-card {
        background-color: var(--panel-bg);
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 24px;
        text-align: center;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;
    }
    
    .metric-card:hover { transform: translateY(-3px); }
    .metric-value { font-size: 32px; font-weight: bold; margin: 10px 0; }
    .metric-label { font-size: 14px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;}
    
    .stButton>button {
        background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 10px 24px;
        font-weight: 600;
        width: 100%;
        transition: all 0.3s;
    }
    .stButton>button:hover {
        box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
    }
    
    /* Timeline / Workflow Animation Classes */
    .timeline-item {
        padding: 15px;
        margin: 10px 0;
        border-left: 2px solid #334155;
        position: relative;
    }
    .timeline-item.active {
        border-left-color: var(--primary);
    }
    .timeline-item::before {
        content: '';
        position: absolute;
        width: 12px;
        height: 12px;
        background: var(--panel-bg);
        border: 2px solid #334155;
        border-radius: 50%;
        left: -8px;
        top: 20px;
    }
    .timeline-item.active::before {
        background: var(--primary);
        border-color: var(--text-main);
        box-shadow: 0 0 10px var(--primary);
    }
    
    /* Hide top nav */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
</style>
""", unsafe_allow_html=True)

# --- STATE MANAGEMENT ---
if 'uploaded' not in st.session_state: st.session_state.uploaded = False
if 'extracted_data' not in st.session_state: st.session_state.extracted_data = {}
if 'nlp_data' not in st.session_state: st.session_state.nlp_data = {}
if 'risk_data' not in st.session_state: st.session_state.risk_data = {}
if 'pipeline_stage' not in st.session_state: st.session_state.pipeline_stage = 0
if 'cam_generated' not in st.session_state: st.session_state.cam_generated = False
if 'company_name' not in st.session_state: st.session_state.company_name = "Acme Corp Logistics Ltd."

API_URL = "http://127.0.0.1:8000"

# --- SIDEBAR NAV ---
st.sidebar.image("https://cdn-icons-png.flaticon.com/512/3592/3592818.png", width=60)
st.sidebar.title("INTELLICREDIT AI")
st.sidebar.markdown('**Next-Gen Corporate AI Appraisal**', help='v1.0.0')

nav = st.sidebar.radio("Navigation", [
    "🚀 Dashboard Pipeline",
    "📄 Document Intelligence",
    "🌐 External NLP Research",
    "🧠 ML Risk Engine",
    "👷 Investigator Portal",
    "📝 AI CAM Generator"
])

def call_api(endpoint, method="POST", data=None, files=None):
    try:
        url = f"{API_URL}{endpoint}"
        if method == "POST":
            res = requests.post(url, json=data, files=files)
        elif method == "GET":
            res = requests.get(url)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

# --- PIPELINE WORKFLOW (Animated UI) ---
if nav == "🚀 Dashboard Pipeline":
    st.title("Live Workflow Dashboard")
    st.markdown("Track the 6-module AI appraisal lifecycle for the applicant.")
    
    c1, c2, c3 = st.columns([1,2,1])
    c1.text_input("Company Name", st.session_state.company_name, key='cn1')
    st.session_state.company_name = st.session_state.cn1
    
    if c2.button("Run Full Automated AI Pipeline"):
        
        stages = ["Uploading Documents...", "AI Extraction Running...", "External Research (NLP)...", "ML Risk Calculation..."]
        progress = st.progress(0)
        status_text = st.empty()
        
        # 1. Upload
        status_text.markdown(f"**Stage 1:** {stages[0]}")
        time.sleep(1)
        st.session_state.uploaded = True
        progress.progress(25)
        
        # 2. Extract
        status_text.markdown(f"**Stage 2:** {stages[1]}")
        import random
        # local stub for pipeline running
        st.session_state.extracted_data = {
            "revenue": random.randint(100, 500), "debt_equity": round(random.uniform(0.5, 3.0),2),
            "interest_coverage": round(random.uniform(1.2, 5.0),2), "gst_mismatch_pct": round(random.uniform(0,3),1)
        }
        time.sleep(1.5)
        progress.progress(50)
        
        # 3. NLP
        status_text.markdown(f"**Stage 3:** {stages[2]}")
        st.session_state.nlp_data = {
            "sentiment_score": round(random.uniform(-0.5, 0.8),2),
            "negative_news_index": random.randint(0, 40),
            "litigation_probability": random.randint(0, 30),
            "sector_risk_index": random.randint(30, 70)
        }
        time.sleep(1.5)
        progress.progress(75)
        
        # 4. ML
        status_text.markdown(f"**Stage 4:** {stages[3]}")
        time.sleep(1)
        
        # Send everything to risk endpoint wrapper
        features = {
            "debt_equity": st.session_state.extracted_data['debt_equity'],
            "interest_coverage": st.session_state.extracted_data['interest_coverage'],
            "revenue_growth": round(random.uniform(-10, 20),2),
            "cash_flow_stability": round(random.uniform(0, 1),2),
            "gst_mismatch_pct": st.session_state.extracted_data['gst_mismatch_pct'],
            "sentiment_score": st.session_state.nlp_data['sentiment_score'],
            "litigation_count": st.session_state.nlp_data['litigation_probability'] // 10,
            "sector_risk_index": st.session_state.nlp_data['sector_risk_index'],
            "utilization_pct": 80.0,
            "collateral_coverage": 1.5
        }
        res = call_api("/calculate_risk", data=features)
        if "error" not in res:
            st.session_state.risk_data = res
            
        progress.progress(100)
        status_text.markdown("✅ **Pipeline Complete!** See modules for deep-dive.")
        st.session_state.pipeline_stage = 4
        
    if st.session_state.pipeline_stage == 4:
        st.markdown("### Executive AI Summary")
        col1, col2, col3, col4 = st.columns(4)
        
        pd_val = st.session_state.risk_data.get('probability_of_default', 0)
        risk_score = st.session_state.risk_data.get('risk_score', 0)
        sent = st.session_state.nlp_data.get('sentiment_score', 0)
        
        # Build metric cards
        cards = [
            (f"{pd_val}%", "Probability of Default", "#EF4444" if pd_val > 10 else "#10B981"),
            (f"{risk_score}/100", "Overall Risk Score", "#F59E0B" if risk_score > 50 else "#10B981"),
            (f"{sent}", "FinBERT Sentiment", "#10B981" if sent > 0 else "#EF4444"),
            (f"{st.session_state.nlp_data.get('litigation_probability',0)}%", "Litigation Risk", "#F59E0B")
        ]
        
        cols = [col1, col2, col3, col4]
        for c, (val, label, color) in zip(cols, cards):
            c.markdown(f"""
            <div class='metric-card'>
                <div class='metric-label'>{label}</div>
                <div class='metric-value' style='color: {color}'>{val}</div>
            </div>
            """, unsafe_allow_html=True)
            
# --- DOCUMENT INTELLIGENCE ---
elif nav == "📄 Document Intelligence":
    st.title("🗂️ AI Document Intelligence")
    st.markdown("OCR and LLM extraction of Annual Reports, GST Returns, and Bank Statements.")
    
    uploaded_files = st.file_uploader("Upload Applicant Files (PDF, XML, JSON)", accept_multiple_files=True)
    if st.button("Extract Financials"):
        if uploaded_files:
            with st.spinner("Extracting with GPT-4 Vision & Tesseract OCR..."):
                # Simulate API file upload
                # We mock it here since Streamlit file passing to FastAPI on same machine is tricky via requests.files in demo
                res = call_api("/upload_documents", data={}, files=[('files', (f.name, f.getvalue(), f.type)) for f in uploaded_files])
                if "error" not in res:
                    st.success("Extraction Complete")
                    st.session_state.extracted_data = res['data']
                    
                    df = pd.DataFrame(res['data'].items(), columns=["Financial Metric", "Extracted Value (CR)"])
                    st.table(df)
        else:
            st.warning("Upload documentation first.")

# --- EXTERNAL NLP RESEARCH ---
elif nav == "🌐 External NLP Research":
    st.title("📰 NLP Research Agent")
    company = st.text_input("Entity to scan:", st.session_state.company_name)
    
    if st.button("Run FinBERT Web Scan"):
        with st.spinner("Fetching news & scanning MCA/Courts..."):
            res = call_api(f"/external_research/{company}", method="GET")
            if "error" not in res:
                st.session_state.nlp_data = res
                st.success("Scan Complete.")
                
                c1, c2, c3 = st.columns(3)
                c1.metric("Sentiment Score", res['sentiment_score'])
                c2.metric("Negative News Index", f"{res['negative_news_index']}%")
                c3.metric("Litigation Prob.", f"{res['litigation_probability_pct']}%")
                
                st.subheader("Highlighted News (Extracted Entities)")
                for n in res['analyzed_headlines']:
                    st.info(n)
            else:
                st.error("Backend offline. Please start FastAPI.")

# --- ML RISK ENGINE ---
elif nav == "🧠 ML Risk Engine":
    st.title("⚡ AI Risk & Probability of Default Model")
    if not st.session_state.risk_data:
        st.warning("Please run the pipeline or extract data first.")
    else:
        st.markdown("### Model Outputs (Random Forest / XGBoost)")
        rs = st.session_state.risk_data.get('risk_score', 0)
        c1, c2 = st.columns(2)
        c1.metric("Calculated Default Probability", f"{st.session_state.risk_data.get('probability_of_default', 0)}%")
        c2.metric("IntelliCredit Risk Score", f"{rs}/100", st.session_state.risk_data.get('risk_category', 'Unknown'))
        
        st.markdown("### SHAP Feature Explainability")
        st.markdown("Transparent breakdown of top drivers influencing the AI prediction.")
        
        drivers = st.session_state.risk_data.get('shap_values', {})
        if drivers:
            df = pd.DataFrame(drivers.items(), columns=["Feature", "SHAP Impact"])
            df = df.sort_values(by="SHAP Impact", ascending=False)
            
            fig = px.bar(df, x="SHAP Impact", y="Feature", orientation='h', 
                         color="SHAP Impact", color_continuous_scale="RdYlGn_r",
                         title="Feature Impact on Probability of Default")
            fig.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font=dict(color='white'))
            st.plotly_chart(fig, use_container_width=True)

# --- INVESTIGATOR PORTAL ---
elif nav == "👷 Investigator Portal":
    st.title("📍 Site Visit Investigator Input")
    st.markdown("Physical verification data is dynamically fed back into the ML model.")
    
    with st.form("site_form"):
        col1, col2 = st.columns(2)
        util = col1.slider("Factory Utilization %", 0, 100, 75)
        mach = col1.selectbox("Machinery Condition", ["Excellent", "Good", "Fair", "Poor"])
        inv = col2.selectbox("Inventory Status", ["Fast Moving", "Normal", "Slow Moving", "Obsolete"])
        mgmt = col2.slider("Management Credibility (1-5)", 1, 5, 4)
        
        submit = st.form_submit_button("Update Risk Profile")
        if submit:
            payload = {
                "utilization_pct": util,
                "machinery_condition": mach,
                "inventory_status": inv,
                "management_rating": mgmt
            }
            res = call_api("/site_visit_update", data=payload)
            st.success(f"Dynamic Recalibration Applied: {res.get('risk_adjustment', 0)}% penalty/bonus applied to Risk Score.")

# --- CAM GENERATOR ---
elif nav == "📝 AI CAM Generator":
    st.title("📑 AI-Powered Credit Appraisal Memo")
    
    if st.button("Generate Final CAM Report"):
        with st.spinner("LLM Generating structure... Document intelligence formatting..."):
            
            payload = {
                "company_name": st.session_state.company_name,
                "pd": st.session_state.risk_data.get('probability_of_default', 5.5),
                "risk_score": st.session_state.risk_data.get('risk_score', 45),
                "sentiment_score": st.session_state.nlp_data.get('sentiment_score', 0.2),
                "top_drivers": st.session_state.risk_data.get('top_drivers', [])
            }
            
            res = call_api("/generate_cam", data=payload)
            if "error" not in res:
                st.session_state.cam_generated = res['file']
                st.success("Professional CAM Generated inside /backend/.")
            else:
                st.error("Error connecting to generator.")
                
    if st.session_state.cam_generated:
        st.markdown("### Executive Review")
        st.text_area("Live Editor (Preview Mode)", f"Prepared for: {st.session_state.company_name}\n\nThe IntelliCredit engine recommends a Facility limit of 35 CR at 9.5% based on a PD of {st.session_state.risk_data.get('probability_of_default', 5.5)}%.\n\nPlease refer to the downloaded PDF for full disclosures.", height=200)
        
        c1, c2, c3 = st.columns(3)
        cam_file = st.session_state.cam_generated
        try:
            with open(cam_file, "rb") as fl:
                c1.download_button("Download CAM PDF", fl, file_name=os.path.basename(cam_file), mime="application/pdf")
        except:
            st.warning("Ensure backend is running and ReportLab successfully built the file.")
