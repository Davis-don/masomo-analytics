import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const client = new PrismaClient();

// --------------------
// Add a new student
// --------------------
router.post('/add-student', async (req, res) => {
  const { student_adm_no, students_name, kcse_entry, class_id, subject_ids } = req.body;

  if (!student_adm_no || !students_name || typeof kcse_entry !== 'number' || !class_id) {
    return res.status(400).json({
      message: 'student_adm_no, students_name, class_id are required, kcse_entry must be a number.',
    });
  }

  if (!Array.isArray(subject_ids) || subject_ids.length === 0) {
    return res.status(400).json({
      message: 'At least one subject_id is required.'
    });
  }

  try {
    // Create student
    const newStudent = await client.student.create({
      data: {
        student_adm_no,
        students_name,
        kcse_entry,
        class_id,
      },
    });

    // Create entries in StudentSubject join table
    await client.studentSubject.createMany({
      data: subject_ids.map((sid) => ({
        student_adm_no,
        subject_id: sid
      })),
      skipDuplicates: true
    });

    res.status(201).json({
      message: 'Student and subjects added successfully!',
      student: newStudent,
    });
  } catch (error) {
    console.error('Error adding student:', error);

    if (error.code === 'P2003') {
      return res.status(400).json({ message: 'Invalid class_id or subject_id. Foreign key does not exist.' });
    }

    res.status(500).json({ message: 'Failed to add student.', error: error.message });
  }
});




// --------------------
// Fetch all students
// --------------------
router.get('/fetch-all-students', async (req, res) => {
  try {
    const students = await client.student.findMany({
      include: {
        class: true, // fetch related class data
      },
    });

    res.status(200).json(students.length ? students : []);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      message: 'Failed to fetch students.',
      error: error.message,
    });
  }
});

// --------------------
// Delete a student by admission number
// --------------------
router.delete('/delete-student-by-adm', async (req, res) => {
  const student_adm_no = req.query.student_adm_no;

  if (!student_adm_no) {
    return res.status(400).json({ message: 'student_adm_no is required.' });
  }

  try {
    const deletedStudent = await client.student.delete({
      where: { student_adm_no },
    });

    res.json({
      message: 'Student deleted successfully!',
      student: deletedStudent,
    });
  } catch (error) {
    console.error('Error deleting student:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Student not found or already deleted.' });
    }

    res.status(500).json({ message: 'Failed to delete student.', error: error.message });
  }
});


// --------------------
// Fetch students by class_id (stream ID)
// --------------------
router.get('/fetch-students-by-class', async (req, res) => {
  const { class_id } = req.query;

  if (!class_id) {
    return res.status(400).json({ message: 'class_id (stream ID) is required.' });
  }

  try {
    const students = await client.student.findMany({
      where: { class_id: String(class_id) },
      include: { class: true }, // include class info
    });

    res.status(200).json(students.length ? students : []);
  } catch (error) {
    console.error('Error fetching students by class_id:', error);
    res.status(500).json({
      message: 'Failed to fetch students by class_id.',
      error: error.message,
    });
  }
});



router.get('/fetch-students-by-subject', async (req, res) => {
  try {
    let { subject_id } = req.query;

    subject_id = subject_id?.trim();
    if (!subject_id) {
      return res.status(400).json({ message: 'subject_id is required.' });
    }

    // ✅ Get all students who are enrolled in this subject via StudentSubject join table
    const students = await client.student.findMany({
      where: {
        subjects: {
          some: { subject_id } // <---- StudentSubject relation check
        }
      },
      include: {
        class: true, // get class details
        subjects: {
          where: { subject_id },
          include: { subject: true } // get subject details from Subject table
        }
      },
      orderBy: { student_adm_no: 'asc' }
    });

    console.log(`Fetched ${students.length} students for subject_id ${subject_id}`);

    return res.status(200).json(students.length ? students : []);
  } catch (error) {
    console.error('Error fetching students by subject:', error);
    res.status(500).json({
      message: 'Failed to fetch students by subject.',
      error: error.message
    });
  }
});




// --------------------
router.get('/fetch-students-by-class-subject', async (req, res) => {
  try {
    let { class_id, subject_id, exam_id, stream_name } = req.query;

    class_id = class_id?.trim();
    subject_id = subject_id?.trim();
    exam_id = exam_id?.trim();
    stream_name = stream_name?.trim();

    console.log("Incoming query:", { class_id, subject_id, exam_id, stream_name });

    if (!class_id || !subject_id || !exam_id) {
      return res.status(400).json({
        message: 'class_id, subject_id, and exam_id are required.'
      });
    }

    // Fetch only students in class who are enrolled in the given subject
    const students = await client.student.findMany({
      where: {
        class_id,
        subjects: {
          some: { subject_id }   // ✅ ensures enrollment in subject from StudentSubject table
        }
      },
      include: {
        class: true,
        subjects: {
          where: { subject_id },
          include: { subject: true }
        },
        results: {
          where: {
            exam_id,
            subject_id
          },
          select: {
            marks: true,
            grade: true,
            percentage: true,
            exam_id: true,
            subject_id: true
          }
        }
      },
      orderBy: { student_adm_no: 'asc' }
    });

    console.log("Fetched students in class + subject:", students.length);

    // Optional stream filter
    const filteredByStream = stream_name
      ? students.filter(s => s.class.class_stream === stream_name)
      : students;

    console.log("After stream filter:", filteredByStream.length);

    return res.status(200).json(filteredByStream);

  } catch (error) {
    console.error('Error fetching students by class, subject, stream, exam:', error);
    res.status(500).json({
      message: 'Failed to fetch students.',
      error: error.message
    });
  }
});





export default router;

