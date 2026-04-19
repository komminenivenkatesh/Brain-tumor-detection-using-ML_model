import styles from './AnalyticsPanel.module.css'
import { useAnalysisStore } from '../store'
import { useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts'

const COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffd93d', '#6c5ce7', '#a29bfe']

export default function AnalyticsPanel() {
  const { analyses } = useAnalysisStore()

  // Calculate statistics
  const stats = useMemo(() => {
    if (analyses.length === 0) {
      return {
        totalAnalyses: 0,
        tumorDetected: 0,
        normalCases: 0,
        averageConfidence: 0,
        detectionRate: 0,
        topMonth: 'N/A'
      }
    }

    const totalAnalyses = analyses.length
    const tumorDetected = analyses.filter(a => a.is_tumor).length
    const normalCases = totalAnalyses - tumorDetected
    const avgConfidence = (analyses.reduce((sum, a) => sum + (a.confidence || 0), 0) / totalAnalyses * 100).toFixed(2)
    const detectionRate = ((tumorDetected / totalAnalyses) * 100).toFixed(2)

    return {
      totalAnalyses,
      tumorDetected,
      normalCases,
      averageConfidence: avgConfidence,
      detectionRate: detectionRate,
    }
  }, [analyses])

  // Prepare pie chart data (Tumor vs Normal)
  const tumorDistribution = useMemo(() => {
    if (analyses.length === 0) return []
    
    const tumorCount = analyses.filter(a => a.is_tumor).length
    const normalCount = analyses.length - tumorCount
    
    return [
      { name: 'Tumor', value: tumorCount, percentage: ((tumorCount / analyses.length) * 100).toFixed(1) },
      { name: 'Normal', value: normalCount, percentage: ((normalCount / analyses.length) * 100).toFixed(1) }
    ].filter(item => item.value > 0)
  }, [analyses])

  // Prepare confidence distribution data
  const confidenceData = useMemo(() => {
    const ranges = [
      { range: '0-20%', min: 0, max: 0.2, count: 0 },
      { range: '20-40%', min: 0.2, max: 0.4, count: 0 },
      { range: '40-60%', min: 0.4, max: 0.6, count: 0 },
      { range: '60-80%', min: 0.6, max: 0.8, count: 0 },
      { range: '80-100%', min: 0.8, max: 1.0, count: 0 }
    ]

    analyses.forEach(analysis => {
      const confidence = analysis.confidence || 0
      const range = ranges.find(r => confidence >= r.min && confidence <= r.max)
      if (range) range.count++
    })

    return ranges.filter(r => r.count > 0)
  }, [analyses])

  // Prepare timeline data (last 7 days)
  const timelineData = useMemo(() => {
    const last7Days = {}
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      last7Days[dateStr] = { date: dateStr, total: 0, tumor: 0, normal: 0 }
    }

    // Count analyses per day
    analyses.forEach(analysis => {
      const date = new Date(analysis.timestamp)
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      
      if (last7Days[dateStr]) {
        last7Days[dateStr].total++
        if (analysis.is_tumor) {
          last7Days[dateStr].tumor++
        } else {
          last7Days[dateStr].normal++
        }
      }
    })

    return Object.values(last7Days)
  }, [analyses])

  // Prepare monthly trend data
  const monthlyData = useMemo(() => {
    const months = {}
    
    analyses.forEach(analysis => {
      const date = new Date(analysis.timestamp)
      const monthKey = date.toLocaleDateString('en-US', { year: '2-digit', month: 'short' })
      
      if (!months[monthKey]) {
        months[monthKey] = { month: monthKey, count: 0 }
      }
      months[monthKey].count++
    })

    return Object.values(months).slice(-6)
  }, [analyses])

  if (analyses.length === 0) {
    return (
      <div className={styles.panel}>
        <div className={styles.empty}>
          <p>📊 No data available yet. Complete some analyses to see analytics.</p>
        </div>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.label}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className={styles.panel}>
      <h2>📊 Analytics Dashboard</h2>

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Analyses</h3>
          <p className={styles.statValue}>{stats.totalAnalyses}</p>
          <span className={styles.statLabel}>Total scans analyzed</span>
        </div>
        <div className={`${styles.statCard} ${styles.tumor}`}>
          <h3>🚨 Tumors Detected</h3>
          <p className={styles.statValue}>{stats.tumorDetected}</p>
          <span className={styles.statLabel}>Positive cases</span>
        </div>
        <div className={`${styles.statCard} ${styles.normal}`}>
          <h3>✅ Normal Cases</h3>
          <p className={styles.statValue}>{stats.normalCases}</p>
          <span className={styles.statLabel}>Negative cases</span>
        </div>
        <div className={styles.statCard}>
          <h3>📈 Avg Confidence</h3>
          <p className={styles.statValue}>{stats.averageConfidence}%</p>
          <span className={styles.statLabel}>Model accuracy rate</span>
        </div>
        <div className={styles.statCard}>
          <h3>🎯 Detection Rate</h3>
          <p className={styles.statValue}>{stats.detectionRate}%</p>
          <span className={styles.statLabel}>Positive detection ratio</span>
        </div>
        <div className={styles.statCard}>
          <h3>📅 Analyses/Month</h3>
          <p className={styles.statValue}>{monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].count : 0}</p>
          <span className={styles.statLabel}>Current month activity</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        {/* Pie Chart - Tumor vs Normal Distribution */}
        {tumorDistribution.length > 0 && (
          <div className={styles.chartCard}>
            <h3>🏥 Detection Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tumorDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tumorDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${value} cases`}
                  contentStyle={{ backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bar Chart - Confidence Distribution */}
        {confidenceData.length > 0 && (
          <div className={styles.chartCard}>
            <h3>🎯 Confidence Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={confidenceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#45b7d1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Line Chart - Last 7 Days Trend */}
        {timelineData.length > 0 && (
          <div className={styles.chartCard}>
            <h3>📈 Last 7 Days Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="tumor" stroke="#ff6b6b" strokeWidth={2} dot={{ fill: '#ff6b6b' }} />
                <Line type="monotone" dataKey="normal" stroke="#4ecdc4" strokeWidth={2} dot={{ fill: '#4ecdc4' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bar Chart - Monthly Trend */}
        {monthlyData.length > 0 && (
          <div className={styles.chartCard}>
            <h3>📊 Monthly Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#6c5ce7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Confidence vs Detection Rate */}
        <div className={styles.chartCard}>
          <h3>💡 Insights</h3>
          <div className={styles.insightsContent}>
            <div className={styles.insight}>
              <h4>📊 Detection Accuracy</h4>
              <p>Based on {stats.totalAnalyses} analyses, the model shows a {stats.averageConfidence}% average confidence in tumor detection.</p>
            </div>
            <div className={styles.insight}>
              <h4>🎯 Case Distribution</h4>
              <p>Out of all cases analyzed, {stats.detectionRate}% resulted in positive tumor detection, indicating a significant portion of the patient base shows concerning signs.</p>
            </div>
            <div className={styles.insight}>
              <h4>📈 Trend</h4>
              <p>{monthlyData.length > 1 ? 'Analysis activity shows positive growth over time' : 'More data needed for trend analysis'}.</p>
            </div>
            <div className={styles.insight}>
              <h4>⚠️ Recommendation</h4>
              <p>Continue regular screening for patients with detected tumors. Monitor confidence scores to identify borderline cases requiring specialist review.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className={styles.exportSection}>
        <button className={styles.exportBtn} onClick={() => {
          const report = {
            generatedAt: new Date().toISOString(),
            stats,
            analyses: analyses.map(a => ({
              id: a.analysis_id,
              timestamp: a.timestamp,
              label: a.label,
              confidence: a.confidence,
              isTumor: a.is_tumor
            }))
          }
          const json = JSON.stringify(report, null, 2)
          const blob = new Blob([json], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `analytics_report_${Date.now()}.json`
          link.click()
        }}>
          📥 Export Analytics (JSON)
        </button>
      </div>
    </div>
  )
}
