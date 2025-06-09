from sqlalchemy import (
    Column,
    Integer,
    Float,
    TIMESTAMP,
    ForeignKey,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class RocketLaunch(Base):
    __tablename__ = "rocket_launch"

    id = Column(Integer, primary_key=True, index=True)
    launch_date = Column(TIMESTAMP, nullable=False)

    telemetry = relationship("RocketTelemetry", back_populates="launch")
    analysis = relationship("RocketTelemetryAnalysis", back_populates="launch", uselist=False)


class RocketTelemetry(Base):
    __tablename__ = "rocket_telemetry"

    id = Column(Integer, primary_key=True, index=True)
    launch_id = Column(Integer, ForeignKey("rocket_launch.id"), nullable=False)
    timestamp = Column(TIMESTAMP, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    altitude_meters = Column(Float, nullable=False)
    gyro_x = Column(Float, nullable=False)
    gyro_y = Column(Float, nullable=False)
    gyro_z = Column(Float, nullable=False)
    speed_mps = Column(Float, nullable=True)

    launch = relationship("RocketLaunch", back_populates="telemetry")


class RocketTelemetryAnalysis(Base):
    __tablename__ = "rocket_telemetry_analysis"

    id = Column(Integer, primary_key=True, index=True)
    launch_id = Column(Integer, ForeignKey("rocket_launch.id"), nullable=False, unique=True)
    avg_altitude = Column(Float)
    max_altitude = Column(Float)
    min_altitude = Column(Float)
    avg_speed = Column(Float)
    max_speed = Column(Float)
    min_speed = Column(Float)
    total_duration_seconds = Column(Integer)
    recorded_points = Column(Integer)

    launch = relationship("RocketLaunch", back_populates="analysis")