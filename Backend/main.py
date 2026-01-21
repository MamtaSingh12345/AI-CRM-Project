"""
main.py - FastAPI server for Healthcare CRM backend
Main entry point for the application
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import uvicorn
from datetime import datetime
from agent import process_interaction
import json

# Initialize FastAPI app
app = FastAPI(
    title="Healthcare CRM API",
    description="AI-first CRM for Healthcare Professionals",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

# Pydantic models for request/response validation
class InteractionRequest(BaseModel):
    """Request model for logging interactions"""
    mode: str = Field(..., description="Interaction mode: 'chat' or 'form'")
    notes: Optional[str] = Field(None, description="Natural language notes for chat mode")
    patient_id: Optional[str] = Field(None, description="Patient identifier")
    interaction_type: Optional[str] = Field("consultation", description="Type of interaction")
    date: Optional[str] = Field(None, description="Interaction date in ISO format")
    duration: Optional[int] = Field(None, description="Duration in minutes")
    symptoms: Optional[str] = Field(None, description="Patient symptoms")
    diagnosis: Optional[str] = Field(None, description="Medical diagnosis")
    prescription: Optional[str] = Field(None, description="Prescribed medication")
    followUpDate: Optional[str] = Field(None, description="Follow-up date in ISO format")
    
    class Config:
        schema_extra = {
            "example": {
                "mode": "chat",
                "notes": "Patient presented with fever and cough for 3 days. Temperature 38.5°C.",
                "patient_id": "PAT123",
                "interaction_type": "consultation",
                "date": "2024-01-20",
                "duration": 30,
                "symptoms": "Fever, cough, fatigue",
                "diagnosis": "Viral infection",
                "prescription": "Paracetamol 500mg",
                "followUpDate": "2024-01-27"
            }
        }

class HealthCheckResponse(BaseModel):
    """Response model for health check endpoint"""
    status: str
    timestamp: str
    version: str
    database: str

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to Healthcare CRM API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "POST /log-interaction": "Log patient interaction",
            "GET /health": "Health check",
            "GET /interactions": "Get all interactions",
            "GET /hcps": "Get healthcare professionals"
        }
    }

@app.get("/health", tags=["Health"], response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "database": "connected"
    }

@app.post("/log-interaction", tags=["Interactions"])
async def log_interaction(request: InteractionRequest):
    """
    Main endpoint for logging patient interactions
    Processes interaction through AI agent and returns insights
    """
    try:
        print(f"📥 Received interaction request: {request.mode} mode")
        print(f"📝 Request data: {json.dumps(request.dict(), indent=2)}")
        
        # Convert Pydantic model to dict for processing
        request_data = request.dict()
        
        # Process through AI agent
        print("🔍 Sending to AI agent...")
        result = process_interaction(request_data)
        
        if not result.get("success", False):
            raise HTTPException(status_code=500, detail=result.get("message", "Processing failed"))
        
        return result
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"💥 Unhandled error in /log-interaction: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/interactions", tags=["Interactions"])
async def get_interactions():
    """Get all interactions from database"""
    print("📊 Fetching all interactions...")
    
    from database import SessionLocal, PatientInteraction
    
    db = SessionLocal()
    try:
        interactions = db.query(PatientInteraction).order_by(PatientInteraction.created_at.desc()).all()
        
        return {
            "success": True,
            "count": len(interactions),
            "interactions": [interaction.to_dict() for interaction in interactions],
            "retrieved_at": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"❌ Error fetching interactions: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch interactions: {str(e)}")
    finally:
        db.close()

@app.get("/hcps", tags=["HCPs"])
async def get_hcps():
    """Get healthcare professionals from database"""
    print("👨‍⚕️ Fetching HCP data...")
    
    from database import SessionLocal, HCPProfile
    
    db = SessionLocal()
    try:
        hcps = db.query(HCPProfile).all()
        
        return {
            "success": True,
            "count": len(hcps),
            "hcps": [hcp.to_dict() for hcp in hcps],
            "retrieved_at": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"❌ Error fetching HCPs: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch HCPs: {str(e)}")
    finally:
        db.close()

@app.get("/test", tags=["Testing"])
async def test_endpoint():
    """Test endpoint to verify database connection"""
    print("🧪 Testing database connection...")
    
    from database import SessionLocal, PatientInteraction, HCPProfile
    
    db = SessionLocal()
    try:
        interaction_count = db.query(PatientInteraction).count()
        hcp_count = db.query(HCPProfile).count()
        
        return {
            "success": True,
            "database": "connected",
            "interaction_count": interaction_count,
            "hcp_count": hcp_count,
            "message": f"Database has {interaction_count} interactions and {hcp_count} HCPs"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Database test failed"
        }
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Starting Healthcare CRM API Server")
    print("=" * 60)
    print("🔗 API Documentation: http://localhost:8000/docs")
    print("🌐 CORS enabled for: http://localhost:3000")
    print("💾 Database: healthcare_crm.db")
    print("🤖 AI Agent: Initialized and ready")
    print("=" * 60)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )

    # In main.py, update the /log-interaction endpoint:

@app.post("/log-interaction", tags=["Interactions"])
async def log_interaction(request: InteractionRequest):
    """
    Main endpoint for logging patient interactions
    """
    try:
        print(f"📥 Received interaction request: {request.mode} mode")
        
        # Convert Pydantic model to dict for processing
        request_data = request.dict()
        
        # Basic validation
        if request.mode == 'chat' and not request.notes:
            raise HTTPException(status_code=400, detail="Chat notes are required for chat mode")
        
        # Process through AI agent
        print("🔍 Sending to AI agent...")
        result = process_interaction(request_data)
        
        if not result.get("success", False):
            error_msg = result.get("message") or result.get("error") or "Processing failed"
            print(f"❌ Agent failed: {error_msg}")
            raise HTTPException(status_code=500, detail=error_msg)
        
        print("✅ Agent processing successful")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"💥 Unhandled error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )