from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Text
from datetime import datetime
from .database import Base

# ===== WELL TABLE =====
class Well(Base):
    __tablename__ = "wells"
    id = Column(Integer, primary_key=True)
    well_name = Column(String, nullable=False)
    filename = Column(String)
    company = Column(String)
    field = Column(String)
    location = Column(String)
    country = Column(String)
    date_analysed = Column(String)
    start_depth = Column(Float)
    stop_depth = Column(Float)
    step = Column(Float)
    null_value = Column(Float)
    row_count = Column(Integer)
    s3_key = Column(String, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

# ===== WELL CURVES TABLE =====
class WellCurve(Base):
    __tablename__ = "well_curves"
    id = Column(Integer, primary_key=True)
    well_id = Column(Integer, ForeignKey("wells.id", ondelete="CASCADE"))
    curve_name = Column(String)
    unit = Column(String)

# ===== WELL DATA TABLE =====
class WellData(Base):
    __tablename__ = "well_data"
    id = Column(Integer, primary_key=True)
    well_id = Column(Integer, ForeignKey("wells.id", ondelete="CASCADE"))
    depth = Column(Float)
    curve_values = Column(JSON)  # {"HC1": 23.5, "HC2": 12.3, ...}

# ===== INTERPRETATION TABLE =====
class Interpretation(Base):
    __tablename__ = "interpretations"
    id = Column(Integer, primary_key=True)
    well_id = Column(Integer, ForeignKey("wells.id", ondelete="CASCADE"))
    depth_from = Column(Float)
    depth_to = Column(Float)
    curves_analyzed = Column(String)
    interpretation = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

# ===== CHAT MESSAGE TABLE =====
class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True)
    well_id = Column(Integer, ForeignKey("wells.id", ondelete="CASCADE"))
    role = Column(String)  # "user" or "assistant"
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)