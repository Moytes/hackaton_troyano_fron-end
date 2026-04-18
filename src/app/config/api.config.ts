declare const __VITE_ENV__: Record<string, string>;

const getBaseUrl = (): string => {
  try {
    const env = (import.meta as any).env;
    return env?.VITE_API_BASE_URL || 'https://hackaton-ms-calls-production.up.railway.app';
  } catch {
    return 'https://hackaton-ms-calls-production.up.railway.app';
  }
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  ENDPOINTS: {
    CALLS: '/api/calls',
    CALLS_BY_USER: (userId: string) => `/api/calls/user/${userId}`,
    CALLS_BY_CLASSIFICATION: (classification: string) => `/api/calls/classification/${classification}`,
    CREATE_EMERGENCY: '/api/calls/emergency'
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
