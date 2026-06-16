'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

// Инициализируем наш клиент Supabase
const supabase = createBrowserClient(
  'https://hqzyzwuoroxsavfmgblv.supabase.co',
  'sb_publishable_fA8mqtdQUvwqvUpaNi2WFg_eLZ-6wAv'
);

export default function RedirectPage() {
  // Получаем ID из URL самым надежным клиентским способом
  const params = useParams();
  const id = params?.id;
  
  const [status, setStatus] = useState('Перенаправлення...');
  const [errorDetails, setErrorDetails] = useState('');

  useEffect(() => {
    const performRedirect = async () => {
      if (!id) return;
      
      try {
        // Запрос к таблице chips по ID
        const { data: chip, error } = await supabase
          .from('chips')
          .select('content')
          .eq('id', id)
          .single();

        if (error) {
          setStatus('Помилка бази даних');
          setErrorDetails(error.message);
          return;
        }

        if (!chip || !chip.content) {
          setStatus('Чіп знайдено, але посилання порожнє');
          return;
        }

        // Форматируем ссылку
        let targetUrl = chip.content.trim();
        if (!/^https?:\/\//i.test(targetUrl)) {
          targetUrl = `https://${targetUrl}`;
        }

        setStatus('Перехід...');
        // Физический редирект
        window.location.href = targetUrl;

      } catch (err: any) {
        setStatus('Проїзошла системна помилка');
        setErrorDetails(err.message);
      }
    };

    performRedirect();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md text-center space-y-4">
        {/* Анимированный спиннер */}
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        
        <h1 className="text-xl font-bold tracking-tight">{status}</h1>
        <p className="text-xs text-slate-500 font-mono break-all">ID: {id || 'не визначено'}</p>
        
        {errorDetails && (
          <div className="mt-6 p-4 bg-red-950/40 border border-red-900/50 rounded-2xl text-xs text-red-400 text-left font-mono">
            <p className="font-bold mb-1">Деталі:</p>
            {errorDetails}
          </div>
        )}
      </div>
    </div>
  );
}