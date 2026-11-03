import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { method } = req;
  const { roomId, word, player } = req.body;

  if (!roomId) return res.status(400).json({ err: "缺少房间号" });

  if (method === "POST") {
    let room = await kv.get(roomId) || { p1: null, p2: null };
    if (player === 1) room.p1 = word;
    if (player === 2) room.p2 = word;
    await kv.set(roomId, room, { ex: 3600 });
    return res.json(room);
  }

  if (method === "GET") {
    const room = await kv.get(roomId) || { p1: null, p2: null };
    return res.json(room);
  }
  res.status(405).end();
}
