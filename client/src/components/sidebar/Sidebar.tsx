// components/Sidebar/Sidebar.tsx
import React from 'react';
import './sidebar.css';

type ActiveComponent = 'dashboard' | 'classes' | 'students' | 'teachers' | 'exams';

interface SidebarProps {
  activeComponent: ActiveComponent;
  setActiveComponent: (component: ActiveComponent) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeComponent, setActiveComponent }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'classes', label: 'Classes', icon: '🏫' },
    { id: 'students', label: 'Students', icon: '👨‍🎓' },
    { id: 'teachers', label: 'Teachers', icon: '👩‍🏫' },
    { id: 'exams', label: 'Exams', icon: '📝' },
  ] as const;

  return (
    <aside className="masomo-sidebar">
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link ${activeComponent === item.id ? 'active' : ''}`}
                onClick={() => setActiveComponent(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;