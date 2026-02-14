import re

def parse_las_file(content: bytes) -> dict:
    try:
        lines = content.decode('utf-8', errors='ignore').split('\n')
    except:
        lines = content.decode('latin-1', errors='ignore').split('\n')
    
    # Initialize
    well_info = {}
    curves_list = []
    in_curve_section = False
    in_data_section = False
    data_rows = []
    
    for line in lines:
        original_line = line
        line = line.strip()
        
        # Skip empty lines and comments
        if not line or line.startswith('#'):
            continue
        
        # ===== DETECT SECTIONS (case-insensitive) =====
        line_upper = line.upper()
        
        if line_upper.startswith('~V'):  # ~Version
            in_curve_section = False
            in_data_section = False
            continue
        elif line_upper.startswith('~W'):  # ~Well
            in_curve_section = False
            in_data_section = False
            continue
        elif line_upper.startswith('~C'):  # ~Curve
            in_curve_section = True
            in_data_section = False
            continue
        elif line_upper.startswith('~A'):  # ~ASCII or ~A
            in_curve_section = False
            in_data_section = True
            continue
        
        # ===== PARSE WELL INFO =====
        # Format: STRT.F          8665.00:  START DEPTH
        if not in_curve_section and not in_data_section and '.' in line:
            try:
                parts = line.split('.')
                if len(parts) >= 2:
                    key = parts[0].strip()
                    
                    # Extract value (between . and :)
                    rest = '.'.join(parts[1:])
                    if ':' in rest:
                        value_part = rest.split(':')[0].strip()
                    else:
                        value_part = rest.strip()
                    
                    # Extract numeric value using regex
                    value = None
                    # Regex to find float or integer, possibly negative
                    match = re.search(r'[-+]?\d*\.\d+|[-+]?\d+', value_part)
                    if match:
                        try:
                            value = float(match.group())
                        except ValueError:
                            pass
                    
                    # Store known fields
                    if key == 'STRT':
                        well_info['start_depth'] = value
                    elif key == 'STOP':
                        well_info['stop_depth'] = value
                    elif key == 'STEP':
                        well_info['step'] = value
                    elif key == 'NULL':
                        well_info['null_value'] = value
                    elif key == 'WELL':
                        well_info['well_name'] = value_part if value is None else str(value_part) # Keep string for names
                    elif key == 'COMP':
                        well_info['company'] = value_part
                    elif key == 'FLD':
                        well_info['field'] = value_part
                    elif key == 'LOC':
                        well_info['location'] = value_part
                    elif key == 'CTRY':
                        well_info['country'] = value_part
                    elif key == 'DATE':
                        well_info['date_analysed'] = value_part
            except Exception as e:
                pass
        
        # ===== PARSE CURVES =====
        # Format: Depth          .F      :  Track #   0
        if in_curve_section and '.' in line:
            try:
                parts = line.split('.')
                if parts:
                    curve_name = parts[0].strip().upper()
                    
                    # Skip header line and empty names
                    if curve_name and curve_name not in ['MNEM', '#', '']:
                        # Handle Duplicate Column Names (e.g. ROP duplicate)
                        unique_name = curve_name
                        counter = 1
                        while unique_name in curves_list:
                            unique_name = f"{curve_name}_{counter}"
                            counter += 1
                        
                        curves_list.append(unique_name)
            except Exception as e:
                pass
        
        # ===== PARSE DATA =====
        if in_data_section and line and not line.startswith('#'):
            try:
                # Split by whitespace and convert to floats
                values = []
                for val in line.split():
                    try:
                        values.append(float(val))
                    except ValueError:
                        # Skip non-numeric values
                        pass
                
                if values:  # Only add non-empty rows
                    data_rows.append(values)
            except Exception as e:
                pass
    
    # Fill in defaults if not found
    if 'well_name' not in well_info:
        well_info['well_name'] = 'Unknown'
    
    # Clean up string fields to remove comments or trailing colons if regex failed to catch only value
    for k in ['well_name', 'company', 'field', 'location', 'country', 'date_analysed']:
        if k in well_info and isinstance(well_info[k], str):
            # Sometimes value is like "CLIENT COMPANY : CLIENT"
            # We already split by ':', but sometimes there are extra descriptions
            pass

    well_info['row_count'] = len(data_rows)
    well_info['curves'] = curves_list
    well_info['data'] = data_rows
    
    return well_info
