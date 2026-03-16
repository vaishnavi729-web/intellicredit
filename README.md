# IntelliCredit -- AI Credit Appraisal System

IntelliCredit is an AI-powered credit appraisal platform designed to
assist banks and financial institutions in evaluating loan applications
using machine learning, document intelligence, and explainable AI.

The system analyzes borrower financial documents, predicts credit risk,
and generates automated Credit Appraisal Memos (CAM) to help loan
officers make faster and more reliable lending decisions.

------------------------------------------------------------------------

## 🚀 Features

### Loan Application Management

-   Submit and track loan applications
-   View application status
-   Manage borrower profiles

### AI Risk Assessment

-   Machine learning model predicts **Probability of Default (PD)**
-   Risk scoring based on financial indicators
-   Automated creditworthiness evaluation

### Document Intelligence

-   Upload financial documents
-   Extract data from:
    -   Annual Reports
    -   Bank Statements
    -   Financial Statements
-   Automatic financial feature extraction

### NLP Research

-   Fetch company-related insights
-   Analyze market and financial text data

### Explainable AI

-   SHAP-based explainability
-   Shows key factors affecting loan risk

### CAM Generator

-   Automatic **Credit Appraisal Memo generation**
-   Structured loan evaluation report

### Dashboard Analytics

-   Loan request queue
-   Borrower analysis
-   Risk indicators

------------------------------------------------------------------------

## 🏗 System Architecture

Borrower Dashboard (React) ↓ Loan Application API ↓ FastAPI Backend ↓ AI
Modules - Risk Model - Document Intelligence - NLP Research - Feature
Engineering - Explainability Layer

------------------------------------------------------------------------

## 📂 Project Structure

intellicredit/
│
├── backend/
│ ├── main.py
│ ├── ml_engine.py
│ ├── risk_model.py
│ ├── feature_engineering.py
│ ├── explainability.py
│ ├── doc_intelligence.py
│ ├── nlp_research.py
│ ├── cam_generator.py
│ └── intellicredit.db
│
├── react_frontend/
│ └── frontend UI code
│
└── venv/

------------------------------------------------------------------------

## ⚙️ Installation

### 1️⃣ Clone Repository

git clone https://github.com/yourusername/intellicredit.git cd
intellicredit

### 2️⃣ Create Virtual Environment

python -m venv venv

Activate environment:

Windows: venv`\Scripts`{=tex}`\activate`{=tex}

Linux/Mac: source venv/bin/activate

### 3️⃣ Install Dependencies

pip install -r requirements.txt

### 4️⃣ Run Backend Server

cd backend uvicorn main:app --reload

Backend runs at: http://127.0.0.1:8000

API Docs: http://127.0.0.1:8000/docs

### 5️⃣ Run Frontend

cd react_frontend npm install npm start

------------------------------------------------------------------------

## 🧠 AI Components

### Risk Prediction

Machine learning model predicts credit risk using: - Revenue - Profit
margin - Debt ratio - Cash flow indicators

### Explainability

Uses SHAP to show: - Top features increasing risk - Top features
reducing risk

### Document Intelligence

Extracts financial values from uploaded documents.

### NLP Research

Analyzes company data and financial context.

------------------------------------------------------------------------

## 📊 Example Workflow

1.  Borrower submits loan application
2.  Documents uploaded
3.  Financial data extracted
4.  ML model calculates risk score
5.  SHAP explains decision
6.  CAM report generated
7.  Bank officer approves/rejects loan

------------------------------------------------------------------------

## 🛠 Technologies Used

Backend - FastAPI - Python - SQLite

Machine Learning - Scikit-learn - SHAP - Transformers - Sentence
Transformers

Data Processing - Pandas - NumPy

Document Processing - PyPDF2 - python-docx - ReportLab

Visualization - Matplotlib

Frontend - React

------------------------------------------------------------------------

## 🎯 Future Improvements

-   Blockchain-based document verification
-   Real-time credit bureau integration
-   Fraud detection models
-   Multi-bank loan marketplace
-   Automated regulatory compliance

------------------------------------------------------------------------

## 👩‍💻 Author

AI-powered financial analytics platform for intelligent loan appraisal
and credit risk management.
