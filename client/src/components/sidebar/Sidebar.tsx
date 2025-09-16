// components/sidebar/Sidebar.tsx
import React from 'react';
import './sidebar.css';

type ActiveComponent = 'dashboard' | 'classes' | 'students' | 'teachers' | 'exams' | 'subjects' | 'schools';

interface SidebarProps {
  activeComponent: ActiveComponent;
  setActiveComponent: (component: ActiveComponent) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeComponent, 
  setActiveComponent, 
  isOpen,
  onClose
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'classes', label: 'Classes', icon: '🏫' },
    { id: 'students', label: 'Students', icon: '👨‍🎓' },
    { id: 'teachers', label: 'Teachers', icon: '👩‍🏫' },
    { id: 'exams', label: 'Exams', icon: '📝' },
    { id: 'subjects', label: 'Subjects', icon: '📚' },
    { id: 'schools', label: 'Schools', icon: '🏢' },
  ] as const;

  const handleItemClick = (itemId: ActiveComponent) => {
    setActiveComponent(itemId);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      <aside className={`masomo-sidebar ${isOpen ? 'open' : ''}`}>
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item) => (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-link ${activeComponent === item.id ? 'active' : ''}`}
                  onClick={() => handleItemClick(item.id as ActiveComponent)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;