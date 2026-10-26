import 'server-only'
import http from 'node:http'
import https from 'node:https'
import dns from 'node:dns'
import net from 'node:net'

const MAX_BYTES = 2_000_000
const TIMEOUT_MS = 8000
const MAX_REDIRECTS = 3

export class UnsafeUrlError extends Error {}

function isPrivateIPv4(ip: string) {
  const [a, b] = ip.split('.').map(Number)
  return (
    a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19))
  )
}

export function isPrivateAddress(ip: string): boolean {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip)
  const v6 = ip.toLowerCase()
  if (v6 === '::' || v6 === '::1') return true
  const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) return isPrivateIPv4(mapped[1])
  return /^(fc|fd|fe8|fe9|fea|feb|ff)/.test(v6) || v6.startsWith('64:ff9b') || v6.startsWith('2001:db8')
}

function validateUrl(raw: string): URL {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new UnsafeUrlError('That does not look like a valid web address.')
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new UnsafeUrlError('Only http and https links can be imported.')
  if (url.username || url.password) throw new UnsafeUrlError('Links with embedded credentials are not allowed.')
  if (url.port && !['80', '443'].includes(url.port)) throw new UnsafeUrlError('Links on non-standard ports are not allowed.')
  const host = url.hostname.replace(/^\[|\]$/g, '')
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal') || host.endsWith('.local')) {
    throw new UnsafeUrlError('Private network addresses cannot be imported.')
  }
  if (net.isIP(host) && isPrivateAddress(host)) throw new UnsafeUrlError('Private network addresses cannot be imported.')
  return url
}

// The check runs inside the socket's DNS lookup, so the address that is validated is the one actually connected to
// (no DNS-rebinding gap between checking and connecting).
const guardedLookup: net.LookupFunction = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err, '', 4)
    const list = addresses as dns.LookupAddress[]
    const bad = list.find((a) => isPrivateAddress(a.address))
    if (bad || !list.length) return callback(new UnsafeUrlError('Private network addresses cannot be imported.'), '', 4)
    if ((options as dns.LookupOptions).all) return (callback as unknown as (e: null, a: dns.LookupAddress[]) => void)(null, list)
    callback(null, list[0].address, list[0].family)
  })
}

function requestOnce(url: URL): Promise<{ status: number; location?: string; body: string; contentType: string }> {
  return new Promise((resolve, reject) => {
    const lib = url.protocol === 'https:' ? https : http
    const req = lib.request(
      url,
      {
        method: 'GET',
        lookup: guardedLookup,
        timeout: TIMEOUT_MS,
        headers: { 'User-Agent': 'FamilyCommandCenter/1.0 (recipe import)', Accept: 'text/html,application/xhtml+xml' },
      },
      (res) => {
        const status = res.statusCode ?? 0
        if (status >= 300 && status < 400) {
          res.resume()
          return resolve({ status, location: res.headers.location, body: '', contentType: '' })
        }
        let size = 0
        const chunks: Buffer[] = []
        res.on('data', (chunk: Buffer) => {
          size += chunk.length
          if (size > MAX_BYTES) {
            req.destroy(new UnsafeUrlError('That page is too large to import.'))
            return
          }
          chunks.push(chunk)
        })
        res.on('end', () => resolve({ status, body: Buffer.concat(chunks).toString('utf8'), contentType: String(res.headers['content-type'] ?? '') }))
        res.on('error', reject)
      },
    )
    req.on('timeout', () => req.destroy(new Error('The site took too long to respond.')))
    req.on('error', reject)
    req.end()
  })
}

/** Fetch a public web page, re-validating every redirect hop. */
export async function safeFetchHtml(raw: string): Promise<{ url: string; html: string }> {
  let url = validateUrl(raw)
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await requestOnce(url)
    if (res.status >= 300 && res.status < 400) {
      if (!res.location) throw new Error('The site sent an invalid redirect.')
      url = validateUrl(new URL(res.location, url).toString())
      continue
    }
    if (res.status >= 400) throw new Error(`The site responded with an error (${res.status}).`)
    if (res.contentType && !/html|xml/.test(res.contentType)) throw new Error('That link is not a web page.')
    return { url: url.toString(), html: res.body }
  }
  throw new UnsafeUrlError('Too many redirects.')
}
