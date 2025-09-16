import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import Header from '../../components/header/Header';
import Sidebar from '../../components/sidebar/Sidebar';
import Dashboard from '../../components/dashboard/Dashboard';
import Classes from '../../components/classes/Classes';
import Students from '../../components/students/Student';
import Teachers from '../../components/teachers/Teachers';
import Exams from '../../components/exams/Exams';
import Subjects from '../../components/Subjects/Subject';
import Schools from '../../components/Schools/Schools';
import Upload from '../fileUpload/Fileupload';
import ConfirmPublish from '../../components/Examresults/Confirmpublish';

type ActiveComponent =
  | 'dashboard'
  | 'classes'
  | 'students'
  | 'teachers'
  | 'exams'
  | 'subjects'
  | 'schools';

interface UploadData {
  className: string;
  classId: string;
  examId: string;
  subjectId: string;
  subjectName: string;
  streamName: string;
}

function AgentCockpit() {
  const [activeComponent, setActiveComponent] = useState<ActiveComponent>('dashboard');
  const [user] = useState({ name: 'Davis Mwai' });
  const [school] = useState('Nairobi School');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [uploadData, setUploadData] = useState<UploadData | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Handle window resize for responsive sidebar
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

  // ✅ Handle swipe gestures for mobile sidebar
  useEffect(() => {
    let touchStartX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isMobile) return;

      const touchEndX = e.changedTouches[0].screenX;
      const swipeDistance = touchEndX - touchStartX;

      if (touchStartX < 50 && swipeDistance > 50) setIsSidebarOpen(true); // swipe right
      if (isSidebarOpen && swipeDistance < -50) setIsSidebarOpen(false);  // swipe left
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, isSidebarOpen]);

  // ✅ Update activeComponent based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.endsWith('/agent/cockpit') || path.endsWith('/agent/cockpit/')) {
      setActiveComponent('dashboard');
    } else if (path.includes('/classes')) setActiveComponent('classes');
    else if (path.includes('/students')) setActiveComponent('students');
    else if (path.includes('/teachers')) setActiveComponent('teachers');
    else if (path.includes('/exams')) setActiveComponent('exams');
    else if (path.includes('/subjects')) setActiveComponent('subjects');
    else if (path.includes('/schools')) setActiveComponent('schools');
  }, [location]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // ✅ Handle upload navigation
  const handleUploadClick = (
    className: string,
    classId: string,
    examId: string,
    subjectId: string,
    subjectName: string,
    streamName: string
  ) => {
    setUploadData({ className, classId, examId, subjectId, subjectName, streamName });
    navigate('/agent/cockpit/upload');
  };

  const handleBackToExams = () => {
    navigate('/agent/cockpit/exams');
    setUploadData(null);
  };

  // ✅ Navigation handler for sidebar items
  const handleNavigation = (component: ActiveComponent) => {
    setActiveComponent(component);
    if (component === 'dashboard') {
      navigate('/agent/cockpit');
    } else {
      navigate(`/agent/cockpit/${component}`);
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
          setActiveComponent={handleNavigation}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {isSidebarOpen && isMobile && (
          <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
        )}

        <main className="main-content">
          <Routes>
            <Route index element={<Dashboard user={user} />} />
            <Route path="classes" element={<Classes />} />
            <Route path="students" element={<Students />} />
            <Route path="teachers" element={<Teachers />} />
            <Route
              path="exams"
              element={<Exams onUploadClick={handleUploadClick} />}
            />
            <Route path="subjects" element={<Subjects />} />
            <Route path="schools" element={<Schools />} />

            <Route
              path="upload"
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

            <Route
              path="confirmpublish"
              element={<ConfirmpublishWrapper onBack={handleBackToExams} />}
            />
            
            {/* Catch-all route for nested pages */}
            <Route path="*" element={<div>Page not found within cockpit</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// ✅ Wrapper to pass location.state to Confirmpublish
function ConfirmpublishWrapper({ onBack }: { onBack: () => void }) {
  const location = useLocation();
  const data = location.state as UploadData | undefined;

  if (!data) {
    return <div>No publish data available. Please go back to exams.</div>;
  }

  return (
    <ConfirmPublish
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

export default AgentCockpit;