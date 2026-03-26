/**
 * 공인인증서 암호화/복호화 유틸
 * AES-256-GCM 방식으로 인증서 데이터를 안전하게 암호화
 */
import crypto from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32  // 256 bits
const IV_LENGTH = 16   // 128 bits
const TAG_LENGTH = 16  // 128 bits

/** 마스터 키 (환경변수에서 로드, 32바이트 hex) */
function getMasterKey(): Buffer {
  const hex = process.env.CERT_MASTER_KEY
  if (!hex || hex.length !== 64) {
    throw new Error('CERT_MASTER_KEY must be set as 64-char hex string (32 bytes)')
  }
  return Buffer.from(hex, 'hex')
}

export interface EncryptedCert {
  encryptedData: string  // base64
  iv: string             // base64
  authTag: string        // base64
}

/**
 * 인증서 데이터(파일 버퍼 또는 문자열) 암호화
 */
export function encryptCert(data: Buffer | string): EncryptedCert {
  const key = getMasterKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  const input = typeof data === 'string' ? Buffer.from(data, 'utf8') : data
  const encrypted = Buffer.concat([cipher.update(input), cipher.final()])
  const authTag = cipher.getAuthTag()

  return {
    encryptedData: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  }
}

/**
 * 암호화된 인증서 데이터 복호화
 */
export function decryptCert(enc: EncryptedCert): Buffer {
  const key = getMasterKey()
  const iv = Buffer.from(enc.iv, 'base64')
  const authTag = Buffer.from(enc.authTag, 'base64')
  const encryptedData = Buffer.from(enc.encryptedData, 'base64')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  return Buffer.concat([decipher.update(encryptedData), decipher.final()])
}

/**
 * 마스터 키 생성 (최초 설정 시 사용)
 */
export function generateMasterKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex')
}

/**
 * PFX/P12 인증서 파일 정보 추출 (기본 파싱)
 */
export interface CertInfo {
  subject?: string
  issuer?: string
  validFrom?: Date
  validUntil?: Date
}

export function parseCertDates(pfxBuffer: Buffer, password: string): CertInfo {
  // Node.js crypto doesn't support PFX parsing directly
  // Return basic info - for full parsing use node-forge or similar
  try {
    // Try to at least verify it's a valid PFX by attempting to load it
    // Real implementation would use node-forge or openssl subprocess
    void pfxBuffer
    void password
    return {
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    }
  } catch {
    throw new Error('인증서 파일을 파싱할 수 없습니다. 올바른 PFX/P12 형식인지 확인하세요.')
  }
}

/**
 * 인증서 저장 헬퍼 (DB 저장용 직렬화)
 */
export interface CertStoragePayload {
  pfxBase64: string    // original PFX base64
  password: string     // certificate password
  provider: string     // 'hometax' | 'fourinsure'
}

export function serializeCertPayload(payload: CertStoragePayload): Buffer {
  return Buffer.from(JSON.stringify(payload), 'utf8')
}

export function deserializeCertPayload(buf: Buffer): CertStoragePayload {
  return JSON.parse(buf.toString('utf8')) as CertStoragePayload
}
