import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import axios from 'axios';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  SubTitle,
  Filler,
  RadialLinearScale
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { FaEthereum, FaExternalLinkAlt, FaInfoCircle, FaChartPie, FaDollarSign, FaRobot, FaWallet, FaExchangeAlt, FaHistory } from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  SubTitle,
  Filler,
  RadialLinearScale
);

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
`;

const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--primary-color);
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 40px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  margin-bottom: 20px;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const ProfileAvatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-right: 30px;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 40px;
  
  @media (max-width: 768px) {
    margin-right: 0;
    margin-bottom: 20px;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const AddressLink = styled.a`
  display: inline-flex;
  align-items: center;
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 10px;
  text-decoration: none;
  
  &:hover {
    color: var(--primary-color);
    text-decoration: underline;
  }
  
  svg {
    margin-left: 5px;
  }
`;

const ProfileType = styled.span`
  display: inline-block;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-right: 10px;
  background-color: ${props => {
    switch(props.type) {
      case 'Investor': return '#a29bfe';
      case 'NFT Collector': return '#74b9ff';
      case 'DAO Member': return '#55efc4';
      case 'Degen Trader': return '#ff7675';
      default: return '#b2bec3';
    }
  }};
  color: white;
`;

const Confidence = styled.span`
  font-size: 14px;
  color: var(--text-secondary);
`;

const BioSection = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  position: relative;
`;

const BioHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
  }
`;

const BioIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 20px;
`;

const BioText = styled.p`
  line-height: 1.6;
  color: var(--text-color);
  font-size: 16px;
  margin: 0;
`;

const AIBadge = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: help;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
  
  svg {
    font-size: 18px;
  }
`;

const ScoreSection = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ScoreCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const ScoreCircle = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 10px solid ${props => {
    const value = props.value || 0;
    if (value > 75) return '#ff7675';
    if (value > 50) return '#fdcb6e';
    if (value > 25) return '#74b9ff';
    return '#55efc4';
  }};
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: var(--text-color);
`;

const ScoreTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 18px;
  color: var(--text-color);
`;

const ScoreDescription = styled.p`
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
`;

const ChartSection = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ChartCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    font-size: 18px;
  }
`;

const ChartIcon = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 16px;
`;

const RecommendationsSection = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
`;

const RecommendationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
`;

const RecommendationCard = styled.div`
  background-color: #f7f9fc;
  border-radius: 8px;
  padding: 15px;
`;

const RecommendationTitle = styled.h4`
  margin: 0 0 10px 0;
  font-size: 16px;
  color: var(--primary-color);
`;

const RecommendationList = styled.ul`
  margin: 0;
  padding: 0 0 0 20px;
  
  li {
    margin-bottom: 5px;
  }
`;

// New components for token holdings and transactions
const WalletDetailsSection = styled.div`
  margin-bottom: 30px;
`;

const DetailsSectionTitle = styled.h3`
  font-size: 1.4rem;
  margin-bottom: 15px;
  color: var(--text-color);
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 10px;
    color: var(--primary-color);
  }
`;

const TokensTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  
  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    background-color: #f7f9fc;
    font-weight: 600;
    color: var(--text-secondary);
  }
  
  tbody tr:hover {
    background-color: #f7f9fc;
  }
  
  td:last-child {
    text-align: right;
  }
`;

const EthBalanceCard = styled.div`
  background-color: #f7f9fc;
  border-left: 4px solid var(--primary-color);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  
  svg {
    color: var(--primary-color);
    font-size: 24px;
    margin-right: 15px;
  }
`;

const BalanceInfo = styled.div`
  flex: 1;
`;

const BalanceAmount = styled.div`
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 5px;
`;

const BalanceLabel = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const TransactionTable = styled(TokensTable)`
  font-size: 0.9rem;
  
  td {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  a {
    color: var(--primary-color);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const BackButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 30px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #2952c8;
    transform: translateY(-2px);
  }
`;

// Mock API response for development
const mockApiResponse = {
  address: '0x1234567890abcdef1234567890abcdef12345678',
  wallet_type: 'Investor',
  confidence: 85.5,
  persona_bio: "I'm a long-term DeFi believer focused on sustainable yields and strategic token acquisitions. My portfolio is carefully balanced across major ecosystems, with particular interest in governance tokens that offer both utility and appreciation potential. Currently holding ETH, AAVE, CRV among other assets. Active in Uniswap, Curve protocols. Participated in governance for Aave, Compound.",
  is_ai_generated: true,
  risk_score: 35.8,
  health_score: 72.3,
  recommendations: {
    dapps: ['DeBank', 'Zapper.fi', 'Zerion'],
    nfts: ['Art Blocks', 'PROOF Collective'],
    defi: ['Aave', 'Compound', 'Yearn Finance'],
    daos: ['MakerDAO', 'Aave Governance']
  },
  visualization_data: {
    portfolio: [
      { symbol: 'ETH', value: 5.2, name: 'Ethereum', type: 'ERC20' },
      { symbol: 'USDC', value: 10000, name: 'USD Coin', type: 'ERC20' },
      { symbol: 'AAVE', value: 50, name: 'Aave', type: 'ERC20' },
      { symbol: 'CRV', value: 1000, name: 'Curve DAO Token', type: 'ERC20' },
      { symbol: 'BAYC', value: 1, name: 'Bored Ape Yacht Club', type: 'NFT' }
    ],
    defi_interactions: [
      { protocol: 'Uniswap', interactions: 35 },
      { protocol: 'Aave', interactions: 22 },
      { protocol: 'Curve', interactions: 18 },
      { protocol: '1inch', interactions: 12 },
      { protocol: 'Compound', interactions: 8 }
    ],
    dao_participation: [
      { dao: 'Aave', votes: 15 },
      { dao: 'Compound', votes: 12 },
      { dao: 'Uniswap', votes: 7 }
    ]
  }
};

function PersonaPage() {
  const { address } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Make an actual API call to the backend
        const response = await axios.post('http://localhost:8000/api/analyze', { address });
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching wallet data:', err);
        setError('Failed to fetch wallet data. Please try again.');
        setLoading(false);
        toast.error('Error analyzing wallet address');
        
        // If API call fails in development, fallback to mock data
        if (process.env.NODE_ENV === 'development') {
          console.log('Using mock data as fallback in development mode');
          setData(mockApiResponse);
          setLoading(false);
        }
      }
    };
    
    fetchData();
  }, [address]);
  
  // Prepare chart data
  const preparePortfolioChart = () => {
    if (!data || !data.visualization_data || !data.visualization_data.portfolio) {
      return null;
    }
    
    const portfolio = data.visualization_data.portfolio;
    
    // Only use ERC20 tokens (exclude NFTs) and filter out invalid data
    const validPortfolio = portfolio.filter(item => {
      // Only include ERC20 tokens with valid symbols and non-zero values
      return item.type === 'ERC20' && 
             item.symbol && 
             item.symbol !== 'Unknown' && 
             item.value && 
             item.value > 0.00001;
    });
    
    // If no valid portfolio items remain after filtering, return null
    if (validPortfolio.length === 0) {
      // Check if we should add a placeholder token
      return null;
    }
    
    // Sort tokens by value (descending) to prioritize major holdings
    validPortfolio.sort((a, b) => b.value - a.value);
    
    // Take only top 10 tokens for better visualization
    const topTokens = validPortfolio.slice(0, 10);
    
    // Generate a sufficient number of distinct colors
    const generateColors = (count) => {
      const baseColors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
        '#FF9F40', '#8AFF40', '#41B883', '#E46651', '#00D8FF',
        '#DD1B16', '#7957D5', '#7367F0', '#10002B', '#A442A0'
      ];
      
      // If we need more colors than in our base set, generate them
      if (count > baseColors.length) {
        const additionalColors = [];
        for (let i = 0; i < count - baseColors.length; i++) {
          const hue = (i * 137.5) % 360; // Use golden ratio for good distribution
          additionalColors.push(`hsl(${hue}, 70%, 60%)`);
        }
        return [...baseColors, ...additionalColors];
      }
      
      return baseColors.slice(0, count);
    };
    
    // For debug purposes, log the actual data being used for the chart
    console.log('Portfolio Chart Data:', topTokens);
    
    return {
      labels: topTokens.map(item => item.symbol),
      datasets: [
        {
          data: topTokens.map(item => item.value),
          backgroundColor: generateColors(topTokens.length),
          borderWidth: 1
        }
      ]
    };
  };

  const prepareDefiChart = () => {
    if (!data || !data.visualization_data || !data.visualization_data.defi_interactions) {
      return null;
    }
    
    const defiData = data.visualization_data.defi_interactions;
    
    // Validate defi data - filter out empty or zero-interaction protocols
    const validDefiData = defiData.filter(item => {
      return item.protocol && 
             item.protocol !== 'Unknown' && 
             item.interactions && 
             item.interactions > 0;
    });
    
    // If we have no valid data, return null
    if (validDefiData.length === 0) {
      return null;
    }
    
    // Sort by number of interactions, descending
    validDefiData.sort((a, b) => b.interactions - a.interactions);
    
    // Take only top 8 protocols for better visualization
    const topProtocols = validDefiData.slice(0, 8);
    
    // Generate distinct colors for each protocol
    const generateColors = (count) => {
      // Create an array of distinct colors with consistent brightness
      const colors = [];
      for (let i = 0; i < count; i++) {
        const hue = (i * 137.5) % 360; // Use golden ratio for good distribution
        colors.push(`hsl(${hue}, 75%, 55%)`);
      }
      return colors;
    };
    
    const colors = generateColors(topProtocols.length);
    
    return {
      labels: topProtocols.map(item => item.protocol),
      datasets: [
        {
          label: 'Interactions',
          data: topProtocols.map(item => item.interactions),
          backgroundColor: colors,
          borderRadius: 5,
          maxBarThickness: 50
        }
      ]
    };
  };
  
  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <Spinner />
          <p>Analyzing wallet {address}...</p>
        </LoadingContainer>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorMessage>{error}</ErrorMessage>
          <BackButton to="/">← Try Another Wallet</BackButton>
        </ErrorContainer>
      </Container>
    );
  }
  
  return (
    <Container>
      <BackButton to="/">← Back to Home</BackButton>
      
      <ProfileHeader>
        <ProfileAvatar>
          <FaEthereum />
        </ProfileAvatar>
        <ProfileInfo>
          <AddressLink 
            href={`https://etherscan.io/address/${address}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {address} <FaExternalLinkAlt size={12} />
          </AddressLink>
          <h1>Wallet Persona</h1>
          <div>
            <ProfileType type={data.wallet_type}>{data.wallet_type}</ProfileType>
            <Confidence>{data.confidence}% confidence</Confidence>
          </div>
        </ProfileInfo>
      </ProfileHeader>
      
      <BioSection>
        <BioHeader>
          <BioIcon>
            <FaInfoCircle />
          </BioIcon>
          <h2>Wallet Bio</h2>
        </BioHeader>
        <BioText>{data.persona_bio}</BioText>
        {data.is_ai_generated && (
          <AIBadge title="This bio was generated using AI">
            <FaRobot />
          </AIBadge>
        )}
      </BioSection>
      
      <ScoreSection>
        <ScoreCard>
          <ScoreCircle value={data.risk_score}>
            {Math.round(data.risk_score)}
          </ScoreCircle>
          <ScoreTitle>Risk Score</ScoreTitle>
          <ScoreDescription>
            Measures exposure to risky assets and interactions with unverified contracts.
            Lower is better for risk-averse strategies.
          </ScoreDescription>
        </ScoreCard>
        
        <ScoreCard>
          <ScoreCircle value={data.health_score}>
            {Math.round(data.health_score)}
          </ScoreCircle>
          <ScoreTitle>Health Score</ScoreTitle>
          <ScoreDescription>
            Evaluates portfolio diversity, consistency of activity, and long-term holdings.
            Higher scores indicate healthier wallet behavior.
          </ScoreDescription>
        </ScoreCard>
      </ScoreSection>
      <ChartSection>
        <ChartCard>
          <ChartHeader>
            <ChartIcon>
              <FaChartPie />
            </ChartIcon>
            <h3>Portfolio Composition</h3>
          </ChartHeader>
          {(() => {
            const chartData = preparePortfolioChart();
            return chartData ? (
              <div style={{ height: '250px' }}>
                <Pie 
                  data={chartData} 
                  options={{
                    plugins: {
                      legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                          boxWidth: 12,
                          padding: 10,
                          font: {
                            size: 10
                          }
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            return `${label}: ${value.toFixed(4)}`;
                          }
                        }
                      }
                    },
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </div>
            ) : (
              <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#888', fontStyle: 'italic' }}>No token holdings found for this wallet</p>
              </div>
            );
          })()}
        </ChartCard>
        
        <ChartCard>
          <ChartHeader>
            <ChartIcon>
              <FaDollarSign />
            </ChartIcon>
            <h3>DeFi Protocol Interactions</h3>
          </ChartHeader>
          {(() => {
            const chartData = prepareDefiChart();
            return chartData ? (
              <div style={{ height: '250px' }}>
                <Bar 
                  data={chartData} 
                  options={{
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${value} interactions`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0 // Only show whole numbers
                        }
                      }
                    },
                    maintainAspectRatio: false
                  }}
                />
              </div>
            ) : (
              <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#888', fontStyle: 'italic' }}>No DeFi interaction data available</p>
              </div>
            );
          })()}
        </ChartCard>
      </ChartSection>
      
      {/* Wallet Details Section - For displaying token holdings and transactions */}
      <WalletDetailsSection>
        {/* ETH Balance Card */}
        <EthBalanceCard>
          <FaEthereum />
          <BalanceInfo>
            <BalanceAmount>{data.eth_balance ? `${parseFloat(data.eth_balance).toFixed(4)} ETH` : 'Loading...'}</BalanceAmount>
            <BalanceLabel>Current ETH Balance</BalanceLabel>
          </BalanceInfo>
        </EthBalanceCard>
        
        {/* Token Holdings Table */}
        <DetailsSectionTitle>
          <FaWallet />
          Token Holdings
        </DetailsSectionTitle>
        
        {data.visualization_data && data.visualization_data.portfolio && data.visualization_data.portfolio.length > 0 ? (
          <TokensTable>
            <thead>
              <tr>
                <th>Token</th>
                <th>Name</th>
                <th>Type</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {data.visualization_data.portfolio
                .filter(token => token.value > 0)
                .map((token, index) => (
                  <tr key={index}>
                    <td>{token.symbol}</td>
                    <td>{token.name}</td>
                    <td>{token.type}</td>
                    <td>{parseFloat(token.value).toFixed(token.type === 'NFT' ? 0 : 4)}</td>
                  </tr>
                ))}
            </tbody>
          </TokensTable>
        ) : (
          <p>No token holdings found for this wallet.</p>
        )}
        
        {/* Recent Transactions Table */}
        <DetailsSectionTitle>
          <FaHistory />
          Recent Transactions
        </DetailsSectionTitle>
        
        {data.recent_transactions && data.recent_transactions.length > 0 ? (
          <TransactionTable>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Value</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_transactions.map((tx, index) => (
                <tr key={index}>
                  <td>{tx.timestamp}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <FaExchangeAlt style={{ marginRight: '5px', fontSize: '12px' }} />
                      {tx.method || 'Transfer'}
                    </div>
                  </td>
                  <td>{parseFloat(tx.value).toFixed(4)} ETH</td>
                  <td>
                    <a 
                      href={`https://etherscan.io/tx/${tx.hash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View on Etherscan <FaExternalLinkAlt size={10} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </TransactionTable>
        ) : (
          <p>No recent transactions found for this wallet.</p>
        )}
      </WalletDetailsSection>
      
      <RecommendationsSection>
        <ChartHeader>
          <ChartIcon>
            <FaInfoCircle />
          </ChartIcon>
          <h3>Personalized Recommendations</h3>
        </ChartHeader>
        
        <RecommendationsGrid>
          {Object.entries(data.recommendations).map(([category, items]) => (
            <RecommendationCard key={category}>
              <RecommendationTitle>
                {category === 'dapps' ? 'DApps' : 
                 category === 'nfts' ? 'NFT Collections' : 
                 category === 'defi' ? 'DeFi Protocols' : 'DAOs'}
              </RecommendationTitle>
              <RecommendationList>
                {items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </RecommendationList>
            </RecommendationCard>
          ))}
        </RecommendationsGrid>
      </RecommendationsSection>
    </Container>
  );
}

export default PersonaPage;
