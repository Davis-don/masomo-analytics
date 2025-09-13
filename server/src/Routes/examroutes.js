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
    // Create the exam
    const newExam = await prisma.exam.create({
      data: { name, date: new Date(date), term, year, status },
    });

    for (const class_id of class_ids) {
      // Create ClassExam (no status field)
      await prisma.classExam.create({
        data: { class_id, exam_id: newExam.exam_id },
      });

      // Fetch subjects for the class
      const subjects = await prisma.studentSubject.findMany({
        where: { student: { class_id } },
        select: { subject_id: true },
        distinct: ['subject_id'],
      });

      // Create ClassExamSubject entries with status
      const classExamSubjects = subjects.map((s) => ({
        class_id,
        exam_id: newExam.exam_id,
        subject_id: s.subject_id,
        status: 'upload', // default status
      }));

      if (classExamSubjects.length > 0) {
        await prisma.classExamSubject.createMany({
          data: classExamSubjects,
          skipDuplicates: true,
        });
      }
    }

    const examWithSubjects = await prisma.exam.findUnique({
      where: { exam_id: newExam.exam_id },
      include: { classExamSubjects: { include: { class: true, subject: true } } },
    });

    res.status(201).json({ message: 'Exam added successfully!', exam: examWithSubjects });
  } catch (error) {
    console.error('Error adding exam:', error);
    res.status(500).json({ message: 'Failed to add exam.', error: error.message });
  }
});

// --------------------
// Fetch all exams
// --------------------
// --------------------
// Fetch exams with specific subject status
// --------------------
router.get('/fetch-all-exams', async (req, res) => {
  try {
    const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();
    const subjectId = req.query.subject_id;

    if (!subjectId) {
      return res.status(400).json({ message: 'subject_id query parameter is required.' });
    }

    const exams = await prisma.exam.findMany({
      where: { year },
      include: { 
        classExamSubjects: { 
          where: { subject_id: subjectId }, // Only include the passed subject
          include: { class: true, subject: true } 
        } 
      },
      orderBy: { date: 'desc' },
    });

    const examsFormatted = exams.map((exam) => {
      const classMap = {};
      exam.classExamSubjects.forEach((ces) => {
        if (!classMap[ces.class_id]) {
          classMap[ces.class_id] = { class: ces.class, subject: ces.subject, status: ces.status };
        }
      });
      return { ...exam, classes: Object.values(classMap) };
    });

    res.json(examsFormatted);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ message: 'Failed to fetch exams.', error: error.message });
  }
});


// --------------------
// Delete exam
// --------------------
router.delete('/delete-exam/:exam_id', async (req, res) => {
  const { exam_id } = req.params;
  if (!exam_id) return res.status(400).json({ message: 'exam_id is required.' });

  try {
    await prisma.classExamSubject.deleteMany({ where: { exam_id } });
    await prisma.classExam.deleteMany({ where: { exam_id } });
    const deletedExam = await prisma.exam.delete({ where: { exam_id } });

    res.json({ message: 'Exam deleted successfully!', exam: deletedExam });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ message: 'Failed to delete exam.', error: error.message });
  }
});

// --------------------
// Update ClassExamSubject status
// --------------------
router.put('/update-class-exam-status', async (req, res) => {
  const { class_id, exam_id, status } = req.body;
  if (!class_id || !exam_id || !status)
    return res.status(400).json({ message: 'class_id, exam_id, and status are required.' });

  try {
    const updated = await prisma.classExamSubject.updateMany({
      where: { class_id, exam_id },
      data: { status },
    });

    res.json({ message: 'Class exam status updated successfully!', updated });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Failed to update status.', error: error.message });
  }
});

export default router;
