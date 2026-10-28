import crypto from 'crypto';

const DEFAULT_DB_URL =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_rxlK7iSQZBD3@ep-withered-tree-ajmgfttm.c-3.us-east-2.aws.neon.tech/neondb?sslmode=require';

export async function neonQuery(query: string, params: unknown[] = []) {
  const parsed = new URL(DEFAULT_DB_URL);
  const endpoint = `https://${parsed.hostname}/sql`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': DEFAULT_DB_URL,
    },
    body: JSON.stringify({ query, params }),
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Neon SQL error: ${text}`);
  }

  return res.json() as Promise<{ rows: Record<string, any>[] }>;
}

export function createSimpleToken(payload: Record<string, any>): string {
  const secret =
    process.env.SECRET_KEY ||
    'MauYDancarSonMejoresAmigosYPorEsoEstanCreandoCodePulsePlataform1234567890';
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 })
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

