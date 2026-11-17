export type Carrier = {
  name: string
  confidence: number
  source: 'prefix-dataset' | 'numverify'
  kind: 'mobile' | 'landline'
}

export type LookupResult =
  | {
      valid: true
      input: string
      e164: string
      international: string
      national: string
      country: { iso: string; name: string; flag: string; callingCode: string }
      lineType: { code: string; label: string }
      carrier: Carrier | null
      carrierNote: string | null
      portability: string | null
      live: boolean
      durationMs: number
    }
  | {
      valid: false
      input: string
      reason: string
      hint: string | null
      durationMs: number
    }

export async function lookup(number: string, country: string): Promise<LookupResult> {
  const params = new URLSearchParams({ number })
  if (country) params.set('country', country)

  const response = await fetch(`/api/lookup?${params.toString()}`)
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(payload?.error ?? 'Lookup failed. Try again.')
  }

  return (await response.json()) as LookupResult
}
