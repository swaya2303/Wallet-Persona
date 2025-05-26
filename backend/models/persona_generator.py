"""
Persona Profile Generator
------------------------
This module generates natural language persona profiles for wallets using transformer models.
"""

import os
from typing import Dict, Any, List
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

class PersonaGenerator:
    """Generates persona profiles using transformer models."""
    
    def __init__(self, model_name: str = "distilgpt2"):
        """
        Initialize the persona generator with a pre-trained model.
        
        Args:
            model_name: Name of the pre-trained model to use
        """
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(model_name)
        
        # Load the model on GPU if available
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = self.model.to(self.device)
        
    def _create_prompt(self, wallet_data: Dict[str, Any], classification: Dict[str, Any]) -> str:
        """
        Create a prompt for the model based on wallet data and classification.
        
        Args:
            wallet_data: Dictionary of wallet features
            classification: Dictionary containing classification results
            
        Returns:
            Prompt string for the model
        """
        # Get wallet type with error handling
        wallet_type = classification.get("wallet_type", "Unknown")
        
        # Get features with error handling
        features = classification.get("features", {})
        if not features and isinstance(features, dict):
            # Default values if features is missing
            features = {
                "transaction_count": wallet_data.get("transaction_count", 0),
                "token_count": wallet_data.get("token_count", 0),
                "nft_count": wallet_data.get("nft_count", 0)
            }
            
        # Extract key metrics with error handling
        tx_count = features.get("transaction_count", 0)
        token_count = features.get("token_count", 0)
        nft_count = features.get("nft_count", 0)
        dao_count = wallet_data.get("dao_vote_count", 0)
        defi_protocols = list(wallet_data.get("defi_protocols", {}).keys())
        
        # Create descriptive prompt
        prompt = f"Wallet with {tx_count} transactions"
        
        if token_count > 0:
            prompt += f", holds {token_count} different tokens"
        
        if nft_count > 0:
            prompt += f", owns {nft_count} NFTs"
        
        if dao_count > 0:
            prompt += f", has participated in {dao_count} DAO votes"
        
        if defi_protocols:
            protocols_str = ", ".join(defi_protocols[:3])
            prompt += f", uses DeFi protocols like {protocols_str}"
        
        prompt += f". This wallet is classified as a {wallet_type}.\n\nBio:"
        
        return prompt
    
    def generate_persona(self, wallet_data: Dict[str, Any], classification: Dict[str, Any]) -> str:
        """
        Generate a persona profile bio for the wallet.
        
        Args:
            wallet_data: Dictionary of wallet features
            classification: Dictionary containing classification results
            
        Returns:
            Generated persona profile bio
        """
        prompt = self._create_prompt(wallet_data, classification)
        
        # Tokenize the prompt
        inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)
        
        # Generate text
        with torch.no_grad():
            outputs = self.model.generate(
                inputs["input_ids"],
                max_length=150,
                num_return_sequences=1,
                temperature=0.8,
                top_p=0.9,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )
        
        # Decode the generated text
        generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract only the bio part (remove the prompt)
        bio = generated_text[len(prompt):].strip()
        
        return bio
    
    def persona_templates(self, wallet_type: str) -> List[str]:
        """
        Get predefined persona templates based on wallet type.
        Used as fallback or for fine-tuning.
        
        Args:
            wallet_type: Type of wallet persona
            
        Returns:
            List of template bios for the wallet type
        """
        templates = {
            "Investor": [
                "I'm a long-term DeFi believer focused on sustainable yields and strategic token acquisitions. My portfolio is carefully balanced across major ecosystems, with particular interest in governance tokens that offer both utility and appreciation potential.",
                "Building wealth through smart contract interactions is my passion. I regularly rebalance my positions based on market conditions, preferring established protocols with proven track records."
            ],
            "NFT Collector": [
                "Digital art connoisseur with a growing collection of unique NFTs spanning various genres and communities. I'm particularly drawn to generative art and projects with strong artistic vision.",
                "I hunt for hidden gems in the NFT space, balancing blue-chip collections with emerging artists. My collection reflects both aesthetic appreciation and community participation."
            ],
            "DAO Member": [
                "Governance enthusiast actively shaping the future of decentralized protocols through proposal creation and voting. I believe in the power of collective decision-making to build better financial systems.",
                "I split my time between multiple DAOs, contributing proposals and voting on critical protocol changes. Community-driven development is the future of blockchain technology."
            ],
            "Degen Trader": [
                "Living on the edge of DeFi with a taste for volatile assets and emerging protocols. I'm always chasing the next big opportunity, even if it means taking calculated risks.",
                "Fast moves and alpha hunting define my on-chain strategy. I've developed a sixth sense for emerging trends and don't mind the occasional high-risk position if the potential rewards are substantial."
            ],
            "Dormant/Inactive": [
                "I'm a patient hodler who believes in the long-term vision of crypto. I don't need to make daily moves to build wealth - time in the market beats timing the market.",
                "My wallet may seem quiet, but that's by design. I've positioned myself in solid assets that don't require constant maintenance, allowing me to focus on life beyond the blockchain."
            ]
        }
        
        return templates.get(wallet_type, ["Crypto enthusiast exploring the blockchain ecosystem."])
    
    def enhance_generated_bio(self, bio: str, wallet_data: Dict[str, Any], classification: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enhance a generated bio with specific details from wallet data.
        
        Args:
            bio: Base generated bio
            wallet_data: Dictionary of wallet features
            classification: Dictionary containing classification results
            
        Returns:
            Dictionary containing enhanced bio text and a flag indicating if it's AI-generated
        """
        try:
            # Track whether we're using an AI-generated bio or a template
            is_ai_generated = True
            
            # If the generated bio is too short, use a template instead
            if len(bio.split()) < 10:
                # Get wallet type with error handling
                wallet_type = classification.get("wallet_type", "Unknown")
                templates = self.persona_templates(wallet_type)
                bio = templates[0]
                is_ai_generated = False  # Using a template, not AI-generated
        except Exception as e:
            print(f"Error enhancing bio: {str(e)}")
            bio = "This wallet has insufficient data for a detailed persona."
            is_ai_generated = False
        
        # Add specific details about tokens or protocols if available
        token_balances = wallet_data.get("token_balances", [])
        if token_balances:
            top_tokens = [token["tokenSymbol"] for token in token_balances[:3] if "tokenSymbol" in token]
            if top_tokens:
                tokens_str = ", ".join(top_tokens)
                bio += f" Currently holding {tokens_str} among other assets."
        
        # Add DeFi protocol information
        defi_protocols = list(wallet_data.get("defi_protocols", {}).keys())
        if defi_protocols:
            protocols_str = ", ".join(defi_protocols[:2])
            bio += f" Active in {protocols_str} protocols."
        
        # Add DAO participation
        dao_participation = wallet_data.get("dao_participation", {})
        if dao_participation:
            daos = list(dao_participation.keys())
            if daos:
                daos_str = ", ".join(daos[:2])
                bio += f" Participated in governance for {daos_str}."
        
        # Return both the bio text and whether it was AI-generated
        return {
            "text": bio,
            "is_ai_generated": is_ai_generated
        }
