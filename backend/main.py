"""
Main Application
---------------
FastAPI application entry point for the Wallet Persona API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

from backend.api.router import router

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Wallet Persona API",
    description="API for analyzing Ethereum wallet addresses and generating persona profiles",
    version="0.1.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ],  # Specific origins for development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include router
app.include_router(router, prefix="/api")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint returning API information."""
    return {
        "message": "Welcome to the Wallet Persona API",
        "docs_url": "/docs",
        "version": "0.1.0"
    }

if __name__ == "__main__":
    # Get port from environment or use default
    port = int(os.getenv("PORT", 8000))
    
    # Run API with uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
