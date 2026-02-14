import os
import json
from groq import Groq
from fastapi import APIRouter, HTTPException
from .database import SessionLocal
from .models import Well, WellData, ChatMessage

router = APIRouter(prefix="/chat", tags=["chat"])

def get_client():
    api_key = os.getenv("API_KEY")
    if not api_key:
        return None
    return Groq(api_key=api_key.strip())

@router.post("")
def chat(request: dict):
    """Send chat message"""
    db = SessionLocal()
    
    try:
        well_id_raw = request.get("well_id")
        message = request.get("message")
        
        if not well_id_raw or not message:
            db.close()
            raise HTTPException(status_code=400, detail="well_id and message are required")

        well_id = int(well_id_raw)
        well = db.query(Well).filter(Well.id == well_id).first()
        
        # --- DATA GROUNDING ENGINE ---
        # Fetch a snapshot of stats to give GeoBot 'vision' of the data
        curves_to_check = ["TOTAL_GAS", "HC1", "HC2", "HC3", "ROP", "CO2"]
        data_summary = {}
        
        # Get overall stats for the whole well
        query = db.query(WellData).filter(WellData.well_id == well_id)
        all_data = query.all()
        
        if all_data:
            for c in curves_to_check:
                vals = [d.curve_values.get(c) for d in all_data 
                       if d.curve_values.get(c) is not None and d.curve_values.get(c) > -900]
                if vals:
                    max_val = max(vals)
                    max_depth = [d.depth for d in all_data if d.curve_values.get(c) == max_val][0]
                    data_summary[c] = {
                        "avg": round(sum(vals)/len(vals), 2),
                        "max": round(max_val, 2),
                        "peak_at": round(max_depth, 1)
                    }

        # Save user message
        user_msg = ChatMessage(well_id=well_id, role="user", content=message)
        db.add(user_msg)
        db.commit()
        
        # Get recent history for context
        # We fetch more than 10 to ensure we can filter and still have enough
        history = db.query(ChatMessage).filter(ChatMessage.well_id == well_id).order_by(ChatMessage.created_at.desc()).limit(20).all()
        history = history[::-1] # back to chronological
        
        client = get_client()
        if not client:
            reply = "Geo-AI Assistant: API Key not configured. I'm ready to discuss your well data once configured."
        else:
            # Build history list for AI - MUST alternate user/assistant
            messages_payload = []
            
            # OpenAI system prompt is part of messages
            system_prompt = f"""
                You are GeoBot, an expert geological AI. You are analyzing well '{well.well_name if well else 'Unknown'}'.

                REAL-TIME DATA SUMMARY for this well:
                {json.dumps(data_summary, indent=2)}

                MISSION:
                Use the numbers above to answer questions. 
                - Reference 'max' and 'peak_at' for spikes.
                - Technical focus: Hydrocarbon ratios, gas units.
                - Don't hallucinate numbers. Use only the summary.
                """
            messages_payload.append({"role": "system", "content": system_prompt})
            
            # History
            for m in history[:-1]: # everything except the current user message (added below)
                messages_payload.append({"role": m.role, "content": m.content})
            
            # Current message
            messages_payload.append({"role": "user", "content": message})

            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages_payload,
                max_tokens=1024,
                temperature=0.0
            )
            reply = response.choices[0].message.content
            
    except Exception as e:
        print(f"❌ Groq Chat Error: {type(e).__name__}: {str(e)}")
        reply = f"Error: {str(e)}"
    finally:
        asst_msg = ChatMessage(well_id=well_id, role="assistant", content=reply)
        db.add(asst_msg)
        db.commit()
        db.close()
    
    return {"role": "assistant", "reply": reply}

@router.get("/wells/{well_id}/chat/history")
def get_chat_history(well_id: int):
    """Get chat history"""
    db = SessionLocal()
    messages = db.query(ChatMessage).filter(ChatMessage.well_id == well_id).order_by(ChatMessage.created_at).all()
    db.close()
    
    return {
        "messages": [{"role": m.role, "content": m.content} for m in messages]
    }

@router.delete("/wells/{well_id}/chat/history")
def delete_chat_history(well_id: int):
    """Clear chat history"""
    db = SessionLocal()
    db.query(ChatMessage).filter(ChatMessage.well_id == well_id).delete()
    db.commit()
    db.close()
    
    return {"message": "Chat history cleared"}
