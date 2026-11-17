import { Hono, type Context } from 'hono'
import { cors } from 'hono/cors'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { COVERAGE } from './carriers'
import { lookupNumber } from './lookup'

const app = new Hono()

const WINDOW_MS = 60_000
const LIMIT = 60
const hits = new Map<string, { count: number; reset: number }>()

function rateLimit(key: string) {
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || entry.reset < now) {
    hits.set(key, { count: 1, reset: now + WINDOW_MS })
    return { allowed: true, remaining: LIMIT - 1, reset: now + WINDOW_MS }
  }

  entry.count += 1
  return { allowed: entry.count <= LIMIT, remaining: Math.max(0, LIMIT - entry.count), reset: entry.reset }
}

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of hits) {
    if (entry.reset < now) hits.delete(key)
  }
}, WINDOW_MS).unref()

app.use('/api/*', cors({ origin: '*' }))

app.use('/api/*', async (c, next) => {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  const limit = rateLimit(ip)

  if (!limit.allowed) {
    c.header('Retry-After', String(Math.ceil((limit.reset - Date.now()) / 1000)))
    return c.json({ error: 'Too many lookups. Try again in a minute.' }, 429)
  }

  c.header('X-RateLimit-Limit', String(LIMIT))
  c.header('X-RateLimit-Remaining', String(limit.remaining))
  await next()
})

app.get('/api/health', (c) => c.json({ ok: true, service: 'numlens', time: new Date().toISOString() }))

app.get('/api/coverage', (c) =>
  c.json({
    countries: COVERAGE,
    validation: 'worldwide',
    liveProvider: process.env.NUMVERIFY_ACCESS_KEY ? 'numverify' : null,
  }),
)

async function run(c: Context, number: string, country?: string) {
  const result = await lookupNumber(number, country)
  c.header('Cache-Control', 'no-store')
  return c.json(result)
}

app.get('/api/lookup', async (c) => {
  const number = c.req.query('number') ?? ''
  const country = c.req.query('country')
  return run(c, number, country)
})

app.post('/api/lookup', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { number?: string; country?: string }
  return run(c, body.number ?? '', body.country)
})

app.use('/*', serveStatic({ root: './dist' }))
app.get('*', serveStatic({ path: './dist/index.html' }))

const port = Number(process.env.PORT ?? 8787)

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`numlens api on http://localhost:${info.port}`)
})
