import connectDB from '@/utils/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { auth0Id } = await req.json();

    if (!auth0Id) {
      return NextResponse.json({ error: 'Missing auth0Id' }, { status: 400 });
    }

    await connectDB();

    // Find user by auth0Id and retrieve lectures
    const user = await User.findOne({ auth0Id }, 'lectures');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Lectures retrieved successfully',
      lectures: user.lectures,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching lectures:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
