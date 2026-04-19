import styles from './ResultsPanel.module.css'
import { useAnalysisStore } from '../store'
import { analysisAPI } from '../api'
import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'

const VIDEO_SOURCES = {
  youtube: {
    label: 'YouTube',
    buildUrl: (keyword) => `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`
  }
}

export default function ResultsPanel() {
  const { currentAnalysis } = useAnalysisStore()
  const [downloading, setDownloading] = useState(false)

  console.log('ResultsPanel - currentAnalysis:', currentAnalysis)

  const handleDownloadPDF = async () => {
    if (!currentAnalysis) return
    
    try {
      setDownloading(true)
      const response = await analysisAPI.downloadReport(currentAnalysis.analysis_id)
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `analysis_report_${currentAnalysis.analysis_id}.pdf`)
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      console.error('Failed to download report:', error)
      alert('Failed to download report. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  if (!currentAnalysis) {
    return (
      <div className={styles.empty}>
        <p>No analysis selected. Upload an image first.</p>
      </div>
    )
  }

  const tumorDetectedText = currentAnalysis.is_tumor ? 'YES' : 'NO'
  const tumorType = currentAnalysis.tumor_type || (currentAnalysis.is_tumor ? currentAnalysis.label : 'N/A')
  const tumorCount = Number.isFinite(currentAnalysis.tumor_count)
    ? currentAnalysis.tumor_count
    : (currentAnalysis.is_tumor ? 1 : 0)
  const tumorLocation = currentAnalysis.tumor_location || currentAnalysis.location || 'N/A'
  const tumorSizeValue = currentAnalysis.tumor_size_cm2 || currentAnalysis.tumor_size
  const tumorSize = Number.isFinite(tumorSizeValue)
    ? `${tumorSizeValue} cm²`
    : (typeof tumorSizeValue === 'string' && tumorSizeValue.trim() ? tumorSizeValue : 'N/A')
  const confidencePercent = (currentAnalysis.confidence * 100).toFixed(1)
  const recommendation = currentAnalysis.is_tumor
    ? 'Consult a neurologist immediately.'
    : 'No immediate concern detected. Continue routine checkups.'

  const resolvedTumorType = String(
    currentAnalysis.tumor_subtype || currentAnalysis.tumor_type || currentAnalysis.label || ''
  ).trim()
  const lowerTumorType = resolvedTumorType.toLowerCase()

  const tumorTypeKeywordsMap = {
    glioma: [
      'Glioma explanation by doctor',
      'Glioma symptoms MRI diagnosis',
      'Glioma treatment options explained'
    ],
    meningioma: [
      'Meningioma explanation by doctor',
      'Meningioma symptoms and diagnosis',
      'Meningioma treatment options explained'
    ],
    pituitary: [
      'Pituitary tumor explanation by doctor',
      'Pituitary tumor symptoms and MRI',
      'Pituitary adenoma treatment options'
    ]
  }

  let videoKeywords = []
  if (currentAnalysis.is_tumor) {
    const mappedType = Object.keys(tumorTypeKeywordsMap).find((typeKey) => lowerTumorType.includes(typeKey))
    if (mappedType) {
      videoKeywords = tumorTypeKeywordsMap[mappedType]
    } else {
      videoKeywords = [
        `${resolvedTumorType || 'Brain tumor'} explanation by doctor`,
        `${resolvedTumorType || 'Brain tumor'} MRI diagnosis explanation`,
        `${resolvedTumorType || 'Brain tumor'} treatment options explained`
      ]
    }
  }

  const videoIntentText = currentAnalysis.is_tumor
    ? `Recommended videos are based on detected tumor type: ${resolvedTumorType || 'Tumor'}.`
    : 'No tumor-specific video recommendations are shown because no tumor was detected.'

  return (
    <div className={styles.panel}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Analysis Results</h2>
          <span className={styles.timestamp}>
            {formatDistanceToNow(new Date(currentAnalysis.timestamp), { addSuffix: true })}
          </span>
        </div>

        <div className={styles.resultBadge}>
          <div className={`${styles.badge} ${currentAnalysis.is_tumor ? styles.tumor : styles.normal}`}>
            {currentAnalysis.is_tumor ? '⚠️ TUMOR DETECTED' : '✓ NORMAL'}
          </div>
          <p className={styles.label}>{currentAnalysis.label}</p>
        </div>

        <div className={styles.report}>
          <h3 className={styles.reportTitle}>🧠 Brain Tumor Analysis Report</h3>
          <div className={styles.reportList}>
            <div className={styles.reportRow}>
              <span className={styles.reportLabel}>✔ Tumor Detected</span>
              <span className={`${styles.reportValue} ${currentAnalysis.is_tumor ? styles.reportYes : styles.reportNo}`}>
                {tumorDetectedText}
              </span>
            </div>
            <div className={styles.reportRow}>
              <span className={styles.reportLabel}>✔ Tumor Type</span>
              <span className={styles.reportValue}>{tumorType}</span>
            </div>
            <div className={styles.reportRow}>
              <span className={styles.reportLabel}>✔ Number of Tumors</span>
              <span className={styles.reportValue}>{tumorCount}</span>
            </div>
            <div className={styles.reportRow}>
              <span className={styles.reportLabel}>✔ Location</span>
              <span className={styles.reportValue}>{tumorLocation}</span>
            </div>
            <div className={styles.reportRow}>
              <span className={styles.reportLabel}>✔ Size</span>
              <span className={styles.reportValue}>{tumorSize}</span>
            </div>
            <div className={styles.reportRow}>
              <span className={styles.reportLabel}>✔ Confidence</span>
              <span className={styles.reportValue}>{confidencePercent}%</span>
            </div>
          </div>
          <div className={styles.recommendation}>
            <p className={styles.recommendationLabel}>📌 Recommendation:</p>
            <p className={styles.recommendationText}>{recommendation}</p>
          </div>
        </div>

        <div className={styles.videoSection}>
          <h3 className={styles.videoTitle}>🎬 Smart Video Recommendation</h3>
          <p className={styles.videoSubtitle}>{videoIntentText}</p>

          {videoKeywords.length > 0 ? (
            <div className={styles.videoGrid}>
              {videoKeywords.map((keyword) => (
                <div className={styles.videoCard} key={keyword}>
                  <p className={styles.videoKeyword}>{keyword}</p>
                  <div className={styles.videoLinks}>
                    {Object.values(VIDEO_SOURCES).map((source) => (
                      <a
                        key={`${keyword}-${source.label}`}
                        href={source.buildUrl(keyword)}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.videoLink}
                      >
                        {source.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.videoSubtitle}>No tumor type videos to recommend for this result.</p>
          )}
        </div>

        {currentAnalysis.segmentation_path && (
          <div className={styles.segmentation}>
            <h3>Tumor Segmentation</h3>
            <img
              src={analysisAPI.getImage(currentAnalysis.segmentation_path)}
              alt="Segmentation"
              className={styles.segmentationImage}
            />
            <p className={styles.segmentationNote}>
              Highlighted regions show detected tumor areas
            </p>
          </div>
        )}

        <div className={styles.actions}>
          <button 
            className={styles.downloadBtn}
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            {downloading ? '⏳ Generating...' : '📥 Download Report (PDF)'}
          </button>
          <button className={styles.shareBtn}>
            📤 Share with Doctor
          </button>
        </div>

        <div className={styles.disclaimer}>
          <p>
            <strong>⚕️ Medical Disclaimer:</strong> This analysis is AI-assisted and should not be used as a sole diagnostic tool. 
            Always consult with a qualified medical professional for accurate diagnosis and treatment.
          </p>
        </div>
      </div>
    </div>
  )
}
