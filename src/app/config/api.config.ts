declare const __VITE_ENV__: Record<string, string>;

const getBaseUrl = (): string => {
  try {
    const env = (import.meta as any)?.env;
    const apiUrl = env?.VITE_API_BASE_URL;

    if (apiUrl && typeof apiUrl === 'string' && apiUrl.length > 0) {
      return apiUrl;
    }
  } catch (e) {
    console.warn('⚠️ Error reading import.meta.env:', e);
  }

  // Fallback por defecto
  return 'https://hackaton-ms-calls-production.up.railway.app';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  ENDPOINTS: {
    CALLS: '/api/calls',
    CALLS_BY_USER: (userId: string) => `/api/calls/user/${userId}`,
    CALLS_BY_CLASSIFICATION: (classification: string) => `/api/calls/classification/${classification}`,
    CREATE_EMERGENCY: '/api/calls/emergency',
    CALLS_STREAM: '/api/calls/stream',
    USER_BY_ID: (id: string) => `/api/users/${id}`
  }
};

export function getCallsEndpoint(): string {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CALLS}`;
}

export function getCallsByUserEndpoint(userId: string): string {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CALLS_BY_USER(userId)}`;
}

export function getCallsByClassificationEndpoint(classification: string): string {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CALLS_BY_CLASSIFICATION(classification)}`;
}

export function getCreateEmergencyEndpoint(): string {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_EMERGENCY}`;
}

export function getCallsStreamEndpoint(): string {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CALLS_STREAM}`;
}

export function getUserEndpoint(id: string): string {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USER_BY_ID(id)}`;
}
