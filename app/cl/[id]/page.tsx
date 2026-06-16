import { createBrowserClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';

// Инициализируем клиент внутри серверного компонента
const supabase = createBrowserClient(
  'https://hqzyzwuoroxsavfmgblv.supabase.co',
  'sb_publishable_fA8mqtdQUvwqvUpaNi2WFg_eLZ-6wAv'
);

interface RedirectPageProps {
  params: Promise<{ id: string }>;
}

export default async function RedirectPage({ params }: RedirectPageProps) {
  // Получаем динамический ID чипа из ссылки
  const { id } = await params;

  // Ищем чип в базе данных по его уникальному ID
  const { data: chip, error } = await supabase
    .from('chips')
    .select('content')
    .eq('id', id)
    .single();

  // Если чип не найден или ссылки нет, отправляем на главную
  if (error || !chip || !chip.content) {
    redirect('/');
  } 

  // Проверяем, есть ли в ссылке протокол, если нет — добавляем для корректного перехода
  let targetUrl = chip.content.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = `https://${targetUrl}`;
  }

  // Мгновенно перенаправляем пользователя на его целевую ссылку!
  redirect(targetUrl);
}