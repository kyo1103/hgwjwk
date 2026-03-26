'use client'

import { useState, useEffect, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────

interface KakaoMessage {
  id: string
  userKey: string
  content: string
  type: string
  timestamp: string
  read: boolean
  replied: boolean
  replyContent?: string
  repliedAt?: string
}

interface KakaoConfigStatus {
  provider: 'solapi'
  configured: boolean
  missing: string[]
  optionalMissing: string[]
}

type Tab = 'inbox' | 'send' | 'notice' | 'settings'

const TEMPLATES = [
  { code: 'DOC_COLLECT_DONE', label: '민원서류 수집 완료', params: ['clientName', 'year', 'month', 'docCount', 'portalUrl'] },
  { code: 'PAYSLIP_READY',    label: '급여명세서 발행',   params: ['employeeName', 'year', 'month', 'netPay', 'portalUrl'] },
  { code: 'FILING_DUE',       label: '신고 기한 안내',    params: ['clientName', 'filingType', 'dueDate', 'required'] },
  { code: 'CONTRACT_SIGN',    label: '전자계약서 서명',   params: ['recipientName', 'contractTitle', 'signUrl', 'expireDate'] },
  { code: 'CONSULT_CONFIRM',  label: '상담 예약 확인',    params: ['clientName', 'datetime', 'location'] },
  { code: 'CASE_UPDATE',      label: '사건 진행 안내',    params: ['clientName', 'caseName', 'updateContent', 'portalUrl'] },
  { code: 'LABOR_NOTICE',     label: '노무 안내',         params: ['clientName', 'title', 'content'] },
]

const KAKAO_YELLOW = '#f9c300'
const KAKAO_BROWN = '#3c1e1e'

// ─── Component ────────────────────────────────────────────────────────────

export default function KakaoPage() {
  const [tab, setTab] = useState<Tab>('inbox')
  const [messages, setMessages] = useState<KakaoMessage[]>([])
  const [selectedMsg, setSelectedMsg] = useState<KakaoMessage | null>(null)
  const [loadingInbox, setLoadingInbox] = useState(false)
  const [loadingConfig, setLoadingConfig] = useState(false)
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState('')
  const [configStatus, setConfigStatus] = useState<KakaoConfigStatus | null>(null)

  // 발송 폼 상태
  const [sendPhone, setSendPhone] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0])
  const [templateParams, setTemplateParams] = useState<Record<string, string>>({})

  // 친구톡 공지 상태
  const [noticeTitle, setNoticeTitle] = useState('')
  const [noticeContent, setNoticeContent] = useState('')
  const [noticeLink, setNoticeLink] = useState('')
  const [noticePhones, setNoticePhones] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  // 상담톡 메시지 로드
  const loadMessages = useCallback(async () => {
    setLoadingInbox(true)
    try {
      const res = await fetch('/api/kakao/webhook')
      if (res.ok) {
        const data = await res.json() as { messages: KakaoMessage[] }
        setMessages(data.messages)
      }
    } finally {
      setLoadingInbox(false)
    }
  }, [])

  const loadConfigStatus = useCallback(async () => {
    setLoadingConfig(true)
    try {
      const res = await fetch('/api/kakao/send')
      if (res.ok) {
        const data = await res.json() as KakaoConfigStatus
        setConfigStatus(data)
      }
    } finally {
      setLoadingConfig(false)
    }
  }, [])

  useEffect(() => {
    if (tab === 'inbox') {
      void loadMessages()
      const interval = setInterval(() => void loadMessages(), 10_000)
      return () => clearInterval(interval)
    }
  }, [tab, loadMessages])

  useEffect(() => {
    if (tab === 'send' || tab === 'settings') {
      void loadConfigStatus()
    }
  }, [tab, loadConfigStatus])

  // 메시지 읽음 처리
  const markRead = async (id: string) => {
    await fetch('/api/kakao/webhook', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, read: true }),
    })
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, read: true } : m))
    if (selectedMsg?.id === id) setSelectedMsg((m) => m ? { ...m, read: true } : m)
  }

  // 알림톡 발송
  const handleSendAlimtalk = async () => {
    if (!sendPhone) { showToast('전화번호를 입력하세요'); return }
    setSending(true)
    try {
      const res = await fetch('/api/kakao/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'alimtalk',
          payload: { recipientPhone: sendPhone, templateCode: selectedTemplate.code, templateParams },
        }),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (!data.success) void loadConfigStatus()
      showToast(data.success ? `알림톡 발송 완료` : `발송 실패: ${data.error ?? ''}`)
    } finally {
      setSending(false)
    }
  }

  // 친구톡 공지 발송
  const handleSendNotice = async () => {
    if (!noticeTitle || !noticeContent || !noticePhones) {
      showToast('제목, 내용, 수신번호를 모두 입력하세요')
      return
    }
    setSending(true)
    try {
      const phones = noticePhones.split(/[\n,]/).map((p) => p.trim()).filter(Boolean)
      const res = await fetch('/api/kakao/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'channel_notice',
          payload: { phones, title: noticeTitle, content: noticeContent, linkUrl: noticeLink, linkLabel: '자세히 보기' },
        }),
      })
      await res.json() as { results?: unknown[] }
      showToast(`친구톡 ${phones.length}건 발송 완료`)
      setNoticeTitle(''); setNoticeContent(''); setNoticeLink(''); setNoticePhones('')
    } finally {
      setSending(false)
    }
  }

  const unreadCount = messages.filter((m) => !m.read).length
  const requiredMissing = configStatus?.missing ?? []
  const optionalMissing = configStatus?.optionalMissing ?? []

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '14px',
          background: KAKAO_YELLOW,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px',
        }}>
          💬
        </div>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: '#111827' }}>
            카카오 채널톡
          </h1>
          <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '2px' }}>
            @신정노동법률사무소 · 상담톡 수신 · 알림톡·친구톡 발송
          </p>
        </div>
        {unreadCount > 0 && (
          <span style={{
            marginLeft: 'auto',
            background: '#ef4444', color: '#fff',
            padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
          }}>
            미읽음 {unreadCount}
          </span>
        )}
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '2px solid #e5e7eb', paddingBottom: '0' }}>
        {([
          { id: 'inbox', label: `상담톡 수신${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
          { id: 'send', label: '알림톡 발송' },
          { id: 'notice', label: '친구톡 공지' },
          { id: 'settings', label: '채널 설정' },
        ] as { id: Tab; label: string }[]).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '10px 18px',
              background: 'none', border: 'none',
              borderBottom: tab === t.id ? `2px solid ${KAKAO_YELLOW}` : '2px solid transparent',
              cursor: 'pointer',
              fontSize: '14px', fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? KAKAO_BROWN : '#6b7280',
              marginBottom: '-2px',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 상담톡 수신 ── */}
      {tab === 'inbox' && (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '16px', height: '600px' }}>
          {/* 메시지 목록 */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>받은 메시지</span>
              <button onClick={() => void loadMessages()} style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px', color: '#6b7280' }}>
                새로고침
              </button>
            </div>
            <div style={{ overflowY: 'auto', height: 'calc(600px - 53px)' }}>
              {loadingInbox && (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>로딩 중...</div>
              )}
              {!loadingInbox && messages.length === 0 && (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: '#9ca3af' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                  <div>수신된 메시지가 없습니다</div>
                  <div style={{ fontSize: '12px', marginTop: '8px' }}>카카오 채널에서 메시지를 보내면 이곳에 표시됩니다</div>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => { setSelectedMsg(msg); if (!msg.read) void markRead(msg.id) }}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #f9fafb',
                    cursor: 'pointer',
                    background: selectedMsg?.id === msg.id ? '#fef9c3' : msg.read ? '#fff' : '#fffbeb',
                  }}
                  onMouseEnter={e => { if (selectedMsg?.id !== msg.id) e.currentTarget.style.background = '#f9fafb' }}
                  onMouseLeave={e => { if (selectedMsg?.id !== msg.id) e.currentTarget.style.background = msg.read ? '#fff' : '#fffbeb' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <span style={{ fontWeight: msg.read ? 500 : 700, fontSize: '13px', color: '#111827' }}>
                      {msg.userKey.slice(0, 8)}…
                    </span>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                      {new Date(msg.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {msg.content}
                  </div>
                  {msg.replied && (
                    <span style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', display: 'block' }}>✓ 답장 완료</span>
                  )}
                  {!msg.read && (
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', background: '#ef4444', borderRadius: '50%', marginTop: '4px' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 메시지 상세 */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '12px', background: '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {!selectedMsg ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '32px' }}>💬</span>
                <span>메시지를 선택하세요</span>
              </div>
            ) : (
              <>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#111827' }}>
                    사용자: {selectedMsg.userKey.slice(0, 12)}…
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                    {new Date(selectedMsg.timestamp).toLocaleString('ko-KR')}
                  </div>
                </div>
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                  {/* 수신 메시지 */}
                  <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
                    <div style={{
                      maxWidth: '80%',
                      background: '#f3f4f6',
                      padding: '12px 16px',
                      borderRadius: '0 12px 12px 12px',
                      fontSize: '14px', lineHeight: 1.6, color: '#111827',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {selectedMsg.content}
                    </div>
                  </div>
                  {/* 답장 표시 */}
                  {selectedMsg.replyContent && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                      <div style={{
                        maxWidth: '80%',
                        background: KAKAO_YELLOW,
                        padding: '12px 16px',
                        borderRadius: '12px 0 12px 12px',
                        fontSize: '14px', lineHeight: 1.6, color: KAKAO_BROWN,
                        whiteSpace: 'pre-wrap',
                      }}>
                        {selectedMsg.replyContent}
                        <div style={{ fontSize: '11px', color: '#92700a', marginTop: '4px', textAlign: 'right' }}>
                          {selectedMsg.repliedAt && new Date(selectedMsg.repliedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {/* 답장 입력 */}
                {!selectedMsg.replied && (
                  <ReplyForm
                    messageId={selectedMsg.id}
                    onReplied={(content) => {
                      setSelectedMsg((m) => m ? { ...m, replied: true, replyContent: content, repliedAt: new Date().toISOString() } : m)
                      setMessages((prev) => prev.map((m) => m.id === selectedMsg.id ? { ...m, replied: true, replyContent: content } : m))
                      showToast('답장이 등록되었습니다')
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── 알림톡 발송 ── */}
      {tab === 'send' && (
        <div style={{ maxWidth: '680px' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '28px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginTop: 0, marginBottom: '24px' }}>
              알림톡 발송
            </h2>

            {configStatus && !configStatus.configured && (
              <div style={{
                marginBottom: '20px',
                padding: '14px 16px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                color: '#991b1b',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  현재 발송 불가
                </div>
                <div style={{ fontSize: '12px', lineHeight: 1.6 }}>
                  필수 설정 누락: {requiredMissing.join(', ')}
                </div>
                <div style={{ fontSize: '12px', marginTop: '6px', lineHeight: 1.6 }}>
                  설정은 아래 `채널 설정` 탭에서 확인할 수 있습니다.
                </div>
              </div>
            )}

            {configStatus && configStatus.configured && optionalMissing.length > 0 && (
              <div style={{
                marginBottom: '20px',
                padding: '14px 16px',
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '10px',
                color: '#92400e',
                fontSize: '12px',
                lineHeight: 1.6,
              }}>
                선택 설정 누락: {optionalMissing.join(', ')}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                수신자 전화번호
              </label>
              <input
                type="tel"
                placeholder="010-0000-0000"
                value={sendPhone}
                onChange={(e) => setSendPhone(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                알림톡 템플릿
              </label>
              <select
                value={selectedTemplate.code}
                onChange={(e) => {
                  const t = TEMPLATES.find(t => t.code === e.target.value)!
                  setSelectedTemplate(t)
                  setTemplateParams({})
                }}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', background: '#fff', boxSizing: 'border-box' }}
              >
                {TEMPLATES.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}
              </select>
            </div>

            {/* 템플릿 파라미터 */}
            {selectedTemplate.params.length > 0 && (
              <div style={{ marginBottom: '20px', padding: '16px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  템플릿 변수
                </div>
                {selectedTemplate.params.map((param) => (
                  <div key={param} style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                      {param}
                    </label>
                    <input
                      type="text"
                      value={templateParams[param] ?? ''}
                      onChange={(e) => setTemplateParams((prev) => ({ ...prev, [param]: e.target.value }))}
                      placeholder={param}
                      style={{ width: '100%', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 미리보기 */}
            <div style={{ marginBottom: '20px', padding: '16px', background: '#fffbeb', borderRadius: '10px', border: `1px solid ${KAKAO_YELLOW}40` }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#92700a', marginBottom: '8px' }}>
                미리보기
              </div>
              <div style={{ fontSize: '13px', lineHeight: 1.7, color: '#374151', whiteSpace: 'pre-wrap' }}>
                {buildPreview(selectedTemplate.code, templateParams)}
              </div>
            </div>

            <button
              onClick={() => void handleSendAlimtalk()}
              disabled={sending}
              style={{
                width: '100%', padding: '12px',
                background: sending ? '#9ca3af' : KAKAO_YELLOW,
                border: 'none', borderRadius: '10px',
                cursor: sending ? 'not-allowed' : 'pointer',
                fontSize: '15px', fontWeight: 700, color: KAKAO_BROWN,
              }}
            >
              {sending ? '발송 중...' : '알림톡 발송'}
            </button>
          </div>
        </div>
      )}

      {/* ── 친구톡 공지 ── */}
      {tab === 'notice' && (
        <div style={{ maxWidth: '680px' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '28px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginTop: 0, marginBottom: '8px' }}>
              친구톡 공지 발송
            </h2>
            <p style={{ color: '#6b7280', fontSize: '13px', marginTop: 0, marginBottom: '24px' }}>
              채널 친구(구독자)에게 공지·뉴스레터를 발송합니다. 광고 표시가 자동으로 추가됩니다.
            </p>

            {[
              { label: '공지 제목', value: noticeTitle, set: setNoticeTitle, placeholder: '예: 3월 노무 안내사항' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>{f.label}</label>
                <input type="text" value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
            ))}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>공지 내용</label>
              <textarea value={noticeContent} onChange={e => setNoticeContent(e.target.value)} rows={5} placeholder="공지 내용을 입력하세요"
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>링크 URL (선택)</label>
              <input type="url" value={noticeLink} onChange={e => setNoticeLink(e.target.value)} placeholder="https://..."
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                수신 전화번호 (줄바꿈 또는 쉼표 구분)
              </label>
              <textarea value={noticePhones} onChange={e => setNoticePhones(e.target.value)} rows={4}
                placeholder={'010-1234-5678\n010-9876-5432\n...'}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', resize: 'vertical', fontFamily: 'monospace', boxSizing: 'border-box' }} />
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                {noticePhones.split(/[\n,]/).filter(p => p.trim()).length}명 입력됨
              </div>
            </div>

            <button onClick={() => void handleSendNotice()} disabled={sending}
              style={{
                width: '100%', padding: '12px',
                background: sending ? '#9ca3af' : KAKAO_YELLOW,
                border: 'none', borderRadius: '10px',
                cursor: sending ? 'not-allowed' : 'pointer',
                fontSize: '15px', fontWeight: 700, color: KAKAO_BROWN,
              }}>
              {sending ? '발송 중...' : '친구톡 발송'}
            </button>
          </div>
        </div>
      )}

      {/* ── 채널 설정 ── */}
      {tab === 'settings' && (
        <div style={{ maxWidth: '680px' }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '28px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginTop: 0, marginBottom: '24px' }}>채널 설정</h2>

            <div style={{
              marginBottom: '24px',
              padding: '16px',
              borderRadius: '10px',
              border: `1px solid ${configStatus?.configured ? '#bbf7d0' : '#fecaca'}`,
              background: configStatus?.configured ? '#f0fdf4' : '#fef2f2',
            }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: configStatus?.configured ? '#166534' : '#991b1b' }}>
                {loadingConfig
                  ? '설정 확인 중...'
                  : configStatus?.configured
                    ? '현재 발송 가능'
                    : '현재 발송 불가'}
              </div>
              {!loadingConfig && configStatus && (
                <div style={{ fontSize: '12px', lineHeight: 1.7, color: configStatus.configured ? '#166534' : '#991b1b', marginTop: '6px' }}>
                  {configStatus.configured
                    ? '필수 Solapi 설정이 모두 들어 있습니다.'
                    : `필수 누락: ${requiredMissing.join(', ')}`}
                  {optionalMissing.length > 0 && ` / 선택 누락: ${optionalMissing.join(', ')}`}
                </div>
              )}
            </div>

            {[
              { label: '발송 경로', value: 'Solapi → 카카오 채널', env: '—', note: '현재 코드 기준 실제 발송 경로입니다.' },
              { label: 'Solapi API Key', value: envStateLabel(configStatus, 'SOLAPI_API_KEY'), env: 'SOLAPI_API_KEY', note: 'Solapi 콘솔에서 발급한 API Key' },
              { label: 'Solapi API Secret', value: envStateLabel(configStatus, 'SOLAPI_API_SECRET'), env: 'SOLAPI_API_SECRET', note: 'Solapi 콘솔에서 발급한 API Secret' },
              { label: '카카오 채널 pfId', value: envStateLabel(configStatus, 'SOLAPI_KAKAO_PF_ID'), env: 'SOLAPI_KAKAO_PF_ID', note: 'Solapi 콘솔 → 카카오 → 채널 목록에서 확인' },
              { label: '발신번호', value: envStateLabel(configStatus, 'SOLAPI_SENDER_NUMBER', true), env: 'SOLAPI_SENDER_NUMBER', note: '친구톡/SMS 발송 시 고정 발신번호가 필요하면 등록' },
              { label: '웹훅 URL', value: `${typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api/kakao/webhook`, env: '—', note: '카카오 채널 관리자 센터에 등록할 수 있는 웹훅 주소' },
              { label: '웹훅 시크릿', value: envStateLabel(configStatus, 'KAKAO_WEBHOOK_SECRET', true), env: 'KAKAO_WEBHOOK_SECRET', note: '웹훅 서명 검증용 시크릿' },
            ].map(row => (
              <div key={row.label} style={{ padding: '14px 0', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{row.label}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>env: {row.env}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <code style={{ fontSize: '12px', background: '#f3f4f6', padding: '3px 8px', borderRadius: '4px', color: '#374151' }}>
                      {row.value}
                    </code>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>{row.note}</div>
              </div>
            ))}

            <div style={{ marginTop: '24px', padding: '16px', background: '#fffbeb', borderRadius: '10px', border: `1px solid ${KAKAO_YELLOW}40` }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#92700a', marginBottom: '8px' }}>
                실제 연동 절차
              </div>
              <ol style={{ fontSize: '13px', color: '#374151', margin: 0, paddingLeft: '18px', lineHeight: 2 }}>
                <li>Solapi 콘솔에서 <code>SOLAPI_API_KEY</code>, <code>SOLAPI_API_SECRET</code>를 발급합니다.</li>
                <li>카카오 비즈니스 채널을 준비하고 Solapi 카카오 채널 연동을 완료합니다.</li>
                <li>Solapi 카카오 채널 목록에서 pfId를 확인해 <code>SOLAPI_KAKAO_PF_ID</code>에 넣습니다.</li>
                <li>필요하면 등록된 발신번호를 <code>SOLAPI_SENDER_NUMBER</code>에 넣습니다.</li>
                <li>상담톡을 받을 계획이면 웹훅 URL과 <code>KAKAO_WEBHOOK_SECRET</code>를 함께 설정합니다.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          background: '#111827', color: '#fff',
          padding: '12px 20px', borderRadius: '10px',
          fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 9999,
        }}>
          {toast}
        </div>
      )}
    </div>
  )
}

// ─── 서브 컴포넌트 ────────────────────────────────────────────────────────

function ReplyForm({ messageId, onReplied }: { messageId: string; onReplied: (content: string) => void }) {
  const [reply, setReply] = useState('')
  const [saving, setSaving] = useState(false)

  const handleReply = async () => {
    if (!reply.trim()) return
    setSaving(true)
    await fetch('/api/kakao/webhook', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: messageId, replied: true, replyContent: reply }),
    })
    setSaving(false)
    onReplied(reply)
    setReply('')
  }

  return (
    <div style={{ padding: '16px', borderTop: '1px solid #f3f4f6', background: '#fafafa' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <textarea
          value={reply}
          onChange={e => setReply(e.target.value)}
          placeholder="답장 내용 (내부 메모용 — 실제 발송은 카카오 채널 관리자 센터에서)"
          rows={2}
          style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', resize: 'none', fontFamily: 'inherit' }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleReply() } }}
        />
        <button
          onClick={() => void handleReply()}
          disabled={saving || !reply.trim()}
          style={{
            padding: '0 16px', background: '#f9c300', border: 'none',
            borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer',
            fontWeight: 700, color: '#3c1e1e', fontSize: '13px',
          }}
        >
          {saving ? '...' : '등록'}
        </button>
      </div>
      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
        Enter로 저장 · Shift+Enter 줄바꿈 · 메모만 저장 (실제 카카오 발송은 채널 관리자 센터 이용)
      </div>
    </div>
  )
}

function envStateLabel(
  configStatus: KakaoConfigStatus | null,
  key: string,
  optional = false,
): string {
  if (!configStatus) return '확인 중'
  if (configStatus.missing.includes(key) || configStatus.optionalMissing.includes(key)) {
    return optional ? '선택' : '미설정'
  }
  return '설정됨'
}

// 발송 미리보기 헬퍼
function buildPreview(templateCode: string, params: Record<string, string>): string {
  const T = '신정노동법률사무소'
  const get = (k: string) => params[k] || `{${k}}`

  const templates: Record<string, () => string> = {
    DOC_COLLECT_DONE: () =>
      `[${T}] 안녕하세요, ${get('clientName')}님.\n\n${get('year')}년 ${get('month')}월 민원서류 수집이 완료되었습니다.\n\n📄 수집 문서: ${get('docCount')}건\n🔗 확인: ${get('portalUrl')}`,
    PAYSLIP_READY: () =>
      `[${T}] ${get('employeeName')}님의\n${get('year')}년 ${get('month')}월 급여명세서가 발행되었습니다.\n\n💰 실수령액: ${get('netPay')}원\n🔗 명세서 확인: ${get('portalUrl')}`,
    FILING_DUE: () =>
      `[${T}] ⚠️ 신고 기한 안내\n\n${get('clientName')}님, ${get('filingType')} 신고 기한이\n📅 ${get('dueDate')} 입니다.\n\n준비 서류: ${get('required')}`,
    CONTRACT_SIGN: () =>
      `[${T}] 전자서명 요청\n\n${get('recipientName')}님께 서명 요청 드립니다.\n\n📋 계약서: ${get('contractTitle')}\n✍️ 서명 링크: ${get('signUrl')}\n⏰ 유효기간: ${get('expireDate')}`,
    CONSULT_CONFIRM: () =>
      `[${T}] 상담 예약이 확인되었습니다.\n\n👤 성함: ${get('clientName')}\n📅 일시: ${get('datetime')}\n📍 장소: ${get('location') || '신정노동법률사무소'}`,
    CASE_UPDATE: () =>
      `[${T}] 사건 진행 안내\n\n${get('clientName')}님의 사건 상황을 안내드립니다.\n\n📂 사건명: ${get('caseName')}\n📋 내용: ${get('updateContent')}`,
    LABOR_NOTICE: () =>
      `[${T}] 노무 안내\n\n${get('clientName')}님께 안내 드립니다.\n\n📌 ${get('title')}\n\n${get('content')}`,
  }
  return templates[templateCode]?.() ?? templateCode
}
