import { useState, useEffect } from 'react';
import Header from './components/header/Header';
import Sidebar from './components/sidebar/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import Classes from './components/classes/Classes';
import Students from './components/students/Student';
import Teachers from './components/teachers/Teachers';
import Exams from './components/exams/Exams';
import Upload from './features/fileUpload/Fileupload';
import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type ActiveComponent = 'dashboard' | 'classes' | 'students' | 'teachers' | 'exams';

interface UploadData {
  streamName: string;
  examId: number;
}

function App() {
  // Create react-query client once
  const queryClient = new QueryClient();

  const [activeComponent, setActiveComponent] = useState<ActiveComponent>('dashboard');
  const [user] = useState({ name: 'Davis Mwai' });
  const [school] = useState('Nairobi School');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentPage, setCurrentPage] = useState<'main' | 'upload'>('main');
  const [uploadData, setUploadData] = useState<UploadData | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

      if (touchStartX < 50 && swipeDistance > 50) setIsSidebarOpen(true);
      if (isSidebarOpen && swipeDistance < -50) setIsSidebarOpen(false);
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, isSidebarOpen]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleUploadClick = (streamName: string, examId: number) => {
    setUploadData({ streamName, examId });
    setCurrentPage('upload');
  };

  const handleBackToExams = () => {
    setCurrentPage('main');
    setUploadData(null);
  };

  const renderComponent = () => {
    if (currentPage === 'upload' && uploadData) {
      return <Upload streamName={uploadData.streamName} examId={uploadData.examId} onBack={handleBackToExams} />;
    }

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
        return <Exams onUploadClick={handleUploadClick} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
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
          {isSidebarOpen && isMobile && (
            <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
          )}
          <main className="main-content">
            {renderComponent()}
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
