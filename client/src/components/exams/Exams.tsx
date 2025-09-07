// features/Exams/Exams.tsx
import React, { useState, useEffect } from 'react';
import './exams.css';

interface Exam {
  id: number;
  name: string;
  date: string;
  streams: number;
  status: 'upcoming' | 'ongoing' | 'completed';
}

interface StreamExam {
  id: number;
  name: string;
  status: 'upload' | 'review' | 'published' | 'archived';
}

interface ExamsProps {
  onUploadClick: (streamName: string, examId: number) => void;
}

const Exams: React.FC<ExamsProps> = ({ onUploadClick }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [streamExams, setStreamExams] = useState<StreamExam[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching data
  useEffect(() => {
    const fetchExamData = () => {
      setTimeout(() => {
        const examData: Exam[] = [
          { id: 1, name: 'End of Term 2 Examinations', date: '2023-11-15', streams: 12, status: 'upcoming' },
          { id: 2, name: 'Mid Term 2 Examinations', date: '2023-09-20', streams: 12, status: 'completed' },
          { id: 3, name: 'End of Term 1 Examinations', date: '2023-06-30', streams: 12, status: 'completed' }
        ];
        setExams(examData);
        setSelectedExam(examData[0]);

        const streamData: StreamExam[] = [
          { id: 1, name: 'Form 1 East', status: 'upload' },
          { id: 2, name: 'Form 1 West', status: 'upload' },
          { id: 3, name: 'Form 2 North', status: 'review' },
          { id: 4, name: 'Form 2 South', status: 'upload' },
          { id: 5, name: 'Form 3 Alpha', status: 'published' },
          { id: 6, name: 'Form 3 Beta', status: 'upload' },
          { id: 7, name: 'Form 4 Red', status: 'archived' },
          { id: 8, name: 'Form 4 Blue', status: 'upload' }
        ];
        setStreamExams(streamData);
        setLoading(false);
      }, 800);
    };

    fetchExamData();
  }, []);

  const handleStatusChange = (id: number, newStatus: StreamExam['status']) => {
    setStreamExams(prev =>
      prev.map(stream => (stream.id === id ? { ...stream, status: newStatus } : stream))
    );
  };

  const handleUploadClick = (streamName: string) => {
    if (selectedExam) onUploadClick(streamName, selectedExam.id);
  };

  // Centralized status configuration
  const statusConfig: Record<
    StreamExam['status'],
    { label: string; color: string; action: (stream: StreamExam) => void }
  > = {
    upload: { label: 'Upload', color: '#4361ee', action: (stream) => handleUploadClick(stream.name) },
    review: { label: 'Under Review', color: '#f9c74f', action: (stream) => handleStatusChange(stream.id, 'published') },
    published: { label: 'Published', color: '#2a9d8f', action: (stream) => handleStatusChange(stream.id, 'archived') },
    archived: { label: 'Archived', color: '#6c757d', action: (stream) => handleStatusChange(stream.id, 'upload') }
  };

  const getStatusButton = (stream: StreamExam) => {
    const config = statusConfig[stream.status];
    return (
      <button className="status-btn" style={{ backgroundColor: config.color }} onClick={() => config.action(stream)}>
        {config.label}
      </button>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="exams-container">
        <div className="exams-loading">Loading exam data...</div>
      </div>
    );
  }

  return (
    <div className="exams-container">
      <div className="exams-header">
        <h1>Examination Management</h1>
        <p>Manage and monitor exam progress across all streams</p>
      </div>

      <div className="exam-selector-card">
        <div className="exam-selector-header">
          <h2>Select Examination</h2>
        </div>
        <div className="exam-selector-content">
          <div className="exam-dropdown">
            <label htmlFor="exam-select">Choose an exam:</label>
            <select
              id="exam-select"
              value={selectedExam?.id || ''}
              onChange={e => {
                const examId = parseInt(e.target.value);
                const exam = exams.find(ex => ex.id === examId);
                if (exam) setSelectedExam(exam);
              }}
            >
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} ({formatDate(exam.date)})
                </option>
              ))}
            </select>
          </div>

          {selectedExam && (
            <div className="selected-exam-details">
              <div className="exam-detail">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{formatDate(selectedExam.date)}</span>
              </div>
              <div className="exam-detail">
                <span className="detail-label">Streams:</span>
                <span className="detail-value">{selectedExam.streams}</span>
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

      <div className="stream-exams-section">
        <h2>Stream Exam Status - {selectedExam?.name}</h2>
        <div className="stream-exams-table-container">
          <table className="stream-exams-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name of Stream</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {streamExams.map((stream, index) => (
                <tr key={stream.id}>
                  <td>{index + 1}</td>
                  <td>{stream.name}</td>
                  <td>
                    <span className={`status-indicator ${stream.status}`}>
                      {stream.status.charAt(0).toUpperCase() + stream.status.slice(1)}
                    </span>
                  </td>
                  <td>{getStatusButton(stream)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Exams;
