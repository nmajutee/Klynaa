from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Klynaa AI Service")


class Health(BaseModel):
    status: str = "ok"


@app.get("/health", response_model=Health)
async def health():
    return Health()


@app.post("/predict")
async def predict(payload: dict):
    # Stub prediction
    return {"prediction": 0, "confidence": 0.0, "echo": payload}
