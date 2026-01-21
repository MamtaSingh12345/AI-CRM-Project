AI-First Healthcare CRM System (HCP Interaction Module)

An AI-powered Customer Relationship Management (CRM) system designed for Healthcare Professional (HCP) interactions. This project enables medical field representatives and healthcare staff to log patient interactions using both structured forms and conversational chat interfaces. The system leverages AI agent orchestration using LangGraph principles and Groq LLMs for intelligent automation.

 Project Objective

The goal of this project is to design and implement an AI-first Healthcare CRM module focused on the Log Interaction Screen, allowing users to:

Log interactions using forms or chat

Automate backend workflows using AI agents

Store interaction data securely

Generate AI-powered insights and summaries

Manage follow-ups and compliance tracking

Key Features:-

 Dual Input Modes (Form + Chat Interface)
 AI Agent-Based Workflow Management
 Automated Interaction Logging
 Follow-Up Scheduling
 Interaction Editing
 Healthcare Professional (HCP) Data Retrieval
 Compliance Status Tracking
 AI-Generated Insights & Summaries
 REST API Architecture
 Modern Single-Page UI

Tech Stack:-
Frontend

React.js

Redux (State Management)

Google Inter Font

Axios (API Calls)

Backend

Python

FastAPI

SQLAlchemy ORM

SQLite (Development Database)

AI Layer

LangGraph-style Agent Architecture

Groq LLM Integration

Model Support:

gemma2 / llama models (fallback supported)

Database

SQLite (Local Development)

Compatible with MySQL / PostgreSQL for production

System Architecture Overview:-

Frontend (React UI)
        |
        v
Backend API (FastAPI)
        |
        v
AI Agent (LangGraph Orchestration)
        |
        v
Tools Layer (Business Logic)
        |
        v
Database (Healthcare CRM Records)



 AI Agent Role (LangGraph Concept):--

The AI Agent acts as an intelligent orchestrator that:

Interprets incoming user requests

Identifies user intent

Selects the appropriate business tool

Executes workflows

Generates AI insights

This design separates decision-making logic from execution logic, making the system scalable and modular.

🔧 LangGraph Tools Implemented

The system includes the following AI tools:

1️.Log Interaction Tool

Purpose:

Saves new interaction data

Supports chat-based and form-based submissions

Features:

Stores patient interaction details

Extracts basic data from chat input

Persists data into database

2️. Edit Interaction Tool

Purpose:

Updates previously logged interactions

Features:

Modifies diagnosis

Updates prescriptions

Changes follow-up dates

Updates symptoms

3️. Fetch HCP Tool

Purpose:

Retrieves healthcare professional profiles

Features:

Filters by specialization

Searches by doctor name

Returns structured HCP data

4️. Schedule Follow-Up Tool

Purpose:

Schedules follow-up appointments

Features:

Updates follow-up date

Adds notes to patient record

5️. Compliance Tool

Purpose:

Tracks regulatory compliance

Features:

Marks interactions compliant or non-compliant

Stores audit notes

Supports healthcare regulatory requirements

 Application Flow (End-to-End):-

User enters data via form or chat

Frontend sends request to FastAPI backend

Backend forwards data to AI Agent

AI Agent detects intent

Relevant tool is executed

Database is updated

AI generates insights

Response returned to frontend

API Endpoints
Log Interaction
POST /log-interaction


Payload Example:

{
  "mode": "chat",
  "notes": "Patient had fever for two days"
}

⚙️ Installation & Setup
1️ Clone Repository
git clone https://github.com/your-username/ai-healthcare-crm.git
cd ai-healthcare-crm

2️ Backend Setup

Navigate to backend folder:

cd Backend


Create virtual environment:

python -m venv venv
venv\Scripts\activate


Install dependencies:

pip install -r requirements.txt


Create .env file:

GROQ_API_KEY=your_groq_api_key_here


Run backend server:

uvicorn main:app --reload


Backend will run on:

http://127.0.0.1:8000

3️ Frontend Setup

Navigate to frontend folder:

cd Frontend


Install packages:

npm install


Run frontend:

npm start


Frontend will run on:

http://localhost:3000

Project Structure:-
ai-crm-project/
│
├── Frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── Backend/
│   ├── main.py
│   ├── agent.py
│   ├── tools.py
│   ├── database.py
│   ├── models.py
│   └── requirements.txt
│
└── README.md

Assignment Compliance Checklist:-
Requirement	Status
React Frontend	✔ Implemented
Redux State Management	✔ Implemented
FastAPI Backend	✔ Implemented
LangGraph Agent Architecture	✔ Implemented
Groq LLM Integration	✔ Implemented
Dual Input UI (Form + Chat)	✔ Implemented
SQL Database	✔ Implemented
Google Inter Font	✔ Implemented
5 AI Tools	✔ Implemented
Author

Mamta
AI Healthcare CRM Projec
