// features/Teachers/TeacherAssignmentForm.tsx
import React, { useState } from 'react';
import type { Teacher } from './Teachers';
import './teachersassignment.css';

interface TeacherAssignmentFormProps {
  teachers: Teacher[];
  onAssign: (teacherId: number, subjects: string[], streams: string[]) => void;
}

const TeacherAssignmentForm: React.FC<TeacherAssignmentFormProps> = ({ teachers, onAssign }) => {
  const [selectedTeacher, setSelectedTeacher] = useState<number>(0);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedStreams, setSelectedStreams] = useState<string[]>([]);

  const subjects = [
    'Mathematics', 'English', 'Kiswahili', 'Physics', 'Chemistry', 'Biology',
    'History', 'Geography', 'Business Studies', 'Computer Studies', 
    'Religion', 'Agriculture'
  ];

  const streams = [
    'Form 2 East', 'Form 2 West', 'Form 2 North', 'Form 2 South',
    'Form 3 East', 'Form 3 West', 'Form 3 North', 'Form 3 St. Jerome',
    'Form 4 East', 'Form 4 West', 'Form 4 North',
    'Form 2 All', 'Form 3 All', 'Form 4 All', 'All Forms', 'School Wide'
  ];

  const handleTeacherChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const teacherId = parseInt(e.target.value);
    setSelectedTeacher(teacherId);
    
    // Pre-fill current assignments if teacher has them
    if (teacherId > 0) {
      const teacher = teachers.find(t => t.id === teacherId);
      if (teacher) {
        setSelectedSubjects(teacher.subjects);
        setSelectedStreams(teacher.streams);
      }
    } else {
      setSelectedSubjects([]);
      setSelectedStreams([]);
    }
  };

  const handleSubjectChange = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleStreamChange = (stream: string) => {
    setSelectedStreams(prev => 
      prev.includes(stream)
        ? prev.filter(s => s !== stream)
        : [...prev, stream]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTeacher > 0) {
      onAssign(selectedTeacher, selectedSubjects, selectedStreams);
      setSelectedSubjects([]);
      setSelectedStreams([]);
      setSelectedTeacher(0);
    }
  };

  return (
    <form className="teacher-assignment-form" onSubmit={handleSubmit}>
      <div className="assignment-form-group">
        <label htmlFor="teacher-select" className="assignment-form-label">Select Teacher:</label>
        <select
          id="teacher-select"
          value={selectedTeacher}
          onChange={handleTeacherChange}
          className="assignment-form-select"
          required
        >
          <option value={0}>Choose a teacher</option>
          {teachers.map(teacher => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name} ({teacher.role})
            </option>
          ))}
        </select>
      </div>

      {selectedTeacher > 0 && (
        <>
          <div className="assignment-form-group">
            <label className="assignment-form-label">Subjects:</label>
            <div className="assignment-checkbox-group">
              {subjects.map(subject => (
                <label key={subject} className="assignment-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject)}
                    onChange={() => handleSubjectChange(subject)}
                    className="assignment-checkbox"
                  />
                  {subject}
                </label>
              ))}
            </div>
          </div>

          <div className="assignment-form-group">
            <label className="assignment-form-label">Streams/Classes:</label>
            <div className="assignment-checkbox-group">
              {streams.map(stream => (
                <label key={stream} className="assignment-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedStreams.includes(stream)}
                    onChange={() => handleStreamChange(stream)}
                    className="assignment-checkbox"
                  />
                  {stream}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="assignment-form-submit">
            Assign Subjects & Streams
          </button>
        </>
      )}
    </form>
  );
};

export default TeacherAssignmentForm;