// Model Performance Panel Component
import React, { useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ModelPerformancePanel = () => {
  const [testData, setTestData] = useState('');
  const [metrics, setMetrics] = useState(null);
  const [confusionMatrix, setConfusionMatrix] = useState(null);
  const [clinicalQuality, setClinicalQuality] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUploadGuide, setShowUploadGuide] = useState(false);

  const sampleTestData = {
    y_true: [0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1],
    y_pred: [0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1]
  };

  const calculateMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/advanced/performance/metrics', sampleTestData);

      if (response.data.success) {
        setMetrics(response.data);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError('Failed to calculate metrics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeConfusionMatrix = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/advanced/performance/confusion-matrix', sampleTestData);

      if (response.data.success) {
        setConfusionMatrix(response.data);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError('Failed to analyze confusion matrix');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const assessClinicalQuality = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/advanced/performance/clinical-quality', sampleTestData);

      if (response.data.success) {
        setClinicalQuality(response.data);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError('Failed to assess clinical quality');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const prepareConfusionMatrixChart = () => {
    if (!confusionMatrix) return null;

    const { true_negatives, false_positives, false_negatives, true_positives } = confusionMatrix.interpretation;

    return {
      labels: ['True Negatives', 'False Positives', 'False Negatives', 'True Positives'],
      datasets: [{
        label: 'Count',
        data: [true_negatives.count, false_positives.count, false_negatives.count, true_positives.count],
        backgroundColor: [
          'rgba(75, 192, 75, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 193, 7, 0.7)',
          'rgba(54, 162, 235, 0.7)'
        ]
      }]
    };
  };

  return (
    <div className="model-performance-container">
      <h2>📊 Model Performance Panel</h2>

      <div className="action-buttons">
        <button onClick={calculateMetrics} disabled={loading}>
          {loading ? 'Calculating...' : '📈 Calculate Metrics'}
        </button>
        <button onClick={analyzeConfusionMatrix} disabled={loading}>
          {loading ? 'Analyzing...' : '🔢 Analyze Confusion Matrix'}
        </button>
        <button onClick={assessClinicalQuality} disabled={loading}>
          {loading ? 'Assessing...' : '⚕️ Assess Clinical Quality'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Metrics Display */}
      {metrics && (
        <div className="metrics-section">
          <h3>Performance Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <h4>Accuracy</h4>
              <p className="metric-value">{(metrics.accuracy * 100).toFixed(2)}%</p>
              <p className="metric-label">Overall Correctness</p>
            </div>

            <div className="metric-card">
              <h4>Precision</h4>
              <p className="metric-value">{(metrics.precision * 100).toFixed(2)}%</p>
              <p className="metric-label">True Positives / Predicted Positives</p>
            </div>

            <div className="metric-card">
              <h4>Recall (Sensitivity)</h4>
              <p className="metric-value">{(metrics.recall * 100).toFixed(2)}%</p>
              <p className="metric-label">True Positives / Actual Positives</p>
            </div>

            <div className="metric-card">
              <h4>Specificity</h4>
              <p className="metric-value">{(metrics.specificity * 100).toFixed(2)}%</p>
              <p className="metric-label">True Negatives / Actual Negatives</p>
            </div>

            <div className="metric-card">
              <h4>F1 Score</h4>
              <p className="metric-value">{(metrics.f1_score * 100).toFixed(2)}%</p>
              <p className="metric-label">Harmonic Mean of Precision & Recall</p>
            </div>

            {metrics.roc_auc && (
              <div className="metric-card">
                <h4>ROC-AUC</h4>
                <p className="metric-value">{(metrics.roc_auc * 100).toFixed(2)}%</p>
                <p className="metric-label">Area Under ROC Curve</p>
              </div>
            )}
          </div>

          <div className="sample-info">
            <h4>Sample Information</h4>
            <ul>
              <li>Total Samples: {metrics.sample_counts.total_samples}</li>
              <li>Positive Cases: {metrics.sample_counts.positive_samples}</li>
              <li>Negative Cases: {metrics.sample_counts.negative_samples}</li>
            </ul>
          </div>
        </div>
      )}

      {/* Confusion Matrix Display */}
      {confusionMatrix && (
        <div className="confusion-matrix-section">
          <h3>Confusion Matrix Analysis</h3>

          <div className="confusion-matrix-visual">
            <table className="confusion-matrix-table">
              <thead>
                <tr>
                  <th colSpan="2"></th>
                  <th colSpan="2">Predicted</th>
                </tr>
                <tr>
                  <th colSpan="2"></th>
                  <th>Negative (No Tumor)</th>
                  <th>Positive (Tumor)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td rowSpan="2"><strong>Actual</strong></td>
                  <td>Negative</td>
                  <td className="tn">{confusionMatrix.interpretation.true_negatives.count}</td>
                  <td className="fp">{confusionMatrix.interpretation.false_positives.count}</td>
                </tr>
                <tr>
                  <td>Positive</td>
                  <td className="fn">{confusionMatrix.interpretation.false_negatives.count}</td>
                  <td className="tp">{confusionMatrix.interpretation.true_positives.count}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="matrix-chart">
            <Bar
              data={prepareConfusionMatrixChart()}
              options={{ responsive: true, indexAxis: 'y' }}
            />
          </div>

          <div className="matrix-interpretation">
            <div className="interpretation-card tn">
              <h4>True Negatives</h4>
              <p>{confusionMatrix.interpretation.true_negatives.meaning}</p>
              <p>{confusionMatrix.interpretation.true_negatives.percentage}% of all cases</p>
            </div>

            <div className="interpretation-card tp">
              <h4>True Positives</h4>
              <p>{confusionMatrix.interpretation.true_positives.meaning}</p>
              <p>{confusionMatrix.interpretation.true_positives.percentage}% of all cases</p>
            </div>

            <div className="interpretation-card fp">
              <h4>False Positives</h4>
              <p>{confusionMatrix.interpretation.false_positives.meaning}</p>
              <p className="impact">
                ⚠️ {confusionMatrix.interpretation.false_positives.clinical_impact}
              </p>
              <p>{confusionMatrix.interpretation.false_positives.percentage}% of all cases</p>
            </div>

            <div className="interpretation-card fn critical">
              <h4>False Negatives</h4>
              <p>{confusionMatrix.interpretation.false_negatives.meaning}</p>
              <p className="impact critical">
                🚨 {confusionMatrix.interpretation.false_negatives.clinical_impact}
              </p>
              <p>{confusionMatrix.interpretation.false_negatives.percentage}% of all cases</p>
            </div>
          </div>
        </div>
      )}

      {/* Clinical Quality Assessment */}
      {clinicalQuality && (
        <div className="clinical-quality-section">
          <h3>Clinical Quality Assessment</h3>

          <div className={`quality-badge ${clinicalQuality.quality_assessment.clinical_readiness.toLowerCase()}`}>
            <h4>Clinical Readiness: {clinicalQuality.quality_assessment.clinical_readiness}</h4>
          </div>

          <div className="quality-assessments">
            <div className={`quality-card ${clinicalQuality.quality_assessment.accuracy_assessment.status.toLowerCase()}`}>
              <h4>Accuracy Assessment</h4>
              <p className="score">{(clinicalQuality.quality_assessment.accuracy_assessment.score * 100).toFixed(2)}%</p>
              <p className="status">{clinicalQuality.quality_assessment.accuracy_assessment.status}</p>
              <p className="threshold">Threshold: {clinicalQuality.quality_assessment.accuracy_assessment.threshold * 100}%</p>
            </div>

            <div className={`quality-card ${clinicalQuality.quality_assessment.sensitivity_assessment.status.toLowerCase()}`}>
              <h4>Sensitivity (Recall)</h4>
              <p className="score">{(clinicalQuality.quality_assessment.sensitivity_assessment.score * 100).toFixed(2)}%</p>
              <p className="status">{clinicalQuality.quality_assessment.sensitivity_assessment.status}</p>
              <p className="importance">
                🔴 {clinicalQuality.quality_assessment.sensitivity_assessment.clinical_importance}
              </p>
            </div>

            <div className={`quality-card ${clinicalQuality.quality_assessment.specificity_assessment.status.toLowerCase()}`}>
              <h4>Specificity</h4>
              <p className="score">{(clinicalQuality.quality_assessment.specificity_assessment.score * 100).toFixed(2)}%</p>
              <p className="status">{clinicalQuality.quality_assessment.specificity_assessment.status}</p>
              <p className="importance">
                {clinicalQuality.quality_assessment.specificity_assessment.clinical_importance}
              </p>
            </div>
          </div>

          <div className="recommendations">
            <h4>Recommendations</h4>
            <ul>
              {clinicalQuality.quality_assessment.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelPerformancePanel;
