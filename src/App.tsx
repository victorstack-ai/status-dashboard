import { useEffect, useState } from 'react'

interface HistoryItem {
  job: string
  state: string
  description: string
  timestamp: string
}

interface AgentStatus {
  current_job: string
  state: string
  description: string
  last_updated_utc: string
  history: HistoryItem[]
}

const TELEMETRY_URL = 'https://raw.githubusercontent.com/victorstack-ai/agent-telemetry/main/status.json'

function StateIcon({ state, size = 16 }: { state: string; size?: number }) {
  const s = state.toLowerCase()
  if (s === 'success') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--state-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" strokeWidth="2" opacity="0.3" />
        <polyline points="9 12 11.5 14.5 16 9.5" />
      </svg>
    )
  }
  if (s === 'fail' || s === 'failed') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--state-failed)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" strokeWidth="2" opacity="0.3" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    )
  }
  // Running / default
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="icon-spin">
      <circle cx="12" cy="12" r="10" stroke="var(--state-running)" strokeWidth="2" opacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--state-running)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

function StateBadge({ state }: { state: string }) {
  const s = state.toLowerCase()
  const label = s === 'fail' ? 'Failed' : state
  return (
    <span className={`state-badge state-badge-${s}`}>
      <StateIcon state={state} size={12} />
      {label}
    </span>
  )
}

function App() {
  const [status, setStatus] = useState<AgentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${TELEMETRY_URL}?t=${new Date().getTime()}`)
      if (!response.ok) throw new Error('Failed to fetch telemetry data')
      const data: AgentStatus = await response.json()
      setStatus(data)
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Agent is currently offline or synchronizing.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const intervalId = setInterval(fetchStatus, 15000)
    return () => clearInterval(intervalId)
  }, [])

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const getTimeAgo = (isoString: string) => {
    const diff = new Date().getTime() - new Date(isoString).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes === 1) return '1 min ago'
    if (minutes < 60) return `${minutes} mins ago`
    const hours = Math.floor(minutes / 60)
    if (hours === 1) return '1 hour ago'
    if (hours < 24) return `${hours} hours ago`
    const days = Math.floor(hours / 24)
    return days === 1 ? '1 day ago' : `${days} days ago`
  }

  const getStats = (history: HistoryItem[]) => {
    const total = history.length
    const success = history.filter(h => h.state.toLowerCase() === 'success').length
    const failed = history.filter(h => {
      const s = h.state.toLowerCase()
      return s === 'fail' || s === 'failed'
    }).length
    const running = history.filter(h => h.state.toLowerCase() === 'running').length
    return { total, success, failed, running }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Connecting to Agent Telemetry...</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>

      <div className="dashboard-container">
        <header className="header">
          <div className="header-title-wrapper">
            <h1>VictorStack AI Engine</h1>
            <p>Live autonomous agent telemetry and operational status.</p>
          </div>
          <div className="live-indicator">
            <div className="pulsing-dot"></div>
            LIVE
          </div>
        </header>

        {error ? (
          <div className="status-card state-failed">
            <div className="status-icon-large">
              <StateIcon state="failed" size={40} />
            </div>
            <p className="task-description">{error}</p>
          </div>
        ) : status ? (
          <>
            <section className={`status-card state-${status.state.toLowerCase()}`}>
              <div className="status-card-top">
                <div className={`status-icon-large icon-glow-${status.state.toLowerCase()}`}>
                  <StateIcon state={status.state} size={40} />
                </div>
                <div className="status-card-content">
                  <div className="status-meta">
                    <span className="job-name">{status.current_job}</span>
                    <StateBadge state={status.state} />
                  </div>
                  <h2 className="task-description">{status.description}</h2>
                </div>
              </div>

              <div className="timestamp">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Last Update: {getTimeAgo(status.last_updated_utc)} ({formatDate(status.last_updated_utc)})
              </div>
            </section>

            {status.history && status.history.length > 0 && (
              <>
                <section className="stats-bar">
                  {(() => {
                    const stats = getStats(status.history)
                    return (
                      <>
                        <div className="stat-item">
                          <span className="stat-value">{stats.total}</span>
                          <span className="stat-label">Total</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item stat-success">
                          <span className="stat-value">{stats.success}</span>
                          <span className="stat-label">Success</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item stat-failed">
                          <span className="stat-value">{stats.failed}</span>
                          <span className="stat-label">Failed</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item stat-running">
                          <span className="stat-value">{stats.running}</span>
                          <span className="stat-label">Running</span>
                        </div>
                      </>
                    )
                  })()}
                </section>

                <section className="history-section">
                  <h3 className="history-title">Recent Activity</h3>
                  <div className="history-list">
                    {status.history.slice(0, 8).map((item, index) => (
                      <div className={`history-item history-state-${item.state.toLowerCase()}`} key={index}>
                        <div className="history-icon">
                          <StateIcon state={item.state} size={18} />
                        </div>
                        <div className="history-main">
                          <div className="history-top-row">
                            <span className="history-job">{item.job}</span>
                            <StateBadge state={item.state} />
                          </div>
                          <span className="history-desc" title={item.description}>{item.description}</span>
                        </div>
                        <span className="history-time">{getTimeAgo(item.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </>
        ) : null}
      </div>
    </>
  )
}

export default App
