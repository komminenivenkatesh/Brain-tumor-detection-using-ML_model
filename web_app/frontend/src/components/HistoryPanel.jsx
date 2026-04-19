import styles from './HistoryPanel.module.css'
import { useState, useEffect } from 'react'
import { analysisAPI } from '../api'
import { useAuthStore } from '../store'
import { formatDistanceToNow } from 'date-fns'

export default function HistoryPanel({ onSelectAnalysis }) {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null) // Track which item to delete
  const { token } = useAuthStore()

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await analysisAPI.getHistory()
      setAnalyses(response.data.analyses)
    } catch (err) {
      setError('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAnalysis = async (analysisId) => {
    try {
      setLoading(true)
      await analysisAPI.deleteAnalysis(analysisId)
      
      // Remove from local state
      setAnalyses(prev => prev.filter(a => a.analysis_id !== analysisId))
      
      setMessageType('success')
      setMessage('✅ Analysis deleted successfully')
      setDeleteConfirm(null)
      
      setTimeout(() => {
        setMessage('')
        setMessageType('')
      }, 3000)
    } catch (err) {
      setMessageType('error')
      setMessage(err.response?.data?.detail || '❌ Failed to delete analysis')
      setTimeout(() => {
        setMessage('')
        setMessageType('')
      }, 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleClearAllHistory = async () => {
    if (!window.confirm('Are you sure you want to delete ALL analyses? This cannot be undone.')) {
      return
    }
    
    try {
      setLoading(true)
      const response = await analysisAPI.clearAllHistory()
      
      // Clear local state
      setAnalyses([])
      
      setMessageType('success')
      setMessage(`✅ Cleared ${response.data.count} analyses`)
      
      setTimeout(() => {
        setMessage('')
        setMessageType('')
      }, 3000)
    } catch (err) {
      setMessageType('error')
      setMessage(err.response?.data?.detail || '❌ Failed to clear history')
      setTimeout(() => {
        setMessage('')
        setMessageType('')
      }, 3000)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.panel}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading analysis history...</p>
        </div>
      </div>
    )
  }

  if (analyses.length === 0) {
    return (
      <div className={styles.panel}>
        <div className={styles.empty}>
          <div className={styles.icon}>📜</div>
          <h3>No Analysis History</h3>
          <p>Your past analyses will appear here. Start by uploading an image!</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2>Analysis History</h2>
        <div className={styles.actions}>
          <button className={styles.refreshBtn} onClick={fetchHistory} disabled={loading}>
            🔄 Refresh
          </button>
          <button className={styles.clearAllBtn} onClick={handleClearAllHistory} disabled={loading || analyses.length === 0}>
            🗑️ Clear All
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {message && <div className={`${styles.message} ${styles[messageType]}`}>{message}</div>}

      <div className={styles.timeline}>
        {analyses.map((analysis, index) => (
          <div key={analysis.analysis_id} className={styles.itemWrapper}>
            {deleteConfirm === analysis.analysis_id && (
              <div className={styles.confirmDialog}>
                <p>Delete this analysis?</p>
                <div className={styles.confirmButtons}>
                  <button 
                    className={styles.confirmYes}
                    onClick={() => handleDeleteAnalysis(analysis.analysis_id)}
                    disabled={loading}
                  >
                    Yes, Delete
                  </button>
                  <button 
                    className={styles.confirmNo}
                    onClick={() => setDeleteConfirm(null)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            <div
              className={styles.item}
              onClick={() => !deleteConfirm && onSelectAnalysis(analysis)}
            >
              <div className={styles.timelineDot}></div>

              <div className={styles.content}>
                <div className={styles.top}>
                  <div className={styles.fileInfo}>
                    <p className={styles.fileName}>{analysis.filename}</p>
                    <small className={styles.timestamp}>
                      {formatDistanceToNow(new Date(analysis.timestamp), { addSuffix: true })}
                    </small>
                  </div>

                  <div className={styles.result}>
                    <span className={`${styles.badgeSmall} ${analysis.is_tumor ? styles.tumor : styles.normal}`}>
                      {analysis.label}
                    </span>
                  </div>
                </div>

                <div className={styles.details}>
                  <div className={styles.detail}>
                    <span className={styles.label}>Confidence:</span>
                    <span className={styles.value}>{(analysis.confidence * 100).toFixed(2)}%</span>
                  </div>
                  <div className={styles.detail}>
                    <span className={styles.label}>Probability:</span>
                    <span className={styles.value}>{(analysis.probability * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <button 
                  className={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    setDeleteConfirm(analysis.analysis_id)
                  }}
                  title="Delete this analysis"
                  disabled={loading}
                >
                  🗑️
                </button>
                <div className={styles.arrow}>→</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
