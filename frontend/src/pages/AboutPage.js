import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 50px;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 20px;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: var(--text-secondary);
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
`;

const Section = styled.section`
  margin-bottom: 60px;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 20px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 60px;
    height: 4px;
    background: var(--primary-color);
    border-radius: 2px;
  }
`;

const SectionContent = styled.div`
  line-height: 1.7;
  color: var(--text-color);
  
  p {
    margin-bottom: 20px;
  }
  
  ul {
    padding-left: 20px;
    margin-bottom: 20px;
    
    li {
      margin-bottom: 10px;
    }
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 30px;
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
`;

const FeatureTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: var(--primary-color);
`;

const FeatureDescription = styled.p`
  margin: 0;
  color: var(--text-secondary);
`;

function AboutPage() {
  return (
    <Container>
      <PageHeader>
        <PageTitle>About Wallet Persona</PageTitle>
        <Subtitle>
          Discover the AI-powered tool that analyzes on-chain activity to generate unique wallet personas,
          combining behavior classification, data visualization, and personalized recommendations.
        </Subtitle>
      </PageHeader>
      
      <Section>
        <SectionTitle>Our Mission</SectionTitle>
        <SectionContent>
          <p>
            We created Wallet Persona to bring transparency and personalization to the blockchain ecosystem.
            Our mission is to help users understand their on-chain behavior patterns, identify risk factors,
            and discover new opportunities based on their unique wallet profile.
          </p>
          <p>
            By leveraging the power of artificial intelligence and blockchain data analytics, we're able to
            transform raw transaction data into meaningful insights that help users make better decisions
            in the decentralized economy.
          </p>
        </SectionContent>
      </Section>
      
      <Section>
        <SectionTitle>How It Works</SectionTitle>
        <SectionContent>
          <p>
            Wallet Persona combines blockchain data retrieval, machine learning classification, and natural
            language generation to create comprehensive profiles for any Ethereum wallet address.
          </p>
          <p>Here's how the process works:</p>
          <ul>
            <li>
              <strong>Data Collection:</strong> We fetch transaction history, token balances, NFT holdings,
              and protocol interactions from the Ethereum blockchain using APIs like Etherscan and Alchemy.
            </li>
            <li>
              <strong>Behavior Classification:</strong> Our proprietary algorithms analyze the data to classify
              the wallet into one of several persona types, including Investor, NFT Collector, DAO Member,
              Degen Trader, and Dormant/Inactive.
            </li>
            <li>
              <strong>AI Bio Generation:</strong> Using DistilGPT-2, we generate a natural language description
              of the wallet's behavior and preferences based on its on-chain activity.
            </li>
            <li>
              <strong>Risk & Health Assessment:</strong> We calculate risk and health scores by evaluating
              multiple factors including transaction patterns, portfolio diversity, and interaction with
              verified contracts.
            </li>
            <li>
              <strong>Visualization:</strong> We transform complex blockchain data into intuitive charts
              and graphs that make it easy to understand the wallet's activity patterns.
            </li>
            <li>
              <strong>Personalized Recommendations:</strong> Based on the wallet's classification and
              activity patterns, we suggest relevant DApps, NFT collections, DeFi protocols, and DAOs.
            </li>
          </ul>
        </SectionContent>
      </Section>
      
      <Section>
        <SectionTitle>Key Features</SectionTitle>
        <FeatureGrid>
          <FeatureCard>
            <FeatureTitle>Wallet Behavior Classifier</FeatureTitle>
            <FeatureDescription>
              Categorizes wallets into distinct personas based on transaction patterns, holdings, and DeFi activities.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureTitle>AI-Generated Bios</FeatureTitle>
            <FeatureDescription>
              Creates natural language descriptions of wallet behavior using advanced language models.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureTitle>Portfolio Visualization</FeatureTitle>
            <FeatureDescription>
              Illustrates token distribution, transaction history, and protocol interactions through interactive charts.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureTitle>Risk & Health Scoring</FeatureTitle>
            <FeatureDescription>
              Evaluates wallet risk exposure and overall health based on multiple on-chain factors.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureTitle>Personalized Recommendations</FeatureTitle>
            <FeatureDescription>
              Suggests relevant protocols, collections, and communities based on wallet behavior.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureTitle>Privacy-Focused</FeatureTitle>
            <FeatureDescription>
              All analysis is performed on publicly available on-chain data without requiring any private information.
            </FeatureDescription>
          </FeatureCard>
        </FeatureGrid>
      </Section>
      
      <Section>
        <SectionTitle>Technical Details</SectionTitle>
        <SectionContent>
          <p>
            Wallet Persona is built with a modern tech stack designed for performance and scalability:
          </p>
          <ul>
            <li>
              <strong>Backend:</strong> Python with FastAPI for high-performance API endpoints, scikit-learn
              for classification algorithms, and Hugging Face Transformers for AI text generation.
            </li>
            <li>
              <strong>Frontend:</strong> React with styled-components for the user interface, Chart.js and
              D3.js for interactive data visualizations.
            </li>
            <li>
              <strong>Data Sources:</strong> Etherscan API for transaction history, Alchemy for NFT data,
              and custom blockchain data processing pipelines.
            </li>
          </ul>
          <p>
            The application is designed to be efficient and responsive, with optimized API calls and
            caching strategies to minimize blockchain query costs while providing a seamless user experience.
          </p>
        </SectionContent>
      </Section>
    </Container>
  );
}

export default AboutPage;
