// features/Classes/Classes.tsx
import React, { useState } from 'react';
import ClassForm from './Classform';
import './classes.css';

interface ClassItem {
  id: number;
  form: string;
  stream: string;
}

interface ClassFormData {
  form: string;
  stream: string;
}

const Classes: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([
    { id: 1, form: 'Form 2', stream: 'East' },
    { id: 2, form: 'Form 3', stream: 'West' },
    { id: 3, form: 'Form 4', stream: 'North' },
    { id: 4, form: 'Form 2', stream: 'South' },
    { id: 5, form: 'Form 3', stream: 'St. Jerome' },
  ]);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    classToDelete: ClassItem | null;
  }>({ show: false, classToDelete: null });

  const [deleteSuccess, setDeleteSuccess] = useState<boolean>(false);

  const handleAddClass = (newClass: ClassFormData) => {
    const id = classes.length > 0 ? Math.max(...classes.map(c => c.id)) + 1 : 1;
    setClasses([...classes, { ...newClass, id }]);
  };

  const handleDeleteClass = (id: number) => {
    setClasses(classes.filter(cls => cls.id !== id));
    setDeleteConfirm({ show: false, classToDelete: null });
    setDeleteSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setDeleteSuccess(false);
    }, 3000);
  };

  const openDeleteConfirm = (cls: ClassItem) => {
    setDeleteConfirm({ show: true, classToDelete: cls });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ show: false, classToDelete: null });
  };

  return (
    <div className="classes-container">
      <h1 className="classes-title">Classes Management</h1>
      <p className="classes-description">Manage and view class information here.</p>
      
      {/* Success Message */}
      {deleteSuccess && (
        <div className="classes-success-message">
          <span className="success-icon">✓</span>
          Class deleted successfully!
        </div>
      )}
      
      <div className="classes-content">
        <div className="classes-form-section">
          <h2 className="classes-section-title">Add New Class</h2>
          <ClassForm onSubmit={handleAddClass} />
        </div>
        
        <div className="classes-table-section">
          <h2 className="classes-section-title">Available Classes</h2>
          <div className="classes-table-container">
            <table className="classes-table">
              <thead className="classes-table-header">
                <tr>
                  <th className="classes-table-th">ID</th>
                  <th className="classes-table-th">Form</th>
                  <th className="classes-table-th">Stream</th>
                  <th className="classes-table-th actions-header">Actions</th>
                </tr>
              </thead>
              <tbody className="classes-table-body">
                {classes.map((cls) => (
                  <tr key={cls.id} className="classes-table-row">
                    <td className="classes-table-td">{cls.id}</td>
                    <td className="classes-table-td">{cls.form}</td>
                    <td className="classes-table-td">{cls.stream}</td>
                    <td className="classes-table-td actions-cell">
                      <button 
                        className="classes-delete-btn"
                        onClick={() => openDeleteConfirm(cls)}
                        aria-label={`Delete ${cls.form} ${cls.stream}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {classes.length === 0 && (
              <div className="classes-empty-state">
                <p>No classes available. Add a new class to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && deleteConfirm.classToDelete && (
        <div className="classes-modal-overlay">
          <div className="classes-modal">
            <div className="classes-modal-header">
              <span className="classes-modal-icon">✕</span>
              <h3>Confirm Deletion</h3>
            </div>
            <div className="classes-modal-body">
              <p>
                Are you sure you want to delete {deleteConfirm.classToDelete.form} -{' '}
                {deleteConfirm.classToDelete.stream}? This action cannot be undone.
              </p>
            </div>
            <div className="classes-modal-footer">
              <button 
                className="classes-modal-cancel"
                onClick={closeDeleteConfirm}
              >
                Cancel
              </button>
              <button 
                className="classes-modal-confirm"
                onClick={() => handleDeleteClass(deleteConfirm.classToDelete!.id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;