// Tumor Growth Prediction Component
import React, { useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TumorGrowthPrediction = () => {
  const [tumorVolume, setTumorVolume] = useState('');
  const [tumorGrade, setTumorGrade] = useState('moderate');
  const [daysAhead, setDaysAhead] = useState('90');
  const [prediction, setPrediction] = useState(null);
  const [scenarios, setScenarios] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const predictGrowth = async () => {
    if (!tumorVolume) {
      setError('Please enter tumor volume');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/advanced/prediction/growth', {
        current_volume_mm3: parseFloat(tumorVolume),
        tumor_grade: tumorGrade,
        days_ahead: parseInt(daysAhead)
      });

      if (response.data.success) {
        setPrediction(response.data);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError('Failed to predict growth');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const compareScenarios = async () => {
    if (!tumorVolume) {
      setError('Please enter tumor volume');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/advanced/prediction/scenarios', {
        current_volume_mm3: parseFloat(tumorVolume),
        days_ahead: parseInt(daysAhead)
      });

      if (response.data.success) {
        setScenarios(response.data);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError('Failed to compare scenarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    if (!prediction) return null;

    return {
      labels: prediction.predictions.map(p => p.date),
      datasets: [{
        label: 'Predicted Tumor Volume (mm³)',
        data: prediction.predictions.map(p => p.predicted_volume_mm3),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        tension: 0.1
      }]
    };
  };

  return (
    <div className="growth-prediction-container">
      <h2>🔥 Tumor Growth Prediction</h2>

      <div className="input-section">
        <div className="input-group">
          <label>Current Tumor Volume (mm³):</label>
          <input
            type="number"
            value={tumorVolume}
            onChange={(e) => setTumorVolume(e.target.value)}
            placeholder="Enter current tumor volume"
          />
        </div>

        <div className="input-group">
          <label>Tumor Grade:</label>
          <select value={tumorGrade} onChange={(e) => setTumorGrade(e.target.value)}>
            <option value="slow">Slow Growth</option>
            <option value="moderate">Moderate Growth</option>
            <option value="aggressive">Aggressive Growth</option>
          </select>
        </div>

        <div className="input-group">
          <label>Predict Ahead (days):</label>
          <input
            type="number"
            value={daysAhead}
            onChange={(e) => setDaysAhead(e.target.value)}
            placeholder="90"
          />
        </div>

        <button onClick={predictGrowth} disabled={loading}>
          {loading ? 'Predicting...' : 'Predict Growth'}
        </button>
        <button onClick={compareScenarios} disabled={loading}>
          {loading ? 'Comparing...' : 'Compare Scenarios'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {prediction && (
        <div className="prediction-results">
          <div className="risk-assessment">
            <h3>Risk Assessment</h3>
            <div className={`risk-level ${prediction.risk_assessment.level.toLowerCase()}`}>
              <strong>Risk Level: {prediction.risk_assessment.level}</strong>
              <p>Volume Increase: {prediction.risk_assessment.volume_increase_percent}%</p>
              <p>Final Volume: {prediction.risk_assessment.final_volume_mm3} mm³</p>
              <p className="recommendation">
                📋 {prediction.risk_assessment.recommendation}
              </p>
            </div>
          </div>

          <div className="chart-container">
            <h3>Growth Trajectory</h3>
            <Line data={prepareChartData()} options={{ responsive: true }} />
          </div>

          <div className="predictions-table">
            <h3>Detailed Predictions</h3>
            <table>
              <thead>
                <tr>
                  <th>Days</th>
                  <th>Date</th>
                  <th>Volume (mm³)</th>
                  <th>Increase (%)</th>
                </tr>
              </thead>
              <tbody>
                {prediction.predictions.slice(0, 10).map((pred, idx) => (
                  <tr key={idx}>
                    <td>{pred.days}</td>
                    <td>{pred.date}</td>
                    <td>{pred.predicted_volume_mm3}</td>
                    <td>{pred.volume_increase_percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {scenarios && (
        <div className="scenarios-comparison">
          <h3>Growth Scenarios Comparison</h3>
          <div className="scenario-cards">
            {Object.entries(scenarios.scenarios).map(([grade, data]) => (
              <div key={grade} className="scenario-card">
                <h4>{grade.toUpperCase()}</h4>
                <p>Growth Rate: {data.growth_rate} mm³/day</p>
                <p>Doubling Time: {data.doubling_time} days</p>
                <p>Final Volume: {data.final_volume} mm³</p>
                <p className={`risk-${data.risk_level.toLowerCase()}`}>
                  Risk: {data.risk_level}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TumorGrowthPrediction;
