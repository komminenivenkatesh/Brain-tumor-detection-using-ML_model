// Doctor Recommendation System Component
import React, { useState } from 'react';
import axios from 'axios';

const DoctorRecommendationSystem = () => {
  const [formData, setFormData] = useState({
    tumor_size_mm3: '',
    tumor_grade: 'moderate',
    location_operable: true,
    symptoms: [],
    patient_age: '',
    comorbidities: []
  });

  const [specialists, setSpecialists] = useState(null);
  const [treatments, setTreatments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const symptomOptions = [
    'Headaches',
    'Vision Changes',
    'Speech Difficulty',
    'Seizures',
    'Motor Weakness',
    'Balance Problems',
    'Nausea/Vomiting'
  ];

  const comorbidityOptions = [
    'Diabetes',
    'Hypertension',
    'Heart Disease',
    'Kidney Disease',
    'Liver Disease',
    'Previous Cancer'
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleMultiSelect = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const getSpecialistRecommendations = async () => {
    if (!formData.tumor_size_mm3 || !formData.patient_age) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/advanced/recommendation/specialist', {
        tumor_size_mm3: parseFloat(formData.tumor_size_mm3),
        tumor_grade: formData.tumor_grade,
        location_operable: formData.location_operable,
        symptoms: formData.symptoms
      });

      if (response.data.success) {
        setSpecialists(response.data);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError('Failed to get recommendations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTreatmentOptions = async () => {
    if (!formData.tumor_size_mm3 || !formData.patient_age) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post('/api/advanced/recommendation/treatment', {
        tumor_size_mm3: parseFloat(formData.tumor_size_mm3),
        tumor_grade: formData.tumor_grade,
        location_operable: formData.location_operable,
        patient_age: parseInt(formData.patient_age),
        comorbidities: formData.comorbidities
      });

      if (response.data.success) {
        setTreatments(response.data);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError('Failed to get treatment options');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="doctor-recommendation-container">
      <h2>👨‍⚕️ Doctor Recommendation System</h2>

      <div className="form-section">
        <h3>Patient & Tumor Information</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Tumor Size (mm³) *</label>
            <input
              type="number"
              name="tumor_size_mm3"
              value={formData.tumor_size_mm3}
              onChange={handleInputChange}
              placeholder="Enter tumor size"
            />
          </div>

          <div className="form-group">
            <label>Tumor Grade *</label>
            <select
              name="tumor_grade"
              value={formData.tumor_grade}
              onChange={handleInputChange}
            >
              <option value="low">Low Grade</option>
              <option value="medium">Medium Grade</option>
              <option value="high">High Grade</option>
            </select>
          </div>

          <div className="form-group">
            <label>Patient Age *</label>
            <input
              type="number"
              name="patient_age"
              value={formData.patient_age}
              onChange={handleInputChange}
              placeholder="Enter patient age"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="location_operable"
                checked={formData.location_operable}
                onChange={handleInputChange}
              />
              Tumor is Operable
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Symptoms (Select all that apply):</label>
          <div className="checkbox-group">
            {symptomOptions.map(symptom => (
              <label key={symptom}>
                <input
                  type="checkbox"
                  checked={formData.symptoms.includes(symptom)}
                  onChange={() => handleMultiSelect('symptoms', symptom)}
                />
                {symptom}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Comorbidities (Select all that apply):</label>
          <div className="checkbox-group">
            {comorbidityOptions.map(comorbidity => (
              <label key={comorbidity}>
                <input
                  type="checkbox"
                  checked={formData.comorbidities.includes(comorbidity)}
                  onChange={() => handleMultiSelect('comorbidities', comorbidity)}
                />
                {comorbidity}
              </label>
            ))}
          </div>
        </div>

        <div className="button-group">
          <button onClick={getSpecialistRecommendations} disabled={loading}>
            {loading ? 'Loading...' : '🔍 Get Specialist Recommendations'}
          </button>
          <button onClick={getTreatmentOptions} disabled={loading}>
            {loading ? 'Loading...' : '💊 Get Treatment Options'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {specialists && (
        <div className="specialists-section">
          <h3>Recommended Specialists</h3>
          <div className="specialists-list">
            {specialists.recommendations.map((rec, idx) => (
              <div key={idx} className="specialist-card">
                <div className="priority-badge">Priority {rec.priority}</div>
                <h4>{rec.specialist}</h4>
                <p className="expertise">{rec.expertise}</p>
                <div className="responsibilities">
                  <h5>Responsibilities:</h5>
                  <ul>
                    {rec.responsibilities.map((resp, i) => (
                      <li key={i}>{resp}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {treatments && (
        <div className="treatments-section">
          <h3>Recommended Treatment Options</h3>

          {treatments.age_consideration && (
            <div className="info-box age-consideration">
              ⚠️ {treatments.age_consideration}
            </div>
          )}

          {treatments.comorbidity_considerations && (
            <div className="info-box comorbidity-consideration">
              ⚠️ {treatments.comorbidity_considerations}
            </div>
          )}

          <div className="treatments-list">
            {treatments.recommended_treatments.map((treatment, idx) => (
              <div key={idx} className="treatment-card">
                <div className="sequence-badge">Step {treatment.sequence}</div>
                <h4>{treatment.treatment}</h4>
                <p className="description">{treatment.description}</p>

                <div className="treatment-details">
                  <div className="detail">
                    <strong>Use Cases:</strong>
                    <ul>
                      {treatment.use_cases.map((useCase, i) => (
                        <li key={i}>{useCase}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="detail">
                    <strong>Expected Duration:</strong>
                    <p>{treatment.expected_duration}</p>
                  </div>

                  <div className="detail">
                    <strong>Possible Side Effects:</strong>
                    <ul>
                      {treatment.possible_side_effects.map((effect, i) => (
                        <li key={i}>{effect}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="info-box">
            <strong>📋 Important Note:</strong>
            <p>{treatments.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorRecommendationSystem;
