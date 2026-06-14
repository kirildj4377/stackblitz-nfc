import { createBrowserClient } from '@supabase/ssr'

// Создаем клиент для работы на фронтенде (в компонентах)
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)