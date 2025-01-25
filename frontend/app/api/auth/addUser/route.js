import connectDB from '@/utils/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { cookies } from 'next/headers';  // Correct import for cookies

export async function GET(req) {
  try {
    // Await the cookies function before using it
    const cookieStore = cookies(); // Ensure cookies() is awaited
    const sessionCookie = await cookieStore.get('appSession');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get the session for the logged-in user from Auth0
    const session = await getSession(req);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Extract user details from the session
    const { sub: auth0Id, email, name, email_verified } = session.user;

    // Connect to MongoDB
    await connectDB();

    // Upsert the user - insert if they don't exist, update if they do
    const updatedUser = await User.findOneAndUpdate(
      { auth0Id },  // Search criteria

      { 
        $set: { 
          auth0Id,  // Ensure auth0Id is always set
          email,
          name: name || 'No Name',
          emailVerified: email_verified || false,
          role: 'teacher',  // Default role as per schema
          lastLogin: new Date(),  // Update last login timestamp
        } 
      },

      { new: true, upsert: true }  // Upsert ensures insertion if user doesn't exist
    );

    return NextResponse.json({ 
      message: updatedUser.isNew ? 'User added to MongoDB' : 'User updated in MongoDB', 
      user: updatedUser 
    }, { status: updatedUser.isNew ? 201 : 200 });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
