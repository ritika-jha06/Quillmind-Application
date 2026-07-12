// themeSlice.js
import { createSlice } from '@reduxjs/toolkit'

const stored = localStorage.getItem('qm_theme') || 'dark'

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: stored },
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark'
      localStorage.setItem('qm_theme', state.mode)
      document.documentElement.classList.toggle('dark', state.mode === 'dark')
    },
    setTheme(state, { payload }) {
      state.mode = payload
      localStorage.setItem('qm_theme', payload)
      document.documentElement.classList.toggle('dark', payload === 'dark')
    },
  },
})

export const { toggleTheme, setTheme } = themeSlice.actions
export default themeSlice.reducer
