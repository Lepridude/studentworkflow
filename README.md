# StudentFlow

Студенческий планировщик на React, TypeScript и Vite. Поддерживает аккаунты Supabase, облачное хранение рабочего пространства пользователя и локальный режим до подключения Supabase.

## Требования

- Node.js 20+
- npm
- Проект Supabase для аккаунтов и синхронизации

## Локальный запуск

```bash
npm install
cp .env.example .env.local
npm run dev
```

Заполни `.env.local` значениями из Supabase: Project URL и publishable/anon key. Не добавляй service_role/secret key во frontend и не коммить `.env.local`.

## Настройка Supabase

1. Создай проект в Supabase.
2. Открой SQL Editor и выполни файл `supabase/migrations/202611060001_create_user_workspaces.sql`.
3. В Authentication → URL Configuration укажи адрес локального приложения и production URL в Site URL / Redirect URLs.
4. В Authentication → Providers проверь, что Email включён.
5. Скопируй Project URL и publishable key (или legacy anon key) в `.env.local`.
6. В Cloudflare Pages добавь те же переменные `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` в Environment variables для Production и Preview, затем запусти новый deployment.

## Аккаунты и данные

- Регистрация по email и паролю, вход и выход.
- Подтверждение email и восстановление пароля через стандартные письма Supabase Auth.
- Сессия сохраняется в браузере и обновляется через refresh token.
- Задачи, календарные события, предметы и настройки сохраняются в одной записи `public.user_workspaces` на пользователя.
- Row Level Security разрешает чтение и изменение только строки с `user_id = auth.uid()`.
- При первом входе локальные данные текущего браузера переносятся в аккаунт. При следующих входах данные загружаются из облака.
- Изменения локальных данных синхронизируются с облаком с небольшой задержкой.

## Проверка

```bash
npm run build
```

## Важно

Пока переменные Supabase не заданы и SQL migration не применена, регистрация и вход недоступны. Старый локальный режим не превращается автоматически в облачный. Перед первым входом в новый аккаунт убедись, что браузер содержит актуальные локальные данные: именно они будут перенесены, если у аккаунта ещё нет облачного рабочего пространства.
