import { createBrowserClient } from '@supabase/ssr'

// Передаем URL и ANON KEY как обычные строки в кавычках
export const supabase = createBrowserClient(
  'https://hqzyzwuoroxsavfmgblv.supabase.co',
  'sb_publishable_fA8mqtdQUvwqvUpaNi2WFg_eLZ-6wAv'
) 