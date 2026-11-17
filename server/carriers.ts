export type CarrierGuess = {
  name: string
  confidence: number
  source: 'prefix-dataset' | 'numverify'
  kind: 'mobile' | 'landline'
}

type Range = { from: number; to: number; carrier: string }

const PK_MOBILE: Range[] = [
  { from: 300, to: 309, carrier: 'Jazz' },
  { from: 310, to: 319, carrier: 'Zong' },
  { from: 320, to: 329, carrier: 'Jazz' },
  { from: 330, to: 339, carrier: 'Ufone' },
  { from: 340, to: 349, carrier: 'Telenor' },
  { from: 355, to: 355, carrier: 'SCOM' },
]

const PK_LANDLINE: Record<string, string> = {
  '21': 'PTCL',
  '22': 'PTCL',
  '23': 'PTCL',
  '24': 'PTCL',
  '25': 'PTCL',
  '41': 'PTCL',
  '42': 'PTCL',
  '43': 'PTCL',
  '44': 'PTCL',
  '45': 'PTCL',
  '46': 'PTCL',
  '47': 'PTCL',
  '48': 'PTCL',
  '49': 'PTCL',
  '51': 'PTCL',
  '52': 'PTCL',
  '53': 'PTCL',
  '54': 'PTCL',
  '55': 'PTCL',
  '56': 'PTCL',
  '57': 'PTCL',
  '58': 'PTCL',
  '61': 'PTCL',
  '62': 'PTCL',
  '63': 'PTCL',
  '64': 'PTCL',
  '65': 'PTCL',
  '66': 'PTCL',
  '67': 'PTCL',
  '68': 'PTCL',
  '81': 'PTCL',
  '82': 'PTCL',
  '83': 'PTCL',
  '84': 'PTCL',
  '85': 'PTCL',
  '86': 'PTCL',
  '91': 'PTCL',
  '92': 'PTCL',
  '93': 'PTCL',
  '94': 'PTCL',
  '95': 'PTCL',
  '96': 'PTCL',
  '97': 'PTCL',
  '98': 'PTCL',
  '99': 'PTCL',
}

export const COVERAGE = [
  {
    code: 'PK',
    name: 'Pakistan',
    level: 'Network-level for mobile and landline prefixes. Confidence reflects how specific the prefix is.',
    networks: ['Jazz', 'Zong', 'Telenor', 'Ufone', 'SCOM', 'PTCL'],
  },
]

export function detectCarrier(iso: string | undefined, nationalNumber: string | undefined): CarrierGuess | null {
  if (iso !== 'PK' || !nationalNumber) return null

  if (nationalNumber.startsWith('3') && nationalNumber.length === 10) {
    const prefix = Number(nationalNumber.slice(0, 3))
    const match = PK_MOBILE.find((range) => prefix >= range.from && prefix <= range.to)
    if (match) return { name: match.carrier, confidence: 0.92, source: 'prefix-dataset', kind: 'mobile' }
    return null
  }

  const landline = PK_LANDLINE[nationalNumber.slice(0, 2)]
  if (landline) return { name: landline, confidence: 0.72, source: 'prefix-dataset', kind: 'landline' }

  return null
}
