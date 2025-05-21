
# Documentação Completa Atualizada — Projeto Telemetria de Foguete

---

## 1. Estrutura do Projeto

```
app/
├── data_ingestion/
├── database/
├── frontend/
├── main.py             # Backend FastAPI principal
├── .env
├── requirements.txt
└── README.md
```

---

## 2. Configuração do Ambiente

### 2.1 Criar e ativar ambiente virtual Python

```bash
python -m venv env
source env/bin/activate
```

### 2.2 Instalar dependências

```bash
pip install -r requirements.txt
```

---

## 3. Variáveis de Ambiente — `.env`

Crie arquivo `.env` na raiz do projeto `app/.env`:

```env
POSTGRES_USER=p1user
POSTGRES_PASSWORD=p1password
POSTGRES_DB=analytics
POSTGRES_PORT=54321
DATABASE_URL=postgresql+psycopg2://p1user:p1password@localhost:54321/analytics
```

> Atenção: o valor de `DATABASE_URL` deve estar sem caracteres escapados, exatamente como acima.

---

## 4. Populando o banco com dados fake

Execute:

```bash
python -m data_ingestion.fake_data
```

---

## 5. Rodar backend FastAPI

Na raiz `app/` (onde está o `main.py`):

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

* Backend disponível em: `http://localhost:8000`

---

## 6. Rodar frontend React

### 6.1 Instalar dependências no frontend

```bash
cd frontend
npm install
```

### 6.2 Iniciar frontend

```bash
npm start
```

* Frontend disponível em: `http://localhost:3000`
* Ele consulta o backend automaticamente a cada 5 segundos (polling) para atualizar dados e gráficos.

---

## 7. Testar

* Verifique o backend rodando no `localhost:8000`.
* Abra navegador em `localhost:3000`.
* Você verá os gráficos e métricas atualizados em tempo real.

---

## 8. Comandos úteis

| Comando                              | Descrição                         |
| ------------------------------------ | --------------------------------- |
| `source env/bin/activate`            | Ativar ambiente virtual Python    |
| `pip install -r requirements.txt`    | Instalar dependências Python      |
| `python -m data_ingestion.fake_data` | Popular banco com dados simulados |
| `uvicorn main:app --reload`          | Rodar backend FastAPI             |
| `cd frontend && npm install`         | Instalar dependências do frontend |
| `npm start`                          | Rodar frontend React              |
