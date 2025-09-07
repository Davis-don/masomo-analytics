// features/Classes/Classes.tsx
import React, { useState } from 'react';
import ClassForm from './Classform';
import './classes.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ClassItem {
  class_id: string;
  class_level: number;
  class_stream: string;
}

interface DeleteResponse {
  message: string;
  success: boolean;
}

interface ClassesResponse {
  data?: ClassItem[];
}

const Classes: React.FC = () => {
  const queryClient = useQueryClient();
  const apiUrl = import.meta.env.VITE_API_URL;

  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    classToDelete: ClassItem | null;
  }>({ show: false, classToDelete: null });

  const [dataVersion, setDataVersion] = useState<number>(0);

  // Fetch classes with refetch only when dataVersion changes
  const { 
    data: classesResponse = [], 
    isLoading, 
    error 
  } = useQuery<ClassesResponse | ClassItem[], Error>({
    queryKey: ['classes', dataVersion],
    queryFn: async (): Promise<ClassesResponse | ClassItem[]> => {
      const response = await fetch(`${apiUrl}/api/class/fetch-all-classes`, {
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Extract classes array from response
  const classes: ClassItem[] = Array.isArray(classesResponse) 
    ? classesResponse 
    : classesResponse.data || [];

  // Delete class mutation with optimistic update
  const deleteClassMutation = useMutation<DeleteResponse, Error, string>({
    mutationFn: async (classId: string): Promise<DeleteResponse> => {
      const response = await fetch(`${apiUrl}/api/class/delete-class-by-id?id=${classId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete class');
      }

      return response.json();
    },
    onMutate: async (classId: string) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['classes', dataVersion] });

      // Snapshot the previous value
      const previousClasses = queryClient.getQueryData(['classes', dataVersion]);

      // Optimistically update the cache by removing the class
      queryClient.setQueryData(['classes', dataVersion], (old: unknown) => {
        if (Array.isArray(old)) {
          return old.filter((cls: ClassItem) => cls.class_id !== classId);
        } else if (old && typeof old === 'object' && 'data' in old) {
          const oldData = (old as ClassesResponse).data || [];
          return {
            ...old,
            data: oldData.filter((cls: ClassItem) => cls.class_id !== classId)
          };
        }
        return old;
      });

      // Return a context object with the snapshotted value
      return { previousClasses };
    },
    onError: (error: Error,  context?: unknown) => {
      // Revert back to the previous value on error
      if (
        context &&
        typeof context === 'object' &&
        'previousClasses' in context
      ) {
        const previousClasses = (context as { previousClasses: unknown }).previousClasses;
        queryClient.setQueryData(['classes', dataVersion], previousClasses);
      }
      toast.error(error.message || 'Failed to delete class');
    },
    onSuccess: (data: DeleteResponse) => {
      toast.success(data.message || 'Class deleted successfully!');
      setDeleteConfirm({ show: false, classToDelete: null });
      // Increment data version to trigger a single refetch
      setDataVersion(prev => prev + 1);
    },
    onSettled: () => {
      // Ensure query is fresh after mutation
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  const handleAddClass = (): void => {
    // Increment data version to trigger refetch when new class is added
    setDataVersion(prev => prev + 1);
    toast.success('Class added successfully! Refreshing data...');
  };

  const handleDeleteClass = (classId: string): void => {
    deleteClassMutation.mutate(classId);
  };

  const openDeleteConfirm = (cls: ClassItem): void => {
    setDeleteConfirm({ show: true, classToDelete: cls });
  };

  const closeDeleteConfirm = (): void => {
    setDeleteConfirm({ show: false, classToDelete: null });
  };

  // Manual refetch function
  const handleManualRefetch = (): void => {
    setDataVersion(prev => prev + 1);
    toast.info('Refreshing class data...');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="classes-container">
        <h1 className="classes-title">Classes Management</h1>
        <div className="classes-loading">
          <div className="classes-loading-spinner"></div>
          <p>Loading classes...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="classes-container">
        <h1 className="classes-title">Classes Management</h1>
        <div className="classes-error">
          <span className="error-icon">⚠️</span>
          <p>Failed to load classes: {error.message}</p>
          <button
            className="classes-retry-btn"
            onClick={handleManualRefetch}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="classes-container">
      <h1 className="classes-title">Classes Management</h1>
      <div className="classes-header">
        <p className="classes-description">Manage and view class information here.</p>
        <button 
          className="classes-refresh-btn"
          onClick={handleManualRefetch}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      <div className="classes-content">
        <div className="classes-form-section">
          <h2 className="classes-section-title">Add New Class</h2>
          <ClassForm onSubmit={handleAddClass} />
        </div>

        <div className="classes-table-section">
          <div className="classes-table-header-section">
            <h2 className="classes-section-title">Available Classes</h2>
            <span className="classes-count">Total: {classes.length} classes</span>
          </div>
          <div className="classes-table-container">
            <table className="classes-table">
              <thead className="classes-table-header">
                <tr>
                  <th className="classes-table-th">#</th>
                  <th className="classes-table-th">Form</th>
                  <th className="classes-table-th">Stream</th>
                  <th className="classes-table-th actions-header">Actions</th>
                </tr>
              </thead>
              <tbody className="classes-table-body">
                {classes.map((cls, index) => (
                  <tr key={cls.class_id} className="classes-table-row">
                    <td className="classes-table-td">{index + 1}</td>
                    <td className="classes-table-td">Form {cls.class_level}</td>
                    <td className="classes-table-td">{cls.class_stream}</td>
                    <td className="classes-table-td actions-cell">
                      <button
                        className="classes-delete-btn"
                        onClick={() => openDeleteConfirm(cls)}
                        disabled={deleteClassMutation.isPending}
                        aria-label={`Delete Form ${cls.class_level} ${cls.class_stream}`}
                      >
                        {deleteClassMutation.isPending && deleteConfirm.classToDelete?.class_id === cls.class_id
                          ? 'Deleting...'
                          : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {classes.length === 0 && (
              <div className="classes-empty-state">
                <p>No classes available. Add a new class to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {deleteConfirm.show && deleteConfirm.classToDelete && (
        <div className="classes-modal-overlay">
          <div className="classes-modal">
            <div className="classes-modal-header">
              <span className="classes-modal-icon">✕</span>
              <h3>Confirm Deletion</h3>
            </div>
            <div className="classes-modal-body">
              <p>
                Are you sure you want to delete Form {deleteConfirm.classToDelete.class_level} -{' '}
                {deleteConfirm.classToDelete.class_stream}? This action cannot be undone.
              </p>
            </div>
            <div className="classes-modal-footer">
              <button
                className="classes-modal-cancel"
                onClick={closeDeleteConfirm}
                disabled={deleteClassMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="classes-modal-confirm"
                onClick={() => handleDeleteClass(deleteConfirm.classToDelete!.class_id)}
                disabled={deleteClassMutation.isPending}
              >
                {deleteClassMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;