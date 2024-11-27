import { NextResponse } from 'next/server';
import prisma from '@/app/lib/localDb'; // Adjust path based on your setup
import bcrypt from 'bcrypt'

export async function POST(request: Request) {
  try {
    const { email, name, password, metro_id } = await request.json();


    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: bcrypt.hashSync(password, 10), // In a real app, hash the password before storing
        metro_id
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the user' },
      { status: 500 }
    );
  }
}