import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen:   true,
    sidebarMobile: false,
    activeModal:   null,
  },
  reducers: {
    toggleSidebar(state)          { state.sidebarOpen   = !state.sidebarOpen },
    toggleMobileSidebar(state)    { state.sidebarMobile = !state.sidebarMobile },
    closeMobileSidebar(state)     { state.sidebarMobile = false },
    openModal(state, { payload }) { state.activeModal = payload },
    closeModal(state)             { state.activeModal = null },
  },
})

export const { toggleSidebar, toggleMobileSidebar, closeMobileSidebar, openModal, closeModal } = uiSlice.actions
export default uiSlice.reducer
