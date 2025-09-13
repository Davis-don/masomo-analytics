import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/header/Header';
import Sidebar from './components/sidebar/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import Classes from './components/classes/Classes';
import Students from './components/students/Student';
import Teachers from './components/teachers/Teachers';
import Exams from './components/exams/Exams';
import Subjects from './components/Subjects/Subject';
import Upload from './features/fileUpload/Fileupload';
import Confirmpublish from './components/Examresults/Confirmpublish';
import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ✅ Define ActiveComponent type inline
type ActiveComponent =
  | 'dashboard'
  | 'classes'
  | 'students'
  | 'teachers'
  | 'exams'
  | 'subjects';

interface UploadData {
  className: string;
  classId: string;
  examId: string;
  subjectId: string;
  subjectName: string;
  streamName: string;
}

// Main App Content Component
function AppContent() {
  const [activeComponent, setActiveComponent] = useState<ActiveComponent>('dashboard');
  const [user] = useState({ name: 'Davis Mwai' });
  const [school] = useState('Nairobi School');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [uploadData, setUploadData] = useState<UploadData | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Handle window resize for sidebar responsiveness
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle swipe gestures for mobile sidebar
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

  // Update activeComponent based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveComponent('dashboard');
    else if (path === '/classes') setActiveComponent('classes');
    else if (path === '/students') setActiveComponent('students');
    else if (path === '/teachers') setActiveComponent('teachers');
    else if (path === '/exams') setActiveComponent('exams');
    else if (path === '/subjects') setActiveComponent('subjects');
  }, [location]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleUploadClick = (
    className: string,
    classId: string,
    examId: string,
    subjectId: string,
    subjectName: string,
    streamName: string
  ) => {
    setUploadData({ className, classId, examId, subjectId, subjectName, streamName });
    navigate('/upload');
  };

  const handleBackToExams = () => {
    navigate('/exams');
    setUploadData(null);
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
          setActiveComponent={(component) => {
            setActiveComponent(component);
            navigate(`/${component === 'dashboard' ? '' : component}`);
          }}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        {isSidebarOpen && isMobile && (
          <div
            className="sidebar-overlay"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/students" element={<Students />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route 
              path="/exams" 
              element={<Exams onUploadClick={handleUploadClick} />} 
            />
            <Route path="/subjects" element={<Subjects />} />
            <Route 
              path="/upload" 
              element={
                uploadData ? (
                  <Upload
                    className={uploadData.className}
                    streamName={uploadData.streamName}
                    classId={uploadData.classId}
                    examId={uploadData.examId}
                    subjectId={uploadData.subjectId}
                    subjectName={uploadData.subjectName}
                    onBack={handleBackToExams}
                  />
                ) : (
                  <div>No upload data available. Please go back to exams.</div>
                )
              } 
            />
            {/* Updated confirmpublish route */}
            <Route 
              path="/confirmpublish" 
              element={<ConfirmpublishWrapper onBack={handleBackToExams} />}
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Wrapper to pass location.state to Confirmpublish
function ConfirmpublishWrapper({ onBack }: { onBack: () => void }) {
  const location = useLocation();
  const data = location.state as UploadData | undefined;

  if (!data) return <div>No publish data available. Please go back to exams.</div>;

  return (
    <Confirmpublish
      className={data.className}
      streamName={data.streamName}
      classId={data.classId}
      examId={data.examId}
      subjectId={data.subjectId}
      subjectName={data.subjectName}
      onBack={onBack}
    />
  );
}

// Main App Component
function App() {
  const queryClient = new QueryClient();

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
