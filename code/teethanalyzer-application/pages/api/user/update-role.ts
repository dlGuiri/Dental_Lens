// pages/api/user/update-role.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGO_URI || "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = await getSession({ req });
  
  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { userId, role } = req.body;

  // Validate role
  if (!role || (role !== 'dentist' && role !== 'patient')) {
    return res.status(400).json({ message: 'Invalid role specified' });
  }

  // Verify the userId matches the session user
  if (userId !== session.user.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    await client.connect();
    const db = client.db();
    const users = db.collection('users');

    // Update the user's role in the database
    const result = await users.updateOne(
      { _id: userId },
      { 
        $set: { 
          role: role,
          roleUpdatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ 
      message: 'Role updated successfully',
      role: role 
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    await client.close();
  }
}