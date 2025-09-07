// features/Upload/Upload.tsx
import React, { useState, useEffect } from 'react';
import './fileupload.css';

interface UploadProps {
  streamName: string;
  examId: number;
  onBack: () => void;
}

interface Student {
  id: number;
  name: string;
  admissionNumber: string;
}

interface StudentResult extends Student {
  marks: string;
}

const Upload: React.FC<UploadProps> = ({ streamName, examId, onBack }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [outOfMarks, setOutOfMarks] = useState<string>('');
  const [students, setStudents] = useState<StudentResult[]>([]);
  const [activeTab, setActiveTab] = useState<'manual' | 'file'>('manual');

  // Dummy student data (simulating database fetch)
  const dummyStudents: Student[] = [
    { id: 1, name: 'John Kamau', admissionNumber: 'ST001' },
    { id: 2, name: 'Mary Wanjiku', admissionNumber: 'ST002' },
    { id: 3, name: 'James Ochieng', admissionNumber: 'ST003' },
    { id: 4, name: 'Grace Achieng', admissionNumber: 'ST004' },
    { id: 5, name: 'Peter Mwangi', admissionNumber: 'ST005' },
    { id: 6, name: 'Sarah Njeri', admissionNumber: 'ST006' },
    { id: 7, name: 'David Otieno', admissionNumber: 'ST007' },
    { id: 8, name: 'Esther Wambui', admissionNumber: 'ST008' },
    { id: 9, name: 'Michael Njoroge', admissionNumber: 'ST009' },
    { id: 10, name: 'Lilian Atieno', admissionNumber: 'ST010' }
  ];

  useEffect(() => {
    // Initialize students with marks field
    const initialStudents = dummyStudents.map(student => ({
      ...student,
      marks: ''
    }));
    setStudents(initialStudents);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);

    // Calculate percentages
    const resultsWithPercentages = students.map(student => {
      const marksNum = parseFloat(student.marks);
      const outOfNum = parseFloat(outOfMarks);
      const percentage = outOfNum > 0 ? (marksNum / outOfNum) * 100 : 0;
      
      return {
        ...student,
        percentage: !isNaN(percentage) ? percentage.toFixed(2) : '0.00'
      };
    });

    // Example: Log examId for reference (can be used for backend API)
    console.log(`Uploading results for examId: ${examId}, stream: ${streamName}`, {
      outOfMarks,
      students: resultsWithPercentages,
      files
    });

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setFiles([]);
          alert(`Results uploaded successfully for ${streamName} (Exam ID: ${examId})`);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleMarksChange = (id: number, value: string) => {
    const updatedStudents = students.map(student => 
      student.id === id ? { ...student, marks: value } : student
    );
    setStudents(updatedStudents);
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <button className="back-button" onClick={onBack}>
          &larr; Back to Exams
        </button>
        <h1>Upload Exam Results</h1>
        <p>Upload exam results for {streamName} (Exam ID: {examId})</p>
      </div>

      <div className="upload-card">
        <div className="upload-instructions">
          <h3>Upload Instructions</h3>
          <ul>
            <li>You can manually enter student marks or upload a file</li>
            <li>Accepted file formats: CSV and Excel files</li>
            <li>Maximum file size: 10MB per file</li>
          </ul>
        </div>

        <div className="upload-tabs">
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
                placeholder="Enter total marks"
                min="0"
              />
            </div>

            <div className="students-table-container">
              <h4>Student Results:</h4>
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
                    const marksNum = parseFloat(student.marks);
                    const outOfNum = parseFloat(outOfMarks);
                    const percentage = outOfNum > 0 ? (marksNum / outOfNum) * 100 : 0;
                    
                    return (
                      <tr key={student.id}>
                        <td>{index + 1}</td>
                        <td>{student.name}</td>
                        <td>{student.admissionNumber}</td>
                        <td>
                          <input
                            type="number"
                            value={student.marks}
                            onChange={(e) => handleMarksChange(student.id, e.target.value)}
                            min="0"
                            max={outOfMarks || undefined}
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
              </label>
            </div>

            {files.length > 0 && (
              <div className="file-list">
                <h4>Selected Files:</h4>
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
          onClick={handleUpload}
          disabled={
            (activeTab === 'manual' && (!outOfMarks || students.some(s => s.marks === ''))) ||
            (activeTab === 'file' && files.length === 0) ||
            isUploading
          }
        >
          {isUploading ? 'Uploading...' : 'Submit Results'}
        </button>
      </div>
    </div>
  );
};

export default Upload;