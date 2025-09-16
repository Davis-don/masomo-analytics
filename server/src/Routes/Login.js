import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const client = new PrismaClient();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check for required values
    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Username and password are required" 
      });
    }

    // Try to find user by username or email
    const user = await client.user.findFirst({
      where: {
        OR: [
          { userName: username },
          { email: username } // Allow login with email as well
        ]
      },
      include: {
        school: {
          select: {
            school_id: true,
            name: true,
            username: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Check password (in production, you should hash passwords)
    // For now, we'll compare directly since your current setup doesn't hash
    const passwordMatch = password === user.password;
    
    // If you want to implement hashing later, use:
    // const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Ensure JWT secret exists
    if (!process.env.JWT_SECRET) {
      console.error("Missing JWT_SECRET environment variable");
      return res.status(500).json({ 
        success: false,
        message: "Internal server error" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.user_id,
        userName: user.userName,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send success response (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Internal server error" 
    });
  }
});

export default router;