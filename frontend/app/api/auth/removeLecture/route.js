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

    // Remove the lecture from the lectures array based on title and url
    const updatedUser = await User.findOneAndUpdate(
      { auth0Id },
      {
        $pull: {
          lectures: {
            title: title,  // Match lecture by title
            url: url,      // Match lecture by url
          },
        },
      },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found or lecture not deleted' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Lecture removed successfully',
      user: updatedUser,
    }, { status: 200 });

  } catch (error) {
    console.error('Error removing lecture:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
