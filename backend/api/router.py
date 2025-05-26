"""
API Router
---------
This module defines the FastAPI routes for the wallet persona application.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
import traceback

from backend.utils.blockchain_data import get_wallet_data
from backend.models.classifier import WalletClassifier
from backend.models.persona_generator import PersonaGenerator

# Initialize router
router = APIRouter()

# Initialize models
classifier = WalletClassifier()
persona_generator = PersonaGenerator()

# Request/Response models
class WalletRequest(BaseModel):
    """Request model for wallet analysis."""
    address: str = Field(..., description="Ethereum wallet address")


class WalletResponse(BaseModel):
    """Response model for wallet analysis results."""
    address: str
    wallet_type: str
    confidence: float
    persona_bio: str
    is_ai_generated: bool
    risk_score: float
    health_score: float
    eth_balance: Optional[float] = 0.0
    recent_transactions: Optional[List[Dict[str, Any]]] = []
    recommendations: Dict[str, List[str]]
    visualization_data: Dict[str, Any]


@router.post("/analyze", response_model=WalletResponse)
async def analyze_wallet(request: WalletRequest):
    """
    Analyze a wallet address and generate a persona profile.
    
    Args:
        request: WalletRequest containing the wallet address
        
    Returns:
        WalletResponse containing the analysis results
    """
    try:
        # Validate address format (basic check)
        if not request.address.startswith("0x") or len(request.address) != 42:
            raise HTTPException(status_code=400, detail="Invalid Ethereum address format")
        
        # Get wallet data with error handling
        try:
            wallet_data = get_wallet_data(request.address)
            
            # Classify wallet - this returns a dictionary with wallet_type, confidence, risk_score, etc.
            classification = classifier.classify_wallet(wallet_data)
            
            # Get recommendations - this returns a dictionary of recommendations
            recommendations = classifier.get_recommendations(classification)
        except Exception as e:
            print(f"Error getting wallet data or classifying: {str(e)}")
            # Provide default values if data fetching or classification fails
            wallet_data = {
                "address": request.address,
                "transaction_count": 0,
                "token_count": 0,
                "nft_count": 0,
                "days_since_last_transaction": 365,
                "defi_interaction_count": 0,
                "dao_vote_count": 0
            }
            classification = {
                "wallet_type": "Unknown",
                "confidence": 0.0,
                "risk_score": 25.0,  # Default moderate-low risk
                "health_score": 50.0  # Default neutral health
            }
            # Default recommendations
            recommendations = {
                "dapps": ["Etherscan", "Revoke.cash", "Zapper.fi"],
                "nfts": [],
                "defi": ["Uniswap", "Aave"],
                "daos": []
            }
        
        # Generate persona bio
        persona_bio = persona_generator.generate_persona(wallet_data, classification)
        
        # Enhance bio with specific details - returns dict with text and is_ai_generated
        bio_data = persona_generator.enhance_generated_bio(persona_bio, wallet_data, classification)
        
        # Get recommendations
        recommendations = classifier.get_recommendations(classification)
        
        # Prepare visualization data
        visualization_data = prepare_visualization_data(wallet_data)
        
        # Construct response with proper error handling for all fields
        response = WalletResponse(
            address=request.address,
            wallet_type=classification.get("wallet_type", "Unknown"),
            confidence=classification.get("confidence", 0.0),
            persona_bio=bio_data.get("text", "No information available for this wallet."),
            is_ai_generated=bio_data.get("is_ai_generated", False),
            risk_score=classification.get("risk_score", 25.0),
            health_score=classification.get("health_score", 50.0),
            eth_balance=wallet_data.get("eth_balance", 0.0),  # Add ETH balance
            recent_transactions=wallet_data.get("recent_transactions", []),  # Add recent transactions
            recommendations=recommendations,  # This is now a separate variable
            visualization_data=visualization_data
        )
        
        return response
    
    except Exception as e:
        # Log error (in production, use proper logging)
        print(f"Error analyzing wallet {request.address}: {str(e)}")
        print(traceback.format_exc())
        
        # Return error
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing wallet: {str(e)}"
        )


def prepare_visualization_data(wallet_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepare data for frontend visualizations.
    
    Args:
        wallet_data: Dictionary of wallet features
        
    Returns:
        Dictionary containing data for various visualizations
    """
    try:
        # Initialize default return structure
        result = {
            "timeline": [],
            "portfolio": [],
            "defi_interactions": [],
            "dao_participation": []
        }
        
        # Check if wallet_data is valid
        if not wallet_data or not isinstance(wallet_data, dict):
            print("Warning: Invalid wallet_data provided to prepare_visualization_data")
            return result
        
        # Extract transaction history for timeline with error handling
        try:
            transactions = wallet_data.get("transactions", [])
            timeline_data = []
            
            for tx in transactions:
                try:
                    # Convert timestamp and value with error handling
                    try:
                        timestamp = int(tx.get("timeStamp", 0))
                    except (ValueError, TypeError):
                        timestamp = 0
                        
                    try:
                        value = float(tx.get("value", 0)) / 1e18  # Convert wei to Ether
                    except (ValueError, TypeError):
                        value = 0.0
                        
                    timeline_data.append({
                        "timestamp": timestamp,
                        "type": "transaction",
                        "hash": tx.get("hash", ""),
                        "value": value,
                        "to": tx.get("to", ""),
                        "from": tx.get("from", "")
                    })
                except Exception as e:
                    print(f"Error processing transaction: {str(e)}")
                    continue
            
            result["timeline"] = timeline_data
        except Exception as e:
            print(f"Error preparing timeline data: {str(e)}")
        
        # Prepare token balance data for pie chart with error handling
        try:
            token_balances = wallet_data.get("token_balances", [])
            portfolio_data = []
            
            # Debug log for token balances
            print(f"Token balances: {token_balances[:3] if token_balances else 'None'}")
            
            for token in token_balances:
                try:
                    # Debug log for each token
                    print(f"Processing token: {token.get('tokenSymbol', 'Unknown')}")
                    
                    # The Etherscan API returns the token balance as tokenValue in the response
                    # but sometimes it's named tokenBalance, let's handle both
                    token_value = token.get("tokenValue", token.get("tokenBalance", "0"))
                    print(f"Token value raw: {token_value}")
                    
                    # Convert token value based on decimals with error handling
                    try:
                        decimals = int(token.get("tokenDecimal", 18))
                    except (ValueError, TypeError):
                        decimals = 18
                    
                    # Ensure token_value is converted to float
                    try:
                        value = float(token_value) / (10 ** decimals)
                        # Check if value is very small, and if so, log but still include it
                        if value < 0.00001:
                            print(f"Very small token value: {value} for {token.get('tokenSymbol')}")
                    except (ValueError, TypeError, ZeroDivisionError):
                        print(f"Error converting token value: {token_value} with decimals {decimals}")
                        value = 0.0
                    
                    # Create portfolio entry if value is non-zero
                    if value > 0:
                        portfolio_data.append({
                            "symbol": token.get("tokenSymbol", "Unknown"),
                            "value": value,
                            "name": token.get("tokenName", "Unknown Token"),
                            "type": "ERC20"
                        })
                        print(f"Added token {token.get('tokenSymbol')} with value {value}")
                    else:
                        print(f"Skipping zero-value token: {token.get('tokenSymbol')}")
                
                except Exception as e:
                    print(f"Error processing token: {str(e)}")
                    continue
            
            # Process NFTs separately from ERC20 tokens
            try:
                nfts = wallet_data.get("nfts", [])
                nft_count = len(nfts)
                
                # Only add a single aggregated NFT entry if NFTs exist
                # This prevents NFTs from dominating the portfolio chart
                if nft_count > 0:
                    # Add a separate data structure for NFT collections
                    nft_collections = {}
                    for nft in nfts:
                        try:
                            collection = nft.get("contract", {}).get("name", "Unknown Collection")
                            if collection in nft_collections:
                                nft_collections[collection] += 1
                            else:
                                nft_collections[collection] = 1
                        except Exception as e:
                            print(f"Error processing NFT collection: {str(e)}")
                    
                    # Store NFT collection data separately
                    result["nft_collections"] = [
                        {"name": collection, "count": count}
                        for collection, count in nft_collections.items()
                    ]
                    
                    # Only add NFTs to portfolio if there are few ERC20 tokens
                    # This prevents NFTs from dominating the chart when there are real tokens
                    if len(portfolio_data) < 3 and nft_count > 0:
                        portfolio_data.append({
                            "symbol": "NFTs",
                            "value": 0.1,  # Small value to not dominate the chart
                            "name": f"NFT Collections ({nft_count} items)",
                            "type": "NFT"
                        })
            except Exception as e:
                print(f"Error processing NFTs: {str(e)}")
                # Ensure the NFT collections field exists even if empty
                result["nft_collections"] = []
            
            result["portfolio"] = portfolio_data
        except Exception as e:
            print(f"Error preparing portfolio data: {str(e)}")
        
        # Extract DeFi interaction data with error handling
        try:
            defi_protocols = wallet_data.get("defi_protocols", {})
            if isinstance(defi_protocols, dict):
                defi_data = [
                    {"protocol": protocol, "interactions": count}
                    for protocol, count in defi_protocols.items()
                ]
                result["defi_interactions"] = defi_data
        except Exception as e:
            print(f"Error preparing DeFi interaction data: {str(e)}")
        
        # Extract DAO participation data with error handling
        try:
            dao_participation = wallet_data.get("dao_participation", {})
            if isinstance(dao_participation, dict):
                dao_data = [
                    {"dao": dao, "votes": count}
                    for dao, count in dao_participation.items()
                ]
                result["dao_participation"] = dao_data
        except Exception as e:
            print(f"Error preparing DAO participation data: {str(e)}")
        
        # Add default data if any section is empty
        if not result["portfolio"]:
            # Add a default token for visualization if no portfolio data
            result["portfolio"] = [
                {"symbol": "ETH", "value": 0.1, "name": "Ethereum", "type": "ERC20"}
            ]
            
        if not result["defi_interactions"]:
            # Add minimal DeFi data if none exists
            result["defi_interactions"] = [
                {"protocol": "Unknown", "interactions": 0}
            ]
            
        return result
            
    except Exception as e:
        print(f"Critical error in prepare_visualization_data: {str(e)}")
        # Return a minimal valid structure
        return {
            "timeline": [],
            "portfolio": [{"symbol": "ETH", "value": 0.1, "name": "Ethereum", "type": "ERC20"}],
            "defi_interactions": [{"protocol": "Unknown", "interactions": 0}],
            "dao_participation": []
        }
