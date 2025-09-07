// components/header/Header.tsx
import React from 'react';
import './header.css';

interface User {
  name: string;
}

interface HeaderProps {
  user: User;
  school: string;
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, school, onMenuClick, isSidebarOpen }) => {
  return (
    <header className="masomo-header">
      <div className="header-left">
        <button 
          className="menu-toggle"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <span className={isSidebarOpen ? "hamburger open" : "hamburger"}></span>
        </button>
        <div className="logo">
          <span className="logo-icon">M</span>
          <span className="logo-text">Masomo Analytics</span>
        </div>
      </div>
      <div className="header-center">
        <h2 className="school-name">{school}</h2>
      </div>
      <div className="header-right">
        <div className="user-info">
          <span className="user-name">{user.name}</span>
          <div className="user-avatar">
            {user.name.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;