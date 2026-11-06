export type AuthUser = { id: string; email?: string };
export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: AuthUser;
};

const url = (import.meta.env.VITE_SUPABASE_URL || 'https://xodyomjvkjjqflzbtflo.supabase.co').replace(/\/$/, '');
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_7zz3JiIYtX79-CFVl8wpow_6OyDeNeM';
const APP_URL = 'https://studentworkflow.pages.dev';

export const isSupabaseConfigured = Boolean(url && anonKey);

function config() {
  if (!url || !anonKey) {
    throw new Error('Supabase не настроен. Добавьте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY.');
  }
  return { url, anonKey };
}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const { url, anonKey } = config();
  const response = await fetch(`${url}${path}`, {
    ...init,
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  const body = await response.text();
  const data = body ? JSON.parse(body) : null;
  if (!response.ok) {
    const message = data?.msg || data?.message || data?.error_description || data?.error || 'Ошибка Supabase';
    throw new Error(message);
  }
  return data as T;
}

export const supabaseAuth = {
  signUp(email: string, password: string) {
    return request<{ user: AuthUser; session: AuthSession | null }>('/auth/v1/signup', {
      method: 'POST', body: JSON.stringify({ email, password, options: { emailRedirectTo: APP_URL } }),
    });
  },
  signIn(email: string, password: string) {
    return request<AuthSession>('/auth/v1/token?grant_type=password', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
  },
  refresh(refreshToken: string) {
    return request<AuthSession>('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST', body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },
  signOut(token: string) {
    return request<null>('/auth/v1/logout', { method: 'POST' }, token);
  },
  recover(email: string) {
    return request<null>(`/auth/v1/recover?redirect_to=${encodeURIComponent(APP_URL)}`, { method: 'POST', body: JSON.stringify({ email }) });
  },
  verifyEmail(tokenHash: string, type: string) {
    return request<AuthSession>(`/auth/v1/verify`, { method: 'POST', body: JSON.stringify({ token_hash: tokenHash, type }) });
  },
  updatePassword(token: string, password: string) {
    return request<{ id: string }>('/auth/v1/user', { method: 'PUT', body: JSON.stringify({ password }) }, token);
  },
};

export type WorkspaceData = {
  settings: unknown;
  tasks: unknown[];
  events: unknown[];
  subjects: unknown[];
};

export async function loadWorkspace(userId: string, token: string): Promise<WorkspaceData | null> {
  const rows = await request<Array<{ data: WorkspaceData }>>(
    `/rest/v1/user_workspaces?select=data&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
    { method: 'GET' }, token,
  );
  return rows[0]?.data ?? null;
}

export async function saveWorkspace(userId: string, token: string, data: WorkspaceData): Promise<void> {
  await request<unknown>('/rest/v1/user_workspaces?on_conflict=user_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ user_id: userId, data, updated_at: new Date().toISOString() }),
  }, token);
}
