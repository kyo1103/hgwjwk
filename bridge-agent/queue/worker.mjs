/**
 * BullMQ 워커 - 자동화 작업 스케줄러
 * Redis 큐에서 작업을 가져와 실행
 */
import { Worker, Queue, QueueEvents } from 'bullmq'
import { randomUUID } from 'node:crypto'
import { loadConfig } from '../config.mjs'
import { runHometax } from '../worker/hometax.mjs'
import { runFourinsure } from '../worker/fourinsure.mjs'

const config = loadConfig()

// Redis connection (default: localhost:6379)
const connection = {
  host: config.REDIS_HOST || 'localhost',
  port: parseInt(config.REDIS_PORT || '6379', 10),
  password: config.REDIS_PASSWORD || undefined,
}

/** 큐 이름 상수 */
export const QUEUE_NAMES = {
  COLLECTION: 'erp:collection',
  NOTIFICATION: 'erp:notification',
  PAYROLL: 'erp:payroll',
}

/** 컬렉션 작업 큐 */
export const collectionQueue = new Queue(QUEUE_NAMES.COLLECTION, { connection })

/** 알림 큐 */
export const notificationQueue = new Queue(QUEUE_NAMES.NOTIFICATION, { connection })

/**
 * 컬렉션 작업 워커
 */
const collectionWorker = new Worker(
  QUEUE_NAMES.COLLECTION,
  async (job) => {
    const { clientId, businessNo, clientName, channels, provider } = job.data

    console.log(`[BullMQ] 작업 시작: ${job.id} | ${provider} | ${clientName}`)

    await job.updateProgress(5)
    await job.log(`작업 시작: ${provider} | 거래처: ${clientName} (${businessNo})`)

    try {
      if (provider === 'hometax') {
        const result = await runHometax({
          clientId,
          businessNo,
          clientName,
          channels: channels.filter(ch =>
            ['certificate_of_tax_payment', 'business_registration', 'vat_base_certificate',
             'income_certificate', 'financial_statement', 'tax_invoice_summary',
             'closure_certificate', 'local_tax_certificate'].includes(ch)
          ),
          onProgress: async (pct, msg) => {
            await job.updateProgress(pct)
            await job.log(msg)
          },
        })
        await job.updateProgress(100)
        return result
      }

      if (provider === 'fourinsure') {
        const result = await runFourinsure({
          clientId,
          businessNo,
          clientName,
          channels: channels.filter(ch =>
            ['coverage_statement', 'health_insurance', 'national_pension',
             'employment_insurance', 'industrial_accident',
             'health_insurance_notice', 'national_pension_notice'].includes(ch)
          ),
          onProgress: async (pct, msg) => {
            await job.updateProgress(pct)
            await job.log(msg)
          },
        })
        await job.updateProgress(100)
        return result
      }

      throw new Error(`알 수 없는 provider: ${provider}`)
    } catch (err) {
      await job.log(`오류: ${err.message}`)
      throw err
    }
  },
  {
    connection,
    concurrency: 2,  // 동시 최대 2개 작업
    limiter: {
      max: 5,
      duration: 60_000,  // 분당 최대 5개
    },
  }
)

/**
 * 알림 작업 워커
 */
const notificationWorker = new Worker(
  QUEUE_NAMES.NOTIFICATION,
  async (job) => {
    const { type, payload } = job.data
    console.log(`[BullMQ] 알림 발송: ${type}`)

    if (type === 'kakao_alimtalk') {
      // Dynamic import to avoid loading kakao module if not needed
      const { sendAlimtalk } = await import('../kakao-sender.mjs')
      return await sendAlimtalk(payload)
    }

    throw new Error(`알 수 없는 알림 타입: ${type}`)
  },
  { connection, concurrency: 5 }
)

// 이벤트 핸들러
collectionWorker.on('completed', (job, result) => {
  console.log(`[BullMQ] 완료: ${job.id} | 문서 ${result?.documents?.length ?? 0}건`)
})

collectionWorker.on('failed', (job, err) => {
  console.error(`[BullMQ] 실패: ${job?.id} | ${err.message}`)
})

collectionWorker.on('progress', (job, progress) => {
  if (typeof progress === 'number') {
    process.stdout.write(`\r[BullMQ] ${job.id}: ${progress}%   `)
  }
})

notificationWorker.on('completed', (job) => {
  console.log(`[BullMQ] 알림 완료: ${job.id}`)
})

notificationWorker.on('failed', (job, err) => {
  console.error(`[BullMQ] 알림 실패: ${job?.id} | ${err.message}`)
})

console.log('[BullMQ] 워커 시작됨')
console.log(`  - 컬렉션 큐: ${QUEUE_NAMES.COLLECTION}`)
console.log(`  - 알림 큐: ${QUEUE_NAMES.NOTIFICATION}`)
console.log(`  - Redis: ${connection.host}:${connection.port}`)

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[BullMQ] 종료 중...')
  await collectionWorker.close()
  await notificationWorker.close()
  process.exit(0)
})

export { collectionWorker, notificationWorker }
