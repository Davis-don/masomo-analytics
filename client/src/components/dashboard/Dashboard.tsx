// features/Dashboard/Dashboard.tsx
import React from 'react';
import './dashboard.css';

interface User {
  name: string;
}

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-welcome">
        <h1>Welcome, {user.name}!</h1>
        <p>Manage our Masomo platform efficiently with these analytics</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon teachers">👩‍🏫</div>
          <div className="stat-info">
            <h3>Teachers</h3>
            <span className="stat-number">42</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon students">👨‍🎓</div>
          <div className="stat-info">
            <h3>Students</h3>
            <span className="stat-number">1,248</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon classes">🏫</div>
          <div className="stat-info">
            <h3>Classes</h3>
            <span className="stat-number">36</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon streams">📚</div>
          <div className="stat-info">
            <h3>Streams</h3>
            <span className="stat-number">12</span>
          </div>
        </div>
      </div>
      
      <div className="analysis-cards">
        <div className="analysis-card">
          <h3>Form 2 Performance</h3>
          <p>View detailed analysis of Form 2 academic performance</p>
          <button className="analysis-btn">View Analysis</button>
        </div>
        
        <div className="analysis-card">
          <h3>Form 3 Performance</h3>
          <p>View detailed analysis of Form 3 academic performance</p>
          <button className="analysis-btn">View Analysis</button>
        </div>
        
        <div className="analysis-card">
          <h3>Overall Performance</h3>
          <p>View school-wide performance analytics</p>
          <button className="analysis-btn">View Analysis</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;