'use client';

import { useEffect, useState, use } from 'react';
import { createBrowserClient } from '@supabase/ssr';

// Инициализируем наш стандартный клиент
const supabase = createBrowserClient(
  'https://hqzyzwuoroxsavfmgblv.supabase.co',
  'sb_publishable_fA8mqtdQUvwqvUpaNi2WFg_eLZ-6wAv'
);

interface RedirectPageProps {
  params: Promise<{ id: string }>;
}

export default function RedirectPage({ params }: RedirectPageProps) {
  // Разворачиваем параметры через use(), как требует Next.js
  const { id } = use(params);
  
  const [status, setStatus] = useState('Перенаправлення...');
  const [errorDetails, setErrorDetails] = useState('');

  useEffect(() => {
    const performRedirect = async () => {
      try {
        // 1. Делаем запрос к таблице chips по ID
        const { data: chip, error } = await supabase
          .from('chips')
          .select('content')
          .eq('id', id)
          .single();

        // 2. Если Supabase вернул ошибку
        if (error) {
          setStatus('Помилка бази даних');
          setErrorDetails(error.message);
          return;
        }

        // 3. Если чип нашли, но у него пустое поле URL
        if (!chip || !chip.content) {
          setStatus('Чіп знайдено, але посилання не налаштоване');
          return;
        }

        // 4. Форматируем ссылку (добавляем https, если пользователь забыл)
        let targetUrl = chip.content.trim();
        if (!/^https?:\/\//i.test(targetUrl)) {
          targetUrl = `https://${targetUrl}`;
        }

        setStatus('Перехід...');
        // 5. Делаем физический редирект внутри браузера
        window.location.href = targetUrl;

      } catch (err: any) {
        setStatus('Произошла системная ошибка');
        setErrorDetails(err.message);
      }
    };

    if (id) {
      performRedirect();
    }
  }, [id]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md text-center space-y-4">
        {/* Красивый спиннер загрузки */}
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        
        <h1 className="text-xl font-bold tracking-tight">{status}</h1>
        <p className="text-xs text-slate-500 font-mono break-all">ID: {id}</p>
        
        {errorDetails && (
          <div className="mt-6 p-4 bg-red-950/40 border border-red-900/50 rounded-2xl text-xs text-red-400 text-left font-mono">
            <p className="font-bold mb-1">Деталі помилки:</p>
            {errorDetails}
          </div>
        )}
      </div>
    </div>
  );
}