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

# In-memory DB for simulation
APPLICATIONS = [
    { "id": 101, "companyName": "Acme Corp Logistics Ltd.", "industry": "Logistics", "amount": "40.0", "status": "Pending", "date": "2026-03-08", "cin": "U74999MH2021PTC355000", "pan": "AAACA1234F", "gstin": "27AAACA1234F1Z5", "doi": "2012-05-18", "address": "Andheri East, Mumbai, MH - 400069", "promoterNames": "Vikram Malhotra, Sameer Sen" }
]

@app.post("/save_application")
async def save_application(app_data: dict):
    APPLICATIONS.append(app_data)
    return {"status": "success", "message": "Application saved to core engine"}

@app.get("/get_applications")
async def get_applications():
    return APPLICATIONS

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
    """Simulate document extraction (OCR/LLM)"""
    extracted_data = extract_financials([f.filename for f in files])
    return {"status": "success", "data": extracted_data}

@app.get("/external_research/{company_name}")
async def external_research(company_name: str, cin: str = None, promoter_names: str = None):
    """Run NLP on news for company sentiment and litigation."""
    p_names = promoter_names.split(",") if promoter_names else []
    results = fetch_and_analyze(company_name, cin, p_names)
    return results

@app.post("/calculate_risk")
async def calculate_risk(features: dict):
    """Run ML XGBoost/RF Model with SHAP"""
    result = risk_calculator(features)
    return result

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
    # In real world, saves to DB
    return {"status": "Decision Recorded Successfully", "data": decision.dict()}

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
    return {"status": "success", "file": pdf_path}
