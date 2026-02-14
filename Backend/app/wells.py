from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
from .database import SessionLocal
from .models import Well, WellCurve, WellData
from .parser import parse_las_file
from .storage import storage_service

router = APIRouter(prefix="/wells", tags=["wells"])

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload LAS file"""
    try:
        content = await file.read()
        well_data = parse_las_file(content)
        
        # Store file using StorageService (Local + S3)
        storage_result = storage_service.store_file(file.filename, content)
        
        db = SessionLocal()
        
        # Determine a friendly name for the UI
        parsed_name = well_data.get('well_name', 'Unknown')
        if parsed_name.upper() in ['WELL1', 'UNKNOWN', 'WELL', 'N/A']:
            # Append filename for better distinction in generic cases
            base_display_name = f"{parsed_name} ({file.filename})"
        else:
            base_display_name = parsed_name
        
        # Option 1: Auto-rename if name exists
        display_name = base_display_name
        copy_counter = 1
        while db.query(Well).filter(Well.well_name == display_name).first():
            display_name = f"{base_display_name} (Copy {copy_counter})"
            copy_counter += 1

        well = Well(
            well_name=display_name,
            filename=file.filename,
            company=well_data.get('company'),
            field=well_data.get('field'),
            location=well_data.get('location'),
            country=well_data.get('country'),
            date_analysed=well_data.get('date_analysed'),
            start_depth=well_data.get('start_depth'),
            stop_depth=well_data.get('stop_depth'),
            step=well_data.get('step'),
            null_value=well_data.get('null_value'),
            row_count=well_data.get('row_count'),
            s3_key=storage_result.get('s3_key')
        )
        db.add(well)
        db.commit()
        db.refresh(well)
        
        curves_list = well_data.get('curves', [])
        for curve_name in curves_list:
            curve = WellCurve(well_id=well.id, curve_name=curve_name)
            db.add(curve)
        db.commit()
        
        # Optimized Bulk Insert for large datasets (e.g. 11k+ rows)
        data_to_insert = []
        for row in well_data.get('data', []):
            if row:
                depth = row[0]
                curve_values = {}
                for j, curve_name in enumerate(curves_list):
                    if j < len(row):
                        curve_values[curve_name] = row[j]
                
                data_to_insert.append({
                    "well_id": well.id,
                    "depth": depth,
                    "curve_values": curve_values
                })
        
        if data_to_insert:
            db.bulk_insert_mappings(WellData, data_to_insert)
            db.commit()
        
        db.close()
        
        return {
            "id": well.id,
            "well_name": well.well_name,
            "filename": well.filename,
            "company": well.company,
            "field": well.field,
            "location": well.location,
            "country": well.country,
            "date_analysed": well.date_analysed,
            "start_depth": well.start_depth,
            "stop_depth": well.stop_depth,
            "step": well.step,
            "row_count": well.row_count,
            "curves": well_data.get('curves', []),
            "s3_stored": storage_result.get('s3_stored'),
            "s3_key": well.s3_key,
            "depth_range": {"start": well.start_depth, "stop": well.stop_depth}
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("")
def get_wells():
    """Get all wells"""
    db = SessionLocal()
    wells = db.query(Well).all()
    
    result = []
    for well in wells:
        curves = db.query(WellCurve).filter(WellCurve.well_id == well.id).all()
        curve_names = [c.curve_name for c in curves]
        
        result.append({
            "id": well.id,
            "well_name": well.well_name,
            "filename": well.filename,
            "company": well.company,
            "field": well.field,
            "location": well.location,
            "country": well.country,
            "date_analysed": well.date_analysed,
            "start_depth": well.start_depth,
            "stop_depth": well.stop_depth,
            "step": well.step,
            "row_count": well.row_count,
            "curves": curve_names,
            "uploaded_at": well.uploaded_at.isoformat()
        })
    
    db.close()
    return {"wells": result}

@router.get("/{well_id}")
def get_well(well_id: int):
    """Get specific well"""
    db = SessionLocal()
    well = db.query(Well).filter(Well.id == well_id).first()
    
    if not well:
        raise HTTPException(status_code=404, detail="Well not found")
    
    curves = db.query(WellCurve).filter(WellCurve.well_id == well_id).all()
    curve_names = [c.curve_name for c in curves]
    
    db.close()
    
    return {
        "id": well.id,
        "well_name": well.well_name,
        "filename": well.filename,
        "company": well.company,
        "field": well.field,
        "location": well.location,
        "country": well.country,
        "date_analysed": well.date_analysed,
        "start_depth": well.start_depth,
        "stop_depth": well.stop_depth,
        "step": well.step,
        "row_count": well.row_count,
        "curves": curve_names,
        "uploaded_at": well.uploaded_at.isoformat()
    }

@router.get("/{well_id}/data")
def get_well_data(well_id: int, curves: str = None, depth_from: float = None, depth_to: float = None, downsample: int = 1):
    """Get chart data for well with optional downsampling for performance"""
    db = SessionLocal()
    
    query = db.query(WellData).filter(WellData.well_id == well_id)
    
    if depth_from and depth_to:
        query = query.filter(WellData.depth.between(depth_from, depth_to))
    
    # We fetch ALL data in the range to calculate accurate statistics
    all_data = query.order_by(WellData.depth).all()
    db.close()
    
    if not all_data:
        return {"depths": [], "curves": {}, "stats": {}}

    # 1. Calculate Statistics on the FULL range for precision
    stats = {}
    curves_to_process = curves.split(',') if curves else (all_data[0].curve_values.keys() if all_data[0].curve_values else [])
    
    for curve in curves_to_process:
        values = [d.curve_values.get(curve, None) if d.curve_values else None for d in all_data]
        valid_values = [v for v in values if v is not None and v > -900]
        
        if valid_values:
            mean_val = sum(valid_values) / len(valid_values)
            variance = sum((x - mean_val) ** 2 for x in valid_values) / len(valid_values)
            std_dev = variance ** 0.5
            
            stats[curve] = {
                "min": round(min(valid_values), 4),
                "max": round(max(valid_values), 4),
                "mean": round(mean_val, 4),
                "std": round(std_dev, 4)
            }

    # 2. Downsample for the Chart Visualization (Performance Reason)
    # This prevents the browser from crashing or lagging with 10k+ DOM points
    if downsample > 1:
        data_for_chart = all_data[::downsample]
    else:
        data_for_chart = all_data

    depths = [d.depth for d in data_for_chart]
    curve_dict = {}
    
    for curve in curves_to_process:
        curve_dict[curve] = [d.curve_values.get(curve, None) if d.curve_values else None for d in data_for_chart]
    
    return {
        "depths": depths,
        "curves": curve_dict,
        "stats": stats
    }

@router.delete("/{well_id}")
def delete_well(well_id: int):
    """Delete well"""
    db = SessionLocal()
    well = db.query(Well).filter(Well.id == well_id).first()
    
    if not well:
        raise HTTPException(status_code=404, detail="Well not found")
    
    db.delete(well)
    db.commit()
    db.close()
    
    return {"message": "Well deleted"}
