const developmentBackendUrl = "http://localhost:4000"

export function getBackendBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_BACKEND_API_URL?.trim()
  return (configured || developmentBackendUrl).replace(/\/+$/, "")
}
