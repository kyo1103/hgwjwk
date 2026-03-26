/**
 * Next.js 서버에서 BullMQ 큐에 작업 등록
 * bridge-agent의 BullMQ 워커가 처리
 */
import { Queue } from 'bullmq'

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
}

export const QUEUE_NAMES = {
  COLLECTION: 'erp:collection',
  NOTIFICATION: 'erp:notification',
  PAYROLL: 'erp:payroll',
} as const

let _collectionQueue: Queue | null = null
let _notificationQueue: Queue | null = null

function getCollectionQueue(): Queue {
  if (!_collectionQueue) {
    _collectionQueue = new Queue(QUEUE_NAMES.COLLECTION, { connection })
  }
  return _collectionQueue
}

function getNotificationQueue(): Queue {
  if (!_notificationQueue) {
    _notificationQueue = new Queue(QUEUE_NAMES.NOTIFICATION, { connection })
  }
  return _notificationQueue
}

export interface CollectionJobData {
  clientId: string
  businessNo: string
  clientName: string
  channels: string[]
  provider: 'hometax' | 'fourinsure'
}

/**
 * 문서 수집 작업 큐에 등록
 */
export async function enqueueCollectionJob(data: CollectionJobData): Promise<string> {
  const q = getCollectionQueue()
  const job = await q.add('collect', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  })
  return job.id!
}

/**
 * 카카오 알림톡 큐에 등록
 */
export async function enqueueAlimtalk(payload: {
  recipientPhone: string
  templateCode: string
  templateParams?: Record<string, string>
}): Promise<string> {
  const q = getNotificationQueue()
  const job = await q.add('kakao_alimtalk', { type: 'kakao_alimtalk', payload }, {
    attempts: 2,
    backoff: { type: 'fixed', delay: 3000 },
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 100 },
  })
  return job.id!
}
