import connectDB from '@/utils/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { auth0Id, title, url } = await req.json();

    if (!auth0Id || !title || !url) {
      return NextResponse.json({ error: 'Missing required lecture information' }, { status: 400 });
    }

    await connectDB();

    // Find the user and add a new lecture only if the user exists
    const updatedUser = await User.findOneAndUpdate(
      { auth0Id }, 
      {
        $push: { 
          lectures: { title, url, students: [] }  // Add a new lecture
        },
      },
      { new: true }  // Do not use upsert to avoid creating a new user
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Lecture added successfully',
      user: updatedUser,
    }, { status: 200 });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
