// features/Students/Students.tsx
import React, { useState } from 'react';
import StudentForm from './Studentsform';
import './students.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ClassInfo {
  class_id: string;
  class_level: number;
  class_stream: string;
}

interface Student {
  student_id: string;
  student_adm_no: string;
  students_name: string;
  kcse_entry: number;
  class_id: string;
  class: ClassInfo;
}

interface DeleteResponse {
  message: string;
  success: boolean;
}

interface StudentsResponse {
  data?: Student[];
}

interface ClassesResponse {
  data?: ClassInfo[];
}

interface ClassStream {
  form: string;
  stream: string;
}

const Students: React.FC = () => {
  const queryClient = useQueryClient();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [selectedClassStream, setSelectedClassStream] = useState<ClassStream>({
    form: 'Form 2',
    stream: 'All'
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    studentToDelete: Student | null;
  }>({ show: false, studentToDelete: null });

  const [dataVersion, setDataVersion] = useState<number>(0);

  // Fetch classes to populate the filter dropdowns
  const { data: classesResponse = [] } = useQuery<ClassesResponse | ClassInfo[], Error>({
    queryKey: ['classes'],
    queryFn: async (): Promise<ClassesResponse | ClassInfo[]> => {
      const response = await fetch(`${apiUrl}/api/class/fetch-all-classes`);
      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Extract classes array from response
  const classes: ClassInfo[] = Array.isArray(classesResponse) 
    ? classesResponse 
    : classesResponse.data || [];

  // Fetch students with refetch only when dataVersion changes
  const { 
    data: studentsResponse = [], 
    isLoading, 
    error 
  } = useQuery<StudentsResponse | Student[], Error>({
    queryKey: ['students', dataVersion],
    queryFn: async (): Promise<StudentsResponse | Student[]> => {
      const response = await fetch(`${apiUrl}/api/student/fetch-all-students`, {
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Extract students array from response
  const students: Student[] = Array.isArray(studentsResponse) 
    ? studentsResponse 
    : studentsResponse.data || [];

  // Delete student mutation - FIXED: Correct parameter name
  const deleteStudentMutation = useMutation<DeleteResponse, Error, string, { previousStudents: unknown }>({
    mutationFn: async (admissionNumber: string): Promise<DeleteResponse> => {
      const response = await fetch(`${apiUrl}/api/student/delete-student-by-adm?student_adm_no=${admissionNumber}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete student');
      }

      return response.json();
    },
    onMutate: async (admissionNumber: string) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['students', dataVersion] });

      // Snapshot the previous value
      const previousStudents = queryClient.getQueryData(['students', dataVersion]);

      // Optimistically update the cache by removing the student
      queryClient.setQueryData(['students', dataVersion], (old: unknown) => {
        if (Array.isArray(old)) {
          return old.filter((student: Student) => student.student_adm_no !== admissionNumber);
        } else if (old && typeof old === 'object' && 'data' in old) {
          const oldData = (old as StudentsResponse).data || [];
          return {
            ...old,
            data: oldData.filter((student: Student) => student.student_adm_no !== admissionNumber)
          };
        }
        return old;
      });

      // Return a context object with the snapshotted value
      return { previousStudents };
    },
    onError: (error: Error, _admissionNumber: string, context: { previousStudents: unknown } | undefined) => {
      // Revert back to the previous value on error
      if (context?.previousStudents) {
        queryClient.setQueryData(['students', dataVersion], context.previousStudents);
      }
      toast.error(error.message || 'Failed to delete student');
    },
    onSuccess: (data: DeleteResponse) => {
      toast.success(data.message || 'Student deleted successfully!');
      setDeleteConfirm({ show: false, studentToDelete: null });
      // Increment data version to trigger a single refetch
      setDataVersion(prev => prev + 1);
    },
    onSettled: () => {
      // Ensure query is fresh after mutation
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const handleAddStudent = (): void => {
    // Increment data version to trigger refetch when new student is added
    setDataVersion(prev => prev + 1);
    toast.success('Student added successfully! Refreshing data...');
  };

  const handleDeleteStudent = (admissionNumber: string): void => {
    if (!admissionNumber) {
      toast.error('Admission number is required for deletion');
      return;
    }
    console.log('Deleting student with admission number:', admissionNumber);
    deleteStudentMutation.mutate(admissionNumber);
  };

  const openDeleteConfirm = (student: Student): void => {
    setDeleteConfirm({ show: true, studentToDelete: student });
  };

  const closeDeleteConfirm = (): void => {
    setDeleteConfirm({ show: false, studentToDelete: null });
  };

  // Manual refetch function
  const handleManualRefetch = (): void => {
    setDataVersion(prev => prev + 1);
    toast.info('Refreshing student data...');
  };

  // Get unique forms from available classes
  const availableForms = Array.from(new Set(classes.map(cls => `Form ${cls.class_level}`))).sort();

  // Get available streams for the selected form
  const getAvailableStreams = (form: string): string[] => {
    const formLevel = parseInt(form.replace('Form ', ''), 10);
    const streams = classes
      .filter(cls => cls.class_level === formLevel)
      .map(cls => cls.class_stream);
    
    // Always include 'All' option
    return ['All', ...streams];
  };

  // Filter students based on selected class and stream
  const filteredStudents = students.filter(student => {
    const formMatch = `Form ${student.class.class_level}` === selectedClassStream.form;
    const streamMatch = selectedClassStream.stream === 'All' || student.class.class_stream === selectedClassStream.stream;
    return formMatch && streamMatch;
  });

  const getTableTitle = (): string => {
    if (selectedClassStream.stream === 'All') {
      return `All Students in ${selectedClassStream.form}`;
    }
    return `Students in ${selectedClassStream.form} - ${selectedClassStream.stream}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="students-container">
        <h1 className="students-title">Students Management</h1>
        <div className="students-loading">
          <div className="students-loading-spinner"></div>
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="students-container">
        <h1 className="students-title">Students Management</h1>
        <div className="students-error">
          <span className="error-icon">⚠️</span>
          <p>Failed to load students: {error.message}</p>
          <button
            className="students-retry-btn"
            onClick={handleManualRefetch}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="students-container">
      <h1 className="students-title">Students Management</h1>
      <div className="students-header">
        <p className="students-description">Manage and view student information here.</p>
        <button 
          className="students-refresh-btn"
          onClick={handleManualRefetch}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      <div className="students-content">
        <div className="students-form-section">
          <h2 className="students-section-title">Add New Student</h2>
          <StudentForm onSubmit={handleAddStudent} />
          
          <div className="students-class-selection">
            <h3 className="students-subsection-title">View Students by Class & Stream</h3>
            <div className="students-class-form">
              <div className="students-form-group">
                <label htmlFor="form-select" className="students-form-label">Form:</label>
                <select
                  id="form-select"
                  value={selectedClassStream.form}
                  onChange={(e) => setSelectedClassStream({ form: e.target.value, stream: 'All' })}
                  className="students-form-select"
                >
                  {availableForms.map(form => (
                    <option key={form} value={form}>
                      {form}
                    </option>
                  ))}
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
          </div>
        </div>

        <div className="students-table-section">
          <div className="students-table-header-section">
            <h2 className="students-section-title">{getTableTitle()}</h2>
            <span className="students-count">Total: {filteredStudents.length} students</span>
          </div>
          
          <div className="students-filter">
            <div className="students-filter-group">
              <label htmlFor="table-form-select" className="students-filter-label">Form:</label>
              <select
                id="table-form-select"
                value={selectedClassStream.form}
                onChange={(e) => setSelectedClassStream({ form: e.target.value, stream: 'All' })}
                className="students-filter-select"
              >
                {availableForms.map(form => (
                  <option key={form} value={form}>
                    {form}
                  </option>
                ))}
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
                  <th className="students-table-th">#</th>
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
                {filteredStudents.map((student, index) => (
                  <tr key={student.student_id} className="students-table-row">
                    <td className="students-table-td">{index + 1}</td>
                    <td className="students-table-td">{student.students_name}</td>
                    <td className="students-table-td">{student.student_adm_no}</td>
                    <td className="students-table-td">{student.kcse_entry}</td>
                    {selectedClassStream.stream === 'All' && (
                      <td className="students-table-td">{student.class.class_stream}</td>
                    )}
                    <td className="students-table-td actions-cell">
                      <button 
                        className="students-delete-btn"
                        onClick={() => openDeleteConfirm(student)}
                        disabled={deleteStudentMutation.isPending}
                        aria-label={`Delete ${student.students_name}`}
                      >
                        {deleteStudentMutation.isPending && deleteConfirm.studentToDelete?.student_adm_no === student.student_adm_no
                          ? 'Deleting...'
                          : 'Remove'}
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
                Are you sure you want to remove {deleteConfirm.studentToDelete.students_name} ({deleteConfirm.studentToDelete.student_adm_no}) from Form {deleteConfirm.studentToDelete.class.class_level} - {deleteConfirm.studentToDelete.class.class_stream}? This action cannot be undone.
              </p>
            </div>
            <div className="students-modal-footer">
              <button 
                className="students-modal-cancel"
                onClick={closeDeleteConfirm}
                disabled={deleteStudentMutation.isPending}
              >
                Cancel
              </button>
              <button 
                className="students-modal-confirm"
                onClick={() => handleDeleteStudent(deleteConfirm.studentToDelete!.student_adm_no)}
                disabled={deleteStudentMutation.isPending}
              >
                {deleteStudentMutation.isPending ? 'Deleting...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;