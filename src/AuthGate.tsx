import { FormEvent, useCallback, useEffect, useState } from 'react';
import App from './App';
import {
  isSupabaseConfigured, loadWorkspace, saveWorkspace, supabaseAuth,
  type AuthSession, type WorkspaceData,
} from './supabase';

const SESSION_KEY = 'studentworkflow.auth.session.v1';
const DATA_KEYS = {
  settings: 'studentworkflow.settings.v1',
  tasks: 'studentworkflow.tasks.v1',
  events: 'studentworkflow.calendar.events.v1',
  subjects: 'studentworkflow.subjects.v1',
};

function readLocalWorkspace(): WorkspaceData {
  const read = (key: string, fallback: unknown) => {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch { return fallback; }
  };
  return {
    settings: read(DATA_KEYS.settings, { name: '', language: 'ru', theme: 'light' }),
    tasks: read(DATA_KEYS.tasks, []),
    events: read(DATA_KEYS.events, []),
    subjects: read(DATA_KEYS.subjects, []),
  };
}

function writeLocalWorkspace(data: WorkspaceData) {
  localStorage.setItem(DATA_KEYS.settings, JSON.stringify(data.settings));
  localStorage.setItem(DATA_KEYS.tasks, JSON.stringify(data.tasks));
  localStorage.setItem(DATA_KEYS.events, JSON.stringify(data.events));
  localStorage.setItem(DATA_KEYS.subjects, JSON.stringify(data.subjects));
}

function readSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as AuthSession : null;
  } catch { return null; }
}

function storeSession(session: AuthSession | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

export default function AuthGate() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<'login' | 'register' | 'recover'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const activateSession = useCallback(async (next: AuthSession) => {
    storeSession(next);
    const cloud = await loadWorkspace(next.user.id, next.access_token);
    if (cloud) {
      writeLocalWorkspace(cloud);
    } else {
      // First login: preserve existing browser data and move it to the account.
      await saveWorkspace(next.user.id, next.access_token, readLocalWorkspace());
    }
    setSession(next);
  }, []);

  useEffect(() => {
    let active = true;
    async function initialize() {
      if (!isSupabaseConfigured) { setReady(true); return; }
      const saved = readSession();
      if (!saved) { setReady(true); return; }
      try {
        const current = saved.expires_at && saved.expires_at * 1000 > Date.now() + 30000
          ? saved
          : await supabaseAuth.refresh(saved.refresh_token);
        if (active) await activateSession(current);
      } catch {
        storeSession(null);
      } finally {
        if (active) setReady(true);
      }
    }
    void initialize();
    return () => { active = false; };
  }, [activateSession]);

  useEffect(() => {
    if (!session) return;
    let timer: number | undefined;
    const refreshIn = Math.max(30_000, ((session.expires_at ?? Math.floor(Date.now() / 1000 + 3600)) * 1000) - Date.now() - 60_000);
    timer = window.setTimeout(async () => {
      try {
        const refreshed = await supabaseAuth.refresh(session.refresh_token);
        storeSession(refreshed);
        setSession(refreshed);
      } catch {
        storeSession(null);
        setSession(null);
      }
    }, refreshIn);
    return () => { if (timer) window.clearTimeout(timer); };
  }, [session]);

  useEffect(() => {
    if (!session) return;
    let timeout: number | undefined;
    let disposed = false;
    const sync = () => {
      if (timeout) window.clearTimeout(timeout);
      timeout = window.setTimeout(async () => {
        try {
          if (!disposed) await saveWorkspace(session.user.id, session.access_token, readLocalWorkspace());
        } catch (cause) {
          console.error('StudentFlow cloud sync failed:', cause);
        }
      }, 700);
    };
    window.addEventListener('studentflow:data-changed', sync);
    window.addEventListener('beforeunload', sync);
    return () => {
      disposed = true;
      window.removeEventListener('studentflow:data-changed', sync);
      window.removeEventListener('beforeunload', sync);
      if (timeout) window.clearTimeout(timeout);
    };
  }, [session]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (mode === 'recover') {
        await supabaseAuth.recover(email.trim());
        setNotice('Если аккаунт с таким email существует, на него отправлена ссылка для сброса пароля.');
      } else if (mode === 'register') {
        const result = await supabaseAuth.signUp(email.trim(), password);
        if (result.session) {
          await activateSession(result.session);
        } else {
          setNotice('Регистрация создана. Проверь почту и подтверди email, затем войди в аккаунт.');
          setMode('login');
        }
      } else {
        const next = await supabaseAuth.signIn(email.trim(), password);
        await activateSession(next);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось выполнить запрос.');
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    if (!session) return;
    setBusy(true);
    try { await supabaseAuth.signOut(session.access_token); } catch { /* Local logout must still work. */ }
    storeSession(null);
    setSession(null);
    setBusy(false);
  }

  if (!isSupabaseConfigured) {
    return <AuthMessage />;
  }
  if (!ready) return <div className="auth-loading">StudentFlow</div>;
  if (session) {
    return <div className="authenticated-app">
      <div className="account-bar">
        <span>{session.user.email}</span>
        <button className="btn" onClick={() => void logout()} disabled={busy}>Выйти</button>
      </div>
      <App />
    </div>;
  }

  const title = mode === 'register' ? 'Создать аккаунт' : mode === 'recover' ? 'Восстановление пароля' : 'Вход в StudentFlow';
  return <main className="auth-screen">
    <form className="auth-card" onSubmit={submit}>
      <div className="auth-brand">StudentFlow</div>
      <h1>{title}</h1>
      <p className="muted">Задачи, расписание и предметы будут доступны после входа с любого устройства.</p>
      <label className="field"><span>Email</span><input type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
      {mode !== 'recover' && <label className="field"><span>Пароль</span><input type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={8} required value={password} onChange={e => setPassword(e.target.value)} /></label>}
      {error && <p className="auth-error" role="alert">{error}</p>}
      {notice && <p className="auth-notice" role="status">{notice}</p>}
      <button className="btn btn-primary auth-submit" type="submit" disabled={busy}>{busy ? 'Подождите…' : mode === 'register' ? 'Зарегистрироваться' : mode === 'recover' ? 'Отправить ссылку' : 'Войти'}</button>
      <div className="auth-links">
        {mode === 'login' && <><button type="button" onClick={() => { setMode('register'); setError(''); setNotice(''); }}>Создать аккаунт</button><button type="button" onClick={() => { setMode('recover'); setError(''); setNotice(''); }}>Забыли пароль?</button></>}
        {mode !== 'login' && <button type="button" onClick={() => { setMode('login'); setError(''); setNotice(''); }}>Вернуться ко входу</button>}
      </div>
    </form>
  </main>;
}

function AuthMessage() {
  return <main className="auth-screen"><section className="auth-card">
    <div className="auth-brand">StudentFlow</div><h1>Подключи Supabase</h1>
    <p className="muted">Аккаунты ещё не активированы. Добавь URL и публичный ключ Supabase в переменные окружения проекта.</p>
    <p className="auth-help">Нужны VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY. Не используй service_role key в браузере.</p>
  </section></main>;
}
