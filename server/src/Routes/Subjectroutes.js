import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const client = new PrismaClient();

// --------------------
// Add a new subject
// --------------------
router.post('/add-subject', async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: 'Request body is missing.' });
  }

  const { subject_name } = req.body;

  if (!subject_name) {
    return res.status(400).json({ message: 'subject_name is required.' });
  }

  try {
    const newSubject = await client.subject.create({
      data: { subject_name },
    });

    res.status(201).json({
      message: 'Subject added successfully!',
      subject: newSubject,
    });
  } catch (error) {
    console.error('Error adding subject:', error);
    res.status(500).json({ message: 'Failed to add subject.', error: error.message });
  }
});

// --------------------
// Fetch all subjects with related students
// --------------------
router.get('/fetch-all-subjects', async (req, res) => {
  try {
    const subjects = await client.subject.findMany({
      include: {
        students: {
          include: { student: true },
        },
      },
    });

    res.status(200).json(subjects.length ? subjects : []);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      message: 'Failed to fetch subjects.',
      error: error.message,
    });
  }
});

// --------------------
// Delete a subject by ID
// --------------------
router.delete('/delete-subject-by-id', async (req, res) => {
  const subject_id = req.query.subject_id;

  if (!subject_id) {
    return res.status(400).json({ message: 'subject_id is required.' });
  }

  try {
    const deletedSubject = await client.subject.delete({
      where: { subject_id },
    });

    res.json({
      message: 'Subject deleted successfully!',
      subject: deletedSubject,
    });
  } catch (error) {
    console.error('Error deleting subject:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Subject not found or already deleted.' });
    }

    res.status(500).json({ message: 'Failed to delete subject.', error: error.message });
  }
});

// --------------------
// Assign a subject to a student
// --------------------
router.post('/assign-subject', async (req, res) => {
  const { student_adm_no, subject_id } = req.body;

  if (!student_adm_no || !subject_id) {
    return res.status(400).json({ message: 'student_adm_no and subject_id are required.' });
  }

  try {
    const assigned = await client.studentSubject.create({
      data: { student_adm_no, subject_id },
    });

    res.status(201).json({
      message: 'Subject assigned to student successfully!',
      assignment: assigned,
    });
  } catch (error) {
    console.error('Error assigning subject:', error);

    if (error.code === 'P2003') {
      return res.status(400).json({ message: 'Invalid student_adm_no or subject_id.' });
    }

    res.status(500).json({ message: 'Failed to assign subject.', error: error.message });
  }
});

// --------------------
// Unassign a subject from a student
// --------------------
router.delete('/unassign-subject', async (req, res) => {
  const { student_adm_no, subject_id } = req.body;

  if (!student_adm_no || !subject_id) {
    return res.status(400).json({ message: 'student_adm_no and subject_id are required.' });
  }

  try {
    const unassigned = await client.studentSubject.delete({
      where: { student_adm_no_subject_id: { student_adm_no, subject_id } },
    });

    res.json({
      message: 'Subject unassigned from student successfully!',
      assignment: unassigned,
    });
  } catch (error) {
    console.error('Error unassigning subject:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    res.status(500).json({ message: 'Failed to unassign subject.', error: error.message });
  }
});

export default router;

