import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js/max'
import { detectCarrier, type CarrierGuess } from './carriers.js'

const TYPE_LABELS: Record<string, string> = {
  MOBILE: 'Mobile',
  FIXED_LINE: 'Landline',
  FIXED_LINE_OR_MOBILE: 'Fixed line or mobile',
  TOLL_FREE: 'Toll free',
  VOIP: 'VoIP',
  PREMIUM_RATE: 'Premium rate',
  SHARED_COST: 'Shared cost',
  PERSONAL_NUMBER: 'Personal number',
  PAGER: 'Pager',
  UAN: 'UAN',
  VOICEMAIL: 'Voicemail',
  UNKNOWN: 'Unknown',
}

export type ValidLookup = {
  valid: true
  input: string
  e164: string
  international: string
  national: string
  country: {
    iso: string
    name: string
    flag: string
    callingCode: string
  }
  formats: {
    e164: string
    international: string
    national: string
  }
  lineType: {
    code: string
    label: string
  }
  carrier: (CarrierGuess & { confidencePct: number }) | null
  carrierNote: string | null
  portability: string | null
  portable: boolean
  live: boolean
  source: 'numverify' | 'libphonenumber'
  policy: {
    storesNumbers: false
    ownerLookup: false
    signupRequired: false
  }
  checkedAt: string
  durationMs: number
}

export type InvalidLookup = {
  valid: false
  input: string
  reason: string
  hint: string | null
  durationMs: number
}

export type LookupResult = ValidLookup | InvalidLookup

function flagOf(iso: string) {
  return iso.replace(/./g, (letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
}

function countryName(iso: string) {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(iso) ?? iso
  } catch {
    return iso
  }
}

async function liveCarrier(e164: string): Promise<CarrierGuess | null> {
  const key = process.env.NUMVERIFY_ACCESS_KEY
  if (!key) return null

  try {
    const url = new URL('https://apilayer.net/api/validate')
    url.searchParams.set('access_key', key)
    url.searchParams.set('number', e164)
    url.searchParams.set('format', '1')

    const response = await fetch(url, { signal: AbortSignal.timeout(4500) })
    if (!response.ok) return null

    const data = (await response.json()) as {
      valid?: boolean
      carrier?: string | null
      line_type?: string | null
    }

    if (!data.valid || !data.carrier) return null

    const line = (data.line_type ?? '').toLowerCase()
    const kind: CarrierGuess['kind'] = line.includes('landline') || line.includes('fixed') ? 'landline' : 'mobile'

    return { name: data.carrier, confidence: 0.99, source: 'numverify', kind }
  } catch {
    return null
  }
}

export async function lookupNumber(raw: string, defaultCountry?: string): Promise<LookupResult> {
  const started = Date.now()
  const input = raw.trim()
  const duration = () => Date.now() - started

  if (!input) {
    return { valid: false, input, reason: 'Enter a number to check.', hint: null, durationMs: duration() }
  }

  let candidate = input.replace(/[\s().-]/g, '')
  if (candidate.startsWith('00')) candidate = `+${candidate.slice(2)}`

  const country = defaultCountry ? (defaultCountry.toUpperCase() as CountryCode) : undefined
  const phone = parsePhoneNumberFromString(candidate, country)

  if (!phone) {
    return {
      valid: false,
      input,
      reason: 'That does not look like a phone number.',
      hint: 'Try a full international format such as +923001234567, or pick a country hint.',
      durationMs: duration(),
    }
  }

  if (!phone.isValid()) {
    const iso = phone.country
    const name = iso ? countryName(iso) : 'that country'
    return {
      valid: false,
      input,
      reason: `Not a valid ${name} number.`,
      hint: phone.isPossible()
        ? 'The length looks plausible but the prefix or check digit failed. Double-check the digits.'
        : 'The length does not match the numbering plan for that country.',
      durationMs: duration(),
    }
  }

  const iso = phone.country ?? 'ZZ'
  const national = phone.nationalNumber
  const typeCode = phone.getType() ?? 'UNKNOWN'

  let carrier = detectCarrier(iso, national)
  let carrierNote: string | null = null

  const live = await liveCarrier(phone.number)
  if (live) {
    carrier = live
  }

  if (!carrier) {
    carrierNote =
      iso === 'PK'
        ? 'This prefix is not in the local dataset yet. It may be a newer allocation or a number that has been ported.'
        : `Carrier data is not covered for ${countryName(iso)} yet. Validation, line type and formatting are still exact. Connect an HLR provider (for example Twilio Lookup or numverify) for live carrier data here.`
  }

  const portable = typeCode === 'MOBILE'
  const international = phone.formatInternational()
  const nationalFormat = phone.formatNational()

  return {
    valid: true,
    input,
    e164: phone.number,
    international,
    national: nationalFormat,
    formats: {
      e164: phone.number,
      international,
      national: nationalFormat,
    },
    country: {
      iso,
      name: countryName(iso),
      flag: flagOf(iso),
      callingCode: phone.countryCallingCode,
    },
    lineType: {
      code: typeCode,
      label: TYPE_LABELS[typeCode] ?? 'Unknown',
    },
    carrier: carrier ? { ...carrier, confidencePct: Math.round(carrier.confidence * 100) } : null,
    carrierNote,
    portability: portable
      ? 'Mobile number portability lets a number move between networks. Treat the carrier as an estimate, not a guarantee.'
      : null,
    portable,
    live: Boolean(live),
    source: live ? 'numverify' : 'libphonenumber',
    policy: {
      storesNumbers: false,
      ownerLookup: false,
      signupRequired: false,
    },
    checkedAt: new Date().toISOString(),
    durationMs: duration(),
  }
}
