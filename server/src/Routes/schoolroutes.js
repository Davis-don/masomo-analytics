import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const client = new PrismaClient();

// --------------------
// Add a new school
// --------------------
router.post('/add-school', async (req, res) => {
  const { name, location, schoolUsername } = req.body;

  if (!name || !schoolUsername) {
    return res.status(400).json({ message: 'school_name and username are required.' });
  }

  try {
    const newSchool = await client.school.create({
      data: { 
        name, 
        location,
        username: schoolUsername, // ✅ save username
      },
    });

    res.status(201).json({
      message: 'School added successfully!',
      school: newSchool,
    });
  } catch (error) {
    console.error('Error adding school:', error);
    res.status(500).json({ message: 'Failed to add school.', error: error.message });
  }
});


// --------------------
// Fetch all schools with related classes
// --------------------
router.get('/fetch-all-schools', async (req, res) => {
  try {
    const schools = await client.school.findMany({
      include: {
        classes: true,
      },
    });

    res.status(200).json(schools.length ? schools : []);
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ message: 'Failed to fetch schools.', error: error.message });
  }
});

// --------------------
// Delete a school by ID
// --------------------
router.delete('/delete-school-by-id', async (req, res) => {
  const school_id = req.query.school_id;

  if (!school_id) {
    return res.status(400).json({ message: 'school_id is required.' });
  }

  try {
    const deletedSchool = await client.school.delete({
      where: { school_id },
    });

    res.json({
      message: 'School deleted successfully!',
      school: deletedSchool,
    });
  } catch (error) {
    console.error('Error deleting school:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'School not found or already deleted.' });
    }

    res.status(500).json({ message: 'Failed to delete school.', error: error.message });
  }
});

// --------------------
// Update a school
// --------------------
router.put('/update-school', async (req, res) => {
  const { school_id, name, location } = req.body;

  if (!school_id) {
    return res.status(400).json({ message: 'school_id is required.' });
  }

  try {
    const updatedSchool = await client.school.update({
      where: { school_id },
      data: { name, location },
    });

    res.json({
      message: 'School updated successfully!',
      school: updatedSchool,
    });
  } catch (error) {
    console.error('Error updating school:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'School not found.' });
    }

    res.status(500).json({ message: 'Failed to update school.', error: error.message });
  }
});

export default router;
