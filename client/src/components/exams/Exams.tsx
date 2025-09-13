import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExamForm from './Examform';
import './exams.css';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast, Toaster } from 'sonner';

interface Exam {
  exam_id: string;
  name: string;
  date: string;
  term: number;
  year: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  classes: {
    class: {
      class_id: string;
      class_level: number;
      class_stream: string;
    };
    status: 'upload' | 'review' | 'publish' | 'archived' | 'analyse';
  }[];
}

interface ClassExam {
  class_id: string;
  name: string;
  status: 'upload' | 'review' | 'publish' | 'archived' | 'analyse';
}

interface Subject {
  subject_id: string;
  subject_name: string;
}

interface ExamsProps {
  onUploadClick: (
    className: string,
    classId: string,
    examId: string,
    subjectId: string,
    subjectName: string,
    streamName: string
  ) => void;
}

const Exams: React.FC<ExamsProps> = ({ onUploadClick }) => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [classExams, setClassExams] = useState<ClassExam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [showExamForm, setShowExamForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [examToDelete, setExamToDelete] = useState<{ id: string; name: string } | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL;
  const currentYear = new Date().getFullYear();

  // Fetch subjects
  const { data: subjectsData = [] } = useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async (): Promise<Subject[]> => {
      const response = await fetch(`${apiUrl}/api/subjects/fetch-all-subjects`);
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 10 * 60 * 1000,
  });

  // Fetch exams - now depends on selectedSubject
  const { data: examsData = [], isLoading: examsLoading, refetch } = useQuery<Exam[]>({
    queryKey: ['exams', currentYear, selectedSubject?.subject_id],
    queryFn: async (): Promise<Exam[]> => {
      if (!selectedSubject) return [];
      
      const response = await fetch(
        `${apiUrl}/api/exams/fetch-all-exams?year=${currentYear}&subject_id=${selectedSubject.subject_id}`
      );
      if (!response.ok) throw new Error('Failed to fetch exams');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!selectedSubject, // Only fetch when a subject is selected
    staleTime: 5 * 60 * 1000,
  });

  // Auto refetch every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedSubject) {
        refetch();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [refetch, selectedSubject]);

  // Delete exam
  const deleteExamMutation = useMutation({
    mutationFn: async (examId: string) => {
      const response = await fetch(`${apiUrl}/api/exams/delete-exam/${examId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete exam');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Exam deleted successfully!');
      setShowDeleteConfirm(false);
      setExamToDelete(null);
      refetch();
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete exam: ${error.message}`);
      setShowDeleteConfirm(false);
      setExamToDelete(null);
    },
  });

  useEffect(() => {
    if (subjectsData.length > 0) {
      setSubjects(subjectsData);
      setSelectedSubject(subjectsData[0]);
    } else {
      setSubjects([]);
      setSelectedSubject(null);
    }
  }, [subjectsData]);

  useEffect(() => {
    if (examsData.length > 0) {
      setExams(examsData);
      setSelectedExam(examsData[0]);
    } else {
      setExams([]);
      setSelectedExam(null);
    }
  }, [examsData]);

  useEffect(() => {
    if (selectedExam) {
      // Extract class exams from the selected exam
      const classExamsData: ClassExam[] = selectedExam.classes.map((classExam) => ({
        class_id: classExam.class.class_id,
        name: `Form ${classExam.class.class_level} - ${classExam.class.class_stream}`,
        status: classExam.status || 'upload',
      }));
      setClassExams(classExamsData);
    } else {
      setClassExams([]);
    }
  }, [selectedExam]);

  const handleUploadClick = (classExam: ClassExam) => {
    if (!selectedSubject) {
      toast.error('Please select a subject first');
      return;
    }
    
    if (!selectedExam) {
      toast.error('Please select an exam first');
      return;
    }
    
    const streamName = classExam.name.split('-')[1]?.trim() || '';
    onUploadClick(
      classExam.name,
      classExam.class_id,
      selectedExam.exam_id,
      selectedSubject.subject_id,
      selectedSubject.subject_name,
      streamName
    );
  };

  const handlePublishClick = (classExam: ClassExam) => {
    if (!selectedExam || !selectedSubject) {
      toast.error('Please select an exam and subject first');
      return;
    }
    const streamName = classExam.name.split('-')[1]?.trim() || '';
    navigate('/confirmpublish', {
      state: {
        className: classExam.name,
        classId: classExam.class_id,
        examId: selectedExam.exam_id,
        subjectId: selectedSubject.subject_id,
        subjectName: selectedSubject.subject_name,
        streamName: streamName,
      },
    });
  };

  const handleAnalyseClick = (classExam: ClassExam) => {
    if (!selectedExam || !selectedSubject) {
      toast.error('Please select an exam and subject first');
      return;
    }
    const streamName = classExam.name.split('-')[1]?.trim() || '';
    navigate('/analyse', {
      state: {
        className: classExam.name,
        classId: classExam.class_id,
        examId: selectedExam.exam_id,
        subjectId: selectedSubject.subject_id,
        subjectName: selectedSubject.subject_name,
        streamName: streamName,
      },
    });
  };

  const handleAddExamSuccess = () => {
    setShowExamForm(false);
    refetch();
    toast.success('Exam added successfully!');
  };

  const confirmDeleteExam = (examId: string, examName: string) => {
    setExamToDelete({ id: examId, name: examName });
    setShowDeleteConfirm(true);
  };

  const handleDeleteExam = () => {
    if (examToDelete) deleteExamMutation.mutate(examToDelete.id);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setExamToDelete(null);
  };

  const statusConfig: Record<ClassExam['status'], { label: string; color: string; action: (classExam: ClassExam) => void }> = {
    upload: { label: 'Upload', color: '#4361ee', action: (classExam) => handleUploadClick(classExam) },
    review: { label: 'Under Review', color: '#f9c74f', action: () => {} },
    publish: { label: 'Publish', color: '#2a9d8f', action: (classExam) => handlePublishClick(classExam) },
    analyse: { label: 'Analyse', color: '#9d4edd', action: (classExam) => handleAnalyseClick(classExam) },
    archived: { label: 'Archived', color: '#6c757d', action: () => {} },
  };

  const getStatusButton = (classExam: ClassExam) => {
    const status = classExam.status || 'upload';
    const config = statusConfig[status];
    
    if (!config) {
      return (
        <button className="status-btn" style={{ backgroundColor: '#6c757d' }} onClick={() => {}}>
          Unknown Status
        </button>
      );
    }

    // For analyse status, show both Analyse and Publish buttons
    if (status === 'analyse') {
      return (
        <div className="button-group">
          <button 
            className="status-btn" 
            style={{ backgroundColor: '#9d4edd' }} 
            onClick={() => handleAnalyseClick(classExam)}
          >
            Analyse
          </button>
          <button 
            className="status-btn" 
            style={{ backgroundColor: '#2a9d8f' }} 
            onClick={() => handlePublishClick(classExam)}
          >
            Publish
          </button>
        </div>
      );
    }

    // For other statuses, show the single button
    return (
      <button className="status-btn" style={{ backgroundColor: config.color }} onClick={() => config.action(classExam)}>
        {config.label}
      </button>
    );
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });

  const examsByTerm = exams.reduce((acc, exam) => {
    if (!acc[exam.term]) acc[exam.term] = [];
    acc[exam.term].push(exam);
    return acc;
  }, {} as Record<number, Exam[]>);

  if (examsLoading) return <div className="exams-container"><div className="exams-loading">Loading exam data...</div></div>;

  return (
    <div className="exams-container">
      <Toaster richColors position="top-center" />
      {showExamForm && <ExamForm onSuccess={handleAddExamSuccess} onCancel={() => setShowExamForm(false)} />}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="modal-header"><h3>Confirm Deletion</h3></div>
            <div className="modal-body">
              <p>Are you sure you want to delete the exam <strong>{examToDelete?.name}</strong>?</p>
              <p className="warning-text">This action cannot be undone and will permanently remove all associated data.</p>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={cancelDelete} disabled={deleteExamMutation.isPending}>Cancel</button>
              <button className="delete-confirm-btn" onClick={handleDeleteExam} disabled={deleteExamMutation.isPending}>
                {deleteExamMutation.isPending ? 'Deleting...' : 'Delete Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="exams-header">
        <h1>Examination Management</h1>
        <p>Manage and monitor exam progress across all classes</p>
        <button className="add-exam-btn" onClick={() => setShowExamForm(true)}>+ Add New Exam</button>
      </div>
      
      <div className="subject-selection-section">
        <h2>Subject Selection</h2>
        <p>Select a subject to manage exams</p>
        <div className="subject-grid">
          {subjects.map(subject => (
            <div 
              key={subject.subject_id} 
              className={`subject-card ${selectedSubject?.subject_id === subject.subject_id ? 'selected' : ''}`}
              onClick={() => setSelectedSubject(subject)}
            >
              <div className="subject-icon">
                <span>📚</span>
              </div>
              <div className="subject-name">{subject.subject_name}</div>
            </div>
          ))}
        </div>
        {selectedSubject && (
          <div className="selected-subject-indicator">
            Selected: <span className="subject-highlight">{selectedSubject.subject_name}</span>
          </div>
        )}
      </div>

      {selectedSubject && (
        <>
          <div className="exam-selector-card">
            <div className="exam-selector-header"><h2>Select Examination ({currentYear})</h2></div>
            <div className="exam-selector-content">
              <div className="exam-dropdown">
                <label htmlFor="exam-select">Choose an exam:</label>
                <div className="dropdown-container">
                  <select
                    id="exam-select"
                    value={selectedExam?.exam_id || ''}
                    onChange={e => {
                      const exam = exams.find(ex => ex.exam_id === e.target.value);
                      if (exam) setSelectedExam(exam);
                    }}
                    className="exam-dropdown-select"
                  >
                    {Object.entries(examsByTerm).map(([term, termExams]) => (
                      <optgroup key={term} label={`Term ${term} (${currentYear})`}>
                        {termExams.map(exam => <option key={exam.exam_id} value={exam.exam_id}>{exam.name}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
              {selectedExam && (
                <div className="selected-exam-details">
                  <div className="exam-detail"><span className="detail-label">Date:</span><span className="detail-value">{formatDate(selectedExam.date)}</span></div>
                  <div className="exam-detail"><span className="detail-label">Term:</span><span className="detail-value">Term {selectedExam.term}</span></div>
                  <div className="exam-detail"><span className="detail-label">Year:</span><span className="detail-value">{selectedExam.year}</span></div>
                  <div className="exam-detail"><span className="status-badge">{selectedExam.status.charAt(0).toUpperCase() + selectedExam.status.slice(1)}</span></div>
                  <div className="exam-detail"><button className="delete-exam-btn" onClick={() => confirmDeleteExam(selectedExam.exam_id, selectedExam.name)} disabled={deleteExamMutation.isPending}>Delete Exam</button></div>
                </div>
              )}
            </div>
          </div>

          {selectedExam && (
            <div className="class-exams-section">
              <h2>Class Exam Status - {selectedExam.name}</h2>
              <div className="class-exams-table-container">
                <table className="class-exams-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name of Class</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classExams.map((classExam, index) => (
                      <tr key={classExam.class_id}>
                        <td>{index + 1}</td>
                        <td>{classExam.name}</td>
                        <td><span>{classExam.status.charAt(0).toUpperCase() + classExam.status.slice(1)}</span></td>
                        <td>{getStatusButton(classExam)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Exams;