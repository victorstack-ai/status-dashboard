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

function App() {
  const [status, setStatus] = useState<AgentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      // Add cache-busting parameter to bypass GitHub raw CDN caching
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
    // Poll every 15 seconds
    const intervalId = setInterval(fetchStatus, 15000)
    return () => clearInterval(intervalId)
  }, [])

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  const getTimeAgo = (isoString: string) => {
    const diffNode = new Date().getTime() - new Date(isoString).getTime()
    const minutes = Math.floor(diffNode / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes === 1) return '1 min ago'
    return `${minutes} mins ago`
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
            <p className="task-description">{error}</p>
          </div>
        ) : status ? (
          <>
            <section className={`status-card state-${status.state.toLowerCase()}`}>
              <div className="status-meta">
                <span className="job-name">{status.current_job}</span>
                <span className="job-state">{status.state}</span>
              </div>

              <h2 className="task-description">{status.description}</h2>

              <div className="timestamp">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                Last Update: {getTimeAgo(status.last_updated_utc)} ({formatDate(status.last_updated_utc)})
              </div>
            </section>

            {status.history && status.history.length > 0 && (
              <section className="history-section">
                <h3 className="history-title">Recent Activity</h3>
                <div className="history-list">
                  {status.history.slice(1, 6).map((item, index) => (
                    <div className="history-item" key={index}>
                      <span className="history-time">{formatDate(item.timestamp)}</span>
                      <span className="history-job">{item.job}</span>
                      <span className="history-desc" title={item.description}>{item.description}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : null}
      </div>
    </>
  )
}

export default App
