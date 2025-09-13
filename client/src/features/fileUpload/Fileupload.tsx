import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import './fileupload.css';

interface FileuploadProps {
  className: string;
  classId: string;
  examId: string;
  subjectId: string;
  subjectName: string;
  streamName: string;
  onBack: () => void;
}

interface ExamResult {
  marks: number;
  percentage: number | null;
  exam_id: string;
  subject_id: string;
}

interface Student {
  student_adm_no: string;
  students_name: string;
  class_id: string;
  kcse_entry: number;
  class: {
    class_id: string;
    class_level: number;
    class_stream: string;
  };
  subjects: Array<{
    subject_id: string;
    student_adm_no: string;
    subject: {
      subject_id: string;
      subject_name: string;
    };
  }>;
  results: ExamResult[];
}

interface StudentResult extends Student {
  marks: string;
  percentage?: string;
}

interface ManualUploadResult {
  student_adm_no: string;
  marks: number;
  percentage: number;
}

const Fileupload: React.FC<FileuploadProps> = ({
  className,
  classId,
  examId,
  subjectId,
  subjectName,
  streamName,
  onBack
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [outOfMarks, setOutOfMarks] = useState<string>('');
  const [students, setStudents] = useState<StudentResult[]>([]);
  const [activeTab, setActiveTab] = useState<'manual' | 'file'>('manual');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  // Fetch students by class, subject, stream, and exam
  const { data: studentsData = [], isLoading: studentsLoading, refetch: refetchStudents } = useQuery<Student[]>({
    queryKey: ['students', classId, subjectId, streamName, examId],
    queryFn: async (): Promise<Student[]> => {
      const params = new URLSearchParams({
        class_id: classId,
        subject_id: subjectId,
        stream_name: streamName,
        exam_id: examId
      });

      const response = await fetch(
        `${apiUrl}/api/student/fetch-students-by-class-subject?${params}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    },
    enabled: !!classId && !!subjectId && !!streamName && !!examId,
    staleTime: 5 * 60 * 1000,
  });

  // Initialize students with marks field when data is fetched
  useEffect(() => {
    if (studentsData.length > 0) {
      const initialStudents = studentsData.map(student => {
        const existingResult = student.results.find(result => 
          result.exam_id === examId && result.subject_id === subjectId
        );

        return {
          ...student,
          marks: existingResult ? existingResult.marks.toString() : '',
          percentage: existingResult?.percentage ? existingResult.percentage.toString() : undefined
        };
      });
      setStudents(initialStudents);
      
      if (studentsData[0]?.results[0]?.marks) {
        const maxMarks = Math.max(...studentsData
          .map(s => s.results.find(r => r.exam_id === examId && r.subject_id === subjectId)?.marks || 0)
          .filter(marks => marks > 0)
        );
        if (maxMarks > 0) {
          setOutOfMarks(maxMarks.toString());
        }
      }
    }
  }, [studentsData, examId, subjectId]);

  // Effect to navigate back after successful upload
  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => {
        onBack();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess, onBack]);

  // Mutation for uploading manual results - sets status to publish
  const uploadManualResultsMutation = useMutation({
    mutationFn: async (resultsData: {
      exam_id: string;
      class_id: string;
      subject_id: string;
      out_of: number;
      results: ManualUploadResult[];
    }) => {
      const response = await fetch(`${apiUrl}/api/results/bulk-update-results`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exam_id: resultsData.exam_id,
          class_id: resultsData.class_id,
          subject_id: resultsData.subject_id,
          updates: resultsData.results,
          publish: true
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setIsUploading(false);
      setUploadProgress(100);
      setUploadSuccess(true);
      
      toast.success('Results published successfully!', {
        description: 'Results have been saved and published',
        duration: 5000,
      });
      
      setTimeout(() => {
        refetchStudents();
      }, 1000);
    },
    onError: (error: Error) => {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadSuccess(false);
      
      toast.error('Upload failed', {
        description: error.message,
        duration: 5000,
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleManualUpload = async () => {
    if (!outOfMarks || students.some(s => s.marks === '')) {
      toast.error('Validation Error', {
        description: 'Please fill out all marks and set "Out of Marks" value',
        duration: 5000,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Calculate percentages and prepare results
      const results: ManualUploadResult[] = students.map(student => {
        const marksNum = parseFloat(student.marks) || 0;
        const outOfNum = parseFloat(outOfMarks) || 100;
        const percentage = outOfNum > 0 ? (marksNum / outOfNum) * 100 : 0;
        
        return {
          student_adm_no: student.student_adm_no,
          marks: marksNum,
          percentage: percentage
        };
      });

      // Prepare data for API call
      const uploadData = {
        exam_id: examId,
        class_id: classId,
        subject_id: subjectId,
        out_of: parseFloat(outOfMarks) || 100,
        results: results
      };

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Execute the mutation
      uploadManualResultsMutation.mutate(uploadData);
      
      // Clear the progress interval when mutation completes
      setTimeout(() => clearInterval(progressInterval), 10000);

    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadProgress(0);
      toast.error('Upload failed', {
        description: 'An unexpected error occurred',
        duration: 5000,
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleMarksChange = (admissionNumber: string, value: string) => {
    // Allow only numbers and empty string
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      const updatedStudents = students.map(student => 
        student.student_adm_no === admissionNumber ? { ...student, marks: value } : student
      );
      setStudents(updatedStudents);
    }
  };

  if (studentsLoading) {
    return (
      <div className="fileupload-container">
        <div className="fileupload-loading">Loading student data for {subjectName}...</div>
      </div>
    );
  }

  return (
    <div className="fileupload-container">
      <div className="fileupload-header">
        <button className="back-button" onClick={onBack}>
          &larr; Back to Exams
        </button>
        <h1>Upload Exam Results</h1>
        <p>
          Upload results for <strong>{className} - {streamName}</strong> | 
          <strong> {subjectName}</strong> (Subject ID: {subjectId}) | 
          Exam ID: {examId}
        </p>
      </div>

      <div className="fileupload-card">
        <div className="fileupload-instructions">
          <h3>Upload Instructions</h3>
          <ul>
            <li>You can manually enter student marks or upload a file</li>
            <li>Accepted file formats: CSV and Excel files</li>
            <li>Maximum file size: 10MB per file</li>
            <li><strong>Subject:</strong> {subjectName} (ID: {subjectId})</li>
            <li><strong>Exam:</strong> ID: {examId}</li>
          </ul>
        </div>

        <div className="fileupload-tabs">
          <button 
            className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            Manual Entry
          </button>
          <button 
            className={`tab-button ${activeTab === 'file' ? 'active' : ''}`}
            onClick={() => setActiveTab('file')}
          >
            Upload File
          </button>
        </div>

        {activeTab === 'manual' ? (
          <div className="manual-entry">
            <div className="out-of-marks">
              <label htmlFor="out-of-marks">Out of Marks:</label>
              <input
                type="number"
                id="out-of-marks"
                value={outOfMarks}
                onChange={(e) => setOutOfMarks(e.target.value)}
                placeholder="Enter total marks (e.g., 100)"
                min="0"
                step="0.5"
                className="out-of-marks-input"
              />
            </div>

            <div className="students-table-container">
              <h4>Student Results for {subjectName}:</h4>
              <table className="students-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student Name</th>
                    <th>Admission No.</th>
                    <th>Marks</th>
                    {outOfMarks && <th>Percentage</th>}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => {
                    const marksNum = parseFloat(student.marks) || 0;
                    const outOfNum = parseFloat(outOfMarks) || 100;
                    const percentage = outOfNum > 0 ? (marksNum / outOfNum) * 100 : 0;
                    
                    return (
                      <tr key={student.student_adm_no}>
                        <td>{index + 1}</td>
                        <td>{student.students_name}</td>
                        <td>{student.student_adm_no}</td>
                        <td>
                          <input
                            type="number"
                            value={student.marks}
                            onChange={(e) => handleMarksChange(student.student_adm_no, e.target.value)}
                            min="0"
                            max={outOfMarks || undefined}
                            step="0.5"
                            className="marks-input"
                            placeholder="Enter marks"
                          />
                        </td>
                        {outOfMarks && (
                          <td className="percentage-cell">
                            {!isNaN(percentage) ? percentage.toFixed(2) + '%' : '-'}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="file-upload-area">
            <div className="drop-zone">
              <input
                type="file"
                id="file-upload"
                multiple
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="file-upload" className="drop-label">
                <div className="upload-icon">📁</div>
                <p>Drag & drop files here or click to browse</p>
                <span className="file-types">CSV, XLSX, XLS</span>
                <span className="exam-info">Subject: {subjectName} (ID: {subjectId})</span>
                <span className="exam-info">Exam ID: {examId}</span>
              </label>
            </div>

            {files.length > 0 && (
              <div className="file-list">
                <h4>Selected Files for {subjectName}:</h4>
                {files.map((file, index) => (
                  <div key={index} className="file-item">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    <button 
                      className="remove-file"
                      onClick={() => removeFile(index)}
                      aria-label={`Remove ${file.name}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {isUploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <span className="progress-text">{uploadProgress}%</span>
          </div>
        )}

        <button 
          className="upload-button"
          onClick={activeTab === 'manual' ? handleManualUpload : () => {}}
          disabled={
            (activeTab === 'manual' && (!outOfMarks || students.some(s => s.marks === ''))) ||
            (activeTab === 'file' && files.length === 0) ||
            isUploading
          }
        >
          {isUploading ? 'Uploading...' : `Publish ${subjectName} Results`}
        </button>

        {!isUploading && students.some(s => s.marks !== '') && (
          <div className="upload-summary">
            <h4>Summary:</h4>
            <p>
              {students.filter(s => s.marks !== '').length} of {students.length} students have marks entered
            </p>
            <p className="publish-notice">
              ⚠️ Clicking "Publish Results" will make these results visible to students and parents.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Fileupload;