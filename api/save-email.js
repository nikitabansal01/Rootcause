import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, responseId, timestamp } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Generate a unique ID for this email entry
    const emailId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Save the email data
    const emailData = {
      id: emailId,
      email,
      responseId: responseId || null,
      timestamp: timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // Store in Vercel KV
    await kv.set(emailId, JSON.stringify(emailData));
    
    // Also store in a list for easy retrieval
    await kv.lpush('emails', emailId);

    // If there's a responseId, link the email to the response
    if (responseId) {
      await kv.hset(`response_emails:${responseId}`, { email });
    }

    res.status(200).json({ 
      success: true, 
      emailId,
      message: 'Email saved successfully' 
    });

  } catch (error) {
    console.error('Error saving email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save email' 
    });
  }
} 