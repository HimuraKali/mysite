const TOKEN_KEY = 'kurshub_token_v1'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    if (!token) localStorage.removeItem(TOKEN_KEY)
    else localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // ignore
  }
}

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const t = token ?? getToken()
  if (t) headers.Authorization = `Bearer ${t}`

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    const msg = data?.error || `HTTP_${res.status}`
    const err = new Error(msg)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

