import { createBrowserClient } from '@supabase/ssr';

// Создаем клиент для работы на фронтенде
export const supabase = createBrowserClient(
  'https://hqzyzwuoroxsavfmgblv.supabase.co',
  'sb_publishable_fA8mqtdQUvwqvUpaNi2WFg_eLZ-6wAv'
);