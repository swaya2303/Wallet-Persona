import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { FaEthereum, FaSearch } from 'react-icons/fa';

const HeroSection = styled.div`
  background: linear-gradient(-45deg, #3a6df0, #6c5ce7, #00cec9, #3a6df0);
  background-size: 400% 400%;
  animation: gradient 15s ease infinite;
  color: white;
  padding: 80px 0;
  text-align: center;
  border-radius: 0 0 30px 30px;
  margin-bottom: 60px;
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 20px;
  font-weight: 700;
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  max-width: 700px;
  margin: 0 auto 40px;
  opacity: 0.9;
  line-height: 1.6;
`;

const WalletForm = styled.form`
  max-width: 600px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(5px);
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const WalletInput = styled.input`
  width: 100%;
  padding: 16px 16px 16px 50px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.85);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    background: white;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--primary-color);
  font-size: 20px;
`;

const WalletSubmit = styled.button`
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 8px;
  background: #00cec9;
  color: white;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;

  &:hover {
    background: #00b8b2;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    background: #b2bec3;
    cursor: not-allowed;
    transform: none;
  }
`;

const FeaturesSection = styled.section`
  max-width: 1200px;
  margin: 0 auto 80px;
  padding: 0 20px;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2rem;
  margin-bottom: 50px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 4px;
    background: var(--primary-color);
    border-radius: 2px;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  background: var(--primary-color);
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 20px;
`;

const FeatureTitle = styled.h3`
  margin: 0 0 15px 0;
  font-size: 1.2rem;
`;

const FeatureDescription = styled.p`
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.6;
`;

function HomePage() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation for Ethereum address
    if (!walletAddress || !walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error('Please enter a valid Ethereum wallet address');
      return;
    }
    
    setIsLoading(true);
    
    // Navigate to the persona page with the address
    // In a real app, you might want to fetch data first
    navigate(`/persona/${walletAddress}`);
  };
  
  return (
    <>
      <HeroSection>
        <div className="container">
          <HeroTitle>Discover Your On-Chain Persona</HeroTitle>
          <HeroSubtitle>
            Enter any Ethereum wallet address to generate a unique AI-powered profile based on on-chain activity, 
            showcasing behavior patterns, risk metrics, and personalized recommendations.
          </HeroSubtitle>
          
          <WalletForm onSubmit={handleSubmit}>
            <InputGroup>
              <InputIcon>
                <FaEthereum />
              </InputIcon>
              <WalletInput 
                type="text" 
                placeholder="Enter Ethereum wallet address (0x...)" 
                value={walletAddress} 
                onChange={(e) => setWalletAddress(e.target.value)}
              />
            </InputGroup>
            <WalletSubmit type="submit" disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Generate Persona'}
              {!isLoading && <FaSearch />}
            </WalletSubmit>
          </WalletForm>
        </div>
      </HeroSection>
      
      <FeaturesSection>
        <SectionTitle>Key Features</SectionTitle>
        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>📊</FeatureIcon>
            <FeatureTitle>Wallet Behavior Classifier</FeatureTitle>
            <FeatureDescription>
              Advanced algorithm that classifies wallets into distinct personas based on transaction patterns and asset holdings.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>🤖</FeatureIcon>
            <FeatureTitle>AI-Generated Bio</FeatureTitle>
            <FeatureDescription>
              DistilGPT-2 powered natural language generation creates personalized bios describing on-chain behavior and preferences.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>📈</FeatureIcon>
            <FeatureTitle>Interactive Visualizations</FeatureTitle>
            <FeatureDescription>
              Beautiful charts and graphs that illustrate wallet activity, token distribution, and historical transactions.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>🛡️</FeatureIcon>
            <FeatureTitle>Risk & Health Scoring</FeatureTitle>
            <FeatureDescription>
              Proprietary scoring system that evaluates wallet health and risk exposure based on multiple on-chain factors.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>🔮</FeatureIcon>
            <FeatureTitle>Smart Recommendations</FeatureTitle>
            <FeatureDescription>
              Personalized suggestions for DeFi protocols, NFT collections, and DAOs based on your wallet's behavior profile.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>🔍</FeatureIcon>
            <FeatureTitle>Comprehensive Analysis</FeatureTitle>
            <FeatureDescription>
              Deep dive into any Ethereum wallet, revealing patterns and behaviors that define the wallet's persona.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>
    </>
  );
}

export default HomePage;
