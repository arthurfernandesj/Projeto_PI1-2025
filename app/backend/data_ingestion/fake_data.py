import os
import sys
from faker import Faker
from random import uniform
from datetime import timedelta
from database import models, database

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

fake = Faker()


def create_fake_launch(session):
    launch_date = fake.date_time_between(start_date='-1y', end_date='now')
    launch = models.RocketLaunch(launch_date=launch_date)
    session.add(launch)
    session.commit()
    session.refresh(launch)
    return launch


def create_fake_telemetry(session, launch, points=100):
    base_time = launch.launch_date
    for i in range(points):
        timestamp = base_time + timedelta(seconds=i * 10)
        latitude = uniform(-15.9, -15.7)
        longitude = uniform(-48.0, -47.8)
        altitude_meters = uniform(0, 15000)
        gyro_x = uniform(-0.05, 0.05)
        gyro_y = uniform(-0.05, 0.05)
        gyro_z = uniform(-0.05, 0.05)
        speed_mps = uniform(0, 3000)

        telemetry = models.RocketTelemetry(
            launch_id=launch.id,
            timestamp=timestamp,
            latitude=latitude,
            longitude=longitude,
            altitude_meters=altitude_meters,
            gyro_x=gyro_x,
            gyro_y=gyro_y,
            gyro_z=gyro_z,
            speed_mps=speed_mps
        )
        session.add(telemetry)
    session.commit()


def create_fake_analysis(session, launch):
    telemetry_data = session.query(models.RocketTelemetry).filter_by(launch_id=launch.id).all()

    if not telemetry_data:
        return

    altitudes = [t.altitude_meters for t in telemetry_data]
    speeds = [t.speed_mps for t in telemetry_data if t.speed_mps is not None]
    times = [t.timestamp for t in telemetry_data]

    analysis = models.RocketTelemetryAnalysis(
        launch_id=launch.id,
        avg_altitude=sum(altitudes)/len(altitudes),
        max_altitude=max(altitudes),
        min_altitude=min(altitudes),
        avg_speed=sum(speeds)/len(speeds) if speeds else None,
        max_speed=max(speeds) if speeds else None,
        min_speed=min(speeds) if speeds else None,
        total_duration_seconds=(max(times) - min(times)).seconds,
        recorded_points=len(telemetry_data)
    )
    session.add(analysis)
    session.commit()


def main():
    session = database.SessionLocal()

    for _ in range(3):
        launch = create_fake_launch(session)
        create_fake_telemetry(session, launch, points=100)
        create_fake_analysis(session, launch)

    session.close()
    print("Dados fake inseridos com sucesso!")


if __name__ == "__main__":
    main()