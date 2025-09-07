// App.tsx
import  { useState } from 'react';
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
      <Header user={user} school={school} />
      <div className="app-body">
        <Sidebar activeComponent={activeComponent} setActiveComponent={setActiveComponent} />
        <main className="main-content">
          {renderComponent()}
        </main>
      </div>
    </div>
  );
}

export default App;