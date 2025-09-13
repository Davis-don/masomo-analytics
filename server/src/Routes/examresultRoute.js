import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// --------------------
// Fetch results for editing
// --------------------
router.get('/results-for-editing', async (req, res) => {
  try {
    let { class_id, subject_id, exam_id, stream_name } = req.query;

    class_id = class_id?.trim();
    subject_id = subject_id?.trim();
    exam_id = exam_id?.trim();
    stream_name = stream_name?.trim();

    if (!class_id || !subject_id || !exam_id) {
      return res.status(400).json({ message: 'class_id, subject_id, and exam_id are required.' });
    }

    const students = await prisma.student.findMany({
      where: { class_id },
      select: { 
        student_adm_no: true, 
        students_name: true,
        kcse_entry: true,
        class_id: true
      },
      orderBy: { students_name: 'asc' },
    });

    const results = await prisma.examResult.findMany({
      where: { class_id, subject_id, exam_id },
    });

    const resultsMapped = students.map((student) => {
      const result = results.find(r => r.student_adm_no === student.student_adm_no);
      return {
        result_id: result?.result_id || null,
        student_adm_no: student.student_adm_no,
        student: {
          student_adm_no: student.student_adm_no,
          student_name: student.students_name,
        },
        marks: result?.marks || null,
        percentage: result?.percentage || null,
        grade: result?.grade || null,
      };
    });

    const classExamSubject = await prisma.classExamSubject.findUnique({
      where: { class_id_exam_id_subject_id: { class_id, exam_id, subject_id } },
    });

    res.json({
      results: resultsMapped,
      metadata: { classExamStatus: classExamSubject?.status || 'upload' },
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ message: 'Failed to fetch results.', error: error.message });
  }
});

// --------------------
// Bulk update results (for file upload - sets status to publish)
// --------------------
router.put('/bulk-update-results', async (req, res) => {
  try {
    const { exam_id, subject_id, class_id, updates, publish } = req.body;

    if (!exam_id || !subject_id || !class_id || !Array.isArray(updates)) {
      return res.status(400).json({ message: 'exam_id, subject_id, class_id, and updates array are required.' });
    }

    const updatedResults = [];

    for (const u of updates) {
      const { student_adm_no, marks, percentage } = u;

      const result = await prisma.examResult.upsert({
        where: { student_adm_no_exam_id_subject_id: { student_adm_no, exam_id, subject_id } },
        update: { marks, percentage },
        create: { student_adm_no, exam_id, subject_id, class_id, marks, percentage },
      });

      updatedResults.push(result);
    }

    if (publish) {
      // For file uploads, set status to 'publish'
      await prisma.classExamSubject.update({
        where: { class_id_exam_id_subject_id: { class_id, exam_id, subject_id } },
        data: { status: 'publish' },
      });
    }

    res.json({ message: 'Results updated successfully!', updatedResults });
  } catch (error) {
    console.error('Error updating results:', error);
    res.status(500).json({ message: 'Failed to update results.', error: error.message });
  }
});

// --------------------
// Bulk update results for editing (sets status to analyse)
// --------------------
router.put('/bulk-update-results-edit', async (req, res) => {
  try {
    const { exam_id, subject_id, class_id, updates, publish } = req.body;

    if (!exam_id || !subject_id || !class_id || !Array.isArray(updates)) {
      return res.status(400).json({ message: 'exam_id, subject_id, class_id, and updates array are required.' });
    }

    const updatedResults = [];

    for (const u of updates) {
      const { student_adm_no, marks, percentage } = u;

      const result = await prisma.examResult.upsert({
        where: { student_adm_no_exam_id_subject_id: { student_adm_no, exam_id, subject_id } },
        update: { marks, percentage },
        create: { student_adm_no, exam_id, subject_id, class_id, marks, percentage },
      });

      updatedResults.push(result);
    }

    if (publish) {
      // For manual editing, set status to 'analyse'
      await prisma.classExamSubject.update({
        where: { class_id_exam_id_subject_id: { class_id, exam_id, subject_id } },
        data: { status: 'analyse' },
      });
    }

    res.json({ message: 'Results updated successfully!', updatedResults });
  } catch (error) {
    console.error('Error updating results:', error);
    res.status(500).json({ message: 'Failed to update results.', error: error.message });
  }
});

export default router;