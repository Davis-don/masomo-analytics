// features/Teachers/Teachers.tsx
import React, { useState } from 'react';
import TeacherForm from './Teachersform';
import TeacherAssignmentForm from './Teachersassignment';
import './teachers.css';

export interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  subjects: string[];
  streams: string[];
}

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: 1, name: 'John Kamau', email: 'john@school.com', phone: '+254712345678', role: 'Class Teacher', subjects: ['Mathematics', 'Physics'], streams: ['Form 2 East', 'Form 3 West'] },
    { id: 2, name: 'Mary Wanjiku', email: 'mary@school.com', phone: '+254712345679', role: 'Dean', subjects: ['English', 'Literature'], streams: ['Form 4 All'] },
    { id: 3, name: 'James Ochieng', email: 'james@school.com', phone: '+254712345680', role: 'Teacher', subjects: ['Chemistry', 'Biology'], streams: ['Form 3 North', 'Form 4 East'] },
    { id: 4, name: 'Grace Achieng', email: 'grace@school.com', phone: '+254712345681', role: 'Deputy Principal', subjects: ['History', 'Geography'], streams: ['All Forms'] },
    { id: 5, name: 'Peter Mwangi', email: 'peter@school.com', phone: '+254712345682', role: 'Principal', subjects: ['Business Studies'], streams: ['School Wide'] },
  ]);

  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleAddTeacher = (teacherData: Omit<Teacher, 'id' | 'subjects' | 'streams'>) => {
    const id = teachers.length > 0 ? Math.max(...teachers.map(t => t.id)) + 1 : 1;
    const newTeacher = { ...teacherData, id, subjects: [], streams: [] };
    setTeachers([...teachers, newTeacher]);
    setSuccessMessage('Teacher added successfully!');
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleAssignSubjects = (teacherId: number, subjects: string[], streams: string[]) => {
    setTeachers(teachers.map(teacher => 
      teacher.id === teacherId 
        ? { ...teacher, subjects, streams }
        : teacher
    ));
    setSuccessMessage('Subjects assigned successfully!');
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleEditTeacher = (updatedTeacher: Teacher) => {
    setTeachers(teachers.map(teacher => 
      teacher.id === updatedTeacher.id ? updatedTeacher : teacher
    ));
    setEditingTeacher(null);
    setSuccessMessage('Teacher updated successfully!');
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleDeleteTeacher = (id: number) => {
    setTeachers(teachers.filter(teacher => teacher.id !== id));
    setSuccessMessage('Teacher removed successfully!');
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const startEditing = (teacher: Teacher) => {
    setEditingTeacher(teacher);
  };

  const cancelEditing = () => {
    setEditingTeacher(null);
  };

  const handleFieldChange = (field: keyof Teacher, value: string | string[]) => {
    if (editingTeacher) {
      setEditingTeacher({ ...editingTeacher, [field]: value });
    }
  };

  return (
    <div className="teachers-container">
      <h1 className="teachers-title">Teachers Management</h1>
      <p className="teachers-description">Manage and view teacher information here.</p>

      {/* Success Message */}
      {showSuccess && (
        <div className="teachers-success-message">
          <span className="teachers-success-icon">✓</span>
          {successMessage}
        </div>
      )}

      <div className="teachers-content">
        <div className="teachers-form-section">
          <h2 className="teachers-section-title">Add New Teacher</h2>
          <TeacherForm onSubmit={handleAddTeacher} />
        </div>

        <div className="teachers-assignment-section">
          <h2 className="teachers-section-title">Assign Subjects & Streams</h2>
          <TeacherAssignmentForm 
            teachers={teachers} 
            onAssign={handleAssignSubjects} 
          />
        </div>

        <div className="teachers-table-section">
          <h2 className="teachers-section-title">All Teachers</h2>
          
          <div className="teachers-table-container">
            <table className="teachers-table">
              <thead className="teachers-table-header">
                <tr>
                  <th className="teachers-table-th">Name</th>
                  <th className="teachers-table-th">Email</th>
                  <th className="teachers-table-th">Phone</th>
                  <th className="teachers-table-th">Role</th>
                  <th className="teachers-table-th">Subjects</th>
                  <th className="teachers-table-th">Streams</th>
                  <th className="teachers-table-th actions-header">Actions</th>
                </tr>
              </thead>
              <tbody className="teachers-table-body">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="teachers-table-row">
                    {editingTeacher?.id === teacher.id ? (
                      <>
                        <td className="teachers-table-td">
                          <input
                            type="text"
                            value={editingTeacher.name}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                            className="teachers-edit-input"
                          />
                        </td>
                        <td className="teachers-table-td">
                          <input
                            type="email"
                            value={editingTeacher.email}
                            onChange={(e) => handleFieldChange('email', e.target.value)}
                            className="teachers-edit-input"
                          />
                        </td>
                        <td className="teachers-table-td">
                          <input
                            type="text"
                            value={editingTeacher.phone}
                            onChange={(e) => handleFieldChange('phone', e.target.value)}
                            className="teachers-edit-input"
                          />
                        </td>
                        <td className="teachers-table-td">
                          <select
                            value={editingTeacher.role}
                            onChange={(e) => handleFieldChange('role', e.target.value)}
                            className="teachers-edit-select"
                          >
                            <option value="Teacher">Teacher</option>
                            <option value="Class Teacher">Class Teacher</option>
                            <option value="Dean">Dean</option>
                            <option value="Deputy Principal">Deputy Principal</option>
                            <option value="Principal">Principal</option>
                          </select>
                        </td>
                        <td className="teachers-table-td">
                          <span className="teachers-subjects-list">
                            {teacher.subjects.join(', ')}
                          </span>
                        </td>
                        <td className="teachers-table-td">
                          <span className="teachers-streams-list">
                            {teacher.streams.join(', ')}
                          </span>
                        </td>
                        <td className="teachers-table-td actions-cell">
                          <button 
                            className="teachers-save-btn"
                            onClick={() => handleEditTeacher(editingTeacher)}
                          >
                            Save
                          </button>
                          <button 
                            className="teachers-cancel-btn"
                            onClick={cancelEditing}
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="teachers-table-td">{teacher.name}</td>
                        <td className="teachers-table-td">{teacher.email}</td>
                        <td className="teachers-table-td">{teacher.phone}</td>
                        <td className="teachers-table-td">{teacher.role}</td>
                        <td className="teachers-table-td">
                          <span className="teachers-subjects-list">
                            {teacher.subjects.join(', ') || 'None assigned'}
                          </span>
                        </td>
                        <td className="teachers-table-td">
                          <span className="teachers-streams-list">
                            {teacher.streams.join(', ') || 'None assigned'}
                          </span>
                        </td>
                        <td className="teachers-table-td actions-cell">
                          <button 
                            className="teachers-edit-btn"
                            onClick={() => startEditing(teacher)}
                          >
                            Edit
                          </button>
                          <button 
                            className="teachers-delete-btn"
                            onClick={() => handleDeleteTeacher(teacher.id)}
                          >
                            Remove
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {teachers.length === 0 && (
              <div className="teachers-empty-state">
                <p>No teachers available. Add a new teacher to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teachers;