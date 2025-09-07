import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const client = new PrismaClient();

// Add a new class
router.post('/add-class', async (req, res) => {
  // check if req.body exists
  if (!req.body) {
    return res.status(400).json({ message: 'Request body is missing.' });
  }

  const { class_level, class_stream } = req.body;

  if (typeof class_level !== 'number' || !class_stream) {
    return res.status(400).json({ message: 'class_level must be a number and class_stream is required.' });
  }

  try {
    const newClass = await client.class.create({
      data: { class_level, class_stream },
    });

    res.status(201).json({
      message: 'Class added successfully!',
      class: newClass,
    });
  } catch (error) {
    console.error('Error adding class:', error);
    res.status(500).json({ message: 'Failed to add class.', error: error.message });
  }
});

router.get('/fetch-all-classes', async (req, res) => {
  try {
    const classes = await client.class.findMany();
    res.status(200).json(classes.length ? classes : []);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Failed to fetch classes.', error: error.message });
  }
});

// Delete a class by ID
router.delete('/delete-class-by-id', async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'ID is required.' });
  }

  try {
    const deletedClass = await client.class.delete({ where: { class_id: id } });

    res.json({
      message: 'Class deleted successfully!',
      class: deletedClass,
    });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ message: 'Failed to delete class.', error: error.message });
  }
});
// Fetch a class by ID
// router.get('/fetch-class-by-id/:id', async (req, res) => {
//   const { id } = req.params;

//   try {
//     const classItem = await client.class.findUnique({ where: { class_id: id } });

//     if (!classItem) {
//       return res.status(404).json({ message: `Class with id ${id} not found.` });
//     }

//     res.status(200).json(classItem);
//   } catch (error) {
//     console.error('Error fetching class:', error);
//     res.status(500).json({ message: 'Failed to fetch class.', error: error.message });
//   }
// });

// Fetch all classes
router.get('/fetch-all-classes', async (req, res) => {
  try {
    const classes = await client.class.findMany();
    res.status(200).json(classes.length ? classes : []);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ message: 'Failed to fetch classes.', error: error.message });
  }
});



// Delete all classes
router.delete('/delete-all-classes', async (req, res) => {
  try {
    const deleted = await client.class.deleteMany();
    res.json({
      message: `Deleted ${deleted.count} class(es) successfully.`,
      count: deleted.count,
    });
  } catch (error) {
    console.error('Error deleting all classes:', error);
    res.status(500).json({ message: 'Failed to delete all classes.', error: error.message });
  }
});

export default router;
