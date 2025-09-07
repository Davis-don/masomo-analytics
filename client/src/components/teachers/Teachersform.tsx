// features/Teachers/TeacherForm.tsx
import React, { useState } from 'react';
import './teachersform.css';

export interface TeacherFormData {
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface TeacherFormProps {
  onSubmit: (data: TeacherFormData) => void;
}

const TeacherForm: React.FC<TeacherFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<TeacherFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'Teacher'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone) {
      onSubmit(formData);
      setFormData({ name: '', email: '', phone: '', role: 'Teacher' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form className="teacher-form" onSubmit={handleSubmit}>
      <div className="teacher-form-group">
        <label htmlFor="name" className="teacher-form-label">Teacher Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="teacher-form-input"
          placeholder="Enter teacher name"
          required
        />
      </div>

      <div className="teacher-form-group">
        <label htmlFor="email" className="teacher-form-label">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="teacher-form-input"
          placeholder="Enter email address"
          required
        />
      </div>

      <div className="teacher-form-group">
        <label htmlFor="phone" className="teacher-form-label">Phone Number:</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="teacher-form-input"
          placeholder="Enter phone number"
          required
        />
      </div>

      <div className="teacher-form-group">
        <label htmlFor="role" className="teacher-form-label">Role:</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="teacher-form-select"
          required
        >
          <option value="Teacher">Teacher</option>
          <option value="Class Teacher">Class Teacher</option>
          <option value="Dean">Dean</option>
          <option value="Deputy Principal">Deputy Principal</option>
          <option value="Principal">Principal</option>
        </select>
      </div>

      <button type="submit" className="teacher-form-submit">
        Add Teacher
      </button>
    </form>
  );
};

export default TeacherForm;