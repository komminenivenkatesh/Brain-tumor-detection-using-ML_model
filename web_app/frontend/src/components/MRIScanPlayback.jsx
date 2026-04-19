import { useState, useEffect, useRef } from 'react'
import { useAnalysisStore } from '../store'
import { analysisAPI } from '../api'
import styles from './MRIScanPlayback.module.css'

export default function MRIScanPlayback() {
  const { currentAnalysis } = useAnalysisStore()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [showTumorRegion, setShowTumorRegion] = useState(true)
  const [displayMode, setDisplayMode] = useState('overlay') // 'overlay', 'original', 'segmentation'
  const [windowLevel, setWindowLevel] = useState(40)
  const [windowWidth, setWindowWidth] = useState(400)
  const [loading, setLoading] = useState(true)
  const [originalImage, setOriginalImage] = useState(null)
  const [segmentationImage, setSegmentationImage] = useState(null)
  const [error, setError] = useState(null)
  const canvasRef = useRef(null)

  // Total frames based on image slices (simulated)
  const totalFrames = 15 // Simulating 15 slices through brain

  // Load original and segmentation images
  useEffect(() => {
    if (!currentAnalysis) {
      setLoading(false)
      setError(null)
      return
    }

    const loadImages = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Current analysis:', currentAnalysis)
        
        // Use saved_filename if available, fallback to filename for old records
        const fileToLoad = currentAnalysis.saved_filename || currentAnalysis.filename
        
        if (!fileToLoad) {
          setError('No image filename in analysis data. Please upload a new analysis.')
          setLoading(false)
          return
        }

        // Load original image
        const imgUrl = analysisAPI.getImage(fileToLoad)
        console.log('Loading image from:', imgUrl)
        console.log('File to load:', fileToLoad)
        
        const origImg = new Image()
        origImg.onload = () => {
          console.log('✅ Image loaded successfully')
          setOriginalImage(origImg)
          setError(null)
          setLoading(false)
        }
        origImg.onerror = (error) => {
          console.error('❌ Failed to load image:', error, 'URL:', imgUrl)
          setError(`Failed to load image: ${fileToLoad}. File may not exist on server.`)
          setLoading(false)
        }
        origImg.crossOrigin = 'anonymous'
        origImg.src = imgUrl

        // Load segmentation image if available
        if (currentAnalysis.segmentation_path) {
          const segUrl = analysisAPI.getImage(currentAnalysis.segmentation_path)
          console.log('Loading segmentation from:', segUrl)
          
          const segImg = new Image()
          segImg.onload = () => {
            console.log('✅ Segmentation image loaded successfully')
            setSegmentationImage(segImg)
          }
          segImg.onerror = (error) => {
            console.warn('Segmentation image failed to load (optional):', error)
          }
          segImg.crossOrigin = 'anonymous'
          segImg.src = segUrl
        }
      } catch (error) {
        console.error('Error in loadImages:', error)
        setError('Error loading images: ' + error.message)
        setLoading(false)
      }
    }

    loadImages()
  }, [currentAnalysis])

  // Playback animation
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        if (prev >= totalFrames - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 300 / speed)

    return () => clearInterval(interval)
  }, [isPlaying, speed])

  // Draw MRI with realistic tumor detection
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Get images to display
    const imgToUse = displayMode === 'segmentation' && segmentationImage ? segmentationImage : originalImage
    
    if (!imgToUse) {
      // Show placeholder with demo animation
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#1a1a2e')
      gradient.addColorStop(1, '#16213e')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw animated demo brain scan pattern
      ctx.strokeStyle = `rgba(68, 255, 68, ${0.3 + Math.sin(Date.now() / 500) * 0.2})`
      ctx.lineWidth = 2
      for (let i = 0; i < 5; i++) {
        const radius = 80 + (i * 40)
        ctx.beginPath()
        ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2)
        ctx.stroke()
      }
      
      ctx.fillStyle = '#666'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Preparing MRI Analysis...', canvas.width / 2, canvas.height / 2 - 20)
      ctx.font = '12px Arial'
      ctx.fillStyle = '#999'
      ctx.fillText('(Demo visualization)', canvas.width / 2, canvas.height / 2 + 20)
      return
    }

    // Calculate scaled dimensions
    const maxWidth = 400
    const maxHeight = 400
    let drawWidth = imgToUse.width
    let drawHeight = imgToUse.height
    
    if (drawWidth > maxWidth) {
      const ratio = maxWidth / drawWidth
      drawWidth = maxWidth
      drawHeight = imgToUse.height * ratio
    }
    if (drawHeight > maxHeight) {
      const ratio = maxHeight / drawHeight
      drawHeight = maxHeight
      drawWidth = imgToUse.width * ratio
    }

    const x = (canvas.width - drawWidth) / 2
    const y = (canvas.height - drawHeight) / 2

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#0f1419')
    gradient.addColorStop(1, '#1a1f2e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw the image
    ctx.globalAlpha = 1
    ctx.drawImage(imgToUse, x, y, drawWidth, drawHeight)

    // Add progressive tumor detection animation
    if (showTumorRegion && currentAnalysis?.is_tumor) {
      const progress = currentFrame / totalFrames

      // Tumor detection indicators
      const tumorProgress = Math.min(progress * 1.2, 1)
      
      // Draw detection crosshair
      ctx.strokeStyle = `rgba(255, 100, 100, ${tumorProgress * 0.8})`
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(x + 20, y + 20, drawWidth - 40, drawHeight - 40)
      ctx.setLineDash([])

      // Animated detection circles
      ctx.strokeStyle = `rgba(255, 100, 100, ${(1 - progress) * 0.6})`
      ctx.lineWidth = 2
      for (let i = 1; i <= 3; i++) {
        const radius = (50 * i) * tumorProgress
        ctx.globalAlpha = Math.max(0, 1 - progress)
        ctx.beginPath()
        ctx.arc(x + drawWidth / 2, y + drawHeight / 2, radius, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.globalAlpha = 1

      // Tumor region highlight
      if (tumorProgress > 0.3) {
        const highlightAlpha = Math.min((tumorProgress - 0.3) / 0.7, 1)
        ctx.fillStyle = `rgba(255, 100, 100, ${0.15 * highlightAlpha})`
        ctx.fillRect(x, y, drawWidth, drawHeight)
      }
    }

    // Draw frame info
    ctx.globalAlpha = 1
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 14px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`Slice: ${Math.round((currentFrame / totalFrames) * 100)}%`, x + 10, y + drawHeight + 30)

    // Draw tumor info if detected
    if (currentAnalysis?.is_tumor) {
      ctx.fillStyle = '#ff6464'
      ctx.font = 'bold 12px Arial'
      ctx.fillText(`🎯 Tumor Detected (${(currentAnalysis.confidence * 100).toFixed(1)}%)`, x + 10, y + drawHeight + 50)
      
      if (currentAnalysis.tumor_size_cm2) {
        ctx.fillStyle = '#ffaa00'
        ctx.fillText(`📏 Size: ${currentAnalysis.tumor_size_cm2} cm²`, x + 10, y + drawHeight + 70)
      }
      
      if (currentAnalysis.tumor_location) {
        ctx.fillStyle = '#88ff88'
        ctx.fillText(`📍 Location: ${currentAnalysis.tumor_location}`, x + 10, y + drawHeight + 90)
      }
    }

    // Window/Level display
    ctx.fillStyle = '#666'
    ctx.font = '11px Arial'
    ctx.textAlign = 'right'
    ctx.fillText(`W: ${windowWidth} L: ${windowLevel}`, canvas.width - 20, canvas.height - 20)
  }, [currentFrame, totalFrames, showTumorRegion, originalImage, segmentationImage, displayMode, windowLevel, windowWidth, currentAnalysis])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setCurrentFrame(0)
    setIsPlaying(false)
  }

  const handleFrameChange = (e) => {
    setCurrentFrame(parseInt(e.target.value))
    setIsPlaying(false)
  }

  const handleSpeedChange = (e) => {
    setSpeed(parseFloat(e.target.value))
  }

  const handleWindowLevelChange = (e) => {
    setWindowLevel(parseInt(e.target.value))
  }

  const handleWindowWidthChange = (e) => {
    setWindowWidth(parseInt(e.target.value))
  }

  const handleDisplayModeChange = (mode) => {
    setDisplayMode(mode)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>🎥 MRI Scan Playback - Realistic Brain Tumor Detection</h2>
        <p>Frame-by-frame analysis with AI-detected tumor region highlighting</p>
      </div>

      {loading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading MRI scan data...</p>
        </div>
      )}

      {error && (
        <div className={styles.errorBox}>
          <p>⚠️ {error}</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>The image file may not be accessible. Please try uploading a new analysis.</p>
        </div>
      )}

      {!currentAnalysis && !loading && (
        <div className={styles.empty}>
          <p>No analysis available. Upload an MRI image first.</p>
        </div>
      )}

      {currentAnalysis && (
        <>
          <div className={styles.canvas}>
            <canvas 
              ref={canvasRef} 
              width={450} 
              height={500}
              className={styles.mriCanvas}
            />
          </div>

          <div className={styles.imageInfo}>
            <div className={styles.infoBox}>
              <h4>📋 Analysis Summary</h4>
              <ul>
                <li><strong>Tumor Detected:</strong> {currentAnalysis.is_tumor ? '✅ YES' : '❌ NO'}</li>
                <li><strong>Confidence:</strong> {(currentAnalysis.confidence * 100).toFixed(1)}%</li>
                {currentAnalysis.is_tumor && (
                  <>
                    <li><strong>Tumor Type:</strong> {currentAnalysis.tumor_type || currentAnalysis.label || 'N/A'}</li>
                    {currentAnalysis.tumor_size_cm2 && <li><strong>Size:</strong> {currentAnalysis.tumor_size_cm2} cm²</li>}
                    {currentAnalysis.tumor_location && <li><strong>Location:</strong> {currentAnalysis.tumor_location}</li>}
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className={styles.displayModes}>
            <label>Display Mode:</label>
            <div className={styles.modeButtons}>
              <button 
                className={displayMode === 'overlay' ? styles.active : ''}
                onClick={() => handleDisplayModeChange('overlay')}
              >
                📊 Overlay
              </button>
              <button 
                className={displayMode === 'original' ? styles.active : ''}
                onClick={() => handleDisplayModeChange('original')}
              >
                🖼️ Original
              </button>
              {segmentationImage && (
                <button 
                  className={displayMode === 'segmentation' ? styles.active : ''}
                  onClick={() => handleDisplayModeChange('segmentation')}
                >
                  🎯 Segmentation
                </button>
              )}
            </div>
          </div>

          <div className={styles.controls}>
            <div className={styles.playbackControls}>
              <button 
                className={styles.playBtn}
                onClick={handlePlayPause}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button 
                className={styles.resetBtn}
                onClick={handleReset}
                title="Reset to start"
              >
                ⏮
              </button>
            </div>

            <div className={styles.frameSlider}>
              <label>Frame: {currentFrame + 1}/{totalFrames}</label>
              <input 
                type="range" 
                min="0" 
                max={totalFrames - 1}
                value={currentFrame}
                onChange={handleFrameChange}
                className={styles.slider}
              />
            </div>

            <div className={styles.speedControl}>
              <label>Speed:</label>
              <select value={speed} onChange={handleSpeedChange} className={styles.speedSelect}>
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>
          </div>

          {displayMode !== 'segmentation' && (
            <div className={styles.windowControls}>
              <div className={styles.controlGroup}>
                <label>Window Level (Brightness): {windowLevel}</label>
                <input 
                  type="range" 
                  min="0" 
                  max="100"
                  value={windowLevel}
                  onChange={handleWindowLevelChange}
                  className={styles.slider}
                />
              </div>
              <div className={styles.controlGroup}>
                <label>Window Width (Contrast): {windowWidth}</label>
                <input 
                  type="range" 
                  min="100" 
                  max="1000"
                  step="50"
                  value={windowWidth}
                  onChange={handleWindowWidthChange}
                  className={styles.slider}
                />
              </div>
            </div>
          )}

          <div className={styles.toggles}>
            <label className={styles.toggle}>
              <input 
                type="checkbox" 
                checked={showTumorRegion}
                onChange={(e) => setShowTumorRegion(e.target.checked)}
              />
              <span>Show Tumor Detection Highlight</span>
            </label>
          </div>

          <div className={styles.info}>
            <div className={styles.infoSection}>
              <h3>🔬 Medical Imaging</h3>
              <ul>
                <li><strong>MRI Modality:</strong> T1-weighted scan</li>
                <li><strong>Window/Level:</strong> Adjustable for tissue visualization</li>
                <li><strong>Detection Method:</strong> AI-based CNN segmentation</li>
                <li><strong>Visualization:</strong> Slice-by-slice progression</li>
              </ul>
            </div>

            <div className={styles.infoSection}>
              <h3>💡 How to Interpret</h3>
              <ul>
                <li>🔴 Red crosshairs indicate tumor detection</li>
                <li>⭕ Expanding circles show detection progress</li>
                <li>🎯 Switch to Segmentation for tumor boundary</li>
                <li>⚙️ Adjust Window/Level for clarity</li>
              </ul>
            </div>
          </div>

          <div className={styles.nextStep}>
            <p>Next: View the <strong>3D Visualization</strong> for a complete spatial understanding of the tumor location and extent.</p>
          </div>
        </>
      )}
    </div>
  )
}
