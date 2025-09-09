// Routes/examroutes.js
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// --------------------
// Add a new exam
// --------------------
router.post('/add-exam', async (req, res) => {
  const { name, date, term, year, status, class_ids } = req.body;

  if (!name || !date || !term || !year || !status || !Array.isArray(class_ids)) {
    return res.status(400).json({
      message: 'name, date, term, year, status, and class_ids (array) are required.',
    });
  }

  try {
    const newExam = await prisma.exam.create({
      data: {
        name,
        date: new Date(date),
        term,
        year,
        status,
        classes: {
          create: class_ids.map(class_id => ({ 
            class: { connect: { class_id } } 
          })),
        },
      },
      include: { 
        classes: {
          include: {
            class: true
          }
        } 
      },
    });

    res.status(201).json({ message: 'Exam added successfully!', exam: newExam });
  } catch (error) {
    console.error('Error adding exam:', error);
    if (error.code === 'P2003') {
      return res.status(400).json({ message: 'Invalid class_id. Class does not exist.' });
    }
    if (error.code === 'P2025') {
      return res.status(400).json({ message: 'One or more classes not found.' });
    }
    res.status(500).json({ message: 'Failed to add exam.', error: error.message });
  }
});



router.get('/fetch-all-exams', async (req, res) => {
  try {
    // Get year from query params, default to current year
    const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();

    const exams = await prisma.exam.findMany({
      where: {
        year: year,
      },
      include: {
        classes: {
          include: {
            class: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.status(200).json(exams.length ? exams : []);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ message: 'Failed to fetch exams.', error: error.message });
  }
});



// --------------------
// Fetch all exams
// --------------------
router.get('/fetch-all-exams', async (req, res) => {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        classes: { 
          include: { 
            class: true 
          } 
        },
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.status(200).json(exams.length ? exams : []);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ message: 'Failed to fetch exams.', error: error.message });
  }
});

// --------------------
// Delete an exam by exam_id
// --------------------
router.delete('/delete-exam/:exam_id', async (req, res) => {
  const { exam_id } = req.params;

  if (!exam_id) {
    return res.status(400).json({ message: 'exam_id is required.' });
  }

  try {
    // First delete related classExam records
    await prisma.classExam.deleteMany({
      where: { exam_id }
    });

    // Then delete the exam
    const deletedExam = await prisma.exam.delete({
      where: { exam_id }
    });

    res.json({ message: 'Exam deleted successfully!', exam: deletedExam });
  } catch (error) {
    console.error('Error deleting exam:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Exam not found or already deleted.' });
    }
    res.status(500).json({ message: 'Failed to delete exam.', error: error.message });
  }
});

export default router;
