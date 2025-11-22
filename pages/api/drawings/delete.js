import { Redis } from '@vercel/kv';

let redis;
try {
  redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
} catch (error) {
  console.error('Failed to create Redis client:', error);
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!redis) {
    return res.status(200).json({ success: false, error: 'Database not available' });
  }

  if (req.method === 'POST') {
    try {
      const { id } = req.body;
      const drawings = (await redis.get('pond_drawings')) || [];
      const updatedDrawings = drawings.filter(drawing => drawing.id !== id);
      await redis.set('pond_drawings', updatedDrawings);
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting drawing:', error);
      res.status(200).json({ success: false, error: 'Failed to delete drawing' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
