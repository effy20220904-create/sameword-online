import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { roomId } = req.query;
  const { word, player } = req.body || {};
  const key = `room:${roomId}`;
  const TTL = 3600; // 房间1小时过期

  if (req.method === "GET") {
    let room = await redis.get(key);
    if (!room) room = { p1: null, p2: null };
    return res.json(room);
  }

  if (req.method === "POST") {
    let room = await redis.get(key) || { p1: null, p2: null };
    if (player === 1) room.p1 = word;
    if (player === 2) room.p2 = word;
    await redis.set(key, room, { ex: TTL });
    return res.json(room);
  }

  return res.status(405).json({ err: "方法不支持" });
}
