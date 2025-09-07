import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const client = new PrismaClient();

// --------------------
// Add a new student
// --------------------
router.post('/add-student', async (req, res) => {
  // Check if req.body exists
  if (!req.body) {
    return res.status(400).json({ message: 'Request body is missing.' });
  }

  // Destructure fields including class_id
  const { student_adm_no, students_name, kcse_entry, class_id } = req.body;

  // Validate fields
  if (!student_adm_no || !students_name || typeof kcse_entry !== 'number' || !class_id) {
    return res.status(400).json({
      message: 'student_adm_no, students_name, class_id are required, kcse_entry must be a number.',
    });
  }

  try {
    // Create student with foreign key
    const newStudent = await client.student.create({
      data: {
        student_adm_no,
        students_name,
        kcse_entry,
        class_id, // Pass the class ID here
      },
    });

    res.status(201).json({
      message: 'Student added successfully!',
      student: newStudent,
    });
  } catch (error) {
    console.error('Error adding student:', error);

    // Handle foreign key violation (invalid class_id)
    if (error.code === 'P2003') {
      return res.status(400).json({ message: 'Invalid class_id. Class does not exist.' });
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

export default router;

