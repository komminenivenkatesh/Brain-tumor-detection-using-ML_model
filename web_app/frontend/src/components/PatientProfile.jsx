import styles from './PatientProfile.module.css'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../store'
import { authAPI } from '../api'

export default function PatientProfile() {
  const { user, setUser } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    patient_id: '',
    age: '',
    gender: '',
    medical_history: '',
    medications: '',
    allergies: '',
    contact_number: ''
  })
  const [loading, setLoading] = useState(false)
  const [messageType, setMessageType] = useState('') // 'success' or 'error'
  const [message, setMessage] = useState('')

  // Load profile data on component mount
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await authAPI.getProfile()
      if (response.data.profile) {
        setProfile(prev => ({
          ...prev,
          ...response.data.profile
        }))
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      setMessageType('error')
      setMessage('Failed to load profile')
      setTimeout(() => {
        setMessage('')
        setMessageType('')
      }, 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const response = await authAPI.updateProfile(profile)
      
      // Update user in store
      if (response.data) {
        setUser(response.data)
      }
      
      setMessageType('success')
      setMessage('✅ Profile updated successfully!')
      setEditing(false)
      
      setTimeout(() => {
        setMessage('')
        setMessageType('')
      }, 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessageType('error')
      setMessage(error.response?.data?.detail || '❌ Failed to update profile')
      
      setTimeout(() => {
        setMessage('')
        setMessageType('')
      }, 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    loadProfile()
    setEditing(false)
  }

  return (
    <div className={styles.panel}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>👤 Patient Profile</h2>
          <button 
            className={styles.editBtn}
            onClick={() => setEditing(!editing)}
            disabled={loading}
          >
            {editing ? '❌ Cancel' : '✏️ Edit'}
          </button>
        </div>

        {!editing && (
          <div className={styles.displayMode}>
            <div className={styles.field}>
              <span className={styles.label}>Full Name:</span>
              <span className={styles.value}>{profile.name || user?.full_name || 'N/A'}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{profile.email || user?.email || 'N/A'}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Patient ID:</span>
              <span className={styles.value}>{profile.patient_id || 'Not provided'}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Age:</span>
              <span className={styles.value}>{profile.age || 'Not provided'}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Gender:</span>
              <span className={styles.value}>{profile.gender || 'Not provided'}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Contact Number:</span>
              <span className={styles.value}>{profile.contact_number || 'Not provided'}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Medical History:</span>
              <span className={styles.value}>{profile.medical_history || 'Not provided'}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Current Medications:</span>
              <span className={styles.value}>{profile.medications || 'Not provided'}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Allergies:</span>
              <span className={styles.value}>{profile.allergies || 'Not provided'}</span>
            </div>
          </div>
        )}

        {editing && (
          <div className={styles.editMode}>
            <div className={styles.formGroup}>
              <label>Full Name:</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Patient ID:</label>
              <input
                type="text"
                name="patient_id"
                value={profile.patient_id}
                onChange={handleInputChange}
                placeholder="Enter patient ID (e.g., P-12345)"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Age:</label>
              <input
                type="text"
                name="age"
                value={profile.age}
                onChange={handleInputChange}
                placeholder="Enter age"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Gender:</label>
              <select name="gender" value={profile.gender} onChange={handleInputChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Contact Number:</label>
              <input
                type="tel"
                name="contact_number"
                value={profile.contact_number}
                onChange={handleInputChange}
                placeholder="Enter contact number"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Medical History:</label>
              <textarea
                name="medical_history"
                value={profile.medical_history}
                onChange={handleInputChange}
                placeholder="Enter any relevant medical history"
                rows="3"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Current Medications:</label>
              <textarea
                name="medications"
                value={profile.medications}
                onChange={handleInputChange}
                placeholder="List current medications"
                rows="3"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Allergies:</label>
              <textarea
                name="allergies"
                value={profile.allergies}
                onChange={handleInputChange}
                placeholder="List any known allergies"
                rows="2"
              />
            </div>
            <div className={styles.buttonGroup}>
              <button 
                className={styles.saveBtn}
                onClick={handleSaveProfile}
                disabled={loading}
              >
                {loading ? '💾 Saving...' : '💾 Save Profile'}
              </button>
              <button 
                className={styles.cancelBtn}
                onClick={handleCancel}
                disabled={loading}
              >
                ↶ Cancel
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className={`${styles.message} ${styles[messageType]}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
