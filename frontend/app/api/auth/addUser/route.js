import connectDB from '@/utils/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {

    const { auth0Id, email, name, email_verified } = await req.json();

    if (!auth0Id || !email) {
      return NextResponse.json({ error: 'Missing required user information' }, { status: 400 });
    }

    await connectDB();

    const updatedUser = await User.findOneAndUpdate(
      { auth0Id },

      { 
        $set: { 
          auth0Id,
          email, 
          name: name || 'No Name',
          emailVerified: email_verified || false, 
          role: 'teacher',  
          lastLogin: new Date()  
        } 
      },

      { 
        new: true,   
        upsert: true,  
      }
    );

    return NextResponse.json({
      message: 'User updated in MongoDB',
      user: updatedUser
    }, { status: 200 });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
