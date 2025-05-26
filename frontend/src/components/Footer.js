import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: white;
  padding: 30px 0;
  border-top: 1px solid var(--border-color);
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
`;

const Copyright = styled.p`
  margin: 0;
  color: var(--text-secondary);
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 20px;
`;

const FooterLink = styled.a`
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
  
  &:hover {
    color: var(--primary-color);
  }
`;

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <Copyright>
          &copy; {currentYear} WalletPersona. All rights reserved.
        </Copyright>
        <FooterLinks>
          <FooterLink href="https://etherscan.io" target="_blank" rel="noopener noreferrer">
            Etherscan
          </FooterLink>
          <FooterLink href="https://ethereum.org" target="_blank" rel="noopener noreferrer">
            Ethereum
          </FooterLink>
          <FooterLink href="https://github.com" target="_blank" rel="noopener noreferrer">
            GitHub
          </FooterLink>
        </FooterLinks>
      </FooterContent>
    </FooterContainer>
  );
}

export default Footer;
