import os
import json
from groq import Groq
from fastapi import APIRouter, HTTPException
from .database import SessionLocal
from .models import Well, WellData, Interpretation

router = APIRouter(prefix="/interpret", tags=["interpret"])

def get_client():
    api_key = os.getenv("API_KEY")
    if not api_key:
        return None
    return Groq(api_key=api_key.strip())

@router.post("")
def interpret(request: dict):
    """Deep AI interpretation with numeric grounding (Groq)"""
    db = SessionLocal()
    
    well_id = request.get("well_id")
    depth_from = request.get("depth_from")
    depth_to = request.get("depth_to")
    curves = request.get("curves", [])
    
    if not well_id:
        db.close()
        raise HTTPException(status_code=400, detail="well_id is required")

    well = db.query(Well).filter(Well.id == well_id).first()
    if not well:
        db.close()
        raise HTTPException(status_code=404, detail="Well not found")

    # Fetch data for technical analysis
    query = db.query(WellData).filter(WellData.well_id == well_id)
    if depth_from is not None and depth_to is not None:
        query = query.filter(WellData.depth.between(depth_from, depth_to))
    
    data = query.all()
    if not data:
        db.close()
        return {"error": "No data in range"}

    # --- ADVANCED ANALYSIS ENGINE ---
    # We compute these in backend so the LLM doesn't have to guess or calculate
    stats = {}
    for c in curves:
        valid_points = [(d.depth, d.curve_values.get(c)) for d in data 
                       if d.curve_values.get(c) is not None and d.curve_values.get(c) > -900]
        
        if valid_points:
            vals = [p[1] for p in valid_points]
            mean = sum(vals) / len(vals)
            max_val = max(vals)
            max_depth = [p[0] for p in valid_points if p[1] == max_val][0]
            
            # Simple Standard Deviation
            variance = sum((x - mean) ** 2 for x in vals) / len(vals)
            std_dev = variance ** 0.5
            
            stats[c] = {
                "min": round(min(vals), 2),
                "max": round(max_val, 2),
                "max_at": round(max_depth, 1),
                "mean": round(mean, 2),
                "std": round(std_dev, 2),
                "count": len(vals)
            }

    # Detect Gas Ratios if light hydrocarbons are present
    ratios = {}
    if all(k in stats for k in ["HC1", "HC2", "HC3"]):
        c1 = stats["HC1"]["mean"]
        c2 = stats["HC2"]["mean"]
        c3 = stats["HC3"]["mean"]
        if c1 > 0:
            wetness = ((c2 + c3) / (c1 + c2 + c3)) * 100
            balance = c1 / (c2 + c3) if (c2+c3) > 0 else 0
            ratios = {
                "gas_wetness": f"{round(wetness, 2)}%",
                "balance_index": round(balance, 2),
                "interpretation_hint": "Gas" if wetness < 5 else "Condensate/Oil"
            }

    client = get_client()
    if not client:
        interpretation_text = "OpenAI API Key not configured. Please add API_KEY to your .env file."
    else:
        try:
            # STRUCTURED GEOLOGIST PROMPT
            prompt = f"""
You are a Senior Petroleum Geologist and Petrophysicist. 
Analyze these well log signatures for well '{well.well_name}' at interval {depth_from}-{depth_to} ft.

CURVE STATISTICS:
{json.dumps(stats, indent=2)}

{f"GAS RATIOS: {json.dumps(ratios)}" if ratios else ""}

TASK:
Provide a technical, high-precision interpretation.
1. FORMATION ANALYSIS: identify potential lithology or reservoir characteristics.
2. HYDROCARBON POTENTIAL: Analyze spikes (Max values) and their depths. Compare against background mean.
3. FLUID TYPE: If gas ratios are available, interpret if we see dry gas, wet gas, or oil.
4. RECOMMENDATIONS: Precise next steps.

STYLE:
Professional, data-driven, and technical. Use markdown. Reference EXACT peaks and depths.
"""

            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are a professional geologist interpreting well log data."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1500,
                temperature=0.0
            )
            interpretation_text = response.choices[0].message.content
        except Exception as e:
            print(f"❌ Groq Interpret Error: {type(e).__name__}: {str(e)}")
            # Professional Fallback logic
            avg_gas = stats.get('TOTAL_GAS', {}).get('mean', 0)
            max_gas = stats.get('TOTAL_GAS', {}).get('max', 0)
            max_depth = stats.get('TOTAL_GAS', {}).get('max_at', 0)
            
            interpretation_text = f"### Technical Interpretation Summary\n\n"
            interpretation_text += f"Analysis of the interval **{depth_from}–{depth_to} ft** indicates "
            if avg_gas > 500:
                interpretation_text += f"a high-potential hydrocarbon zone. A peak of **{max_gas} units** was detected at **{max_depth} ft**, "
                interpretation_text += "suggesting a significant gas entry or reservoir intersection. "
            else:
                interpretation_text += "stable background conditions with no major anomalies detected. "
            
            interpretation_text += "\n\n*Note: Advanced AI analysis encountered a connectivity issue. Providing rules-based summary.*"

    interpretation = Interpretation(
        well_id=well_id,
        depth_from=depth_from,
        depth_to=depth_to,
        curves_analyzed=",".join(curves),
        interpretation=interpretation_text
    )
    db.add(interpretation)
    db.commit()
    db.refresh(interpretation)
    db.close()
    
    return {
        "id": interpretation.id,
        "depth_from": depth_from,
        "depth_to": depth_to,
        "curves": curves,
        "interpretation": interpretation_text,
        "model": "Groq Llama-3.3-70b",
        "stats": stats,
        "ratios": ratios,
        "created_at": interpretation.created_at.isoformat()
    }

@router.get("/wells/{well_id}/interpretations")
def get_interpretations(well_id: int):
    """Get past interpretations"""
    db = SessionLocal()
    interpretations = db.query(Interpretation).filter(Interpretation.well_id == well_id).order_by(Interpretation.created_at.desc()).all()
    db.close()
    
    return {
        "interpretations": [
            {
                "id": i.id,
                "depth_from": i.depth_from,
                "depth_to": i.depth_to,
                "curves": i.curves_analyzed.split(","),
                "interpretation": i.interpretation,
                "created_at": i.created_at.isoformat()
            }
            for i in interpretations
        ]
    }
