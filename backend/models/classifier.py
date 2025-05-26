"""
Wallet Behavior Classifier
--------------------------
This module classifies wallets into different persona types based on their on-chain behavior.
"""

from typing import Dict, List, Any, Tuple
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

# Define wallet persona types
WALLET_TYPES = [
    "Investor",        # Buys/sells tokens frequently
    "NFT Collector",   # Holds many NFTs, active in minting
    "DAO Member",      # Votes on proposals, stakes governance tokens
    "Degen Trader",    # High-risk short-term trades, using leverage or memecoins
    "Dormant/Inactive" # Minimal recent activity
]

class WalletClassifier:
    """Classifies wallets into different persona types."""
    
    def __init__(self):
        """Initialize the classifier with default parameters."""
        pass
    
    def _extract_features(self, wallet_data: Dict[str, Any]) -> Dict[str, float]:
        """
        Extract numerical features from wallet data for classification.
        
        Args:
            wallet_data: Dictionary of wallet features
            
        Returns:
            Dictionary of numerical features for classification
        """
        try:
            # Basic metrics with default values for safety
            tx_count = wallet_data.get("transaction_count", 0)
            token_count = wallet_data.get("token_count", 0)
            nft_count = wallet_data.get("nft_count", 0)
            days_since_tx = wallet_data.get("days_since_last_transaction", 365)  # Default to a year if no data
            defi_count = wallet_data.get("defi_interaction_count", 0)
            dao_count = wallet_data.get("dao_vote_count", 0)
            
            # Calculate derived metrics with error handling
            # Higher value for more recent activity
            try:
                activity_recency = 1.0 / (1.0 + days_since_tx)  
            except (ZeroDivisionError, TypeError):
                activity_recency = 0.0
            
            # Token diversity - ratio of unique tokens to total transactions
            try:
                token_diversity = token_count / max(tx_count, 1)
            except (ZeroDivisionError, TypeError):
                token_diversity = 0.0
            
            # NFT focus - ratio of NFTs to total tokens
            try:
                nft_focus = nft_count / max(token_count + nft_count, 1)
            except (ZeroDivisionError, TypeError):
                nft_focus = 0.0
            
            # DAO engagement - ratio of DAO votes to total transactions
            try:
                dao_engagement = dao_count / max(tx_count, 1)
            except (ZeroDivisionError, TypeError):
                dao_engagement = 0.0
            
            # DeFi engagement - ratio of DeFi interactions to total transactions
            try:
                defi_engagement = defi_count / max(tx_count, 1)
            except (ZeroDivisionError, TypeError):
                defi_engagement = 0.0
            
            # Extract transaction patterns
            transactions = wallet_data.get("transactions", [])
            
            # Calculate average transaction value (in Ether)
            try:
                tx_values = [float(tx.get("value", 0)) / 1e18 for tx in transactions]
                avg_tx_value = sum(tx_values) / max(len(tx_values), 1)
            except (ZeroDivisionError, TypeError, ValueError):
                avg_tx_value = 0.0
            
            # Calculate transaction frequency (transactions per day)
            tx_frequency = 0.0  # Default value
            try:
                if len(transactions) >= 2:
                    try:
                        first_tx = int(transactions[-1].get("timeStamp", 0))
                        last_tx = int(transactions[0].get("timeStamp", 0))
                        time_span_days = max((last_tx - first_tx) / 86400, 1)
                        tx_frequency = len(transactions) / time_span_days
                    except (IndexError, KeyError, ValueError, ZeroDivisionError):
                        tx_frequency = 0.0
            except Exception:
                # Fallback for any unexpected errors
                tx_frequency = 0.0
        except Exception as e:
            print(f"Error extracting features: {str(e)}")
            # Provide default values if extraction fails
            tx_count = 0
            token_count = 0
            nft_count = 0
            activity_recency = 0.0
            token_diversity = 0.0
            nft_focus = 0.0
            dao_engagement = 0.0
            defi_engagement = 0.0
            avg_tx_value = 0.0
            tx_frequency = 0.0
        
        return {
            "transaction_count": tx_count,
            "token_count": token_count,
            "nft_count": nft_count,
            "activity_recency": activity_recency,
            "token_diversity": token_diversity,
            "nft_focus": nft_focus,
            "dao_engagement": dao_engagement,
            "defi_engagement": defi_engagement,
            "avg_tx_value": avg_tx_value,
            "tx_frequency": tx_frequency
        }
    
    def _rule_based_classification(self, features: Dict[str, float]) -> str:
        """
        Apply rule-based heuristics to classify a wallet.
        
        Args:
            features: Dictionary of numerical features
            
        Returns:
            Wallet persona type
        """
        # Inactive wallets
        if features["transaction_count"] < 5 or features["activity_recency"] < 0.01:
            return "Dormant/Inactive"
        
        # NFT Collector
        if features["nft_count"] > 10 and features["nft_focus"] > 0.5:
            return "NFT Collector"
        
        # DAO Member
        if features["dao_engagement"] > 0.1:
            return "DAO Member"
        
        # Degen Trader
        if features["tx_frequency"] > 5 and features["avg_tx_value"] > 1:
            return "Degen Trader"
        
        # Default to Investor
        return "Investor"
    
    def calculate_wallet_scores(self, features: Dict[str, float]) -> Dict[str, float]:
        """
        Calculate risk and health scores for a wallet.
        
        Args:
            features: Dictionary of numerical features
            
        Returns:
            Dictionary containing risk and health scores
        """
        # Risk score factors (0-100, higher means more risky)
        risk_factors = {
            "tx_frequency": features["tx_frequency"] * 5,  # High frequency trading is riskier
            "avg_tx_value": min(features["avg_tx_value"] * 10, 50),  # Large transactions are riskier
            "token_diversity": (1 - features["token_diversity"]) * 20,  # Low diversity is riskier
            "activity_recency": features["activity_recency"] * 20  # Recent activity can be risky
        }
        
        # Health score factors (0-100, higher means healthier)
        health_factors = {
            "tx_count": min(features["transaction_count"] / 10, 30),  # More transactions show consistent usage
            "token_diversity": features["token_diversity"] * 20,  # Diverse portfolio is healthier
            "dao_engagement": features["dao_engagement"] * 30,  # DAO participation shows commitment
            "activity_recency": (1 - features["activity_recency"]) * 20  # Long-term holding is healthier
        }
        
        risk_score = sum(risk_factors.values())
        health_score = sum(health_factors.values())
        
        # Normalize scores to 0-100 range
        risk_score = min(max(risk_score, 0), 100)
        health_score = min(max(health_score, 0), 100)
        
        return {
            "risk_score": risk_score,
            "health_score": health_score
        }
    
    def classify_wallet(self, wallet_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Classify a wallet based on its features.
        
        Args:
            wallet_data: Dictionary of wallet features
            
        Returns:
            Dictionary containing classification results and scores
        """
        # Extract features
        features = self._extract_features(wallet_data)
        
        # Apply rule-based classification
        wallet_type = self._rule_based_classification(features)
        
        # Calculate scores
        scores = self.calculate_wallet_scores(features)
        
        # Calculate confidence percentages for each wallet type
        confidence_scores = {
            "Investor": 0.2,
            "NFT Collector": 0.2,
            "DAO Member": 0.2,
            "Degen Trader": 0.2,
            "Dormant/Inactive": 0.2
        }
        
        # Adjust confidence based on features
        if features["nft_focus"] > 0.5:
            confidence_scores["NFT Collector"] += 0.3
            confidence_scores["Investor"] -= 0.1
        
        if features["dao_engagement"] > 0.1:
            confidence_scores["DAO Member"] += 0.3
            confidence_scores["Dormant/Inactive"] -= 0.1
        
        if features["tx_frequency"] > 5:
            confidence_scores["Degen Trader"] += 0.3
            confidence_scores["Dormant/Inactive"] -= 0.1
        
        if features["activity_recency"] < 0.01:
            confidence_scores["Dormant/Inactive"] += 0.5
            for wtype in ["Investor", "NFT Collector", "DAO Member", "Degen Trader"]:
                confidence_scores[wtype] -= 0.1
        
        # Normalize confidence scores
        total = sum(confidence_scores.values())
        for wtype in confidence_scores:
            confidence_scores[wtype] = round(confidence_scores[wtype] / total * 100, 2)
        
        return {
            "wallet_type": wallet_type,
            "confidence": confidence_scores[wallet_type],
            "all_types_confidence": confidence_scores,
            "risk_score": scores["risk_score"],
            "health_score": scores["health_score"],
            "features": features
        }
    
    def get_recommendations(self, classification: Dict[str, Any]) -> Dict[str, List[str]]:
        """
        Generate personalized recommendations based on wallet classification.
        
        Args:
            classification: Dictionary containing classification results
            
        Returns:
            Dictionary of recommendations by category
        """
        wallet_type = classification["wallet_type"]
        recommendations = {
            "dapps": [],
            "nfts": [],
            "defi": [],
            "daos": []
        }
        
        if wallet_type == "Investor":
            recommendations["dapps"] = ["DeBank", "Zapper.fi", "Zerion"]
            recommendations["defi"] = ["Aave", "Compound", "Yearn Finance"]
            recommendations["daos"] = ["MakerDAO", "Aave Governance"]
            
        elif wallet_type == "NFT Collector":
            recommendations["dapps"] = ["OpenSea", "Blur", "Rarible"]
            recommendations["nfts"] = ["Art Blocks", "PROOF Collective", "Azuki"]
            recommendations["defi"] = ["NFTfi", "Arcade"]
            
        elif wallet_type == "DAO Member":
            recommendations["dapps"] = ["Snapshot", "Tally", "Boardroom"]
            recommendations["daos"] = ["Gitcoin", "Optimism Collective", "ENS DAO"]
            recommendations["defi"] = ["Index Coop", "Balancer"]
            
        elif wallet_type == "Degen Trader":
            recommendations["dapps"] = ["dYdX", "GMX", "PancakeSwap"]
            recommendations["defi"] = ["Curve", "Synthetix", "Perpetual Protocol"]
            recommendations["nfts"] = ["Memeland", "Pudgy Penguins"]
            
        else:  # Dormant/Inactive
            recommendations["dapps"] = ["Revoke.cash", "Etherscan", "Zapper.fi"]
            recommendations["defi"] = ["Lido", "Rocket Pool", "Yearn Finance"]
            
        return recommendations
