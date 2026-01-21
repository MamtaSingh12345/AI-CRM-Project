"""
tools.py - CRM Business Tools
Database operations layer
"""

from datetime import datetime
from typing import Dict, Any, Optional
from database import SessionLocal, PatientInteraction, HCPProfile
import json


# ----------------- TOOL 1 -----------------

def log_interaction_tool(interaction_data: Dict[str, Any]) -> Dict[str, Any]:

    print("\n🛠 LOG INTERACTION TOOL")

    db = SessionLocal()

    try:
        mode = interaction_data.get("mode", "form")

        new_interaction = PatientInteraction()

        if mode == "chat":

            new_interaction.chat_notes = interaction_data.get("notes", "")
            new_interaction.interaction_type = "consultation"
            new_interaction.duration_minutes = 30

        else:

            new_interaction.patient_id = interaction_data.get("patient_id")
            new_interaction.symptoms = interaction_data.get("symptoms")
            new_interaction.diagnosis = interaction_data.get("diagnosis")
            new_interaction.prescription = interaction_data.get("prescription")
            new_interaction.duration_minutes = interaction_data.get("duration", 20)

        db.add(new_interaction)
        db.commit()
        db.refresh(new_interaction)

        print("✅ Interaction Saved:", new_interaction.id)

        return {
            "success": True,
            "interaction_id": new_interaction.id,
            "data": new_interaction.to_dict()
        }

    except Exception as e:

        db.rollback()

        print("❌ DB Error:", e)

        return {
            "success": False,
            "error": str(e)
        }

    finally:
        db.close()


# ----------------- TOOL 2 -----------------

def edit_interaction_tool(updates: Dict[str, Any]) -> Dict[str, Any]:

    print("\n🛠 EDIT INTERACTION TOOL")

    db = SessionLocal()

    try:

        last = db.query(PatientInteraction)\
                 .order_by(PatientInteraction.created_at.desc())\
                 .first()

        if not last:
            return {"success": False, "message": "No interaction found"}

        if "diagnosis" in updates:
            last.diagnosis = updates["diagnosis"]

        if "prescription" in updates:
            last.prescription = updates["prescription"]

        last.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(last)

        return {
            "success": True,
            "updated": last.to_dict()
        }

    except Exception as e:

        db.rollback()

        return {"success": False, "error": str(e)}

    finally:
        db.close()


# ----------------- TOOL 3 -----------------

def fetch_hcp_tool(query: Optional[Dict[str, Any]] = None):

    print("\n🛠 FETCH HCP TOOL")

    db = SessionLocal()

    try:

        hcps = db.query(HCPProfile).all()

        return {
            "success": True,
            "count": len(hcps),
            "data": [hcp.to_dict() for hcp in hcps]
        }

    except Exception as e:

        return {"success": False, "error": str(e)}

    finally:
        db.close()


# ----------------- TOOL 4 -----------------

def followup_tool(interaction_id: str, followup_date: str):

    print("\n🛠 FOLLOWUP TOOL")

    db = SessionLocal()

    try:

        interaction = db.query(PatientInteraction)\
                        .filter(PatientInteraction.id == interaction_id)\
                        .first()

        if not interaction:
            return {"success": False, "message": "Not found"}

        interaction.follow_up_date = datetime.fromisoformat(followup_date)

        db.commit()
        db.refresh(interaction)

        return {"success": True}

    except Exception as e:

        db.rollback()
        return {"success": False, "error": str(e)}

    finally:
        db.close()


# ----------------- TOOL 5 -----------------

def compliance_tool(interaction_id: str, is_compliant: bool):

    print("\n🛠 COMPLIANCE TOOL")

    db = SessionLocal()

    try:

        interaction = db.query(PatientInteraction)\
                        .filter(PatientInteraction.id == interaction_id)\
                        .first()

        interaction.is_compliant = is_compliant

        db.commit()

        return {"success": True}

    except Exception as e:

        db.rollback()
        return {"success": False, "error": str(e)}

    finally:
        db.close()


# ----------------- TOOL REGISTRY -----------------

TOOLS = {
    "log_interaction": log_interaction_tool,
    "edit_interaction": edit_interaction_tool,
    "fetch_hcp": fetch_hcp_tool,
    "schedule_followup": followup_tool,
    "mark_compliant": compliance_tool
}
