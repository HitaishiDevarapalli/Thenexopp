import React, { useEffect } from 'react';

export const StandaloneAgentAdmin: React.FC = () => {
  useEffect(() => {
    document.title = 'Executive Admin Portal | TheNexopp Agent';
  }, []);

  const adminSrc = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3001'
    : '/agent-admin/index.html';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      zIndex: 999999,
      overflow: 'hidden',
      backgroundColor: '#F7F6F2'
    }}>
      <iframe
        src={adminSrc}
        title="TheNexopp Agent Production Management Console"
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
      />
    </div>
  );
};

export default StandaloneAgentAdmin;
