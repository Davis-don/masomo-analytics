// features/Students/Students.tsx
import React, { useState } from 'react';
import StudentForm from './Studentsform';
import './students.css';

interface Student {
  id: number;
  name: string;
  admissionNumber: string;
  kcseMarks: string;
  form: string;
  stream: string;
}

interface ClassStream {
  form: string;
  stream: string;
}

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: 'John Kamau', admissionNumber: 'ST001', kcseMarks: '350', form: 'Form 2', stream: 'East' },
    { id: 2, name: 'Mary Wanjiku', admissionNumber: 'ST002', kcseMarks: '380', form: 'Form 2', stream: 'West' },
    { id: 3, name: 'James Ochieng', admissionNumber: 'ST003', kcseMarks: '320', form: 'Form 2', stream: 'North' },
    { id: 4, name: 'Grace Achieng', admissionNumber: 'ST004', kcseMarks: '400', form: 'Form 2', stream: 'South' },
    { id: 5, name: 'Peter Mwangi', admissionNumber: 'ST005', kcseMarks: '370', form: 'Form 3', stream: 'East' },
    { id: 6, name: 'Sarah Njeri', admissionNumber: 'ST006', kcseMarks: '390', form: 'Form 3', stream: 'West' },
    { id: 7, name: 'David Otieno', admissionNumber: 'ST007', kcseMarks: '340', form: 'Form 3', stream: 'North' },
    { id: 8, name: 'Esther Wambui', admissionNumber: 'ST008', kcseMarks: '410', form: 'Form 3', stream: 'St. Jerome' },
    { id: 9, name: 'Michael Njoroge', admissionNumber: 'ST009', kcseMarks: '360', form: 'Form 4', stream: 'East' },
    { id: 10, name: 'Lilian Atieno', admissionNumber: 'ST010', kcseMarks: '380', form: 'Form 4', stream: 'West' },
  ]);

  const [selectedClassStream, setSelectedClassStream] = useState<ClassStream>({
    form: 'Form 2',
    stream: 'All'
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    studentToDelete: Student | null;
  }>({ show: false, studentToDelete: null });

  const handleAddStudent = (studentData: Omit<Student, 'id' | 'form' | 'stream'>) => {
    const id = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    const newStudent = { ...studentData, id, form: selectedClassStream.form, stream: selectedClassStream.stream === 'All' ? 'East' : selectedClassStream.stream };
    setStudents([...students, newStudent]);
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleDeleteStudent = (id: number) => {
    setStudents(students.filter(student => student.id !== id));
    setDeleteConfirm({ show: false, studentToDelete: null });
  };

  const openDeleteConfirm = (student: Student) => {
    setDeleteConfirm({ show: true, studentToDelete: student });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirm({ show: false, studentToDelete: null });
  };

  const filteredStudents = students.filter(student => {
    const formMatch = student.form === selectedClassStream.form;
    const streamMatch = selectedClassStream.stream === 'All' || student.stream === selectedClassStream.stream;
    return formMatch && streamMatch;
  });

  const classStreamOptions: ClassStream[] = [
    { form: 'Form 2', stream: 'All' },
    { form: 'Form 2', stream: 'East' },
    { form: 'Form 2', stream: 'West' },
    { form: 'Form 2', stream: 'North' },
    { form: 'Form 2', stream: 'South' },
    { form: 'Form 3', stream: 'All' },
    { form: 'Form 3', stream: 'East' },
    { form: 'Form 3', stream: 'West' },
    { form: 'Form 3', stream: 'North' },
    { form: 'Form 3', stream: 'St. Jerome' },
    { form: 'Form 4', stream: 'All' },
    { form: 'Form 4', stream: 'East' },
    { form: 'Form 4', stream: 'West' },
    { form: 'Form 4', stream: 'North' },
  ];

  const getAvailableStreams = (form: string) => {
    return classStreamOptions
      .filter(option => option.form === form)
      .map(option => option.stream);
  };

  const getTableTitle = () => {
    if (selectedClassStream.stream === 'All') {
      return `All Students in ${selectedClassStream.form}`;
    }
    return `Students in ${selectedClassStream.form} - ${selectedClassStream.stream}`;
  };

  return (
    <div className="students-container">
      <h1 className="students-title">Students Management</h1>
      <p className="students-description">Manage and view student information here.</p>

      {/* Success Message */}
      {showSuccess && (
        <div className="students-success-message">
          <span className="students-success-icon">✓</span>
          Student added successfully!
        </div>
      )}

      <div className="students-content">
        <div className="students-form-section">
          <h2 className="students-section-title">Add New Student</h2>
          <StudentForm onSubmit={handleAddStudent} />
          
          <div className="students-class-selection">
            <h3 className="students-subsection-title">Assign to Class & Stream</h3>
            <div className="students-class-form">
              <div className="students-form-group">
                <label htmlFor="form-select" className="students-form-label">Form:</label>
                <select
                  id="form-select"
                  value={selectedClassStream.form}
                  onChange={(e) => setSelectedClassStream({ form: e.target.value, stream: 'All' })}
                  className="students-form-select"
                >
                  <option value="Form 2">Form 2</option>
                  <option value="Form 3">Form 3</option>
                  <option value="Form 4">Form 4</option>
                </select>
              </div>

              <div className="students-form-group">
                <label htmlFor="stream-select" className="students-form-label">Stream:</label>
                <select
                  id="stream-select"
                  value={selectedClassStream.stream}
                  onChange={(e) => setSelectedClassStream(prev => ({ ...prev, stream: e.target.value }))}
                  className="students-form-select"
                >
                  {getAvailableStreams(selectedClassStream.form).map(stream => (
                    <option key={stream} value={stream}>
                      {stream}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="students-assignment-note">
              Student will be assigned to: <strong>{selectedClassStream.form} - {selectedClassStream.stream === 'All' ? 'East' : selectedClassStream.stream}</strong>
            </p>
          </div>
        </div>

        <div className="students-table-section">
          <h2 className="students-section-title">{getTableTitle()}</h2>
          
          <div className="students-filter">
            <div className="students-filter-group">
              <label htmlFor="table-form-select" className="students-filter-label">Form:</label>
              <select
                id="table-form-select"
                value={selectedClassStream.form}
                onChange={(e) => setSelectedClassStream({ form: e.target.value, stream: 'All' })}
                className="students-filter-select"
              >
                <option value="Form 2">Form 2</option>
                <option value="Form 3">Form 3</option>
                <option value="Form 4">Form 4</option>
              </select>
            </div>

            <div className="students-filter-group">
              <label htmlFor="table-stream-select" className="students-filter-label">Stream:</label>
              <select
                id="table-stream-select"
                value={selectedClassStream.stream}
                onChange={(e) => setSelectedClassStream(prev => ({ ...prev, stream: e.target.value }))}
                className="students-filter-select"
              >
                {getAvailableStreams(selectedClassStream.form).map(stream => (
                  <option key={stream} value={stream}>
                    {stream}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="students-table-container">
            <table className="students-table">
              <thead className="students-table-header">
                <tr>
                  <th className="students-table-th">ID</th>
                  <th className="students-table-th">Name</th>
                  <th className="students-table-th">Admission No.</th>
                  <th className="students-table-th">KCSE Marks</th>
                  {selectedClassStream.stream === 'All' && (
                    <th className="students-table-th">Stream</th>
                  )}
                  <th className="students-table-th actions-header">Actions</th>
                </tr>
              </thead>
              <tbody className="students-table-body">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="students-table-row">
                    <td className="students-table-td">{student.id}</td>
                    <td className="students-table-td">{student.name}</td>
                    <td className="students-table-td">{student.admissionNumber}</td>
                    <td className="students-table-td">{student.kcseMarks}</td>
                    {selectedClassStream.stream === 'All' && (
                      <td className="students-table-td">{student.stream}</td>
                    )}
                    <td className="students-table-td actions-cell">
                      <button 
                        className="students-delete-btn"
                        onClick={() => openDeleteConfirm(student)}
                        aria-label={`Delete ${student.name}`}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredStudents.length === 0 && (
              <div className="students-empty-state">
                <p>No students found in {selectedClassStream.form} {selectedClassStream.stream !== 'All' ? `- ${selectedClassStream.stream}` : ''}.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && deleteConfirm.studentToDelete && (
        <div className="students-modal-overlay">
          <div className="students-modal">
            <div className="students-modal-header">
              <span className="students-modal-icon">✕</span>
              <h3>Confirm Removal</h3>
            </div>
            <div className="students-modal-body">
              <p>
                Are you sure you want to remove {deleteConfirm.studentToDelete.name} ({deleteConfirm.studentToDelete.admissionNumber}) from {deleteConfirm.studentToDelete.form} - {deleteConfirm.studentToDelete.stream}? This action cannot be undone.
              </p>
            </div>
            <div className="students-modal-footer">
              <button 
                className="students-modal-cancel"
                onClick={closeDeleteConfirm}
              >
                Cancel
              </button>
              <button 
                className="students-modal-confirm"
                onClick={() => handleDeleteStudent(deleteConfirm.studentToDelete!.id)}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;