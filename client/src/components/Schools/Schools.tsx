// components/schools/Schools.tsx
import React, { useState } from 'react';
import SchoolForm from './Schoolform';
import RenderSchools from '../Renderschools/Renderschools';
import './schools.css';

const Schools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');

  return (
    <div className="schools-container">
      <div className="schools-header">
        <h1>Schools Management</h1>
        <p>Manage all schools in the system</p>
      </div>

      {/* Tab Navigation */}
      <div className="schools-tabs">
        <button
          className={`tab-button ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          <span className="tab-icon">➕</span>
          Add New School
        </button>
        <button
          className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          <span className="tab-icon">📋</span>
          View All Schools
        </button>
      </div>

      {/* Tab Content */}
      <div className="schools-content">
        {activeTab === 'form' ? (
          <div className="form-section">
            <div className="section-header">
              <h2>Register New School</h2>
              <p>Fill in the details to add a new school to the system</p>
            </div>
            <SchoolForm />
          </div>
        ) : (
          <div className="list-section">
            <div className="section-header">
              <h2>All Registered Schools</h2>
              <p>View and manage all schools in the system</p>
            </div>
            <RenderSchools />
          </div>
        )}
      </div>
    </div>
  );
};

export default Schools;