const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`)
  if (!response.ok) {
    throw new ApiError(response.status, `Erreur API ${response.status}`)
  }
  return response.json() as Promise<T>
}

export async function checkGatewayHealth(): Promise<boolean> {
  try {
    const data = await apiGet<{ status: string }>('/health')
    return data.status === 'ok'
  } catch {
    return false
  }
}

export { API_BASE }
