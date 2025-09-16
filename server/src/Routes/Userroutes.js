import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const client = new PrismaClient();

// --------------------
// Add a new user (admin)
// --------------------
router.post('/add-user', async (req, res) => {
  const {
    firstName,
    lastName,
    phoneNumber,
    email,
    dob,
    userName,
    password,
    role,
    school_id
  } = req.body;

  if (!firstName || !lastName || !phoneNumber || !email || !dob || !userName || !password || !school_id) {
    return res.status(400).json({ message: 'All fields except role are required.' });
  }

  try {
    const newUser = await client.user.create({
      data: {
        firstName,
        lastName,
        phoneNumber,
        email,
        dob: new Date(dob),
        userName,
        password,  // ⚠️ In production, hash this using bcrypt
        role: role || 'admin',
        school_id
      },
    });

    res.status(201).json({
      message: 'User created successfully!',
      user: newUser,
    });
  } catch (error) {
    console.error('Error adding user:', error);

    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'User with this email or username already exists.' });
    }

    res.status(500).json({ message: 'Failed to add user.', error: error.message });
  }
});

// --------------------
// Fetch all users
// --------------------
router.get('/fetch-all-users', async (req, res) => {
  try {
    const users = await client.user.findMany({
      include: {
        school: true
      }
    });

    res.status(200).json(users.length ? users : []);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      message: 'Failed to fetch users.',
      error: error.message,
    });
  }
});

// --------------------
// Delete a user by ID
// --------------------
router.delete('/delete-user-by-id', async (req, res) => {
  const user_id = req.query.user_id;

  if (!user_id) {
    return res.status(400).json({ message: 'user_id is required.' });
  }

  try {
    const deletedUser = await client.user.delete({
      where: { user_id },
    });

    res.json({
      message: 'User deleted successfully!',
      user: deletedUser,
    });
  } catch (error) {
    console.error('Error deleting user:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found or already deleted.' });
    }

    res.status(500).json({ message: 'Failed to delete user.', error: error.message });
  }
});

export default router;
