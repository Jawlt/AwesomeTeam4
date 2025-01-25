from fastapi import FastAPI

app = FastAPI()

@app.api_route("/api", methods=["GET", "POST", "PUT", "DELETE"])
async def handle_crud():
    return {"message": "Handling CRUD operations"}