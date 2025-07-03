import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { surveyData, results, timestamp } = req.body;

    if (!surveyData || !results) {
      return res.status(400).json({ message: 'Missing required data' });
    }

    // Generate a unique ID for this response
    const responseId = `response_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Save the response data
    const responseData = {
      id: responseId,
      surveyData,
      results,
      timestamp: timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // Store in Vercel KV
    await kv.set(responseId, JSON.stringify(responseData));
    
    // Also store in a list for easy retrieval
    await kv.lpush('responses', responseId);

    res.status(200).json({ 
      success: true, 
      responseId,
      message: 'Response saved successfully' 
    });

  } catch (error) {
    console.error('Error saving response:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save response' 
    });
  }
} 