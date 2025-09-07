// features/Students/StudentForm.tsx
import React, { useState } from 'react';
import './studentsform.css'

export interface StudentFormData {
  name: string;
  admissionNumber: string;
  kcseMarks: string;
}

interface StudentFormProps {
  onSubmit: (data: StudentFormData) => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    admissionNumber: '',
    kcseMarks: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.admissionNumber && formData.kcseMarks) {
      onSubmit(formData);
      setFormData({ name: '', admissionNumber: '', kcseMarks: '' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form className="student-form" onSubmit={handleSubmit}>
      <div className="student-form-group">
        <label htmlFor="name" className="student-form-label">Student Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="student-form-input"
          placeholder="Enter student name"
          required
        />
      </div>

      <div className="student-form-group">
        <label htmlFor="admissionNumber" className="student-form-label">Admission Number:</label>
        <input
          type="text"
          id="admissionNumber"
          name="admissionNumber"
          value={formData.admissionNumber}
          onChange={handleChange}
          className="student-form-input"
          placeholder="Enter admission number"
          required
        />
      </div>

      <div className="student-form-group">
        <label htmlFor="kcseMarks" className="student-form-label">KCSE Entry Marks:</label>
        <input
          type="number"
          id="kcseMarks"
          name="kcseMarks"
          value={formData.kcseMarks}
          onChange={handleChange}
          className="student-form-input"
          placeholder="Enter KCSE marks"
          min="0"
          max="500"
          required
        />
      </div>

      <button type="submit" className="student-form-submit">
        Add Student
      </button>
    </form>
  );
};

export default StudentForm;