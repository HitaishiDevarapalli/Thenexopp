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
        backgroundColor: 'rgba(2, 20, 14, 0.75)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
      onClick={closeLoginModal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
        }}
      >
        <LoginPage onClose={closeLoginModal} isModal={true} />
      </div>
    </div>
  );
};
