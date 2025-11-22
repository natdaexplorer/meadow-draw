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
    return res.status(200).json([]); // Return empty instead of error
  }

  if (req.method === 'GET') {
    try {
      const drawings = await redis.get('pond_drawings');
      res.status(200).json(drawings || []);
    } catch (error) {
      console.error('Error fetching drawings:', error);
      res.status(200).json([]); // Return empty on error
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
