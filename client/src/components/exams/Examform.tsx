// features/Exams/ExamForm.tsx
import type { ChangeEvent, FormEvent } from 'react';
import { useState, useEffect } from 'react';
import './examform.css';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast, Toaster } from 'sonner';

export interface ExamFormData {
  name: string;
  date: string;
  term: number;
  year: number;
  status: 'upcoming';
  class_ids: string[];
}

interface ExamFormProps {
  onSuccess?: () => void;
  onCancel: () => void;
}

interface ClassItem {
  class_id: string;
  class_level: number;
  class_stream: string;
}

const ExamForm: React.FC<ExamFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<ExamFormData>({
    name: '',
    date: '',
    term: 1,
    year: new Date().getFullYear(),
    status: 'upcoming',
    class_ids: []
  });

  const apiUrl = import.meta.env.VITE_API_URL;

  // Determine current term based on month
  const getCurrentTerm = () => {
    const currentMonth = new Date().getMonth() + 1; // January = 1, December = 12
    
    if (currentMonth >= 1 && currentMonth <= 4) {
      return 1; // Term 1: Jan, Feb, Mar, Apr
    } else if (currentMonth >= 5 && currentMonth <= 8) {
      return 2; // Term 2: May, Jun, Jul, Aug
    } else {
      return 3; // Term 3: Sep, Oct, Nov, Dec
    }
  };

  // Set current term and year on component mount
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      term: getCurrentTerm(),
      year: new Date().getFullYear()
    }));
  }, []);

  // Fetch classes
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

  // Mutation to add exam
  const mutation = useMutation({
    mutationFn: async (data: ExamFormData) => {
      const res = await fetch(`${apiUrl}/api/exams/add-exam`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.message || 'Failed to add exam');
      return result;
    },
    onSuccess: (res: any) => {
      toast.success(res.message || 'Exam added successfully!');
      setFormData({
        name: '',
        date: '',
        term: getCurrentTerm(),
        year: new Date().getFullYear(),
        status: 'upcoming',
        class_ids: []
      });
      if (onSuccess) onSuccess();
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add exam');
      console.error('Error adding exam:', err);
    }
  });

  const { mutate, isPending } = mutation;

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'term' || name === 'year' ? parseInt(value, 10) : value
    }));
  };

  // Handle checkbox selection
  const handleClassChange = (e: ChangeEvent<HTMLInputElement>) => {
    const classId = e.target.value;
    const isChecked = e.target.checked;

    setFormData(prev => {
      if (isChecked) {
        return { ...prev, class_ids: [...prev.class_ids, classId] };
      } else {
        return { ...prev, class_ids: prev.class_ids.filter(id => id !== classId) };
      }
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.date) {
      toast.error('Exam name and date are required.');
      return;
    }

    if (formData.class_ids.length === 0) {
      toast.error('Please select at least one class.');
      return;
    }

    // Validate that the selected date is in the future for the term
    const selectedDate = new Date(formData.date);
    const now = new Date();
    
    if (selectedDate <= now) {
      toast.error('Exam date must be in the future.');
      return;
    }

    mutate(formData);
  };

  const isLoading = isPending || classesLoading;

  // Get term name for display
  const getTermName = (term: number) => {
    switch (term) {
      case 1: return 'Term 1 (Jan-Apr)';
      case 2: return 'Term 2 (May-Aug)';
      case 3: return 'Term 3 (Sep-Dec)';
      default: return `Term ${term}`;
    }
  };

  return (
    <>
      <Toaster richColors position="top-center" />

      <div className="exam-form-modal">
        <div className="exam-form-content">
          <h2>Add New Examination</h2>
          <form onSubmit={handleSubmit}>
            {/* Exam Name */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">Exam Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter exam name"
                required
                disabled={isLoading}
              />
            </div>

            {/* Exam Date */}
            <div className="form-group">
              <label htmlFor="date" className="form-label">Exam Date:</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="form-input"
                required
                disabled={isLoading}
                min={new Date().toISOString().split('T')[0]} // Set min date to today
              />
            </div>

            {/* Term (read-only) */}
            <div className="form-group">
              <label className="form-label">Term:</label>
              <div className="term-display">
                {getTermName(formData.term)}
                <span className="term-info">(Automatically set based on current month)</span>
              </div>
              <input type="hidden" name="term" value={formData.term} />
            </div>

            {/* Year (read-only) */}
            <div className="form-group">
              <label className="form-label">Year:</label>
              <div className="year-display">
                {formData.year}
                <span className="year-info">(Current year)</span>
              </div>
              <input type="hidden" name="year" value={formData.year} />
            </div>

            {/* Status (hidden, always upcoming) */}
            <input type="hidden" name="status" value="upcoming" />

            {/* Classes */}
            <div className="form-group">
              <label className="form-label">
                Select Classes:
                <span className="classes-count">
                  Selected: {formData.class_ids.length}
                </span>
              </label>
              <div className="classes-container">
                {classesLoading ? (
                  <div className="form-loading">Loading classes...</div>
                ) : (
                  <div className="classes-grid">
                    {classes.map((classItem) => (
                      <label key={classItem.class_id} className="class-checkbox">
                        <input
                          type="checkbox"
                          value={classItem.class_id}
                          checked={formData.class_ids.includes(classItem.class_id)}
                          onChange={handleClassChange}
                          disabled={isLoading}
                        />
                        <span className="class-name">
                          Form {classItem.class_level} - {classItem.class_stream}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {formData.class_ids.length === 0 && (
                <p className="form-error">Please select at least one class.</p>
              )}
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button
                type="button"
                onClick={onCancel}
                className="cancel-btn"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-btn"
                disabled={isLoading || formData.class_ids.length === 0}
              >
                {isPending ? 'Adding Exam...' : 'Add Exam'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ExamForm;
