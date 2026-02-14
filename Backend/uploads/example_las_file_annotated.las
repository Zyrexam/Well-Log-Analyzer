# ANNOTATED LAS FILE EXAMPLE
# This file shows EXACTLY what data a LAS file should have
# Remove these comment lines when creating your actual LAS file

# ============================================================================
# SECTION 1: VERSION INFORMATION (~V) - REQUIRED
# ============================================================================
# Defines the LAS format version and data wrapping mode
~Version Information
VERS.                 2.0:   CWLS LOG ASCII STANDARD - VERSION 2.0
WRAP.                  NO:   ONE LINE PER DEPTH STEP

# ============================================================================
# SECTION 2: WELL INFORMATION (~W) - REQUIRED
# ============================================================================
# Contains metadata about the well and logging run
# Format: MNEMONIC.UNIT    VALUE : DESCRIPTION
~Well Information Block
#----- REQUIRED FIELDS -----
STRT.F              8665.00:   START DEPTH
STOP.F             20035.00:   STOP DEPTH
STEP.F                 1.00:   STEP (sampling interval)
NULL.              -9999.00:   NULL VALUE (used for missing/bad data)

#----- RECOMMENDED FIELDS -----
COMP.          ACME ENERGY:   COMPANY
WELL.         DISCOVERY-1H:   WELL NAME
FLD.           NORTH FIELD:   FIELD NAME
LOC.    31.260966, -103.165250:   LOCATION (Latitude, Longitude)
PROV.                 TEXAS:   PROVINCE/STATE
CNTY.               ANDREWS:   COUNTY
STAT.                    TX:   STATE
CTRY.                   USA:   COUNTRY

#----- OPTIONAL BUT USEFUL -----
SRVC.        SCHLUMBERGER:   SERVICE COMPANY
DATE.            06/13/2025:   DATE LOGGED
UWI.         42-003-12345-00-00:   UNIQUE WELL IDENTIFIER
API.         42003123450000:   API NUMBER
LATI.              31.260966:   LATITUDE (decimal degrees)
LONG.            -103.165250:   LONGITUDE (decimal degrees)
GDAT.                   WGS84:   GEODETIC DATUM

#----- DRILLING INFORMATION -----
SECT.                    12:   SECTION
TOWN.                   3S:    TOWNSHIP
RANG.                  38E:   RANGE
EREF.                   KB:   ELEVATION REFERENCE (Kelly Bushing)
EKBE.F               2847.5:   KB ELEVATION
EGLV.F               2823.0:   GROUND LEVEL ELEVATION
TD.F                21500.0:   TOTAL DEPTH

#----- MUD AND WELLBORE -----
BHT.DEGF              185.0:   BOTTOM HOLE TEMPERATURE
BS.IN                   8.5:   BIT SIZE
MUD.                    WBM:   MUD TYPE (Water-Based Mud)
RM.OHMM                0.45:   MUD RESISTIVITY
RMF.OHMM               0.32:   MUD FILTRATE RESISTIVITY
RMC.OHMM               0.28:   MUD CAKE RESISTIVITY

# ============================================================================
# SECTION 3: CURVE INFORMATION (~C) - REQUIRED
# ============================================================================
# Defines each column of data that follows
# Format: MNEMONIC.UNIT    API_CODE : DESCRIPTION
~Curve Information Block
#MNEM.UNIT              API CODE      :   DESCRIPTION
#---------              --------      :   -----------
Depth    .F                           :   Track #  0   Measured Depth
Time     .SEC                         :   Track #  1   Time
GR       .API          45 310 01 00  :   Track #  2   Gamma Ray
CALI     .IN           45 280 01 00  :   Track #  3   Caliper
RHOB     .G/C3         45 350 02 00  :   Track #  4   Bulk Density
NPHI     .V/V          45 330 04 00  :   Track #  5   Neutron Porosity
DT       .US/F         45 520 01 00  :   Track #  6   Delta-T (Sonic)
RT       .OHMM         45 120 44 00  :   Track #  7   True Resistivity
RDEEP    .OHMM         45 120 46 00  :   Track #  8   Deep Resistivity
RMED     .OHMM         45 120 45 00  :   Track #  9   Medium Resistivity
RSHALLOW .OHMM         45 120 47 00  :   Track # 10   Shallow Resistivity
SP       .MV           45 240 01 00  :   Track # 11   Spontaneous Potential
PEF      .B/E          45 360 01 00  :   Track # 12   Photoelectric Factor

# EXPLANATION OF CURVE UNITS:
# F        = Feet
# M        = Meters
# SEC      = Seconds
# API      = API Gamma Ray Units
# IN       = Inches
# G/C3     = Grams per cubic centimeter (density)
# V/V      = Volume/Volume (porosity fraction, 0.15 = 15%)
# %        = Percentage
# US/F     = Microseconds per foot (sonic)
# OHMM     = Ohm-meters (resistivity)
# MV       = Millivolts
# B/E      = Barns per electron (photoelectric factor)

# ============================================================================
# SECTION 4: PARAMETER INFORMATION (~P) - OPTIONAL
# ============================================================================
# Additional parameters and computed values
~Parameter Information Block
#MNEM.UNIT      VALUE           :   DESCRIPTION
#---------      -----           :   -----------
BHT  .DEGF      185.0           :   Bottom Hole Temperature
BS   .IN        8.5             :   Bit Size
CS   .IN        7.0             :   Casing Size
FD   .F         8665.0          :   First Depth
LD   .F         20035.0         :   Last Depth
MUD  .          WBM             :   Mud Type
RM   .OHMM      0.45            :   Mud Resistivity
RMF  .OHMM      0.32            :   Mud Filtrate Resistivity
RMC  .OHMM      0.28            :   Mud Cake Resistivity
MATR .          SAND            :   Matrix Type
FMTN .          PERMIAN         :   Formation Name
RW   .OHMM      0.15            :   Formation Water Resistivity
RT   .OHMM      10.5            :   True Formation Resistivity

# ============================================================================
# SECTION 5: OTHER INFORMATION (~O) - OPTIONAL
# ============================================================================
# Free-form comments and notes
~Other Information
Logged by: John Smith, Senior Log Analyst
QC Status: Passed - All curves within expected ranges
Weather: Clear, 75°F, Wind 5 mph from NE
Special Notes: 
  - Tool stuck at 15,234 ft for 2 hours, data quality maintained
  - Repeat section from 12,000-12,500 ft shows good repeatability
  - Borehole washout zone from 14,200-14,350 ft
  - Gamma ray calibration checked at surface and downhole
Run Information:
  - Run 1: Density-Neutron-GR, 8665-20035 ft, UP log
  - Run 2: Resistivity-SP, 8665-20035 ft, UP log
  - Run 3: Sonic, 9000-19500 ft, UP log
Processing:
  - Environmental corrections applied
  - Depth matching completed between runs
  - Borehole corrections applied to neutron and density

# ============================================================================
# SECTION 6: ASCII DATA (~A) - REQUIRED
# ============================================================================
# Actual measurement data
# One row per depth step
# Columns match the curves defined in ~C section
# Order: Depth, Time, GR, CALI, RHOB, NPHI, DT, RT, RDEEP, RMED, RSHALLOW, SP, PEF
~ASCII Data
8665.0    0.0   45.234  8.125  2.350  0.156   72.45  12.34  10.23  9.45   8.12  -15.6  3.45
8666.0    1.0   47.123  8.150  2.385  0.148   71.23  11.89  9.87   9.12   7.98  -16.2  3.42
8667.0    2.0   48.567  8.175  2.392  0.145   70.89  11.56  9.56   8.89   7.85  -16.8  3.39
8668.0    3.0   49.234  8.200  2.401  0.142   70.45  11.23  9.34   8.67   7.75  -17.3  3.37
8669.0    4.0   51.456  8.225  2.415  0.138   69.87  10.98  9.12   8.45   7.65  -17.9  3.35
8670.0    5.0   53.789  8.250  2.428  0.135   69.34  10.76  8.95   8.28   7.56  -18.4  3.33
8671.0    6.0   55.234  8.275  2.442  0.131   68.89  10.54  8.78   8.12   7.48  -18.9  3.31
8672.0    7.0   58.123  8.300  2.455  0.128   68.45  10.34  8.63   7.98   7.41  -19.5  3.29
8673.0    8.0   62.456  8.325  2.468  0.124   67.98  10.15  8.49   7.85   7.34  -20.1  3.28
8674.0    9.0   67.891  8.350  2.482  0.121   67.56  9.98   8.36   7.73   7.28  -20.6  3.26
8675.0   10.0   72.345  8.375  2.495  0.118   67.12  9.82   8.24   7.62   7.22  -21.2  3.25
8676.0   11.0   78.123  8.400  2.508  0.115   66.78  9.67   8.13   7.52   7.17  -21.8  3.24
8677.0   12.0   85.678  8.425  2.521  0.112   66.45  9.53   8.03   7.43   7.12  -22.3  3.23
8678.0   13.0   92.456  8.450  2.535  0.109   66.12  9.40   7.94   7.35   7.08  -22.9  3.22
8679.0   14.0   98.234  8.475  2.548  0.106   65.78  9.28   7.86   7.27   7.04  -23.5  3.21
8680.0   15.0  105.123  8.500  2.561  0.103   65.45  9.17   7.78   7.20   7.01  -24.1  3.21
# ... continues to STOP depth (20035.0)
# Total rows should be: (STOP - STRT) / STEP + 1 = (20035 - 8665) / 1 + 1 = 11,371 rows

# ============================================================================
# DATA NOTES:
# ============================================================================
# 1. NULL VALUES: Any bad or missing data is replaced with -9999.00
#    Example: If neutron porosity sensor failed at a depth:
#    8681.0   16.0  110.456  8.525  2.575  -9999.00  65.12  9.06  7.71  7.13  6.98  -24.6  3.20
#
# 2. COLUMN ORDER: Must exactly match the order in ~C section
#
# 3. SPACING: Values are space-delimited (spaces or tabs)
#
# 4. DEPTH INCREMENT: Should match STEP value (1.0 ft in this example)
#
# 5. DATA RANGE: Must be within STRT to STOP
#
# 6. CONSISTENT COLUMNS: Every row must have the same number of values
# ============================================================================
