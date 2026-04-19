import styles from './Header.module.css'
import { useAuthStore, useThemeStore } from '../store'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const { user, logout } = useAuthStore()
  const { isDarkMode, toggleDarkMode } = useThemeStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <h1 className={styles.title}>🧠 Brain Tumor Detection</h1>
          <p className={styles.subtitle}>AI-Powered Medical Imaging Analysis</p>
        </div>

        <div className={styles.navigation}>
          <button 
            onClick={() => navigate('/dashboard')}
            className={styles.navBtn}
          >
            📊 Dashboard
          </button>
          <button 
            onClick={() => navigate('/medical-dashboard')}
            className={styles.navBtn}
          >
            🏥 Medical Dashboard
          </button>
        </div>

        <div className={styles.userMenu}>
          <button 
            onClick={toggleDarkMode}
            className={styles.themeBtn}
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <span className={styles.userName}>Welcome, {user?.full_name}!</span>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Sign Out
          </button>
        </div>
      </div>
    </header>
  )
}
