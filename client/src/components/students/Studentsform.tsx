// features/Students/StudentForm.tsx
import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import './studentsform.css';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast, Toaster } from 'sonner';

export interface StudentFormData {
  name: string;
  admissionNumber: string;
  kcseMarks: string;
  classId: string;
  subjectIds: string[];
}

interface StudentFormProps {
  onSubmit?: (data: StudentFormData) => void;
}

interface ClassItem {
  class_id: string;
  class_level: number;
  class_stream: string;
}

interface Subject {
  subject_id: string;
  subject_name: string;
}

const StudentForm: React.FC<StudentFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    admissionNumber: '',
    kcseMarks: '',
    classId: '',
    subjectIds: []
  });

  const apiUrl = import.meta.env.VITE_API_URL;

  // Fetch classes from the database
  const { data: classes = [], isLoading: classesLoading } = useQuery<ClassItem[]>({
    queryKey: ['classes'],
    queryFn: async (): Promise<ClassItem[]> => {
      const response = await fetch(`${apiUrl}/api/class/fetch-all-classes`);
      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : data.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch subjects from the database
  const { data: subjects = [], isLoading: subjectsLoading } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async (): Promise<Subject[]> => {
      const response = await fetch(`${apiUrl}/api/subjects/fetch-all-subjects`);
      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : data.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Mutation to add a student
  const mutation = useMutation({
    mutationFn: async (data: StudentFormData) => {
      const res = await fetch(`${apiUrl}/api/student/add-student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_adm_no: data.admissionNumber,
          students_name: data.name,
          kcse_entry: parseInt(data.kcseMarks, 10),
          class_id: data.classId,
          subject_ids: data.subjectIds
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to add student');
      }

      return result;
    },
    onSuccess: (res: any) => {
      toast.success(res.message || 'Student added successfully!');
      setFormData({ name: '', admissionNumber: '', kcseMarks: '', classId: '', subjectIds: [] });
      if (onSubmit) onSubmit(formData);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add student');
      console.error('Error adding student:', err);
    }
  });

  const { mutate, isPending } = mutation;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (e: ChangeEvent<HTMLInputElement>) => {
    const subjectId = e.target.value;
    const isChecked = e.target.checked;

    setFormData(prev => {
      if (isChecked) {
        return { ...prev, subjectIds: [...prev.subjectIds, subjectId] };
      } else {
        return { ...prev, subjectIds: prev.subjectIds.filter(id => id !== subjectId) };
      }
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.admissionNumber || !formData.kcseMarks || !formData.classId) {
      toast.error('All fields are required.');
      return;
    }

    if (formData.subjectIds.length < 7) {
      toast.error('Please select at least 7 subjects.');
      return;
    }

    mutate(formData);
  };

  const isLoading = isPending || classesLoading || subjectsLoading;

  return (
    <>
      <Toaster richColors position="top-center" />

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
            disabled={isLoading}
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
            disabled={isLoading}
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
            disabled={isLoading}
          />
        </div>

        <div className="student-form-group">
          <label htmlFor="classId" className="student-form-label">Class Stream:</label>
          <select
            id="classId"
            name="classId"
            value={formData.classId}
            onChange={handleChange}
            className="student-form-select"
            required
            disabled={isLoading}
          >
            <option value="">Select Class Stream</option>
            {classes.map((classItem) => (
              <option key={classItem.class_id} value={classItem.class_id}>
                Form {classItem.class_level} - {classItem.class_stream}
              </option>
            ))}
          </select>
          {classesLoading && (
            <div className="student-form-loading">Loading classes...</div>
          )}
        </div>

        <div className="student-form-group">
          <label className="student-form-label">
            Select Subjects (Minimum 7 required):
            <span className="subjects-count">
              Selected: {formData.subjectIds.length}/7
            </span>
          </label>
          <div className="subjects-container">
            {subjectsLoading ? (
              <div className="student-form-loading">Loading subjects...</div>
            ) : (
              <div className="subjects-grid">
                {subjects.map((subject) => (
                  <label key={subject.subject_id} className="subject-checkbox">
                    <input
                      type="checkbox"
                      value={subject.subject_id}
                      checked={formData.subjectIds.includes(subject.subject_id)}
                      onChange={handleSubjectChange}
                      disabled={isLoading}
                    />
                    <span className="subject-name">{subject.subject_name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          {formData.subjectIds.length < 7 && (
            <p className="form-error">
              Please select at least 7 subjects. Currently selected: {formData.subjectIds.length}
            </p>
          )}
        </div>

        <button 
          type="submit" 
          className="student-form-submit" 
          disabled={isLoading || formData.subjectIds.length < 7}
        >
          {isPending ? 'Adding Student...' : 'Add Student'}
        </button>
      </form>
    </>
  );
};

export default StudentForm;