import { useEffect, useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from 'react'
import {
  Aperture,
  ArrowRight,
  ArrowUpRight,
  Check,
  Code2,
  Copy,
  Globe2,
  Loader2,
  Lock,
  Plus,
  Search,
  ShieldCheck,
  Signal,
  Sparkles,
} from 'lucide-react'
import { lookup, type LookupResult } from './lib/api'

const COUNTRIES = [
  { value: '', label: 'Auto +code' },
  { value: 'PK', label: 'Pakistan' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AE', label: 'UAE' },
  { value: 'IN', label: 'India' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'CA', label: 'Canada' },
  { value: 'DE', label: 'Germany' },
  { value: 'AU', label: 'Australia' },
  { value: 'BD', label: 'Bangladesh' },
]

const SAMPLES = [
  { label: 'Jazz', number: '+923001234567' },
  { label: 'Zong', number: '+923101234567' },
  { label: 'Ufone', number: '+923301234567' },
  { label: 'Telenor', number: '+923451234567' },
  { label: 'Karachi', number: '+922134567890' },
  { label: 'United States', number: '+14155552671' },
  { label: 'United Kingdom', number: '+447911123456' },
]

const DEMO: Extract<LookupResult, { valid: true }> = {
  valid: true,
  input: '+92 300 1234567',
  e164: '+923001234567',
  international: '+92 300 1234567',
  national: '0300 1234567',
  country: { iso: 'PK', name: 'Pakistan', flag: 'PK', callingCode: '92' },
  lineType: { code: 'MOBILE', label: 'Mobile' },
  carrier: { name: 'Jazz', confidence: 0.92, source: 'prefix-dataset', kind: 'mobile' },
  carrierNote: null,
  portability: 'Mobile number portability lets a number move between networks. Treat the carrier as an estimate, not a guarantee.',
  live: false,
  durationMs: 18,
}

const CURL = `curl "http://localhost:8787/api/lookup?number=%2B923001234567"`

const MARQUEE = [
  'Worldwide validation',
  'Jazz',
  'Zong',
  'Telenor',
  'Ufone',
  'SCOM',
  'PTCL',
  '240+ numbering plans',
  'Line type detection',
  'No storage',
  'Public API',
]

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${shown ? 'is-in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

function Header() {
  return (
    <header className="sticky top-3 z-40 wrap pt-1">
      <div className="flex h-[62px] items-center justify-between gap-3 rounded-2xl border border-line bg-panel/85 px-2.5 backdrop-blur-2xl">
        <a href="#top" className="flex items-center gap-2.5 pl-1">
          <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-lime text-white shadow-[0_0_24px_rgba(183,243,107,0.35)]">
            <Aperture className="h-4 w-4" strokeWidth={2.4} />
          </span>
          <span className="font-display text-[16px] font-semibold tracking-tight">numlens.</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {[
            { href: '#lookup', label: 'Lookup' },
            { href: '#coverage', label: 'Coverage' },
            { href: '#api', label: 'API' },
            { href: '#privacy', label: 'Privacy' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-[12.5px] text-muted transition-colors hover:bg-panel2 hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <a
            href="https://github.com/Faizan-khan144"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub profile"
            className="grid h-9 w-9 place-items-center rounded-xl text-muted transition-colors hover:bg-panel2 hover:text-ink"
          >
            <Code2 className="h-4 w-4" />
          </a>
          <a href="#lookup" className="btn btn-ink !rounded-xl !px-4 !py-2.5 !text-[12.5px]">
            Check a number <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </header>
  )
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <span className="label shrink-0">{label}</span>
      <span className={`truncate text-right text-[13.5px] ${mono ? 'mono' : ''}`}>{value}</span>
    </div>
  )
}

function ResultBody({ result, demo }: { result: Extract<LookupResult, { valid: true }>; demo: boolean }) {
  const [copied, setCopied] = useState(false)
  const confidence = result.carrier ? Math.round(result.carrier.confidence * 100) : 0
  const tone = confidence >= 90 ? 'text-lime' : confidence >= 75 ? 'text-amber' : 'text-muted'

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.e164)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-panel2 font-mono text-[11px] font-semibold text-lime">
              {result.country.iso}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold">{result.country.name}</p>
              <p className="mono text-[11px] text-faint">
                +{result.country.callingCode} / {result.lineType.label}
              </p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-lime/25 bg-mint-soft px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-lime">
              <Check className="h-3 w-3" /> valid
            </span>
          </div>

          <div className="mt-6">
            <p className="label">carrier</p>
            <div className="mt-1 flex items-end justify-between gap-4">
              <h3 className="font-display text-[30px] font-semibold leading-tight tracking-tight">
                {result.carrier ? result.carrier.name : 'Not covered yet'}
              </h3>
              {result.carrier && <span className={`mono shrink-0 text-[12px] ${tone}`}>{confidence}%</span>}
            </div>

            {result.carrier ? (
              <>
                <div className="bar mt-3">
                  <span style={{ width: `${confidence}%` }} />
                </div>
                <p className="mt-2 text-[11.5px] text-muted">
                  estimated from {result.carrier.source === 'numverify' ? 'a live HLR lookup' : 'the number prefix'}
                  {result.live ? ' - live provider connected' : ' - confidence shown, never hidden'}
                </p>
              </>
            ) : (
              <p className="mt-2 text-[12px] leading-relaxed text-muted">{result.carrierNote}</p>
            )}
          </div>

          <div className="mt-6 rule" />

          <div className="flex items-center justify-between gap-3 py-3">
            <span className="label shrink-0">E.164</span>
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="mono truncate text-[14.5px] font-medium text-lime">{result.e164}</span>
              <button
                type="button"
                onClick={copy}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-faint transition-colors hover:bg-panel2 hover:text-ink"
                aria-label="Copy E.164 number"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-lime" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          <div className="rule" />
          <Row label="International" value={result.international} mono />
          <div className="rule" />
          <Row label="National" value={result.national} mono />
          <div className="rule" />
          <Row label="Line type" value={result.lineType.label} />
          <div className="rule" />
          <Row label="Calling code" value={`+${result.country.callingCode}`} mono />
        </div>

        <div className="grid content-start gap-3">
          <div className="rounded-2xl border border-line bg-panel2/50 p-4">
            <div className="flex items-center gap-2 text-muted">
              <Signal className="h-3.5 w-3.5" />
              <span className="label">signal</span>
            </div>
            <p className="mt-3 font-display text-[19px] font-semibold tracking-tight">{result.lineType.label}</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted">
              Line type is read from official numbering metadata - exact, not estimated.
            </p>
            {result.portability && (
              <p className="mt-3 rounded-xl border border-amber/20 bg-amber/5 px-3 py-2.5 text-[11px] leading-relaxed text-amber/90">
                {result.portability}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-panel2/50 p-4">
            <div className="flex items-center gap-2 text-muted">
              <Lock className="h-3.5 w-3.5" />
              <span className="label">privacy</span>
            </div>
            <ul className="mt-3 grid gap-2 text-[11.5px] text-muted">
              <li className="flex gap-2"><Check className="mt-0.5 h-3 w-3 shrink-0 text-lime" /> No owner identity.</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-3 w-3 shrink-0 text-lime" /> No live location.</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-3 w-3 shrink-0 text-lime" /> Nothing stored.</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-3 w-3 shrink-0 text-lime" /> No SMS, no account.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-[#080c08] px-5 py-3">
        <span className="mono text-[10px] text-faint">
          {demo ? 'sample result - run a check to try your own' : `checked in ${result.durationMs}ms - nothing stored`}
        </span>
        <span className="mono flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-lime">
          <span className="pulse-dot" /> {demo ? 'preview' : 'live'}
        </span>
      </div>
    </>
  )
}

function NumberWindow({
  result,
  demo,
  tilt,
  onMove,
  onLeave,
}: {
  result: Extract<LookupResult, { valid: true }>
  demo: boolean
  tilt: { x: number; y: number }
  onMove: (event: MouseEvent<HTMLDivElement>) => void
  onLeave: () => void
}) {
  return (
    <div className="mx-auto mt-12 max-w-4xl" style={{ perspective: '1400px' }}>
      <div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="window transition-transform duration-300 ease-out"
        style={{ transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)` }}
      >
        <div className="window-bar">
          <span className="dot bg-[#ff5f57]/80" />
          <span className="dot bg-[#febc2e]/80" />
          <span className="dot bg-[#28c840]/80" />
          <span className="mono ml-2 truncate text-[10.5px] text-faint">
            numlens.app/check/{demo ? '03001234567' : result.e164.replace('+', '')}
          </span>
          <span className="mono ml-auto flex shrink-0 items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] text-lime">
            <span className="pulse-dot" /> {demo ? 'sample' : 'live'}
          </span>
        </div>
        <ResultBody result={result} demo={demo} />
      </div>
    </div>
  )
}

function App() {
  const [number, setNumber] = useState('')
  const [country, setCountry] = useState('')
  const [result, setResult] = useState<LookupResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [sampleIndex, setSampleIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA')
      if (event.key === '/' && !typing) {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const run = async (value: string, hint: string) => {
    const trimmed = value.trim()
    if (!trimmed || loading) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await lookup(trimmed, hint)
      setResult(data)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Lookup failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    void run(number, country)
  }

  const nextSample = () => {
    const sample = SAMPLES[sampleIndex % SAMPLES.length]
    setSampleIndex((index) => index + 1)
    setNumber(sample.number)
    setCountry('')
    void run(sample.number, '')
  }

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    const px = (event.clientX - box.left) / box.width - 0.5
    const py = (event.clientY - box.top) / box.height - 0.5
    setTilt({ x: Number((px * 2.4).toFixed(2)), y: Number((-py * 1.8).toFixed(2)) })
  }

  const shown = result && result.valid ? result : null
  const payload = shown ?? DEMO
  const isDemo = !shown

  return (
    <div id="top" className="grain relative flex min-h-screen flex-col overflow-x-clip">
      <div className="scroll-progress" aria-hidden="true" />

      <div className="relative z-10 flex flex-1 flex-col">
        <Header />

        <main className="flex-1">
          <section id="lookup" className="wrap pb-10 pt-20 sm:pt-28">
            <div className="mx-auto max-w-3xl text-center">
              <span className="chip rise" style={{ animationDelay: '30ms' }}>
                <span className="pulse-dot" /> live - public metadata - no login
              </span>

              <h1
                className="rise mt-7 font-display text-[3.1rem] font-semibold leading-[0.92] tracking-[-0.055em] sm:text-[5.2rem] xl:text-[5.8rem]"
                style={{ animationDelay: '100ms' }}
              >
                Any number.
                <br />
                Its whole network<span className="accent-dot" aria-hidden="true" />
              </h1>

              <p
                className="rise mx-auto mt-6 max-w-xl text-[14.5px] leading-relaxed text-muted"
                style={{ animationDelay: '170ms' }}
              >
                NumLens turns a phone number into something you can read: the country it belongs to, the line type,
                and the network behind it - with confidence stated, never hidden.
              </p>
            </div>

            <form
              onSubmit={onSubmit}
              className="card rise mx-auto mt-10 flex max-w-2xl flex-col gap-2 p-2.5 sm:flex-row sm:items-center"
              style={{ animationDelay: '240ms' }}
            >
              <label className="relative block flex-1">
                <span className="sr-only">Phone number</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                <input
                  ref={inputRef}
                  value={number}
                  onChange={(event) => setNumber(event.target.value)}
                  placeholder="+92 300 1234567"
                  inputMode="tel"
                  autoComplete="tel"
                  className="field !border-transparent !bg-transparent !pl-11 focus:!border-transparent focus:!shadow-none"
                />
              </label>

              <label className="block sm:w-[152px]">
                <span className="sr-only">Country hint</span>
                <select
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  className="field !py-3.5 font-sans !text-[12px] text-muted"
                >
                  {COUNTRIES.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                disabled={loading || !number.trim()}
                className="btn btn-ink !rounded-xl !px-5 !py-3.5 disabled:opacity-40"
              >
                {loading ? <Loader2 className="h-4 w-4 spin" /> : <Sparkles className="h-4 w-4" />}
                {loading ? 'Checking' : 'Check'}
              </button>
            </form>

            <div
              className="rise mx-auto mt-4 flex max-w-2xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11.5px] text-muted"
              style={{ animationDelay: '310ms' }}
            >
              <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-lime" /> No account</span>
              <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-lime" /> Nothing stored</span>
              <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-lime" /> Estimates labeled</span>
              <button type="button" onClick={nextSample} className="group flex items-center gap-1.5 font-medium text-lime transition-opacity hover:opacity-75">
                or try a sample number
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            <div className="mt-4" aria-live="polite">
              {error && (
                <div className="card mx-auto mt-8 max-w-2xl border-rose/30 px-5 py-4">
                  <p className="label text-rose">request failed</p>
                  <p className="mt-1 text-[13.5px]">{error}</p>
                </div>
              )}

              {result && !result.valid && (
                <div className="card pop mx-auto mt-8 max-w-2xl border-rose/25 px-6 py-6">
                  <p className="label text-rose">check failed</p>
                  <h2 className="mt-2 font-display text-[23px] font-semibold tracking-tight">{result.reason}</h2>
                  {result.hint && <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{result.hint}</p>}
                  <p className="mono mt-4 text-[10px] text-faint">checked in {result.durationMs}ms - nothing stored</p>
                </div>
              )}
            </div>

            <NumberWindow result={payload} demo={isDemo} tilt={tilt} onMove={onMove} onLeave={() => setTilt({ x: 0, y: 0 })} />
          </section>

          <div className="marquee mt-6 border-y border-line bg-[#070a07] py-3">
            <div className="marquee-track">
              {[...MARQUEE, ...MARQUEE].map((item, index) => (
                <span key={`${item}-${index}`} className="marquee-item">
                  <span className="h-1 w-1 rounded-full bg-lime/70" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <section id="coverage" className="wrap scroll-mt-28 py-20">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="label">coverage</p>
                  <h2 className="mt-2 max-w-xl font-display text-[2.1rem] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[3rem]">
                    Exact where it matters.
                    <br />
                    Honest where it does not.
                  </h2>
                </div>
                <span className="chip"><Globe2 className="h-3 w-3" /> validation - 240+ regions</span>
              </div>
            </Reveal>

            <div className="mt-9 grid gap-4 lg:grid-cols-2">
              <Reveal delay={80}>
                <article className="card group h-full p-6 transition-colors hover:border-lime/30">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-[16px] font-semibold">Pakistan</h3>
                    <span className="chip !border-lime/25 !bg-mint-soft !text-lime">prefix level</span>
                  </div>
                  <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
                    Mobile and landline prefixes mapped to Jazz, Zong, Telenor, Ufone, SCOM and PTCL. Confidence
                    reflects how specific the matched prefix is.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {['Jazz', 'Zong', 'Telenor', 'Ufone', 'SCOM', 'PTCL'].map((network) => (
                      <span
                        key={network}
                        className="rounded-full border border-line bg-panel2 px-2.5 py-1 font-mono text-[10px] text-muted transition-colors group-hover:border-line2"
                      >
                        {network}
                      </span>
                    ))}
                  </div>
                </article>
              </Reveal>

              <Reveal delay={160}>
                <article className="card h-full p-6 transition-colors hover:border-lime/30">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-[16px] font-semibold">Everywhere else</h3>
                    <span className="chip">validation level</span>
                  </div>
                  <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
                    Formatting, country, region and line type are exact worldwide. Carrier names need an HLR
                    provider - set <code className="mono text-[11.5px] text-ink">NUMVERIFY_ACCESS_KEY</code> on the
                    server and live results appear here. Keys never reach the browser.
                  </p>
                  <div className="mt-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
                    <span className="pulse-dot" /> provider adapter ready
                  </div>
                </article>
              </Reveal>
            </div>
          </section>

          <section className="wrap py-14">
            <Reveal>
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
                {[
                  { value: '240+', label: 'regions validated' },
                  { value: '60/min', label: 'public API budget' },
                  { value: '0', label: 'numbers stored' },
                  { value: '~20ms', label: 'typical check' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-panel px-5 py-6">
                    <p className="mono text-[26px] font-medium leading-none text-lime">{stat.value}</p>
                    <p className="label mt-2">{stat.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </section>

          <section id="how" className="wrap scroll-mt-28 py-16">
            <Reveal>
              <p className="label">how it works</p>
              <h2 className="mt-2 max-w-2xl font-display text-[2.1rem] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[3rem]">
                Three steps between a number and its network.
              </h2>
            </Reveal>

            <div className="mt-9 grid gap-4 md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Paste it in any shape',
                  copy: 'Local format, international format, 00 prefix, spaces, dashes or brackets. Add a country hint if there is no +code.',
                },
                {
                  step: '02',
                  title: 'Validate against metadata',
                  copy: 'The number is parsed with the same numbering-plan metadata carriers use: country, calling code and exact line type.',
                },
                {
                  step: '03',
                  title: 'Read the network',
                  copy: 'A prefix dataset returns the carrier with a confidence score. Add an HLR provider key for live worldwide carrier names.',
                },
              ].map((item, index) => (
                <Reveal key={item.step} delay={index * 90}>
                  <article className="card h-full p-6">
                    <span className="mono text-[11px] tracking-[0.18em] text-lime">{item.step}</span>
                    <h3 className="mt-3 text-[15px] font-semibold">{item.title}</h3>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{item.copy}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>

          <section id="features" className="wrap scroll-mt-28 py-16">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="label">what you get</p>
                  <h2 className="mt-2 max-w-xl font-display text-[2.1rem] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[3rem]">
                    Six answers, zero mystery.
                  </h2>
                </div>
                <span className="chip"><Sparkles className="h-3 w-3" /> no accounts</span>
              </div>
            </Reveal>

            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'Worldwide validation', copy: '240+ regions from official numbering plans, including length and check digits.' },
                { title: 'Exact line type', copy: 'Mobile, landline, VoIP, toll free, premium rate, pager, UAN and more.' },
                { title: 'Carrier estimate', copy: 'Prefix-level network with a visible confidence score, never a silent guess.' },
                { title: 'Clean formats', copy: 'E.164, international and national strings, ready to copy into any system.' },
                { title: 'Public JSON API', copy: 'One GET endpoint, 60 lookups a minute per IP, no sign-up or API key.' },
                { title: 'Privacy by design', copy: 'Stateless checks, no numbers table, no profiles, no resale.' },
              ].map((item, index) => (
                <Reveal key={item.title} delay={(index % 3) * 80}>
                  <article className="group card h-full p-5 transition-colors hover:border-lime/30">
                    <span className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-panel2 text-lime transition-colors group-hover:border-lime/30">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <h3 className="mt-4 text-[13.5px] font-semibold">{item.title}</h3>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{item.copy}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>

          <section id="compare" className="wrap scroll-mt-28 py-16">
            <Reveal>
              <p className="label">the difference</p>
              <h2 className="mt-2 max-w-2xl font-display text-[2.1rem] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[3rem]">
                Network facts, not people search.
              </h2>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-8 overflow-hidden rounded-2xl border border-line">
                <div className="grid grid-cols-[1.4fr_1fr_1fr] bg-panel2/70 px-5 py-3 text-[10px] uppercase tracking-[0.16em] text-faint">
                  <span>Capability</span>
                  <span className="text-center text-lime">numlens</span>
                  <span className="text-center">people-search apps</span>
                </div>
                {[
                  ['Format, country and line type', 'Exact', 'Usually hidden'],
                  ['Carrier / network', 'Estimate + confidence', 'Sometimes'],
                  ['Owner name and CNIC', 'Never', 'Their business model'],
                  ['Live location', 'Never', 'Claimed, often fake'],
                  ['Stores your lookups', 'No', 'Usually yes'],
                ].map(([row, ours, theirs], index) => (
                  <div
                    key={row}
                    className={`grid grid-cols-[1.4fr_1fr_1fr] items-center px-5 py-3.5 text-[12px] ${
                      index % 2 ? 'bg-panel' : 'bg-panel/60'
                    }`}
                  >
                    <span className="text-muted">{row}</span>
                    <span className="text-center font-medium text-lime">{ours}</span>
                    <span className="text-center text-faint">{theirs}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </section>

          <section className="wrap py-16">
            <Reveal>
              <p className="label">use cases</p>
              <h2 className="mt-2 max-w-2xl font-display text-[2.1rem] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[3rem]">
                Useful without being creepy.
              </h2>
            </Reveal>

            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: 'Support desks', copy: 'Catch bad numbers before a ticket bounces back.' },
                { title: 'Signup forms', copy: 'Pre-fill country and normalize to E.164 on the fly.' },
                { title: 'Fraud triage', copy: 'Spot VoIP and premium-rate lines in a queue.' },
                { title: 'Developers', copy: 'Pipe the JSON API into onboarding or CRM flows.' },
              ].map((item, index) => (
                <Reveal key={item.title} delay={index * 70}>
                  <article className="card h-full p-5">
                    <p className="text-[13px] font-semibold">{item.title}</p>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{item.copy}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>

          <section id="api" className="wrap scroll-mt-28 py-16">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <Reveal>
                <div>
                  <p className="label">public api</p>
                  <h2 className="mt-2 font-display text-[2.1rem] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[3rem]">
                    One endpoint.
                    <br />
                    JSON out.
                  </h2>
                  <p className="mt-3 max-w-md text-[13px] leading-relaxed text-muted">
                    Same engine the page uses. 60 lookups per minute per IP, no key required. Numbers are never
                    logged.
                  </p>
                  <div className="mt-6 grid gap-2 text-[12px]">
                    {[
                      ['GET', '/api/lookup?number='],
                      ['POST', '/api/lookup'],
                      ['GET', '/api/coverage'],
                      ['GET', '/api/health'],
                    ].map(([method, path]) => (
                      <div key={path} className="flex items-center gap-2">
                        <span
                          className={`mono rounded px-1.5 py-0.5 text-[9.5px] ${
                            method === 'POST' ? 'bg-sky/10 text-sky' : 'bg-mint-soft text-lime'
                          }`}
                        >
                          {method}
                        </span>
                        <span className="mono text-muted">{path}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={120}>
                <div className="window">
                  <div className="window-bar">
                    <span className="dot bg-[#ff5f57]/80" />
                    <span className="dot bg-[#febc2e]/80" />
                    <span className="dot bg-[#28c840]/80" />
                    <span className="mono ml-2 text-[10px] text-faint">shell</span>
                    <span className="mono ml-auto text-[9px] uppercase tracking-[0.16em] text-faint">json</span>
                  </div>
                  <pre className="overflow-x-auto bg-[#070b07] px-5 py-5 text-[11px] leading-relaxed text-white/80">
                    <code>{CURL}
{`

{
  "valid": true,
  "e164": "+923001234567",
  "country": { "iso": "PK", "callingCode": "92" },
  "lineType": { "label": "Mobile" },
  "carrier": { "name": "Jazz", "confidence": 0.92 }
}`}</code>
                  </pre>
                </div>
              </Reveal>
            </div>
          </section>

          <section id="privacy" className="wrap scroll-mt-28 pb-24 pt-10">
            <Reveal>
              <div className="card overflow-hidden">
                <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[0.85fr_1.15fr]">
                  <div>
                    <span className="chip"><ShieldCheck className="h-3 w-3" /> privacy</span>
                    <h2 className="mt-4 font-display text-[2rem] font-semibold leading-[1.05] tracking-[-0.045em]">
                      It tells you the network.
                      <br />
                      Nothing about the person.
                    </h2>
                    <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
                      NumLens is deliberately not a people-search tool. Carrier and line metadata are network facts,
                      so that is all we expose - and we build no histories.
                    </p>
                    <a href="#lookup" className="btn btn-ink mt-6 !py-3 !text-[12.5px]">
                      Run a check <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { title: 'No owner identity', copy: 'No names, CNIC, addresses or linked accounts.' },
                      { title: 'No live location', copy: 'We cannot see where a phone is, and we do not claim to.' },
                      { title: 'No storage', copy: 'Lookups run in memory; there is no numbers table to leak.' },
                      { title: 'No dark patterns', copy: 'No sign-up walls, no forced SMS, no data resale.' },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="rounded-2xl border border-line bg-bg/60 p-4 transition-colors hover:border-lime/25"
                      >
                        <p className="text-[12.5px] font-semibold">{item.title}</p>
                        <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{item.copy}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </section>
          <section id="faq" className="wrap scroll-mt-28 pb-8 pt-16">
            <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
              <Reveal>
                <div>
                  <p className="label">faq</p>
                  <h2 className="mt-2 font-display text-[2.1rem] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[3rem]">
                    Straight answers.
                  </h2>
                  <p className="mt-3 max-w-sm text-[12.5px] leading-relaxed text-muted">
                    If something here sounds too good to be true, it usually is. NumLens only claims what the
                    metadata can prove.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={90}>
                <div className="card divide-y divide-line px-6">
                  {[
                    {
                      q: 'Can this track someone live?',
                      a: 'No. There is no location data in a phone number lookup, and NumLens does not pretend otherwise. Anything claiming live tracking from a number alone is a scam.',
                    },
                    {
                      q: 'Can it tell me who owns a number?',
                      a: 'No. Owner names are not part of numbering metadata, and exposing them would make this a people-search tool. We deliberately do not build that.',
                    },
                    {
                      q: 'Why is the carrier an estimate?',
                      a: 'Prefixes indicate the original allocation, but mobile number portability moves numbers between networks. We show a confidence score and never hide the source.',
                    },
                    {
                      q: 'Do you store the numbers I check?',
                      a: 'No. Checks are processed in memory and the API sets no-store caching. There is no numbers table in the database because there is no database.',
                    },
                    {
                      q: 'Can I use the API in my own product?',
                      a: 'Yes. It is one GET endpoint with a 60 requests per minute per IP budget, no key required. Self-hosting is a single Node process plus static files.',
                    },
                  ].map((item) => (
                    <details key={item.q} className="faq group">
                      <summary className="flex items-center justify-between gap-4 py-4 text-[13px] font-medium">
                        {item.q}
                        <Plus className="faq-plus h-3.5 w-3.5 shrink-0 text-faint" />
                      </summary>
                      <p className="pb-4 pr-6 text-[12px] leading-relaxed text-muted">{item.a}</p>
                    </details>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>

          <section className="wrap pb-24 pt-16">
            <Reveal>
              <div className="glow-band card relative overflow-hidden px-6 py-14 text-center sm:px-12">
                <span className="chip"><Aperture className="h-3 w-3" /> one check away</span>
                <h2 className="mx-auto mt-5 max-w-2xl font-display text-[2.4rem] font-semibold leading-[0.98] tracking-[-0.05em] sm:text-[3.6rem]">
                  Check one number.
                  <br />
                  See the whole network<span className="accent-dot" aria-hidden="true" />
                </h2>
                <p className="mx-auto mt-4 max-w-md text-[12.5px] leading-relaxed text-muted">
                  Free, keyless and stateless. Bring a number in any format and leave with clean E.164, line type
                  and a carrier estimate.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                  <a href="#lookup" className="btn btn-ink">
                    Run a check <ArrowRight className="h-4 w-4" />
                  </a>
                  <a href="#api" className="btn btn-ghost">
                    Read the API
                  </a>
                </div>
              </div>
            </Reveal>
          </section>
        </main>

        <footer className="border-t border-line">
          <div className="wrap py-8">
            <p className="mono text-center text-[9px] uppercase tracking-[0.22em] text-faint">
              built on open infrastructure you can check
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11.5px] text-muted">
              {['libphonenumber', 'Hono', 'React 19', 'TypeScript', 'Vite', 'Tailwind CSS 4'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-lime/60" /> {item}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              <span className="mono text-[10px] text-faint">numlens - estimates, not surveillance</span>
              <span className="mono text-[10px] uppercase tracking-[0.14em] text-faint">
                built by{' '}
                <a href="https://github.com/Faizan-khan144" target="_blank" rel="noreferrer" className="text-muted hover:text-lime">
                  Faizan Khan
                </a>
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App


