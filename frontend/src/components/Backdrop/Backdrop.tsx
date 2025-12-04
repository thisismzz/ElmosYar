import React from 'react';

interface BackdropProps {
  isActive: boolean;
  onClick: () => void;
}

const Backdrop: React.FC<BackdropProps> = ({ isActive, onClick }) => {
  return (
    <div
      className={`sidebar-backdrop ${isActive ? 'sidebar-backdrop-active' : ''}`}
      onClick={onClick}
    />
  );
};

export default Backdrop;
