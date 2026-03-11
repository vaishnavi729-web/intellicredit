from fastapi import FastAPI, File, UploadFile, BackgroundTasks
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import time
import json
import os
from typing import List

from ml_engine import risk_calculator, train_model
from nlp_research import fetch_and_analyze
from doc_intelligence import extract_financials

app = FastAPI(title="INTELLICREDIT AI API", version="1.0")

import sqlite3
from typing import List, Optional

# --- DATABASE SETUP ---
DB_PATH = os.path.join(os.path.dirname(__file__), "intellicredit.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Tables for persistent storage
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS corporate_profiles (
            companyName TEXT PRIMARY KEY,
            cin TEXT,
            gstin TEXT,
            pan TEXT,
            promoterNames TEXT,
            email TEXT,
            mobile TEXT,
            address TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            companyName TEXT,
            industry TEXT,
            amount TEXT,
            status TEXT,
            date TEXT,
            cin TEXT,
            pan TEXT,
            gstin TEXT,
            promoterNames TEXT,
            purpose TEXT,
            notes TEXT,
            address TEXT,
            bank TEXT,
            finalLimit TEXT,
            finalRate TEXT,
            reason TEXT,
            camUrl TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_accounts (
            email TEXT PRIMARY KEY,
            password TEXT,
            role TEXT,
            bankName TEXT,
            companyName TEXT
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.post("/signup")
async def signup(user: dict):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO user_accounts (email, password, role, bankName, companyName)
            VALUES (?, ?, ?, ?, ?)
        ''', (user.get('email'), user.get('pass'), user.get('role'), user.get('bankName'), user.get('companyName')))
        conn.commit()
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()

@app.post("/login")
async def login(credentials: dict):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM user_accounts WHERE email = ? AND password = ?", (credentials.get('email'), credentials.get('pass')))
    user = cursor.fetchone()
    conn.close()
    if user:
        return {"status": "success", "user": dict(user)}
    return {"status": "error", "message": "Invalid credentials"}

@app.post("/save_profile")
async def save_profile(profile: dict):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT OR REPLACE INTO corporate_profiles 
        (companyName, cin, gstin, pan, promoterNames, email, mobile, address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        profile.get('companyName'), profile.get('cin'), profile.get('gstin'),
        profile.get('pan'), profile.get('promoterNames'), profile.get('email'),
        profile.get('mobile'), profile.get('address')
    ))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.get("/get_profile/{company_name}")
async def get_profile(company_name: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM corporate_profiles WHERE companyName = ?", (company_name,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "companyName": row[0], "cin": row[1], "gstin": row[2], "pan": row[3],
            "promoterNames": row[4], "email": row[5], "mobile": row[6], "address": row[7]
        }
    return None

@app.post("/save_application")
async def save_application(app_data: dict):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO applications 
        (companyName, industry, amount, status, date, cin, pan, gstin, promoterNames, purpose, notes, address, bank)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        app_data.get('companyName'), app_data.get('industry'), app_data.get('amount'),
        app_data.get('status', 'Pending'), app_data.get('date'), app_data.get('cin'),
        app_data.get('pan'), app_data.get('gstin'), app_data.get('promoterNames'),
        app_data.get('purpose'), app_data.get('notes'), app_data.get('address'),
        app_data.get('bank')
    ))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Application saved to core engine"}

@app.put("/update_application/{app_id}")
async def update_application(app_id: int, app_data: dict):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE applications 
        SET companyName = ?, industry = ?, amount = ?, purpose = ?, notes = ?, address = ?, bank = ?,
            cin = ?, pan = ?, gstin = ?, promoterNames = ?
        WHERE id = ?
    ''', (
        app_data.get('companyName'), app_data.get('industry'), app_data.get('amount'),
        app_data.get('purpose'), app_data.get('notes'), app_data.get('address'),
        app_data.get('bank'), app_data.get('cin'), app_data.get('pan'),
        app_data.get('gstin'), app_data.get('promoterNames'), app_id
    ))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Application updated successfully"}

@app.get("/get_applications")
async def get_applications(bank: Optional[str] = None, company: Optional[str] = None):
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    query = "SELECT * FROM applications"
    params = []
    
    if bank:
        query += " WHERE bank = ?"
        params.append(bank)
    elif company:
        query += " WHERE companyName = ?"
        params.append(company)
        
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "react_frontend"))
if os.path.exists(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

@app.get("/")
def read_root():
    return FileResponse(os.path.join(frontend_dir, "index.html"))

@app.get("/download_cam")
def download_cam(path: str):
    if os.path.exists(path):
        return FileResponse(path, media_type="application/pdf", filename="intellicredit_cam.pdf")
    return {"error": "File not found."}

try:
    train_model()
except Exception as e:
    print(f"Model init failed: {e}")

class InvestigatorInput(BaseModel):
    utilization_pct: float
    machinery_condition: str
    inventory_status: str
    employee_strength: int
    management_rating: int

class DecisionPayload(BaseModel):
    decision: str
    loan_limit: float
    interest_rate: float
    tenure: int
    reason: str = ""

@app.post("/upload_documents")
async def upload_documents(files: List[UploadFile] = File(...)):
    """Extract financial data from multiple formats (PDF, Excel, Docx)"""
    extracted_data = extract_financials(files)
    return {"status": "success", "data": extracted_data}

@app.get("/external_research/{company_name}")
async def external_research(company_name: str, cin: str = None, promoter_names: str = None, location: str = None, industry: str = None, bank: str = None):
    """Run NLP on news for company sentiment and litigation."""
    p_names = promoter_names.split(",") if promoter_names else []
    results = fetch_and_analyze(company_name, cin, p_names, location, industry, bank_name=bank)
    return results

@app.post("/calculate_risk")
async def calculate_risk(input_data: dict):
    from feature_engineering import extract_features
    from risk_model import risk_model_instance
    from explainability import explain_decision
    
    # 1. Feature Engineering
    ml_features = extract_features(input_data)
    
    # 2. Risk Model Inference (PD Score)
    pd_score = risk_model_instance.predict_pd(ml_features)
    
    # 3. SHAP Explainability Layer
    explanation = explain_decision(ml_features, pd_score)
    
    # Scale PD to % for frontend
    pd_pct = round(pd_score * 100, 2)
    
    # 4. Final Recommendation Logic (Preserving Business Logic)
    if pd_score < 0.25:
        decision = "Approve"
        risk_premium = 1.5
    elif pd_score < 0.50:
        decision = "Approve with Conditions"
        risk_premium = 3.0
    elif pd_score < 0.75:
        decision = "High Risk - Collateral Required"
        risk_premium = 5.5
    else:
        decision = "Reject"
        risk_premium = None

    requested_amount = float(input_data.get("requested_amount", input_data.get("amount", 100.0)))
    if risk_premium is not None:
        adjusted_limit = requested_amount * (1 - pd_score)
        interest_rate = 8.0 + risk_premium # Base market rate assumed 8.0%
    else:
        adjusted_limit = 0.0
        interest_rate = None

    return {
        "pd_score": pd_pct,
        "risk_level": explanation["risk_level"],
        "decision": decision,
        "recommended_limit": round(adjusted_limit, 2),
        "interest_rate": interest_rate,
        # SHAP Insights for REACT dashboard
        "top_risk_drivers": explanation["top_risk_drivers"],
        "feature_importance": explanation["feature_contributions"],
        "base_value": explanation["base_value"],
        "ml_features": ml_features
    }

@app.get("/get_shap_plot")
async def get_shap_plot(input_data: dict):
    from explainability import get_force_plot_base64
    from feature_engineering import extract_features
    
    ml_features = extract_features(input_data)
    plot_base64 = get_force_plot_base64(ml_features)
    return {"status": "success", "image_base64": plot_base64}


@app.post("/site_visit_update")
async def site_visit_update(visit: InvestigatorInput):
    """Update risk models based on site visit info"""
    adj = 0
    if visit.management_rating < 3: adj += 15
    if visit.utilization_pct < 50: adj += 20
    if visit.machinery_condition == "Poor": adj += 10
    
    return {"status": "updated", "risk_adjustment": adj, "utilization_pct": visit.utilization_pct}

@app.post("/submit_decision")
async def submit_decision(decision: DecisionPayload):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE applications 
        SET status = ?, finalLimit = ?, finalRate = ?, reason = ?
        WHERE id = ?
    ''', (decision.status, decision.finalLimit, decision.finalRate, decision.reason, decision.id))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Decision Recorded Successfully"}

@app.post("/get_cam_text")
async def get_cam_text(data: dict):
    from cam_generator import generate_llm_cam_content
    text = generate_llm_cam_content(data)
    return {"status": "success", "content": text}

@app.post("/generate_cam")
async def generate_cam(data: dict):
    """Generate final CAM memo content."""
    from cam_generator import generate_pdf_cam
    pdf_path = generate_pdf_cam(data)
    
    app_id = data.get('id')
    if app_id:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("UPDATE applications SET camUrl = ? WHERE id = ?", (pdf_path, app_id))
        conn.commit()
        conn.close()
        
    return {"status": "success", "file": pdf_path}

# Catch-all: serve index.html for any unmatched route (SPA support)
@app.get("/{full_path:path}")
async def spa_fallback(full_path: str):
    return FileResponse(os.path.join(frontend_dir, "index.html"))
