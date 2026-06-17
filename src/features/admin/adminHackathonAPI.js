import axios from '../../services/axiosInstance'

export const getAdminHackathons = async () => (await axios.get('/admin/hackathons')).data
export const createAdminHackathon = async (payload) => (await axios.post('/admin/hackathons', payload)).data
export const getAdminHackathon = async (id) => (await axios.get(`/admin/hackathons/${id}`)).data
export const updateAdminHackathon = async (id, payload) => (await axios.patch(`/admin/hackathons/${id}`, payload)).data
export const getAdminHackathonRegistrations = async (id) => (await axios.get(`/admin/hackathons/${id}/registrations`)).data
export const createAdminHackathonRegistration = async (id, projectId) => (await axios.post(`/admin/hackathons/${id}/registrations`, { projectId })).data
export const getAdminHackathonProjectOptions = async () => (await axios.get('/admin/project-records')).data
export const updateAdminHackathonRegistrationStatus = async (id, registrationId, registrationStatus) => (await axios.patch(`/admin/hackathons/${id}/registrations/${registrationId}/status`, { registrationStatus })).data
export const getAdminHackathonLeaderboard = async (id) => (await axios.get(`/admin/hackathons/${id}/leaderboard`)).data
export const getAdminHackathonReport = async (id) => (await axios.get(`/admin/hackathons/${id}/report`)).data
export const getAdminHackathonExportData = async (id) => (await axios.get(`/admin/hackathons/${id}/export-data`)).data
export const getAdminHackathonSubmissions = async (id) => (await axios.get(`/admin/hackathons/${id}/submissions`)).data
export const updateAdminHackathonSubmissionStatus = async (id, submissionId, submissionStatus) => (await axios.patch(`/admin/hackathons/${id}/submissions/${submissionId}/status`, { submissionStatus })).data
export const getAdminHackathonAnnouncements = async (id) => (await axios.get(`/admin/hackathons/${id}/announcements`)).data
export const createAdminHackathonAnnouncement = async (id, payload) => (await axios.post(`/admin/hackathons/${id}/announcements`, payload)).data
export const updateAdminHackathonAnnouncement = async (id, announcementId, payload) => (await axios.patch(`/admin/hackathons/${id}/announcements/${announcementId}`, payload)).data
export const deleteAdminHackathonAnnouncement = async (id, announcementId) => (await axios.delete(`/admin/hackathons/${id}/announcements/${announcementId}`)).data
export const getAdminHackathonStages = async (id) => (await axios.get(`/admin/hackathons/${id}/stages`)).data
export const createAdminHackathonStage = async (id, payload) => (await axios.post(`/admin/hackathons/${id}/stages`, payload)).data
export const updateAdminHackathonStage = async (id, stageId, payload) => (await axios.patch(`/admin/hackathons/${id}/stages/${stageId}`, payload)).data
export const getAdminStageCriteria = async (id, stageId) => (await axios.get(`/admin/hackathons/${id}/stages/${stageId}/criteria`)).data
export const createAdminStageCriteria = async (id, stageId, payload) => (await axios.post(`/admin/hackathons/${id}/stages/${stageId}/criteria`, payload)).data
export const updateAdminStageCriteria = async (id, stageId, criteriaId, payload) => (await axios.patch(`/admin/hackathons/${id}/stages/${stageId}/criteria/${criteriaId}`, payload)).data
export const createAdminJudgeReview = async (id, stageId, registrationId, payload) => (await axios.post(`/admin/hackathons/${id}/stages/${stageId}/registrations/${registrationId}/evaluations`, payload)).data

export const approveAdminHackathon = async (id) => (await axios.patch(`/admin/hackathons/${id}/approve`)).data
export const archiveAdminHackathon = async (id) => (await axios.delete(`/admin/hackathons/${id}`, { data: { confirm: 'DELETE_HACKATHON' } })).data
export const getAdminHackathonCsvUrl = (id) => `${axios.defaults.baseURL || ''}/admin/hackathons/${id}/export.csv`
export const getAdminHackathonPdfUrl = (id) => `${axios.defaults.baseURL || ''}/admin/hackathons/${id}/export.pdf`
