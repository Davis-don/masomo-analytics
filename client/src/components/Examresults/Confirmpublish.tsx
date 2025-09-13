import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast, Toaster } from 'sonner';
import './publishconfirm.css';

interface StudentResult {
  result_id: string;
  student_adm_no: string;
  marks: number | null;
  percentage: number | null;
  grade: string | null;
  student: {
    student_adm_no: string;
    student_name: string;
    admission_number: string;
  };
}

interface ConfirmPublishProps {
  className: string;
  classId: string;
  examId: string;
  subjectId: string;
  subjectName: string;
  streamName: string;
  onBack: () => void;
}

interface PercentageCalculator {
  marks: string;
  outOf: string;
  result: string;
}

const ConfirmPublish: React.FC<ConfirmPublishProps> = ({
  className,
  classId,
  examId,
  subjectId,
  subjectName,
  streamName,
  onBack
}) => {
  const [editedResults, setEditedResults] = useState<Record<string, { marks: string; percentage: string }>>({});
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculator, setCalculator] = useState<PercentageCalculator>({
    marks: '',
    outOf: '100',
    result: ''
  });
  const [hasInitialized, setHasInitialized] = useState(false);
  const [classExamStatus, setClassExamStatus] = useState<string>('upload');

  const baseUrl = import.meta.env.VITE_API_URL || '';

  // Fetch results and ClassExam status
  const { data: resultsData, isLoading, error } = useQuery({
    queryKey: ['exam-results', classId, examId, subjectId],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/api/results/results-for-editing?class_id=${classId}&exam_id=${examId}&subject_id=${subjectId}`);
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('text/html')) {
        await res.text();
        throw new Error('Server returned HTML instead of JSON.');
      }
      if (!res.ok) throw new Error('Failed to fetch results');
      return res.json();
    },
    enabled: !!classId && !!examId && !!subjectId
  });

  // Memoize results
  const results: StudentResult[] = useMemo(() => resultsData?.results || [], [resultsData]);

  // Initialize edited results
  useEffect(() => {
    if (results.length > 0 && !hasInitialized && Object.keys(editedResults).length === 0) {
      const initialEditedResults: Record<string, { marks: string; percentage: string }> = {};
      results.forEach(result => {
        initialEditedResults[result.student_adm_no] = {
          marks: result.marks?.toString() || '',
          percentage: result.percentage?.toString() || ''
        };
      });
      setEditedResults(initialEditedResults);
      setHasInitialized(true);

      // Set ClassExam status
      if (resultsData?.metadata?.classExamStatus) setClassExamStatus(resultsData.metadata.classExamStatus);
    }
  }, [results, hasInitialized, editedResults, resultsData]);

  // Update mutation - uses the new edit endpoint that sets status to analyse
  const updateMutation = useMutation({
    mutationFn: async ({ updates, publish }: { updates: any[]; publish: boolean }) => {
      const res = await fetch(`${baseUrl}/api/results/bulk-update-results-edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam_id: examId, subject_id: subjectId, class_id: classId, out_of: 100, updates, publish })
      });
      const contentType = res.headers.get('content-type');
      if (contentType?.includes('text/html')) {
        await res.text();
        throw new Error('Server returned HTML instead of JSON.');
      }
      if (!res.ok) throw new Error('Failed to update results');
      return res.json();
    }
  });

  const handleMarksChange = (studentAdmNo: string, field: 'marks' | 'percentage', value: string) => {
    setEditedResults(prev => ({
      ...prev,
      [studentAdmNo]: { ...prev[studentAdmNo], [field]: value }
    }));

    if (field === 'marks' && value) {
      const numericValue = parseFloat(value);
      if (!isNaN(numericValue)) {
        const percentageValue = ((numericValue / 100) * 100).toFixed(2);
        setEditedResults(prev => ({
          ...prev,
          [studentAdmNo]: { ...prev[studentAdmNo], percentage: percentageValue }
        }));
      }
    }
  };

  const calculatePercentage = () => {
    const marks = parseFloat(calculator.marks);
    const outOf = parseFloat(calculator.outOf) || 100;
    if (!isNaN(marks) && !isNaN(outOf) && outOf > 0) {
      const percentage = ((marks / outOf) * 100).toFixed(2);
      setCalculator(prev => ({ ...prev, result: percentage }));
    } else setCalculator(prev => ({ ...prev, result: '' }));
  };

  const useCalculatorResult = () => {
    if (calculator.result) {
      toast.success(`Percentage: ${calculator.result}% (copy manually)`);
    }
  };

  const handleSaveResults = async () => {
    const updates = Object.entries(editedResults).map(([student_adm_no, data]) => ({
      student_adm_no,
      marks: data.marks ? parseFloat(data.marks) : null,
      percentage: data.percentage ? parseFloat(data.percentage) : null
    }));

    try {
      await updateMutation.mutateAsync({ updates, publish: false });
      toast.success('Results saved successfully!');
    } catch (error) {
      console.error('Failed to save results:', error);
      toast.error('Failed to save results. Please try again.');
    }
  };

  const handlePublish = async () => {
    const updates = Object.entries(editedResults).map(([student_adm_no, data]) => ({
      student_adm_no,
      marks: data.marks ? parseFloat(data.marks) : null,
      percentage: data.percentage ? parseFloat(data.percentage) : null
    }));

    try {
      await updateMutation.mutateAsync({ updates, publish: true });
      setClassExamStatus('analyse'); // change status locally
      toast.success('Results published for analysis!');
    } catch (error) {
      console.error('Failed to publish:', error);
      toast.error('Failed to publish results. Please try again.');
    }
  };

  if (isLoading) return <div className="exams-container"><div className="loading">Loading student results...</div></div>;
  if (error) return (
    <div className="exams-container">
      <div className="error">Error loading results: {(error as Error).message}</div>
      <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
    </div>
  );

  return (
    <div className="exams-container">
      <Toaster richColors position="top-right" />
      <div className="publish-confirmation">
        <h1>Confirm Publication</h1>
        <div className="publish-details">
          <h2>Exam Details</h2>
          <div className="detail-card">
            <div className="detail-row"><span className="detail-label">Class Name:</span><span className="detail-value">{className}</span></div>
            <div className="detail-row"><span className="detail-label">Subject:</span><span className="detail-value">{subjectName}</span></div>
            <div className="detail-row"><span className="detail-label">Stream:</span><span className={`detail-value ${classExamStatus==='analyse' ? 'status-analyse' : ''}`}>{streamName || 'N/A'} | Status: {classExamStatus}</span></div>
            <div className="detail-row"><span className="detail-label">Total Students:</span><span className="detail-value">{results.length}</span></div>
          </div>
        </div>

        {/* Calculator */}
        <div className="calculator-section">
          <button onClick={() => setShowCalculator(!showCalculator)} className="calculator-toggle">
            {showCalculator ? 'Hide' : 'Show'} Percentage Calculator
          </button>
          {showCalculator && (
            <div className="calculator-card">
              <h3>Percentage Calculator</h3>
              <div className="calculator-inputs">
                <div className="input-group"><label>Marks Obtained:</label>
                  <input type="number" value={calculator.marks} onChange={(e) => setCalculator(prev => ({ ...prev, marks: e.target.value }))} placeholder="Enter marks" />
                </div>
                <div className="input-group"><label>Out Of:</label>
                  <input type="number" value={calculator.outOf} onChange={(e) => setCalculator(prev => ({ ...prev, outOf: e.target.value }))} placeholder="100" />
                </div>
                <button onClick={calculatePercentage} className="calculate-btn">Calculate</button>
              </div>
              {calculator.result && (
                <div className="calculator-result">
                  <span>Percentage: {calculator.result}%</span>
                  <button onClick={useCalculatorResult} className="use-result-btn">Copy Result</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Table */}
        <div className="results-table-section">
          <h2>Student Results for {subjectName}</h2>
          <p className="table-info">Edit marks below. Percentage will be auto-calculated (out of 100).</p>
          <div className="table-container">
            <table className="results-table">
              <thead><tr><th>#</th><th>Admission Number</th><th>Student Name</th><th>Marks (/100)</th><th>Percentage</th></tr></thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={result.result_id}>
                    <td>{index + 1}</td>
                    <td>{result.student.admission_number || result.student.student_adm_no}</td>
                    <td>{result.student.student_name}</td>
                    <td><input type="number" min="0" max="100" step="0.01" value={editedResults[result.student_adm_no]?.marks || ''} onChange={(e) => handleMarksChange(result.student_adm_no, 'marks', e.target.value)} className="marks-input" /></td>
                    <td><input type="number" min="0" max="100" step="0.01" value={editedResults[result.student_adm_no]?.percentage || ''} readOnly className="percentage-input" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="warning-section">
          <h3>⚠️ Important Notice</h3>
          <p>Once published, these results will be sent for analysis before being visible to students and parents.</p>
          <p>• Marks are out of 100</p>
          <p>• Percentage is auto-calculated</p>
          <p>• Save changes before publishing for analysis</p>
        </div>

        <div className="action-buttons">
          <button onClick={onBack} className="cancel-publish-btn">Cancel</button>
          <button onClick={handleSaveResults} className="save-results-btn" disabled={updateMutation.isPending}>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</button>
          <button onClick={handlePublish} className="confirm-publish-btn" disabled={updateMutation.isPending}>{updateMutation.isPending ? 'Publishing...' : 'Publish for Analysis'}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPublish;