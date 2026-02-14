import os
import anthropic
from fastapi import APIRouter, HTTPException
from .database import SessionLocal
from .models import Well, ChatMessage

router = APIRouter(prefix="/chat", tags=["chat"])

def get_client():
    api_key = os.getenv("ANTHROPIC_API_KEY") or os.getenv("API_KEY")
    if not api_key:
        return None
    return anthropic.Anthropic(api_key=api_key)

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
            reply = "Geo-AI Assistant: API Key not configured. I can see you are asking about well data, but I cannot process complex queries yet."
        else:
            # Build history list for AI - MUST alternate user/assistant
            messages_payload = []
            last_role = None
            
            # Only use messages BEFORE the current one for history
            history_to_process = history[:-1]
            
            for m in history_to_process:
                # Anthropic roles must alternate
                if m.role != last_role:
                    messages_payload.append({"role": m.role, "content": m.content})
                    last_role = m.role
            
            # Ensure the first message is 'user' (Anthropic requirement)
            while messages_payload and messages_payload[0]["role"] != "user":
                messages_payload.pop(0)

            # Check if last history role is 'user'. If so, Anthropic requires 'assistant' next.
            # But we want to add our current 'message' as the final 'user' turn.
            # If the last history turn was 'user', we might need to skip it or combine.
            if messages_payload and messages_payload[-1]["role"] == "user":
                # Anthropic needs a user message to END the list if we aren't pre-filling assistant response
                # If we just sent a user message, we must ensure the payload ends with 'user'
                pass # This is fine as long as we append correctly
            
            # Final check: the new message must be 'user'. 
            # If the last one in payload is 'user', we replace it to avoid consecutive roles
            if messages_payload and messages_payload[-1]["role"] == "user":
                messages_payload[-1] = {"role": "user", "content": message}
            else:
                messages_payload.append({"role": "user", "content": message})

            system_prompt = f"You are GeoBot, an expert geological AI assistant. You are helping a user analyze well log data for a well named '{well.well_name if well else 'Unknown'}'. "
            if well:
                system_prompt += f"Well info: Company={well.company}, Field={well.field}, Range={well.start_depth}-{well.stop_depth} ft. "
            system_prompt += "Be helpful, technical, and precise. If you don't have specific data for a curve, explain what that curve typically means in petrophysics."

            response = client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=1024,
                system=system_prompt,
                messages=messages_payload
            )
            reply = response.content[0].text
            
    except Exception as e:
        reply = f"I encountered an error while processing your request: {str(e)}"
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
