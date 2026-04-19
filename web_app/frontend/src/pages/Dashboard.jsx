import styles from './Dashboard.module.css'
import { useState, useEffect } from 'react'
import { useAuthStore, useAnalysisStore } from '../store'
import UploadPanel from '../components/UploadPanel'
import ResultsPanel from '../components/ResultsPanel'
import HistoryPanel from '../components/HistoryPanel'
import PatientProfile from '../components/PatientProfile'
import AnalyticsPanel from '../components/AnalyticsPanel'
import Brain3DVisualization from '../components/Brain3DVisualization'
import TumorGrowthPrediction from '../components/TumorGrowthPrediction'
import DoctorRecommendationSystem from '../components/DoctorRecommendationSystem'
import VoiceAssistant from '../components/VoiceAssistant'
import ModelPerformancePanel from '../components/ModelPerformancePanel'
import MRIScanPlayback from '../components/MRIScanPlayback'
import Header from '../components/Header'

export default function Dashboard() {
  const { currentAnalysis, setCurrentAnalysis } = useAnalysisStore()
  const [activeTab, setActiveTab] = useState('upload')

  // Auto-switch to results when analysis completes
  useEffect(() => {
    if (currentAnalysis) {
      console.log('Analysis complete, switching to results tab')
      setActiveTab('results')
    }
  }, [currentAnalysis])

  return (
    <div className={styles.dashboard}>
      <Header />
      
      <div className={styles.container}>
        <div className={styles.tabs}>
          {/* Initial Setup */}
          <button
            className={`${styles.tab} ${activeTab === 'profile' ? styles.active : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Patient Profile
          </button>
          
          {/* Main Workflow */}
          <button
            className={`${styles.tab} ${activeTab === 'upload' ? styles.active : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            📤 Upload & Analyze
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'results' ? styles.active : ''}`}
            onClick={() => setActiveTab('results')}
            disabled={!currentAnalysis}
          >
            📊 Results
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'playback' ? styles.active : ''}`}
            onClick={() => setActiveTab('playback')}
            disabled={!currentAnalysis}
          >
            🎥 MRI Scan Playback
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'visualization' ? styles.active : ''}`}
            onClick={() => setActiveTab('visualization')}
            disabled={!currentAnalysis}
          >
            🧠 3D Visualization
          </button>
          
          {/* Advanced Analysis */}
          <button
            className={`${styles.tab} ${activeTab === 'growth' ? styles.active : ''}`}
            onClick={() => setActiveTab('growth')}
            disabled={!currentAnalysis}
          >
            📈 Growth Prediction
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'recommendation' ? styles.active : ''}`}
            onClick={() => setActiveTab('recommendation')}
            disabled={!currentAnalysis}
          >
            👨‍⚕️ Doctor Recommendation
          </button>
          
          {/* Support & Reference */}
          <button
            className={`${styles.tab} ${activeTab === 'voice' ? styles.active : ''}`}
            onClick={() => setActiveTab('voice')}
          >
            🎤 Voice Assistant
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📜 History
          </button>
          
          {/* Insights & System */}
          <button
            className={`${styles.tab} ${activeTab === 'analytics' ? styles.active : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'performance' ? styles.active : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            🔍 Model Performance
          </button>
        </div>

        <div className={styles.content}>
          {activeTab === 'upload' && <UploadPanel />}
          {activeTab === 'results' && <ResultsPanel />}
          {activeTab === 'playback' && <MRIScanPlayback />}
          {activeTab === 'history' && <HistoryPanel onSelectAnalysis={(analysis) => {
            setCurrentAnalysis(analysis)
            setActiveTab('results')
          }} />}
          {activeTab === 'analytics' && <AnalyticsPanel />}
          {activeTab === 'profile' && <PatientProfile />}
          {activeTab === 'visualization' && <Brain3DVisualization />}
          {activeTab === 'growth' && <TumorGrowthPrediction />}
          {activeTab === 'recommendation' && <DoctorRecommendationSystem />}
          {activeTab === 'voice' && <VoiceAssistant />}
          {activeTab === 'performance' && <ModelPerformancePanel />}
        </div>
      </div>
    </div>
  )
}
