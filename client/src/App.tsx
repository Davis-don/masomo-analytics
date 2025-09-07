// App.tsx
import { useState, useEffect } from 'react';
import Header from './components/header/Header';
import Sidebar from './components/sidebar/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import Classes from './components/classes/Classes';
import Students from './components/students/Student';
import Teachers from './components/teachers/Teachers';
import Exams from './components/exams/Exams';
import './App.css';

type ActiveComponent = 'dashboard' | 'classes' | 'students' | 'teachers' | 'exams';

function App() {
  const [activeComponent, setActiveComponent] = useState<ActiveComponent>('dashboard');
  const [user] = useState({ name: 'Davis Mwai' });
  const [school] = useState('Nairobi School');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-close sidebar on resize to mobile
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Set initial state based on screen size
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle swipe to open/close sidebar on mobile
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (!isMobile) return;
      
      touchEndX = e.changedTouches[0].screenX;
      const swipeDistance = touchEndX - touchStartX;
      
      // Swipe right to open sidebar (from left edge)
      if (touchStartX < 50 && swipeDistance > 50) {
        setIsSidebarOpen(true);
      }
      
      // Swipe left to close sidebar
      if (isSidebarOpen && swipeDistance < -50) {
        setIsSidebarOpen(false);
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderComponent = () => {
    switch (activeComponent) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'classes':
        return <Classes />;
      case 'students':
        return <Students />;
      case 'teachers':
        return <Teachers />;
      case 'exams':
        return <Exams />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="app">
      <Header 
        user={user} 
        school={school} 
        onMenuClick={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
      <div className="app-body">
        <Sidebar 
          activeComponent={activeComponent} 
          setActiveComponent={setActiveComponent}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && isMobile && (
          <div 
            className="sidebar-overlay"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <main className="main-content">
          {renderComponent()}
        </main>
      </div>
    </div>
  );
}

export default App;