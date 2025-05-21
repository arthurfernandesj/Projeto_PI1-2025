from models import RocketLaunch, RocketTelemetry, RocketTelemetryAnalysis


def test_models_have_tablenames():
    assert RocketLaunch.__tablename__ == "rocket_launch"
    assert RocketTelemetry.__tablename__ == "rocket_telemetry"
    assert RocketTelemetryAnalysis.__tablename__ == "rocket_telemetry_analysis"