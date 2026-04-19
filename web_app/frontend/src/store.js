import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  
  login: (user, token) => {
    localStorage.setItem('access_token', token)
    set({ user, token })
  },
  
  logout: () => {
    localStorage.removeItem('access_token')
    set({ user: null, token: null })
  },
  
  setUser: (user) => set({ user }),
  
  setToken: (token) => {
    localStorage.setItem('access_token', token)
    set({ token })
  }
}))

export const useAnalysisStore = create((set) => ({
  analyses: [],
  currentAnalysis: null,
  loading: false,
  
  setAnalyses: (analyses) => set({ analyses }),
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  setLoading: (loading) => set({ loading }),
  
  addAnalysis: (analysis) => set((state) => ({
    analyses: [analysis, ...state.analyses]
  }))
}))

export const useThemeStore = create((set) => ({
  isDarkMode: localStorage.getItem('theme') === 'dark',
  toggleDarkMode: () => set((state) => {
    const newMode = !state.isDarkMode
    localStorage.setItem('theme', newMode ? 'dark' : 'light')
    return { isDarkMode: newMode }
  }),
  setDarkMode: (isDark) => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    set({ isDarkMode: isDark })
  }
}))
