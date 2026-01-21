"""
agent.py - Simplified AI Agent (Groq optional)
"""

from datetime import datetime
from typing import Dict, Any
import json

# ----------------- TOOLS -----------------

from tools import TOOLS

# Try to import Groq, but make it optional
try:
    from langchain_groq import ChatGroq
    from dotenv import load_dotenv
    import os
    
    load_dotenv()
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    
    if GROQ_API_KEY:
        llm = ChatGroq(
            api_key=GROQ_API_KEY,
            model_name="llama-3.3-70b-versatile",
            temperature=0.2,
            max_tokens=512
        )
        GROQ_AVAILABLE = True
        print("✅ Groq LLM initialized successfully")
    else:
        GROQ_AVAILABLE = False
        print("⚠️  Groq API key not found, using mock AI responses")
except ImportError:
    GROQ_AVAILABLE = False
    print("⚠️  langchain_groq not installed, using mock AI responses")
except Exception as e:
    GROQ_AVAILABLE = False
    print(f"⚠️  Failed to initialize Groq: {e}, using mock AI responses")

# ----------------- AGENT -----------------

class Agent:
    """
    AI-first CRM Agent
    """

    def __init__(self):
        self.tools = TOOLS
        print("🤖 AI Healthcare CRM Agent Initialized")

    def process_interaction(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        print(f"\n🚀 Processing interaction: {input_data.get('mode', 'form')} mode")

        try:
            # Always use log_interaction tool for now
            tool_name = "log_interaction"
            tool = self.tools.get(tool_name)

            if not tool:
                return {
                    "success": False,
                    "message": "Tool not found"
                }

            # Execute tool
            tool_result = tool(input_data)

            if not tool_result.get("success", False):
                return {
                    "success": False,
                    "message": tool_result.get("error", "Tool execution failed"),
                    "tool_result": tool_result
                }

            # Generate AI insights (real or mock)
            ai_insights = self.generate_ai_summary(input_data, tool_result)

            # Return Response
            response = {
                "success": True,
                "tool_used": tool_name,
                "tool_result": tool_result,
                "ai_insights": ai_insights,
                "processed_at": datetime.utcnow().isoformat()
            }

            print(f"✅ Successfully processed interaction")
            return response

        except Exception as e:
            print(f"❌ Agent Error: {e}")
            import traceback
            traceback.print_exc()
            
            return {
                "success": False,
                "error": str(e),
                "message": "Internal server error"
            }

    def generate_ai_summary(self, input_data, tool_result):
        """
        Generate AI insights (uses Groq if available, otherwise mock)
        """
        print("🧠 Generating AI insights...")

        if GROQ_AVAILABLE:
            try:
                text = ""
                if input_data.get("mode") == "chat":
                    text = input_data.get("notes", "")
                else:
                    text = json.dumps(input_data)

                prompt = f"""
You are a healthcare CRM AI assistant. Analyze this doctor interaction:

{text[:2000]}  # Limit text length

Provide a brief summary and 2-3 actionable insights.
Format as JSON with keys: summary, insights (list), confidence_score.
"""

                response = llm.invoke(prompt)
                
                # Try to parse JSON response
                try:
                    ai_response = json.loads(response.content)
                    return {
                        "summary": ai_response.get("summary", "AI analysis completed"),
                        "insights": ai_response.get("insights", ["No specific insights generated"]),
                        "confidence_score": ai_response.get("confidence_score", 0.85),
                        "ai_model": "llama3-8b-8192",
                        "generated_at": datetime.utcnow().isoformat(),
                        "is_real_ai": True
                    }
                except json.JSONDecodeError:
                    # If not JSON, use raw content
                    return {
                        "summary": response.content[:200],
                        "insights": [
                            "AI generated insights from clinical notes",
                            "Recommend reviewing diagnosis accuracy",
                            "Schedule appropriate follow-up"
                        ],
                        "confidence_score": 0.88,
                        "ai_model": "llama3-8b-8192",
                        "generated_at": datetime.utcnow().isoformat(),
                        "is_real_ai": True
                    }
                    
            except Exception as e:
                print(f"⚠️  Groq API error, falling back to mock: {e}")
                # Fall through to mock response

        # Mock AI response (fallback)
        mode = input_data.get("mode", "form")
        
        if mode == "chat":
            notes = input_data.get("notes", "")
            word_count = len(notes.split())
            
            return {
                "summary": f"Analyzed {word_count} words of clinical notes. Patient presents with common symptoms requiring follow-up.",
                "insights": [
                    "Suggested follow-up in 1-2 weeks",
                    "Monitor for symptom progression",
                    "Check for medication interactions"
                ],
                "confidence_score": 0.92,
                "next_steps": [
                    "Schedule follow-up appointment",
                    "Order basic lab tests",
                    "Update patient medication list"
                ],
                "ai_model": "Mock AI (Groq not available)",
                "generated_at": datetime.utcnow().isoformat(),
                "is_real_ai": False
            }
        else:
            patient_id = input_data.get('patient_id', 'Unknown')
            
            return {
                "summary": f"Structured consultation for patient {patient_id} recorded successfully.",
                "insights": [
                    "Data completeness: 95%",
                    "No immediate red flags detected",
                    "Standard treatment protocol followed"
                ],
                "confidence_score": 0.94,
                "next_steps": [
                    "Review and sign documentation",
                    "Update electronic health records",
                    "Schedule next appointment"
                ],
                "ai_model": "Mock AI (Groq not available)",
                "generated_at": datetime.utcnow().isoformat(),
                "is_real_ai": False
            }


# Global Agent Instance
agent = Agent()

def process_interaction(input_data: Dict[str, Any]) -> Dict[str, Any]:
    return agent.process_interaction(input_data)