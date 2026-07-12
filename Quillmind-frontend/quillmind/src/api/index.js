import api from './axios'

/* ──────────────── AUTH ──────────────── */
export const authAPI = {
  register:   (data) => api.post('/auth/register/', data),
  login:      (data) => api.post('/auth/login/', data),
  // adminLogin: (data) => api.post('/admin/login/', data),
  adminLogin: (data) =>
    api.post('/admin/login/', {
      username: data.email || data.username,
      password: data.password,
    }),
  adminToken: (data) => api.post('/admin/token/', data),
  profile:    ()     => api.get('/auth/me/'),
  updateProfile: (data) => api.put('/auth/me/', data),
  uploadAvatar: (formData) =>
    api.post('/auth/avatar/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }),
}

/* ──────────────── GENERAL Q&A ──────────────── */
export const qaAPI = {
  ask: (payload) => api.post('/qa/general/', payload),
  // payload: { question: string, history?: [{role, content}] }
}

/* ──────────────── DOCUMENT Q&A ──────────────── */
export const docQaAPI = {
  ask: (payload) => api.post('/qa/ask/', payload),
  // payload: { question: string, document_id?: string }
}

/* ──────────────── READING ──────────────── */
export const readingAPI = {
  upload:       (formData) => api.post('/reading/upload/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  extract:      (params)   => api.get('/reading/extract/',   { params }),
  getPage:      (params)   => api.get('/reading/page/',      { params }),
  getAllPages:   (params)   => api.get('/reading/all-pages/', { params }),
  getInsight:   (params)   => api.get('/reading/insight/',   { params }),
  chat:         (payload)  => api.post('/reading/chat/',     payload),
  saveProgress: (payload)  => api.post('/reading/progress/save/', payload),
  getProgress:  (params)   => api.get('/reading/progress/', { params }),
}

/* ──────────────── SUMMARY ──────────────── */
export const summaryAPI = {
  fromText: (payload)  => api.post('/summary/text/', payload),
  fromPdf:  (formData) => api.post('/summary/pdf/',  formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

/* ──────────────── EXAM ──────────────── */
export const examAPI = {
  fromText: (payload)  => api.post('/exam/generate/',          payload),
  fromPdf:  (formData) => api.post('/exam/generate-from-pdf/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

/* ──────────────── ADMIN ──────────────── */
export const adminAPI = {
  // Sub-admins
  addSubAdmin:    (data) => api.post('/admin/sub-admins/add/',     data),
  deleteSubAdmin: (id)   => api.delete('/admin/sub-admins/delete/', { data: { id } }),
  listSubAdmins:  ()     => api.get('/admin/sub-admins/'),
  listUsers: () => api.get('/admin/users/'),

  // File management
  upload:       (folder, formData) => api.post(`/admin/upload/${folder}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteFile:   (folder, filename) => api.delete(`/admin/delete/${folder}/${filename}/`),
  reloadDocs:   ()                 => api.post('/admin/reload/'),
  viewAll:      ()                 => api.get('/admin/view/'),
  viewFolder:   (folder)           => api.get(`/admin/view/${folder}/`),
  downloadFile: (folder, filename) => api.get(`/admin/download/${folder}/${filename}`, { responseType: 'blob' }),
  downloadFolder: (folder)         => api.post(`/admin/download/${folder}/`, {}, { responseType: 'blob' }),
}
