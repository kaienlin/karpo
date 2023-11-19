import axios from 'axios'

const axiosInstance = axios.create({ baseURL: 'https://localhost:3001/api' })

const errorHandler = (error) => {
  const statusCode = error.response?.status

  if (statusCode !== null && statusCode !== 401) {
    console.error(error)
  }

  return Promise.reject(error)
}

axiosInstance.interceptors.response.use(undefined, (error) => {
  return errorHandler(error)
})

export default axiosInstance
