// features/Exams/Exams.tsx
import React, { useState, useEffect } from 'react';
import ExamForm from './Examform';
import './exams.css';
import { useQuery } from '@tanstack/react-query';
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
  }[];
}

interface ClassExam {
  class_id: string;
  name: string;
  status: 'upload' | 'review' | 'published' | 'archived';
}

interface ExamsProps {
  onUploadClick: (className: string, examId: string) => void;
}

const Exams: React.FC<ExamsProps> = ({ onUploadClick }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [classExams, setClassExams] = useState<ClassExam[]>([]);
  const [showExamForm, setShowExamForm] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const currentYear = new Date().getFullYear();

  // Fetch exams for the current year
  const { data: examsData = [], isLoading: examsLoading, refetch } = useQuery<Exam[]>({
    queryKey: ['exams', currentYear],
    queryFn: async (): Promise<Exam[]> => {
      const response = await fetch(`${apiUrl}/api/exams/fetch-all-exams?year=${currentYear}`);
      if (!response.ok) {
        throw new Error('Failed to fetch exams');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Update exams when data is fetched
  useEffect(() => {
    if (examsData.length > 0) {
      setExams(examsData);
      setSelectedExam(examsData[0]);
    } else {
      setExams([]);
      setSelectedExam(null);
    }
  }, [examsData]);

  // Generate class exams data from selected exam
  useEffect(() => {
    if (selectedExam) {
      const classExamsData: ClassExam[] = selectedExam.classes.map((classExam) => ({
        class_id: classExam.class.class_id,
        name: `Form ${classExam.class.class_level} - ${classExam.class.class_stream}`,
        status: 'upload' // Default status
      }));
      setClassExams(classExamsData);
    } else {
      setClassExams([]);
    }
  }, [selectedExam]);

  const handleStatusChange = (classId: string, newStatus: ClassExam['status']) => {
    setClassExams(prev =>
      prev.map(classExam => 
        classExam.class_id === classId ? { ...classExam, status: newStatus } : classExam
      )
    );
  };

  const handleUploadClick = (className: string) => {
    if (selectedExam) onUploadClick(className, selectedExam.exam_id);
  };

  const handleAddExamSuccess = () => {
    setShowExamForm(false);
    refetch(); // Refetch exams after adding a new one
    toast.success('Exam added successfully!');
  };

  // Centralized status configuration
  const statusConfig: Record<
    ClassExam['status'],
    { label: string; color: string; action: (classExam: ClassExam) => void }
  > = {
    upload: { 
      label: 'Upload', 
      color: '#4361ee', 
      action: (classExam) => handleUploadClick(classExam.name) 
    },
    review: { 
      label: 'Under Review', 
      color: '#f9c74f', 
      action: (classExam) => handleStatusChange(classExam.class_id, 'published') 
    },
    published: { 
      label: 'Published', 
      color: '#2a9d8f', 
      action: (classExam) => handleStatusChange(classExam.class_id, 'archived') 
    },
    archived: { 
      label: 'Archived', 
      color: '#6c757d', 
      action: (classExam) => handleStatusChange(classExam.class_id, 'upload') 
    }
  };

  const getStatusButton = (classExam: ClassExam) => {
    const config = statusConfig[classExam.status];
    return (
      <button 
        className="status-btn" 
        style={{ backgroundColor: config.color }} 
        onClick={() => config.action(classExam)}
      >
        {config.label}
      </button>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Group exams by term
  const examsByTerm = exams.reduce((acc, exam) => {
    if (!acc[exam.term]) {
      acc[exam.term] = [];
    }
    acc[exam.term].push(exam);
    return acc;
  }, {} as Record<number, Exam[]>);

  if (examsLoading) {
    return (
      <div className="exams-container">
        <div className="exams-loading">Loading exam data...</div>
      </div>
    );
  }

  return (
    <div className="exams-container">
      <Toaster richColors position="top-center" />
      
      {showExamForm && (
        <ExamForm 
          onSuccess={handleAddExamSuccess}
          onCancel={() => setShowExamForm(false)} 
        />
      )}
      
      <div className="exams-header">
        <h1>Examination Management</h1>
        <p>Manage and monitor exam progress across all classes</p>
        <button 
          className="add-exam-btn"
          onClick={() => setShowExamForm(true)}
        >
          + Add New Exam
        </button>
      </div>

      {/* Exam Selector Dropdown */}
      <div className="exam-selector-card">
        <div className="exam-selector-header">
          <h2>Select Examination ({currentYear})</h2>
        </div>
        <div className="exam-selector-content">
          <div className="exam-dropdown">
            <label htmlFor="exam-select">Choose an exam:</label>
            <div className="dropdown-container">
              <select
                id="exam-select"
                value={selectedExam?.exam_id || ''}
                onChange={(e) => {
                  const exam = exams.find(ex => ex.exam_id === e.target.value);
                  if (exam) setSelectedExam(exam);
                }}
                className="exam-dropdown-select"
              >
                {Object.entries(examsByTerm).map(([term, termExams]) => (
                  <optgroup key={term} label={`Term ${term} (${currentYear})`}>
                    {termExams.map((exam) => (
                      <option key={exam.exam_id} value={exam.exam_id}>
                        {exam.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {selectedExam && (
            <div className="selected-exam-details">
              <div className="exam-detail">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{formatDate(selectedExam.date)}</span>
              </div>
              <div className="exam-detail">
                <span className="detail-label">Term:</span>
                <span className="detail-value">Term {selectedExam.term}</span>
              </div>
              <div className="exam-detail">
                <span className="detail-label">Year:</span>
                <span className="detail-value">{selectedExam.year}</span>
              </div>
              <div className="exam-detail">
                <span className="detail-label">Status:</span>
                <span className={`status-badge ${selectedExam.status}`}>
                  {selectedExam.status.charAt(0).toUpperCase() + selectedExam.status.slice(1)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Class Exams Table - Only show if an exam is selected */}
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
                    <td>
                      <span className={`status-indicator ${classExam.status}`}>
                        {classExam.status.charAt(0).toUpperCase() + classExam.status.slice(1)}
                      </span>
                    </td>
                    <td>{getStatusButton(classExam)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;
