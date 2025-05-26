# Wallet Persona

An AI-powered tool that analyzes wallet addresses to generate unique on-chain persona profiles, combining behavior classification, visualizations, and AI-generated bios.

Issues Faced While Making this AI: 
Tried to use diffrent models like tinyllama and microsoft phi-2 to generate accurate bio of users from the information got by the wallet address but as my laptop has 8gb RAM and 6GB free space in disk these small models also didn't work.
I knew distillgpt-2 is not generating good bio's but it is getting all the information about the wallet and the bio's are AI generated and not template based.
Learned great stuff from working on this project.

## Features

1. **Wallet Behavior Classifier**
   - Classifies wallets into categories like Investor, NFT Collector, DAO Member, etc.
   - Uses heuristics and clustering based on on-chain activity

2. **Persona Profile Generator**
   - AI-generated bios similar to social profiles
   - Leverages DistilGPT-2 for natural language generation

3. **Wallet Visualization**
   - Timeline of major transactions
   - Token movement graphs
   - Portfolio pie charts

4. **Wallet Score System**
   - Risk Score based on exposure to risky assets
   - Health Score based on activity consistency and ROI

5. **Personalized Recommendations**
   - DeFi tools for investors
   - NFT drops for collectors
   - DAOs for governance participants

## Tech Stack

- **Backend**: Python, FastAPI
- **Frontend**: React, D3.js/Chart.js
- **Data Sources**: Etherscan API, Alchemy, Covalent
- **AI Models**: DistilGPT-2

## Getting Started

1. Clone this repository
2. Install dependencies: `pip install -r requirements.txt`
3. Set up your environment variables in `.env`
4. Run the backend: `python -m backend.main`
5. Run the frontend: `cd frontend && npm start`

## Environment Variables

Create a `.env` file with the following variables:
```
ETHERSCAN_API_KEY=your_etherscan_api_key
ALCHEMY_API_KEY=your_alchemy_api_key
```

THANK YOU
