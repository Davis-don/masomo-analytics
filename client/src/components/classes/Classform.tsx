// features/Classes/ClassForm.tsx
import React, { useState } from 'react';
import './classform.css';

export interface ClassFormData {
  form: string;
  stream: string;
}

interface ClassFormProps {
  onSubmit: (data: ClassFormData) => void;
}

const ClassForm: React.FC<ClassFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<ClassFormData>({
    form: '',
    stream: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.form && formData.stream) {
      onSubmit(formData);
      setFormData({ form: '', stream: '' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form className="class-form" onSubmit={handleSubmit}>
      <div className="class-form-group">
        <label htmlFor="form" className="class-form-label">Form:</label>
        <select
          id="form"
          name="form"
          value={formData.form}
          onChange={handleChange}
          className="class-form-select"
          required
        >
          <option value="">Select Form</option>
          <option value="Form 2">Form 2</option>
          <option value="Form 3">Form 3</option>
          <option value="Form 4">Form 4</option>
        </select>
      </div>

      <div className="class-form-group">
        <label htmlFor="stream" className="class-form-label">Stream:</label>
        <input
          type="text"
          id="stream"
          name="stream"
          value={formData.stream}
          onChange={handleChange}
          className="class-form-input"
          placeholder="Enter stream (e.g., East, West, St. Jerome)"
          required
        />
      </div>

      <button type="submit" className="class-form-submit">
        Add Class
      </button>
    </form>
  );
};

export default ClassForm;