// features/Classes/ClassForm.tsx
import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import './classform.css';
import { useMutation } from '@tanstack/react-query';
import { toast, Toaster } from 'sonner';

export interface ClassFormData {
  form: string;
  stream: string;
}

interface ClassFormProps {
  onSubmit?: (data: ClassFormData) => void;
}

const ClassForm: React.FC<ClassFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<ClassFormData>({
    form: '',
    stream: ''
  });

  const apiUrl = import.meta.env.VITE_API_URL;

  // Use mutation properly
  const mutation = useMutation({
    mutationFn: async (data: ClassFormData) => {
      const res = await fetch(`${apiUrl}/api/class/add-class`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_level: /^\d+$/.test(data.form)
            ? parseInt(data.form, 10)
            : parseInt(data.form.replace('Form ', ''), 10),
          class_stream: data.stream
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to add class');
      }

      return result;
    },
    onSuccess: (res: any) => {
      toast.success(res.message || 'Class added successfully!');
      setFormData({ form: '', stream: '' });
      if (onSubmit) onSubmit(formData);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to add class');
      console.error('Error adding class:', err);
    }
  });

  const { mutate } = mutation;
  const isLoading = mutation.isPending;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.form || !formData.stream) {
      toast.error('Both form and stream are required.');
      return;
    }
    mutate(formData);
  };

  return (
    <>
      <Toaster richColors position="top-center" />

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
            disabled={isLoading}
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
            disabled={isLoading}
          />
        </div>

        <button type="submit" className="class-form-submit" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Class'}
        </button>
      </form>
    </>
  );
};

export default ClassForm;

