import axiosInstance from '../../services/axiosInstance'

export const getEvents = async () => (await axiosInstance.get('/events')).data
export const getEventDetails = async (idOrSlug) => (await axiosInstance.get(`/events/${idOrSlug}`)).data
