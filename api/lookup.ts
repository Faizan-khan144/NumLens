import type { IncomingMessage, ServerResponse } from 'node:http'
import { lookupNumber } from '../server/lookup'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const number = url.searchParams.get('number') ?? ''
  const country = url.searchParams.get('country') ?? undefined

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method !== 'GET') {
    res.statusCode = 405
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  try {
    const result = await lookupNumber(number, country)
    res.statusCode = 200
    res.end(JSON.stringify(result))
  } catch {
    res.statusCode = 500
    res.end(JSON.stringify({ error: 'Lookup failed' }))
  }
}
