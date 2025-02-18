import crypto from 'crypto'
import { db } from '@/server/db'
import { apiKeys } from '@/server/db/schema'
import { env } from '@/env'
import { NextRequest } from 'next/server'

const ENCRYPTION_KEY = Buffer.from(env.ENCRYPTION_KEY, 'base64')

function generateApiKey(): string {
  return crypto.randomBytes(32).toString('hex')
}

async function encryptApiKey(apiKey: string) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv)
  let encrypted = cipher.update(apiKey, 'utf8')
  encrypted = Buffer.concat([encrypted, cipher.final()])
  const tag = cipher.getAuthTag()

  return { encryptedKey: Buffer.concat([encrypted, tag]), iv }
}

function decryptApiKey(encryptedKey: Buffer, iv: Buffer) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv)
  decipher.setAuthTag(encryptedKey.slice(-16))
  let decrypted = decipher.update(encryptedKey.slice(0, -16))
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString('utf8')
}

export async function storeApiKey(consumerName: string) {
  const apiKey = generateApiKey()
  const { encryptedKey, iv } = await encryptApiKey(apiKey)
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')

  await db.insert(apiKeys).values({
    consumerName,
    encryptedKey,
    iv,
    keyHash,
    createdAt: new Date(),
  })

  return apiKey
}

export async function verifyRequest(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }

  const apiKey = authHeader.split(' ')[1]

  if (!apiKey) {
    return false
  }

  const keyHash = crypto
    .createHash('sha256')
    .update(apiKey, 'utf8')
    .digest('hex')

  const storedKey = await db.query.apiKeys.findFirst({
    where: (keys, { eq }) => eq(keys.keyHash, keyHash),
  })

  if (
    !storedKey ||
    storedKey.revokedAt ||
    (storedKey.expiresAt && new Date(storedKey.expiresAt) < new Date())
  ) {
    return false
  }

  const decryptedKey = decryptApiKey(storedKey.encryptedKey, storedKey.iv)

  if (decryptedKey !== apiKey) {
    return false
  }

  return true
}
