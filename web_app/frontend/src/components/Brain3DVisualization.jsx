// 3D Brain Visualization Component
import React, { useState } from 'react';
import axios from 'axios';

const Brain3DVisualization = () => {
  const [visualization, setVisualization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tumorVolume, setTumorVolume] = useState('');
  const [brainVolume, setBrainVolume] = useState('1400000');
  const [autoGenerateVolume, setAutoGenerateVolume] = useState(false);

  const generate3DModel = async () => {
    if (!autoGenerateVolume && !tumorVolume) {
      setError('Please enter tumor volume');
      return;
    }

    if (!brainVolume || parseFloat(brainVolume) <= 0) {
      setError('Please enter a valid brain volume');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        brain_volume_mm3: parseFloat(brainVolume),
        generate_volume: autoGenerateVolume
      };

      if (!autoGenerateVolume) {
        payload.tumor_volume_mm3 = parseFloat(tumorVolume);
      }
      
      const response = await axios.post('/api/advanced/visualization/3d', payload);

      if (response.data.success) {
        setVisualization(response.data.data);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError('Failed to generate 3D visualization');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brain-3d-container">
      <h2>🧠 3D Brain Visualization</h2>
      
      <div className="input-section">
        <label>Tumor Volume (mm³):</label>
        <input
          type="number"
          value={tumorVolume}
          onChange={(e) => setTumorVolume(e.target.value)}
          placeholder="Enter tumor volume"
          disabled={autoGenerateVolume}
        />
        <label>
          <input
            type="checkbox"
            checked={autoGenerateVolume}
            onChange={(e) => setAutoGenerateVolume(e.target.checked)}
          />
          Auto-generate tumor volume
        </label>
        <label>Brain Volume (mm³):</label>
        <input
          type="number"
          value={brainVolume}
          onChange={(e) => setBrainVolume(e.target.value)}
          placeholder="Enter brain volume"
        />
        <button onClick={generate3DModel} disabled={loading}>
          {loading ? 'Generating...' : 'Generate 3D Model'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {visualization && (
        <div className="visualization-results">
          <div className="stats">
            <div className="stat-card">
              <h4>Tumor Volume</h4>
              <p>{visualization.tumor_volume} mm³</p>
            </div>
            <div className="stat-card">
              <h4>Volume Source</h4>
              <p>{visualization.volume_source === 'generated' ? 'Auto Generated' : 'User Input'}</p>
            </div>
            <div className="stat-card">
              <h4>Brain Volume</h4>
              <p>{visualization.brain_volume} mm³</p>
            </div>
            <div className="stat-card">
              <h4>Tumor %</h4>
              <p>{visualization.tumor_percentage.toFixed(2)}%</p>
            </div>
          </div>

          <div className="plot-container">
            {visualization.visualization ? (
              <div dangerouslySetInnerHTML={{ __html: visualization.visualization }} />
            ) : (
              <p>3D metadata ready. Axial slices are available for this visualization.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Brain3DVisualization;
