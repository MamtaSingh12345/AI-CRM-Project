"""
database.py - Mock database for Healthcare CRM
Handles patient interaction data storage and retrieval using SQLAlchemy ORM
"""

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import uuid
import os

# Create SQLite database file in current directory
DB_PATH = "healthcare_crm.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

# Ensure database file is created
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for ORM models
Base = declarative_base()

class PatientInteraction(Base):
    """
    Patient Interaction Model - Stores all patient-HCP interactions
    Each interaction can be either chat-based or form-based
    """
    __tablename__ = "patient_interactions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = Column(String, index=True, nullable=True)
    interaction_type = Column(String, default="consultation")
    interaction_date = Column(DateTime, default=datetime.utcnow)
    duration_minutes = Column(Integer, nullable=True)
    symptoms = Column(Text, nullable=True)
    diagnosis = Column(String, nullable=True)
    prescription = Column(String, nullable=True)
    follow_up_date = Column(DateTime, nullable=True)
    chat_notes = Column(Text, nullable=True)
    is_compliant = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert interaction to dictionary for API responses"""
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "interaction_type": self.interaction_type,
            "interaction_date": self.interaction_date.isoformat() if self.interaction_date else None,
            "duration_minutes": self.duration_minutes,
            "symptoms": self.symptoms,
            "diagnosis": self.diagnosis,
            "prescription": self.prescription,
            "follow_up_date": self.follow_up_date.isoformat() if self.follow_up_date else None,
            "chat_notes": self.chat_notes,
            "is_compliant": self.is_compliant,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class HCPProfile(Base):
    """
    Healthcare Professional Profile Model
    Stores mock HCP data for demonstration
    """
    __tablename__ = "hcp_profiles"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    specialization = Column(String, nullable=False)
    license_number = Column(String, unique=True, nullable=False)
    hospital_affiliation = Column(String)
    years_of_experience = Column(Integer, default=5)
    contact_email = Column(String)
    
    def to_dict(self):
        """Convert HCP profile to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "specialization": self.specialization,
            "license_number": self.license_number,
            "hospital_affiliation": self.hospital_affiliation,
            "years_of_experience": self.years_of_experience,
            "contact_email": self.contact_email
        }

def init_db():
    """
    Initialize database - create tables and seed with mock data
    """
    print(f"🚀 Initializing database at {DB_PATH}...")
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        
        # Create database session
        db = SessionLocal()
        
        try:
            # Check if we need to seed mock data
            existing_interactions = db.query(PatientInteraction).count()
            existing_hcps = db.query(HCPProfile).count()
            
            # Seed mock HCP data if table is empty
            if existing_hcps == 0:
                print("📋 Seeding mock HCP data...")
                mock_hcps = [
                    HCPProfile(
                        name="Dr. Sarah Johnson",
                        specialization="Cardiology",
                        license_number="MD123456",
                        hospital_affiliation="General Hospital",
                        years_of_experience=12,
                        contact_email="sarah.johnson@hospital.com"
                    ),
                    HCPProfile(
                        name="Dr. Michael Chen",
                        specialization="Pediatrics",
                        license_number="MD789012",
                        hospital_affiliation="Children's Medical Center",
                        years_of_experience=8,
                        contact_email="michael.chen@childrenshospital.com"
                    ),
                    HCPProfile(
                        name="Dr. Lisa Rodriguez",
                        specialization="Neurology",
                        license_number="MD345678",
                        hospital_affiliation="Neuro Center",
                        years_of_experience=15,
                        contact_email="lisa.rodriguez@neurocenter.com"
                    )
                ]
                db.add_all(mock_hcps)
                db.commit()
                print(f"✅ Added {len(mock_hcps)} HCP profiles")
            
            # Seed mock patient interactions if table is empty
            if existing_interactions == 0:
                print("📋 Seeding mock patient interactions...")
                mock_interactions = [
                    PatientInteraction(
                        patient_id="PAT001",
                        interaction_type="consultation",
                        interaction_date=datetime.utcnow() - timedelta(days=2),
                        duration_minutes=30,
                        symptoms="Fever, cough, headache",
                        diagnosis="Viral infection",
                        prescription="Rest, fluids, paracetamol",
                        follow_up_date=datetime.utcnow() + timedelta(days=7),
                        chat_notes=None,
                        is_compliant=True
                    ),
                    PatientInteraction(
                        patient_id="PAT002",
                        interaction_type="follow-up",
                        interaction_date=datetime.utcnow() - timedelta(days=1),
                        duration_minutes=20,
                        symptoms="Improving, mild cough persists",
                        diagnosis="Recovering viral infection",
                        prescription="Continue rest",
                        follow_up_date=None,
                        chat_notes=None,
                        is_compliant=True
                    )
                ]
                db.add_all(mock_interactions)
                db.commit()
                print(f"✅ Added {len(mock_interactions)} patient interactions")
            
            print("🎉 Database initialization complete!")
            
        except Exception as e:
            print(f"❌ Error seeding data: {e}")
            db.rollback()
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        raise

# Initialize database on import
init_db()