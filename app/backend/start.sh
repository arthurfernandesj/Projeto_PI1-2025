#!/bin/bash
# start.sh

echo "🔧 Inicializando o banco de dados..."
python -c "from database.init_db import init_db; init_db()"

echo "🚀 Iniciando FastAPI com Uvicorn..."
exec uvicorn main:app --host 0.0.0.0 --port 8000