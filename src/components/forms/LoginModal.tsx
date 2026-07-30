import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoginPage } from '../../pages/LoginPage';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal } = useAuth();

  if (!isLoginModalOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999999,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
        maxHeight: '100vh'
      }}
      onClick={closeLoginModal}
    >
      <div 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          width: '100%', 
          maxWidth: '1040px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '24px'
        }}
      >
        <LoginPage onClose={closeLoginModal} isModal={true} />
      </div>
    </div>
  );
};
