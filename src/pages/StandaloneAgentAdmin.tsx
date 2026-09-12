import React, { useEffect } from 'react';

export const StandaloneAgentAdmin: React.FC = () => {
  useEffect(() => {
    // Direct top-level navigation to the standalone Mobile App Admin portal
    window.location.href = '/secure-control-x7k9p2/agentadmin/';
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F7F6F2',
      color: '#1B211E',
      fontFamily: 'system-ui, sans-serif',
      zIndex: 999999
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Redirecting to Agent Admin Portal...</p>
      </div>
    </div>
  );
};

export default StandaloneAgentAdmin;
