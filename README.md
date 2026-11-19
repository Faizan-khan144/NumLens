# NumLens

**Know any phone number's network - without turning it into a people search.**

NumLens validates a number against official numbering-plan metadata and tells you what the network can actually reveal: country, exact line type, clean E.164 formatting and a carrier estimate with a visible confidence score.

[![License: MIT](https://img.shields.io/badge/License-MIT-ff3d3d?style=flat-square)](LICENSE)
![React](https://img.shields.io/badge/React-19-1f2328?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-7-1f2328?style=flat-square&logo=typescript&logoColor=white)
![Hono](https://img.shields.io/badge/API-Hono-1f2328?style=flat-square)
![Vite](https://img.shields.io/badge/Build-Vite-1f2328?style=flat-square&logo=vite&logoColor=white)

![NumLens preview](docs/preview.png)

## What it does

- **Worldwide validation** - 240+ regions from libphonenumber metadata, including length and check digits.
- **Exact line type** - mobile, landline, VoIP, toll free, premium rate, pager, UAN and more.
- **Carrier estimate** - prefix-level network for supported countries with a confidence score and source label.
- **Clean output** - E.164, international and national formats ready to copy.
- **Public API** - one JSON endpoint, 60 lookups/minute per IP, no key required.
- **Stateless** - numbers are processed in memory and never written to disk.

## What it never does

- No owner names, CNIC, addresses or linked accounts.
- No live location or tracking, because that data is not in a number.
- No stored lookup history, no accounts and no SMS.

Anything advertised as "live location from a phone number" is a scam. NumLens stays on the side of network facts.

## Stack

| Layer    | Choice                                                   |
| -------- | -------------------------------------------------------- |
| UI       | React 19, Vite 8, Tailwind CSS 4, lucide-react           |
| API      | Hono on Node, plus a Vercel function for serverless use  |
| Parsing  | libphonenumber-js (max metadata)                         |
| CI       | GitHub Actions - lint + typecheck + production build     |

```
server/        Hono API, lookup engine, carrier dataset
api/           Vercel serverless entry point
src/           React app, design tokens and API client
docs/          README screenshots
```

## Run it

```bash
npm install
npm run dev
```

- Web: http://localhost:5173
- API: http://localhost:8787

Production:

```bash
npm run build
npm start
```

## API

```bash
curl "http://localhost:8787/api/lookup?number=%2B923001234567"
```

```json
{
  "valid": true,
  "e164": "+923001234567",
  "formats": {
    "international": "+92 300 1234567",
    "national": "0300 1234567"
  },
  "country": { "iso": "PK", "name": "Pakistan", "flag": "PK", "callingCode": "92" },
  "lineType": { "code": "MOBILE", "label": "Mobile" },
  "carrier": {
    "name": "Jazz",
    "confidence": 0.92,
    "confidencePct": 92,
    "source": "prefix-dataset"
  },
  "portable": true,
  "source": "libphonenumber",
  "policy": { "storesNumbers": false, "ownerLookup": false, "signupRequired": false },
  "checkedAt": "2026-11-19T12:00:00.000Z",
  "durationMs": 18
}
```

Endpoints:

| Method | Path                      | Purpose                          |
| ------ | ------------------------- | -------------------------------- |
| GET    | `/api/lookup?number=`     | Validate and inspect a number    |
| POST   | `/api/lookup`             | Same, with `{ number, country }` |
| GET    | `/api/coverage`           | Carrier coverage and provider    |
| GET    | `/api/health`             | Liveness check                   |

Optional `country` hint (ISO2) helps when the number has no `+` code.

## Coverage, honestly

Validation, formatting, country and line type are exact worldwide.

Carrier names are **prefix-level** and currently mapped for Pakistan: Jazz, Zong, Telenor, Ufone, SCOM and PTCL. Number portability means the carrier can differ from the original allocation, so the UI always shows confidence and never hides the source.

For live worldwide carrier data, set a provider key on the server:

```bash
NUMVERIFY_ACCESS_KEY=your_key_here
```

The adapter calls numverify server-side (`server/lookup.ts`). Keys are never sent to the browser, never committed and never logged. See `.env.example`.

## Privacy

- No database and no numbers table.
- `Cache-Control: no-store` on every lookup.
- Rate limiting in memory by IP.
- No analytics, no cookies, no accounts.

## Deploy

Vercel detects Vite via `vercel.json`; `api/lookup.ts` runs as a serverless function and the SPA is served from `dist`. Set `NUMVERIFY_ACCESS_KEY` in project environment variables if you want live carrier lookups.

## Roadmap

- OTP ownership verification badge for your own number.
- Bulk CSV checks with a downloadable report.
- Twilio Lookup adapter alongside numverify.
- Prefix datasets for more countries.

## License

MIT - see [LICENSE](LICENSE).
