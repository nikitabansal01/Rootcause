import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client with error handling
let redis;
try {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
} catch (error) {
  console.error('Failed to initialize Redis client:', error);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check if Redis is available
  if (!redis) {
    return res.status(500).json({ 
      success: false, 
      message: 'Database connection not available. Please check environment variables.' 
    });
  }

  try {
    // Get all response IDs
    const responseIds = await redis.lrange('responses', 0, -1);
    
    // Get all response data
    const responses = [];
    for (const id of responseIds) {
      const responseData = await redis.get(id);
      if (responseData) {
        responses.push(responseData);
      }
    }

    // Get all email IDs
    const emailIds = await redis.lrange('emails', 0, -1);
    
    // Get all email data
    const emails = [];
    for (const id of emailIds) {
      const emailData = await redis.get(id);
      if (emailData) {
        emails.push(emailData);
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
      message: 'Failed to retrieve data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
} 