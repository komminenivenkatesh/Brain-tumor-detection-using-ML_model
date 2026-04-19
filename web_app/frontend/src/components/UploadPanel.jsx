import styles from './UploadPanel.module.css'
import { useState, useRef } from 'react'
import { analysisAPI } from '../api'
import { useAnalysisStore } from '../store'

export default function UploadPanel() {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState({})
  const fileRef = useRef(null)
  const { setCurrentAnalysis, addAnalysis } = useAnalysisStore()

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
      if (files.length === 0) {
        setError('Please upload image files only')
        return
      }
      setSelectedFiles(files)
      setError('')
    }
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(Array.from(e.target.files))
      setError('')
    }
  }

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one image')
      return
    }

    setLoading(true)
    setError('')
    setUploadProgress({})

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        try {
          setUploadProgress(prev => ({
            ...prev,
            [i]: 'analyzing...'
          }))
          
          console.log(`Uploading file ${i + 1}/${selectedFiles.length}:`, file.name)
          const response = await analysisAPI.uploadAndPredict(file)
          
          console.log(`Analysis Result ${i + 1}:`, response.data)
          addAnalysis(response.data)
          
          // Set the last analysis as current
          if (i === selectedFiles.length - 1) {
            setCurrentAnalysis(response.data)
          }
          
          setUploadProgress(prev => ({
            ...prev,
            [i]: 'complete'
          }))
        } catch (err) {
          console.error(`Error analyzing file ${i}:`, err)
          const errorMsg = err.response?.data?.detail || err.message || 'Upload failed'
          setError(`File ${i + 1} (${file.name}): ${errorMsg}`)
          setUploadProgress(prev => ({
            ...prev,
            [i]: 'failed'
          }))
        }
      }
      
      setSelectedFiles([])
    } catch (err) {
      console.error('Error:', err)
      const errorMsg = err.response?.data?.detail || err.message || 'Batch analysis failed'
      setError(`Batch analysis failed: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.card}>
        <h2>📤 Select Brain MRI Images</h2>
        <p className={styles.batchHint}>Upload multiple images for batch analysis</p>
        
        <div
          className={`${styles.dropzone} ${dragActive ? styles.active : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          {selectedFiles.length === 0 ? (
            <div>
              <div className={styles.icon}>🖼️</div>
              <p className={styles.title}>Drag and drop your images here</p>
              <p className={styles.subtitle}>or click to browse</p>
              <p className={styles.formats}>Supported: JPG, PNG (DICOM coming soon)</p>
            </div>
          ) : (
            <div className={styles.selected}>
              <div className={styles.filesCount}>
                <span className={styles.icon}>📁</span>
                <p>{selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected</p>
              </div>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            multiple
            style={{ display: 'none' }}
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className={styles.filesList}>
            <h3>Selected Files:</h3>
            {selectedFiles.map((file, index) => (
              <div key={index} className={styles.fileItem}>
                <div className={styles.fileInfo}>
                  <span className={styles.fileName}>📄 {file.name}</span>
                  <span className={styles.fileSize}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                {uploadProgress[index] && (
                  <span className={`${styles.status} ${styles[uploadProgress[index]]}`}>
                    {uploadProgress[index] === 'analyzing...' && '⏳ Analyzing...'}
                    {uploadProgress[index] === 'complete' && '✅ Complete'}
                    {uploadProgress[index] === 'failed' && '❌ Failed'}
                  </span>
                )}
                {!loading && !uploadProgress[index] && (
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemoveFile(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.info}>
          <h3>Important:</h3>
          <ul>
            <li>Upload clear, high-quality brain MRI images</li>
            <li>Supported formats: JPEG, PNG</li>
            <li>Image size should be between 64x64 and 512x512 pixels</li>
            <li>Analysis takes 2-5 seconds per image</li>
            <li>Batch analysis: Upload multiple images at once</li>
          </ul>
        </div>

        <button
          className={styles.analyzeBtn}
          onClick={handleSubmit}
          disabled={selectedFiles.length === 0 || loading}
        >
          {loading ? (
            <>
              <span className={styles.spinner}></span>
              Analyzing {Object.values(uploadProgress).filter(s => s === 'complete').length + 1}/{selectedFiles.length}
            </>
          ) : (
            '🔍 Analyze ' + (selectedFiles.length > 1 ? `${selectedFiles.length} Images` : 'Image')
          )}
        </button>
      </div>
    </div>
  )
}
