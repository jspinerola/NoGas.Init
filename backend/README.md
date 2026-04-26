# Backend

This backend exposes the custom API routes used by the frontend.

## Run

Install dependencies:

```bash
pip install -r requirements.txt
```

Copy the environment template for local config:

```bash
copy .env.example .env
```

Start the API from the `backend` directory:

```bash
uvicorn api.main:app --reload
```

The app stores data in `backend/api/nogas.db` so it works without Supabase credentials during local development.
