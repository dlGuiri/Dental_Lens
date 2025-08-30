// pages/api/user/update-role.ts (NextAuth Compatible Version)
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { MongoClient, ObjectId } from 'mongodb';

const client = new MongoClient(process.env.MONGO_URI || "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get session using the correct method
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized - No session found' });
    }

    const { userId, role } = req.body;

    // Validate role
    if (!role || (role !== 'dentist' && role !== 'patient')) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Use session user ID if userId is not provided
    const targetUserId = userId || session.user.id;

    if (!targetUserId) {
      return res.status(400).json({ message: 'No user ID available' });
    }

    await client.connect();
    const db = client.db();
    
    // NextAuth uses 'users' collection by default
    const users = db.collection('users');

    console.log('Attempting to update user:', targetUserId, 'with role:', role);

    // Try to convert string ID to ObjectId for MongoDB
    let mongoId;
    try {
      mongoId = new ObjectId(targetUserId);
    } catch (e) {
      // If it fails, use the string directly
      mongoId = targetUserId;
    }

    // First, try to find the user to see what format they're stored in
    const existingUser = await users.findOne({ _id: mongoId });
    console.log('Found existing user:', existingUser ? 'Yes' : 'No');

    if (!existingUser) {
      // User doesn't exist, this shouldn't happen with NextAuth
      return res.status(404).json({ message: 'User not found in database' });
    }

    // Update the user's role in the NextAuth users collection
    const result = await users.updateOne(
      { _id: mongoId },
      { 
        $set: { 
          role: role, 
          roleUpdatedAt: new Date() 
        } 
      }
    );

    console.log('Database update result:', result);

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found for update' });
    }

    res.status(200).json({ 
      message: 'Role updated successfully', 
      role: role,
      userId: targetUserId,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    
    // Handle specific MongoDB duplicate key error
    if (error instanceof Error && error.message.includes('E11000')) {
      return res.status(409).json({ 
        message: 'User already exists with conflicting data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  } finally {
    await client.close();
  }
}