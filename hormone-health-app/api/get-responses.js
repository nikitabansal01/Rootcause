import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get all response IDs
    const responseIds = await kv.lrange('responses', 0, -1);
    
    // Get all response data
    const responses = [];
    for (const id of responseIds) {
      const responseData = await kv.get(id);
      if (responseData) {
        responses.push(JSON.parse(responseData));
      }
    }

    // Get all email IDs
    const emailIds = await kv.lrange('emails', 0, -1);
    
    // Get all email data
    const emails = [];
    for (const id of emailIds) {
      const emailData = await kv.get(id);
      if (emailData) {
        emails.push(JSON.parse(emailData));
      }
    }

    res.status(200).json({ 
      success: true, 
      responses,
      emails,
      totalResponses: responses.length,
      totalEmails: emails.length
    });

  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve data' 
    });
  }
} 