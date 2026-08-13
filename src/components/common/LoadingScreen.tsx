import React from 'react';
import { Logo } from './Logo';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="nexopp-loading-screen">
      <div className="nexopp-loading-logo">
        <Logo size="xl" />
      </div>
      <div className="nexopp-loading-text">
        <span>{message}</span>
        <span className="nexopp-loading-dot">.</span>
        <span className="nexopp-loading-dot">.</span>
        <span className="nexopp-loading-dot">.</span>
      </div>
    </div>
  );
};

export default LoadingScreen;
