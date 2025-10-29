import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function signup(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return res.status(201).json({
      message: 'User created successfully',
      user
    });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}