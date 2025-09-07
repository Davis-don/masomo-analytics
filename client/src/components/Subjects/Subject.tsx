// components/subjects/Subjects.tsx
import React, { useState } from 'react';
import './subject.css';
import { useMutation, useQuery} from '@tanstack/react-query';
import { toast, Toaster } from 'sonner';

export interface SubjectFormData {
  subjectName: string;
}

interface Subject {
  subject_id: string;
  subject_name: string;
}

interface SubjectsResponse {
  data?: Subject[];
}

interface DeleteResponse {
  message: string;
  success: boolean;
}

const Subjects: React.FC = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [dataVersion, setDataVersion] = useState<number>(0);

  // Fetch subjects
  const { data: subjectsResponse = [], isLoading, error } = useQuery<SubjectsResponse | Subject[], Error>({
    queryKey: ['subjects', dataVersion],
    queryFn: async (): Promise<SubjectsResponse | Subject[]> => {
      const response = await fetch(`${apiUrl}/api/subjects/fetch-all-subjects`, {
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch subjects');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Extract subjects array from response
  const subjects: Subject[] = Array.isArray(subjectsResponse) 
    ? subjectsResponse 
    : subjectsResponse.data || [];

  // Mutation to add a subject
  const addSubjectMutation = useMutation({
    mutationFn: async (subjectName: string) => {
      const res = await fetch(`${apiUrl}/api/subjects/add-subject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject_name: subjectName
        })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to add subject');
      }

      return result;
    },
    onSuccess: (res: any) => {
      toast.success(res.message || 'Subject added successfully!');
      setDataVersion(prev => prev + 1);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add subject');
      console.error('Error adding subject:', err);
    }
  });

  // Delete subject mutation - FIXED parameter name
  const deleteSubjectMutation = useMutation<DeleteResponse, Error, string>({
    mutationFn: async (subjectId: string): Promise<DeleteResponse> => {
      // Try different parameter names based on common API patterns
      const urlsToTry = [
        `${apiUrl}/api/subjects/delete-subject-by-id?subject_id=${subjectId}`,
        `${apiUrl}/api/subjects/delete-subject-by-id?id=${subjectId}`,
        `${apiUrl}/api/subjects/delete-subject/${subjectId}`
      ];

      let lastError: Error | null = null;

      for (const url of urlsToTry) {
        try {
          const response = await fetch(url, {
            method: 'DELETE',
          });

          if (response.ok) {
            return response.json();
          }
          
          // If not found or bad request, try next URL
          if (response.status === 404 || response.status === 400) {
            const errorData = await response.json();
            lastError = new Error(errorData.message || `Failed with status ${response.status}`);
            continue;
          }

          // For other errors, throw immediately
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete subject');
        } catch (err) {
          lastError = err as Error;
          continue;
        }
      }

      // If all URLs failed, throw the last error
      throw lastError || new Error('Failed to delete subject: All endpoints failed');
    },
    onSuccess: (data: DeleteResponse) => {
      toast.success(data.message || 'Subject deleted successfully!');
      setDataVersion(prev => prev + 1);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete subject');
      console.error('Delete error:', error);
    },
  });

  const { mutate: addSubject, isPending: isAdding } = addSubjectMutation;
  const { mutate: deleteSubject, isPending: isDeleting } = deleteSubjectMutation;

  const handleAddSubject = (subjectName: string): void => {
    addSubject(subjectName);
  };

  const handleDeleteSubject = (subjectId: string): void => {
    if (!subjectId) {
      toast.error('Subject ID is required for deletion');
      return;
    }
    console.log('Deleting subject with ID:', subjectId); // Debug log
    deleteSubject(subjectId);
  };

  const handleManualRefetch = (): void => {
    setDataVersion(prev => prev + 1);
    toast.info('Refreshing subjects data...');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="subjects-container">
        <h1 className="subjects-title">Subjects Management</h1>
        <div className="subjects-loading">
          <div className="subjects-loading-spinner"></div>
          <p>Loading subjects...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="subjects-container">
        <h1 className="subjects-title">Subjects Management</h1>
        <div className="subjects-error">
          <span className="error-icon">⚠️</span>
          <p>Failed to load subjects: {error.message}</p>
          <button
            className="subjects-retry-btn"
            onClick={handleManualRefetch}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="subjects-container">
      <Toaster richColors position="top-center" />
      
      <h1 className="subjects-title">Subjects Management</h1>
      <div className="subjects-header">
        <p className="subjects-description">Manage and view subject information here.</p>
        <button 
          className="subjects-refresh-btn"
          onClick={handleManualRefetch}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      <div className="subjects-content">
        <div className="subjects-form-section">
          <h2 className="subjects-section-title">Add New Subject</h2>
          <SubjectForm onSubmit={handleAddSubject} isPending={isAdding} />
        </div>

        <div className="subjects-table-section">
          <div className="subjects-table-header-section">
            <h2 className="subjects-section-title">Available Subjects</h2>
            <span className="subjects-count">Total: {subjects.length} subjects</span>
          </div>
          
          <div className="subjects-table-container">
            <table className="subjects-table">
              <thead className="subjects-table-header">
                <tr>
                  <th className="subjects-table-th">#</th>
                  <th className="subjects-table-th">Subject Name</th>
                  <th className="subjects-table-th actions-header">Actions</th>
                </tr>
              </thead>
              <tbody className="subjects-table-body">
                {subjects.map((subject, index) => (
                  <tr key={subject.subject_id} className="subjects-table-row">
                    <td className="subjects-table-td">{index + 1}</td>
                    <td className="subjects-table-td">{subject.subject_name}</td>
                    <td className="subjects-table-td actions-cell">
                      <button 
                        className="subjects-delete-btn"
                        onClick={() => handleDeleteSubject(subject.subject_id)}
                        disabled={isDeleting}
                        aria-label={`Delete ${subject.subject_name}`}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {subjects.length === 0 && (
              <div className="subjects-empty-state">
                <p>No subjects available. Add a new subject to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Subject Form Component
interface SubjectFormProps {
  onSubmit: (subjectName: string) => void;
  isPending: boolean;
}

const SubjectForm: React.FC<SubjectFormProps> = ({ onSubmit, isPending }) => {
  const [subjectName, setSubjectName] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subjectName.trim()) {
      toast.error('Subject name is required.');
      return;
    }

    onSubmit(subjectName.trim());
    setSubjectName('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubjectName(e.target.value);
  };

  return (
    <form className="subject-form" onSubmit={handleSubmit}>
      <div className="subject-form-group">
        <label htmlFor="subjectName" className="subject-form-label">Subject Name:</label>
        <input
          type="text"
          id="subjectName"
          value={subjectName}
          onChange={handleChange}
          className="subject-form-input"
          placeholder="Enter subject name (e.g., Mathematics, English)"
          required
          disabled={isPending}
        />
      </div>

      <button 
        type="submit" 
        className="subject-form-submit" 
        disabled={isPending}
      >
        {isPending ? 'Adding...' : 'Add Subject'}
      </button>
    </form>
  );
};

export default Subjects;