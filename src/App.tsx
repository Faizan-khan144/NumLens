import { useEffect, useRef, useState, type CSSProperties, type FormEvent, type MouseEvent, type ReactNode } from 'react'
import {
  Aperture,
  ArrowRight,
  Check,
  ChevronDown,
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
import { createPortal } from 'react-dom'
import { lookup, type LookupResult } from './lib/api'

import { COUNTRIES } from './lib/countries'

const SAMPLES = [
  { label: 'Jazz', number: '+923001234567' },
  { label: 'Zong', number: '+923101234567' },
  { label: 'Ufone', number: '+923301234567' },
  { label: 'Telenor', number: '+923451234567' },
  { label: 'Karachi', number: '+922134567890' },
  { label: 'United States', number: '+14155552671' },
  { label: 'United Kingdom', number: '+447911123456' },
]

const MARQUEE = ['Worldwide validation', 'Jazz', 'Zong', 'Telenor', 'Ufone', 'SCOM', 'PTCL', '240+ numbering plans', 'Line type detection', 'No storage', 'Public API']


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
  const onCheck = window.location.pathname.replace(/\/+$/, '') === '/check'
  const links = [
    { href: '/check', label: 'Check', active: onCheck },
    { href: '/#coverage', label: 'Coverage', active: false },
    { href: '/#showcase', label: 'Showcase', active: false },
    { href: '/#privacy', label: 'Privacy', active: false },
  ]

  return (
    <div className="sticky top-0 z-40 bg-gradient-to-b from-[#f3f4f7] via-[#f3f4f7]/80 to-transparent pb-2 pt-3">
      <div className="wrap">
        <header className="relative flex h-[64px] items-center gap-3 rounded-2xl border border-black/[0.08] bg-white/85 px-3 shadow-[0_16px_44px_rgba(20,24,36,0.09)] backdrop-blur-2xl">
          <span className="nav-edge" aria-hidden="true" />

          <a href="/" className="group flex shrink-0 items-center gap-2.5">
            <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-[12px] bg-gradient-to-br from-[#ff3b2e] to-[#ff9a4d] text-white shadow-[0_8px_22px_rgba(244,68,46,0.32)]">
              <Aperture className="h-[18px] w-[18px] transition-transform duration-700 group-hover:rotate-180" strokeWidth={2.3} />
            </span>
            <span className="flex flex-col leading-none">
              <span className="flex items-center gap-1.5 font-display text-[17px] font-semibold tracking-tight">
                numlens
                <span className="mono rounded-full border border-[#f4442e]/20 bg-[#xfff1ec] px-1.5 py-0.5 text-[7px] uppercase tracking-[0.14em] text-[#c9331f]">
                  beta
                </span>
              </span>
              <span className="mono mt-1 text-[7.5px] uppercase tracking-[0.26em] text-faint">phone intelligence</span>
            </span>
          </a>

          <nav className="ml-4 hidden items-stretch self-stretch md:flex">
            {links.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`group relative flex items-center px-3.5 text-[12.5px] transition-colors ${
                  item.active ? 'font-semibold text-ink' : 'text-muted hover:text-ink'
                }`}
              >
                {item.label}
                <span
                  className={`absolute inset-x-3.5 bottom-0 h-[2px] rounded-full bg-gradient-to-r from-[#f4442e] to-[#ff9a5c] transition-transform duration-300 ${
                    item.active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <span className="mono mr-1 hidden items-center gap-2 rounded-full border border-black/[0.07] bg-white px-3 py-1.5 text-[8.5px] uppercase tracking-[0.14em] text-muted xl:flex">
              <span className="pulse-dot" /> 245 countries
            </span>
            <a
              href="https://github.com/Faizan-khan144/NumLens"
              target="_blank"
              rel="noreferrer"
              aria-label="NumLens on GitHub"
              className="grid h-10 w-10 place-items-center rounded-full border border-black/[0.08] bg-white text-muted transition-colors hover:border-[#f4442e]/30 hover:text-ink"
            >
              <Code2 className="h-4 w-4" />
            </a>
            <a href="/check" className="btn btn-ink !px-4 !py-2.5 !text-[12.5px]">
              Check a number <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </header>
      </div>
    </div>
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

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-[#f7f8fa] px-5 py-3">
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

function NumberWindow({ result }: { result: Extract<LookupResult, { valid: true }> }) {
  return (
    <div className="mx-auto mt-8 max-w-4xl">
      <div className="window">
        <div className="window-bar">
          <span className="dot bg-[#ff5f57]/80" />
          <span className="dot bg-[#febc2e]/80" />
          <span className="dot bg-[#28c840]/80" />
          <span className="mono ml-2 truncate text-[10.5px] text-faint">
            numlens.app/check/{result.e164.replace('+', '')}
          </span>
          <span className="mono ml-auto flex shrink-0 items-center gap-1.5 text-[9px] uppercase tracking-[0.16em] text-lime">
            <span className="pulse-dot" /> live
          </span>
        </div>
        <ResultBody result={result} demo={false} />
      </div>
    </div>
  )
}

function Stat({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(to)
      return
    }
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(Math.max((now - start) / 1400, 0), 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(to * eased))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [to])

  return (
    <p className="mono text-[26px] font-medium leading-none text-ink">
      {prefix}
      {value}
      {suffix}
    </p>
  )
}

function PhoneInput() {
  const [value, setValue] = useState('')
  const [hint, setHint] = useState('')
  const [paused, setPaused] = useState(false)
  const [tick, setTick] = useState(0)
  const [typing, setTyping] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (paused || value) return
    const samples = ['+92 300 1234567', '+92 310 1234567', '+92 345 1234567', '+1 415 555 2671']
    let sample = 0
    let length = 0
    let direction = 1
    const id = window.setInterval(() => {
      const text = samples[sample]
      length += direction
      if (length >= text.length) {
        length = text.length
        direction = -1
      } else if (length <= 0) {
        length = 0
        direction = 1
        sample = (sample + 1) % samples.length
      }
      setHint(text.slice(0, length))
    }, 90)
    return () => window.clearInterval(id)
  }, [paused, value])

  const formatNumber = (raw: string) => {
    const plus = raw.trim().startsWith('+')
    const digits = raw.replace(/\D/g, '').slice(0, 15)
    if (!digits) return plus ? '+' : ''
    if (plus && digits.startsWith('92')) {
      const rest = digits.slice(2)
      const head = rest.slice(0, 3)
      const tail = rest.slice(3, 10)
      return `+92${head ? ` ${head}` : ''}${tail ? ` ${tail}` : ''}`
    }
    if (!plus && digits.startsWith('0')) {
      return [digits.slice(0, 4), digits.slice(4, 7), digits.slice(7, 11)].filter(Boolean).join(' ')
    }
    return `${plus ? '+' : ''}${digits}`
  }

  const digits = value.replace(/\D/g, '')
  const filled = Math.min(digits.length, 10)
  const valid = digits.length >= 10

  return (
    <label className="relative flex flex-1 items-center gap-2 rounded-xl bg-[#f4f6f9] px-2 py-1 ring-1 ring-transparent transition-all duration-300 focus-within:bg-white focus-within:ring-[#f4442e]/30 focus-within:shadow-[0_0_0_4px_rgba(244,68,46,0.08)]">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[#fff1ec] text-lime shadow-[0_1px_3px_rgba(20,24,36,0.08)]">
        <Signal className={`h-4 w-4 ${typing ? 'animate-pulse' : ''}`} />
      </span>

      <span className="relative flex min-w-0 flex-1 flex-col justify-center">
        <span className="pointer-events-none absolute -top-0.5 left-0 mono text-[7.5px] uppercase tracking-[0.2em] text-faint">
          {value ? (valid ? 'looks valid' : 'typing') : 'enter a number'}
        </span>
        <input
          name="number"
          value={value}
          placeholder={hint || '+92 300 1234567'}
          inputMode="tel"
          autoComplete="tel"
          required
          maxLength={24}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onChange={(event) => {
            setValue(formatNumber(event.target.value))
            setTick((current) => current + 1)
            setTyping(true)
            if (timer.current) window.clearTimeout(timer.current)
            timer.current = window.setTimeout(() => setTyping(false), 220)
          }}
          className={`type-caret w-full min-w-0 bg-transparent pb-1 pt-2.5 font-mono text-[15.5px] tracking-tight text-ink outline-none placeholder:text-faint ${
            typing ? 'input-live' : ''
          }`}
        />
        {typing && <span key={tick} className="caret-flash" aria-hidden="true" />}
      </span>

      <span className="sig hidden shrink-0 sm:flex" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, index) => (
          <i key={index} className={index < filled ? (index >= filled - 1 && typing ? 'hot' : 'on') : ''} />
        ))}
      </span>

      <span
        className={`mono mr-1 hidden shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[8.5px] uppercase tracking-[0.12em] transition-colors md:flex ${
          valid ? 'bg-mint-soft text-lime' : 'bg-white text-faint'
        }`}
      >
        {valid ? <Check className="h-2.5 w-2.5" /> : null}
        {valid ? 'ok' : `${filled}/10`}
      </span>
    </label>
  )
}

function CountrySelect({ name, value, onChange }: { name?: string; value?: string; onChange?: (code: string) => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [internal, setInternal] = useState(value || 'PK')
  const [pos, setPos] = useState({ top: 0, left: 0, width: 288, up: false })
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)

  const selectedCode = value ?? internal
  const selected =
    COUNTRIES.find((item) => item.code === selectedCode) ?? COUNTRIES.find((item) => item.code === 'PK')!

  const place = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (!rect) return
    const width = Math.min(300, window.innerWidth - 16)
    const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8))
    const spaceBelow = window.innerHeight - rect.bottom
    const up = spaceBelow < 350 && rect.top > spaceBelow
    setPos({ top: up ? rect.top - 8 : rect.bottom + 8, left, width, up })
  }

  useEffect(() => {
    if (!open) return
    place()

    const onDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node
      if (!triggerRef.current?.contains(target) && !panelRef.current?.contains(target)) setOpen(false)
    }
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onMove = () => place()

    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onMove)
    window.addEventListener('scroll', onMove, true)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onMove)
      window.removeEventListener('scroll', onMove, true)
    }
  }, [open])

  const search = query.trim().toLowerCase()
  const filtered = COUNTRIES.filter((item) =>
    !search ||
    item.name.toLowerCase().includes(search) ||
    item.code.toLowerCase().includes(search) ||
    item.dial.includes(search.replace('+', '')),
  )

  const pick = (code: string) => {
    onChange?.(code)
    setInternal(code)
    setOpen(false)
    setQuery('')
  }

  return (
    <div className="relative">
      {name ? <input type="hidden" name={name} value={selectedCode} /> : null}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center gap-1.5 rounded-xl px-2.5 py-2.5 text-left transition-all duration-200 ${
          open ? 'bg-white ring-1 ring-[#f4442e]/25' : 'bg-[#f4f6f9] hover:bg-[#eef0f4]'
        }`}
      >
        <span className="mono grid h-6 w-7 shrink-0 place-items-center rounded-md bg-[#fff1ec] text-[9px] font-semibold tracking-wide text-lime">
          {selected.code}
        </span>
        <span className="mono text-[12px] font-medium">+{selected.dial}</span>
        <ChevronDown
          className={`ml-auto h-3.5 w-3.5 shrink-0 text-faint transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open
        ? createPortal(
            <div
              ref={panelRef}
              role="listbox"
              style={{
                top: pos.top,
                left: pos.left,
                width: pos.width,
                transform: pos.up ? 'translateY(-100%)' : undefined,
              }}
              className="menu-in fixed z-[100] overflow-hidden rounded-2xl border border-black/10 bg-[#ffffff] p-2 shadow-[0_24px_60px_rgba(20,24,36,0.22)]"
            >
              <div className="flex items-center gap-2 rounded-xl bg-[#f4f6f9] px-2.5 py-2">
                <Search className="h-3.5 w-3.5 shrink-0 text-faint" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={`Search ${COUNTRIES.length} countries`}
                  className="w-full min-w-0 bg-transparent text-[12px] text-ink outline-none placeholder:text-faint"
                />
              </div>

              <div className="mt-1.5 max-h-[252px] overflow-y-auto pr-0.5">
                {filtered.length === 0 ? (
                  <p className="px-2 py-6 text-center text-[11px] text-faint">No country found</p>
                ) : (
                  filtered.map((item, index) => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => pick(item.code)}
                      className={`menu-item-in flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[#f6f7f9] ${
                        item.code === selectedCode ? 'bg-[#fff3f0]' : ''
                      }`}
                      style={{ animationDelay: `${Math.min(index, 12) * 10}ms` }}
                    >
                      <span className="mono grid h-6 w-7 shrink-0 place-items-center rounded-md bg-[#f4f6f9] text-[9px] font-semibold tracking-wide text-muted">
                        {item.code}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[12px]">{item.name}</span>
                      <span className="mono shrink-0 text-[10.5px] text-faint">+{item.dial}</span>
                      {item.code === selectedCode ? <Check className="h-3 w-3 shrink-0 text-lime" /> : null}
                    </button>
                  ))
                )}
              </div>

              <div className="mt-1.5 flex items-center justify-between border-t border-black/[0.07] px-2 pb-0.5 pt-1.5">
                <span className="label">{filtered.length} countries</span>
                <span className="label">esc to close</span>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

function PreviewCard() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [step, setStep] = useState(0)
  const steps = ['reading prefix', 'validating length', 'matching carrier', 'estimating network']

  useEffect(() => {
    const id = window.setInterval(() => setStep((value) => (value + 1) % steps.length), 2100)
    return () => window.clearInterval(id)
  }, [steps.length])

  const onMove = (event: MouseEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    const px = (event.clientX - box.left) / box.width - 0.5
    const py = (event.clientY - box.top) / box.height - 0.5
    setTilt({ x: Number((px * 2).toFixed(2)), y: Number((-py * 1.6).toFixed(2)) })
  }

  return (
    <div className="relative mx-auto w-full max-w-md" style={{ perspective: '1200px' }}>
      <div
        className="pointer-events-none absolute -inset-8 rounded-[36px] bg-[radial-gradient(closest-side,rgba(255,90,69,0.22),transparent_72%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-8 -top-4 h-full rotate-[2.5deg] rounded-[24px] border border-black/[0.06] bg-[#ffffff]/70"
        aria-hidden="true"
      />
      <div
        onMouseMove={onMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        className="card relative overflow-hidden p-5 transition-transform duration-300 ease-out sm:p-6"
        style={{
          transform: `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
          boxShadow: '0 34px 80px rgba(66,40,24,0.16), 0 0 50px rgba(255,120,60,0.12)',
        }}
      >
        <div className="scanline" aria-hidden="true" />
        <div className="flex items-center justify-between">
          <span className="label">sample check</span>
          <span className="mono flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-lime">
            <span className="pulse-dot" />
            <span key={step} className="pop inline-block">{steps[step]}</span>
          </span>
        </div>

        <div className="rise mt-4 flex items-end justify-between border-b border-black/[0.06] pb-3" style={{ animationDelay: '150ms' }}>
          <p className="mono text-[20px] tracking-tight text-ink">0300 123 4567</p>
          <span className="mono text-[9px] uppercase tracking-[0.14em] text-faint">e.164</span>
        </div>

        <div className="rise mt-3 flex items-center gap-3" style={{ animationDelay: '230ms' }}>
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-black/[0.09] bg-[#f7f8fa] font-mono text-[11px] font-semibold text-lime">
            PK
          </span>
          <div>
            <p className="text-[14px] font-semibold">Pakistan</p>
            <p className="mono text-[10.5px] text-faint">+92 / mobile</p>
          </div>
          <span className="ml-auto rounded-full border border-lime/25 bg-mint-soft px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-lime">
            valid
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="label">carrier</p>
            <p className="font-display text-[30px] font-semibold leading-tight tracking-tight">Jazz</p>
          </div>
          <span className="mono text-[12px] text-lime">92%</span>
        </div>
        <div className="bar mt-2">
          <span className="bar-grow" style={{ width: '92%' }} />
        </div>
        <p className="rise mt-2 text-[11px] text-muted" style={{ animationDelay: '390ms' }}>prefix-level estimate - confidence always visible</p>

        <div className="rise mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-black/[0.08] bg-[#e7e9ee]" style={{ animationDelay: '470ms' }}>
          {[
            { k: 'line', v: 'Mobile' },
            { k: 'country', v: 'PK' },
            { k: 'code', v: '+92' },
          ].map((item) => (
            <div key={item.k} className="bg-white px-3 py-3">
              <p className="label">{item.k}</p>
              <p className="mono mt-1 text-[12px]">{item.v}</p>
            </div>
          ))}
        </div>

        <a href="/check" className="rise group mt-5 flex items-center justify-between rounded-xl border border-black/[0.08] bg-[#ffffff] px-4 py-3 text-[12px] font-medium transition-colors hover:border-[#ff7a55]/35" style={{ animationDelay: '550ms' }}>
          Open the desk
          <ArrowRight className="h-3.5 w-3.5 text-lime transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>

      <div className="float-delay absolute -right-4 top-24 hidden items-center gap-1.5 rounded-full border border-black/[0.1] bg-[#ffffff]/95 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted shadow-2xl backdrop-blur sm:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-lime" /> E.164 ready
      </div>
      <div className="float-slow absolute -left-5 bottom-28 hidden items-center gap-1.5 rounded-full border border-black/[0.1] bg-[#ffffff]/95 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted shadow-2xl backdrop-blur sm:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-[#ff8a3d]" /> 0 stored
      </div>
    </div>
  )
}

function CheckPage() {
  const params = new URLSearchParams(window.location.search)
  const initial = params.get('number') ?? ''
  const [number, setNumber] = useState(initial)
  const [country, setCountry] = useState(params.get('country') || 'PK')
  const [result, setResult] = useState<LookupResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const started = useRef(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const run = async (value: string, hint: string) => {
    const trimmed = value.trim()
    if (!trimmed) return

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

  useEffect(() => {
    if (started.current) return
    started.current = true
    if (initial) void run(initial, params.get('country') || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    void run(number, country)
  }

  const shown = result && result.valid ? result : null

  return (
    <section className="wrap pb-20 pt-14 sm:pt-20">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <span className="chip"><span className="pulse-dot" /> number desk</span>
          <h1 className="mt-5 font-display text-[2.9rem] font-semibold leading-[0.94] tracking-[-0.05em] sm:text-[4.4rem]">
            Check a number.
          </h1>
          <p className="mt-4 max-w-lg text-[13.5px] leading-relaxed text-muted">
            Paste any format - local, international or with a 00 prefix. NumLens returns clean E.164, the exact
            country and line type, and a carrier estimate with its confidence.
          </p>
        </div>
        <span className="chip hidden sm:inline-flex"><Code2 className="h-3 w-3" /> GET /api/lookup</span>
      </div>

      <form onSubmit={onSubmit} className="card mt-8 flex max-w-3xl flex-col gap-2 p-2.5 sm:flex-row sm:items-center">
        <label className="rise relative block flex-1" style={{ animationDelay: '280ms' }}>
          <span className="sr-only">Phone number</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            ref={inputRef}
            value={number}
            onChange={(event) => setNumber(event.target.value)}
            placeholder="+92 300 1234567"
            inputMode="tel"
            autoComplete="tel"
            autoFocus
            className="field !border-transparent !bg-transparent !pl-11 focus:!border-transparent focus:!shadow-none"
          />
        </label>

        <div className="sm:w-[152px]">
          <CountrySelect value={country} onChange={setCountry} />
        </div>

        <button type="submit" disabled={loading || !number.trim()} className="btn btn-ink !rounded-xl !px-5 !py-3.5 disabled:opacity-40">
          {loading ? <Loader2 className="h-4 w-4 spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? 'Checking' : 'Check'}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="label mr-1">try</span>
        {SAMPLES.map((sample) => (
          <button
            key={sample.number}
            type="button"
            onClick={() => {
              setNumber(sample.number)
              setCountry('')
              void run(sample.number, '')
            }}
            className="rounded-full border border-line bg-panel px-3 py-1.5 text-[11px] text-muted transition-colors hover:border-lime/40 hover:text-ink"
          >
            {sample.label}
          </button>
        ))}
      </div>

      <div aria-live="polite">
        {error && (
          <div className="card mt-8 max-w-3xl border-rose/30 px-5 py-4">
            <p className="label text-rose">request failed</p>
            <p className="mt-1 text-[13.5px]">{error}</p>
          </div>
        )}

        {result && !result.valid && (
          <div className="card pop mt-8 max-w-3xl border-rose/25 px-6 py-6">
            <p className="label text-rose">check failed</p>
            <h2 className="mt-2 font-display text-[24px] font-semibold tracking-tight">{result.reason}</h2>
            {result.hint && <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-muted">{result.hint}</p>}
            <p className="mono mt-4 text-[10px] text-faint">checked in {result.durationMs}ms - nothing stored</p>
          </div>
        )}
      </div>

      {shown ? (
        <NumberWindow result={shown} />
      ) : (
        <div className="card mx-auto mt-8 max-w-4xl px-6 py-14 text-center">
          <Aperture className="mx-auto h-6 w-6 text-faint" />
          <p className="mt-3 text-[14px] font-medium">Your result appears here</p>
          <p className="mx-auto mt-1 max-w-sm text-[12px] leading-relaxed text-muted">
            Validation, country, line type, carrier estimate and copyable formats - all in one card.
          </p>
        </div>
      )}

      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        {[
          { icon: ShieldCheck, title: 'Exact validation', copy: 'Official numbering-plan metadata, not regex guesses.' },
          { icon: Signal, title: 'Carrier + confidence', copy: 'Prefix estimate with source and portability warning.' },
          { icon: Lock, title: 'Nothing stored', copy: 'In-memory checks, no history and no account.' },
        ].map((item) => (
          <div key={item.title} className="card p-4">
            <item.icon className="h-4 w-4 text-lime" />
            <p className="mt-3 text-[12.5px] font-semibold">{item.title}</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{item.copy}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function App() {
  const isCheck = window.location.pathname.replace(/\/+$/, '') === '/check'

  return (
    <div id="top" className="grain relative flex min-h-screen flex-col overflow-x-clip">
      <div className="scroll-progress" aria-hidden="true" />
      <div className="aurora" aria-hidden="true" />

      <div className="relative z-10 flex flex-1 flex-col">
        <Header />

        <main className="flex-1">
          {isCheck ? (
            <CheckPage />
          ) : (
            <>
              <section
                id="lookup"
                className="spot wrap pb-12 pt-14 sm:pt-20"
                onMouseMove={(event) => {
                  const target = event.currentTarget
                  const rect = target.getBoundingClientRect()
                  target.style.setProperty('--mx', `${event.clientX - rect.left}px`)
                  target.style.setProperty('--my', `${event.clientY - rect.top}px`)
                }}
              >
                <div className="grid gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
                  <div>
                    <div className="rise flex items-center gap-3" style={{ animationDelay: '30ms' }}>
                      <span className="line-grow h-px w-8 bg-gradient-to-r from-[#f4442e] to-transparent" />
                      <span className="label">phone intelligence / v1</span>
                      <span className="mono rounded-full border border-[#f4442e]/25 bg-[#ffe9e6] px-2 py-0.5 text-[8.5px] uppercase tracking-[0.14em] text-[#c9331f]">
                        beta
                      </span>
                      <span className="eq" aria-hidden="true"><span /><span /><span /><span /></span>
                    </div>

                    <h1 className="mt-6 font-display text-[3.1rem] font-semibold leading-[0.92] tracking-[-0.055em] sm:text-[4.9rem]">
                      <span className="mr-[0.22em]"><span className="word-in" style={{ animationDelay: '90ms' }}>Any</span></span>
                      <span className="word-in" style={{ animationDelay: '170ms' }}>number.</span>
                      <br />
                      <span className="mr-[0.22em]"><span className="word-in grad-text" style={{ animationDelay: '290ms' }}>Its</span></span>
                      <span className="mr-[0.22em]"><span className="word-in grad-text" style={{ animationDelay: '360ms' }}>whole</span></span>
                      <span className="relative inline-block">
                        <span className="word-in grad-text" style={{ animationDelay: '430ms' }}>network</span>
                        <svg
                          className="draw-line pointer-events-none absolute -bottom-2 left-0 w-full"
                          height="10"
                          viewBox="0 0 200 10"
                          fill="none"
                          preserveAspectRatio="none"
                          aria-hidden="true"
                        >
                          <defs>
                            <linearGradient id="underline" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                              <stop stopColor="#f4442e" stopOpacity="0.15" />
                              <stop offset="0.5" stopColor="#f4442e" />
                              <stop offset="1" stopColor="#ff9a5c" stopOpacity="0.9" />
                            </linearGradient>
                          </defs>
                          <path d="M2 7C48 2 132 2 198 5" stroke="url(#underline)" strokeWidth="3.5" strokeLinecap="round" />
                        </svg>
                      </span>
                      <span className="accent-dot" aria-hidden="true" />
                    </h1>

                    <p className="mt-6 max-w-lg text-[14px] leading-relaxed text-muted">
                      {'Every phone number carries a country, a line type and a network. NumLens reads all three, states its confidence, and never pretends to know the person behind it.'
                        .split(' ')
                        .map((word, index) => (
                          <span
                            key={`${word}-${index}`}
                            className="word-in mr-[0.28em]"
                            style={{ animationDelay: `${480 + index * 16}ms` }}
                          >
                            {word}
                          </span>
                        ))}
                    </p>

                    <div className="rise mt-9 max-w-xl" style={{ animationDelay: '210ms' }}>
                    <form
                      action="/check"
                      method="get"
                      className="form-glow flex flex-col gap-2 rounded-2xl border border-black/10 bg-white p-2 sm:flex-row sm:items-center"
                    >
                      <div className="flex flex-1">
                        <span className="sr-only">Phone number</span>
                        <PhoneInput />
                      </div>

                      <div className="sm:w-[136px]">
                        <CountrySelect name="country" />
                      </div>

                      <button type="submit" className="btn btn-ink !px-5 !py-3.5">
                        <Sparkles className="h-4 w-4" /> Check
                      </button>
                    </form>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-1.5">
                      <span className="rise label mr-1" style={{ animationDelay: '290ms' }}>try</span>
                      {SAMPLES.slice(0, 4).map((sample, index) => (
                        <a
                          key={sample.number}
                          href={`/check?number=${encodeURIComponent(sample.number)}`}
                          className="lift rise rounded-full border border-black/[0.09] bg-white px-3 py-1.5 text-[11px] text-muted hover:border-[#ff7a55]/40 hover:text-ink"
                          style={{ animationDelay: `${310 + index * 55}ms` }}
                        >
                          {sample.label}
                        </a>
                      ))}
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11.5px] text-muted">
                      {['No account', 'Nothing stored', 'Estimates labeled'].map((item, index) => (
                        <span
                          key={item}
                          className="rise flex items-center gap-1.5"
                          style={{ animationDelay: `${380 + index * 70}ms` }}
                        >
                          <Check className="h-3 w-3 text-lime" /> {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rise relative" style={{ animationDelay: '200ms' }}>
                    <div className="float-slow relative">
                      <PreviewCard />

                      <div className="sat float-slow absolute -right-5 -bottom-5 hidden xl:flex">
                        <span className="sat-icon"><Signal className="h-3.5 w-3.5" /></span>
                        <div>
                          <p className="mono text-[11.5px] font-semibold leading-none">18ms</p>
                          <svg className="spark mt-1" width="54" height="16" viewBox="0 0 54 22" fill="none" aria-hidden="true">
                            <path
                              d="M2 18C9 14 12 16 18 10C24 4 28 12 34 7C40 2 45 8 52 3"
                              stroke="#f4442e"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                            <circle cx="52" cy="3" r="2.5" fill="#f4442e" />
                          </svg>
                        </div>
                      </div>

                      <div className="absolute -right-9 -top-10 hidden h-[96px] w-[96px] xl:block" aria-hidden="true">
                        <svg viewBox="0 0 100 100" className="orbit-badge h-full w-full">
                          <defs>
                            <path id="badge-path" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
                          </defs>
                          <text fontSize="7.2" letterSpacing="2.3" fill="#9aa0ab" fontFamily="Geist Mono, monospace">
                            <textPath href="#badge-path">245 REGIONS / ZERO STORAGE / CONFIDENCE / </textPath>
                          </text>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="rise mt-16 grid grid-cols-2 gap-y-7 border-t border-black/[0.07] pt-7 sm:grid-cols-4"
                  style={{ animationDelay: '380ms' }}
                >
                  {[
                    { to: 240, suffix: '+', label: 'regions validated' },
                    { to: 0, suffix: '', label: 'numbers stored' },
                    { to: 20, prefix: '~', suffix: 'ms', label: 'typical check' },
                    { to: 60, suffix: '/min', label: 'public api budget' },
                  ].map((stat) => (
                    <div key={stat.label} className="group">
                      <Stat to={stat.to} prefix={stat.prefix} suffix={stat.suffix} />
                      <p className="label mt-2 transition-colors group-hover:text-lime">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </section>

          <div className="marquee mt-6 border-y border-line bg-[#eceef1] py-3">
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

          <section id="showcase" className="scene relative h-[215vh] scroll-mt-24">
            <div className="sticky top-0 flex h-screen items-center overflow-hidden">
              <div className="wrap w-full">
                <div className="flex flex-wrap items-end justify-between gap-5">
                  <div className="max-w-xl">
                    <p className="label">showcase</p>
                    <h2 className="mt-2 font-display text-[2.1rem] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[2.9rem]">
                      Scroll. Watch a number <span className="grad-text">unfold.</span>
                    </h2>
                    <p className="mt-3 max-w-md text-[13px] leading-relaxed text-muted">
                      One check returns three layers of truth - clean formats, the network behind it and the privacy
                      boundaries. Keep scrolling; the cards drift with you.
                    </p>
                  </div>
                  <span className="mono flex items-center gap-2 rounded-full border border-black/[0.07] bg-white px-3 py-1.5 text-[8.5px] uppercase tracking-[0.16em] text-faint">
                    <span className="pulse-dot" /> pinned scene
                  </span>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  <article
                    className="scene-card card p-5"
                    style={{ '--from': '70px', '--to': '-110px', '--rot': '-2.5deg' } as CSSProperties}
                  >
                    <div className="flex items-center justify-between">
                      <p className="label">format</p>
                      <span className="mono text-[9px] uppercase tracking-[0.14em] text-lime">e.164</span>
                    </div>
                    <p className="mono mt-4 text-[17px] font-medium tracking-tight">+92 300 1234567</p>
                    <p className="mono mt-1 text-[12px] text-faint">0300 1234567</p>
                    <div className="mt-4 flex gap-1.5">
                      {['E.164', 'INTL', 'NATIONAL'].map((tag) => (
                        <span key={tag} className="mono rounded-md bg-[#f4f6f9] px-2 py-1 text-[8px] uppercase tracking-[0.12em] text-muted">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>

                  <article
                    className="scene-card card p-5"
                    style={{ '--from': '150px', '--to': '-40px', '--rot': '1.5deg' } as CSSProperties}
                  >
                    <div className="flex items-center justify-between">
                      <p className="label">network</p>
                      <span className="mono text-[9px] uppercase tracking-[0.14em] text-lime">prefix</span>
                    </div>
                    <p className="mt-4 font-display text-[26px] font-semibold tracking-tight">Jazz</p>
                    <div className="bar mt-3">
                      <span style={{ width: '92%' }} />
                    </div>
                    <p className="mono mt-2 text-[10px] text-faint">92% confidence / mobile</p>
                    <p className="mt-3 text-[11px] leading-relaxed text-muted">
                      Portability can move the number - the estimate never pretends to be a guarantee.
                    </p>
                  </article>

                  <article
                    className="scene-card card p-5"
                    style={{ '--from': '230px', '--to': '30px', '--rot': '-1deg' } as CSSProperties}
                  >
                    <div className="flex items-center justify-between">
                      <p className="label">privacy</p>
                      <ShieldCheck className="h-3.5 w-3.5 text-lime" />
                    </div>
                    <p className="mt-4 font-display text-[26px] font-semibold tracking-tight">0 stored</p>
                    <ul className="mt-3 space-y-2 text-[11.5px] text-muted">
                      {['No owner lookup', 'No account needed', 'Nothing written to a database'].map((item) => (
                        <li key={item} className="flex items-center gap-2">
                          <Check className="h-3 w-3 text-lime" /> {item}
                        </li>
                      ))}
                    </ul>
                  </article>
                </div>
              </div>
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
            </>
          )}
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



