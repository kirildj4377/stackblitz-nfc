'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const supabase = createBrowserClient(
  'https://hqzyzwuoroxsavfmgblv.supabase.co',
  'sb_publishable_fA8mqtdQUvwqvUpaNi2WFg_eLZ-6wAv'
);

export default function RedirectPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const [status, setStatus] = useState('Перенаправлення...');
  const [errorDetails, setErrorDetails] = useState('');
  const [isUnclaimed, setIsUnclaimed] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [chipName, setChipName] = useState('');

  useEffect(() => {
    // Проверяем, залогинен ли сейчас кто-то на сайте
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });

    const checkChipAndRedirect = async () => {
      if (!id) return;
      
      try {
        const { data: chip, error } = await supabase
          .from('chips')
          .select('*')
          .maybeSingle();

        if (error) {
          setStatus('Помилка бази даних');
          setErrorDetails(error.message);
          return;
        }

        if (!chip) {
          setStatus('Чіп не знайдено');
          setErrorDetails('Цей пристрій не зареєстрований в нашій системі.');
          return;
        }

        // КЛЮЧЕВАЯ ЛОГИКА ВАРИАНТА А: Чип ни за кем не закреплен
        if (!chip.user_id) {
          setIsUnclaimed(true);
          setStatus('Новий NFC-пристрій виявлено!');
          return;
        }

        // Если владелец есть — перенаправляем как обычно
        if (!chip.content || chip.content === 'https://') {
          setStatus('Чіп активовано, але посилання ще порожнє');
          return;
        }

        setStatus('Перехід...');
        let targetUrl = chip.content.trim();
        if (!/^https?:\/\//i.test(targetUrl)) {
          targetUrl = `https://${targetUrl}`;
        }
        window.location.href = targetUrl;

      } catch (err: any) {
        setStatus('Системна помилка');
        setErrorDetails(err.message);
      }
    };

    checkChipAndRedirect();
  }, [id]);

  // Функция для привязки чипа к текущему вошедшему юзеру
  const claimChip = async () => {
    if (!currentUser) {
      // Если не залогинен — отправляем на главную логиниться
      alert('Будь ласка, спочатку увійдіть в аккаунт або зареєструйтесь на головній сторінці!');
      router.push('/');
      return;
    }

    const { error } = await supabase
      .from('chips')
      .update({ 
        user_id: currentUser.id,
        name: chipName.trim() || 'Мій новий чіп'
      })
      .eq('id', id);

    if (!error) {
      alert('Вітаємо! Чіп успішно прив’язано до вашого аккаунту. Тепер ви можете керувати ним у власному кабінеті.');
      router.push('/'); // отправляем на главную, где откроется его кабинет
    } else {
      alert('Помилка активації: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md text-center space-y-6 bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 backdrop-blur-sm shadow-xl">
        
        {!isUnclaimed ? (
          // Стандартный экран загрузки/ошибки редиректа
          <>
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h1 className="text-xl font-bold tracking-tight">{status}</h1>
            <p className="text-xs text-slate-500 font-mono break-all">ID: {id || 'не визначено'}</p>
            {errorDetails && (
              <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-2xl text-xs text-red-400 text-left font-mono">
                {errorDetails}
              </div>
            )}
          </>
        ) : (
          // Красивый экран первичной активации нового чипа
          <div className="space-y-4 text-left animate-fade-in-up">
            <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 text-2xl mx-auto mb-2 shadow-lg">
              ✨
            </div>
            <h1 className="text-2xl font-black text-center text-white">Активація пристрою</h1>
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              Цей NFC-чіп ще не прив'язаний до жодного профілю. Ви можете стати його власником прямо зараз.
            </p>

            <div className="pt-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Дайте назву вашому чіпу</label>
                <input 
                  type="text" 
                  placeholder="Наприклад: Моя візитка, Instagram наклейка"
                  value={chipName}
                  onChange={(e) => setChipName(e.target.value)}
                  className="w-full p-3.5 bg-slate-800 text-white rounded-xl border border-slate-700 outline-none text-xs focus:border-blue-500 transition"
                />
              </div>

              <button 
                onClick={claimChip}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 text-xs"
              >
                {currentUser ? 'Прив’язати до мого аккаунту' : 'Увійти та активувати'}
              </button>
              
              {!currentUser && (
                <p className="text-[10px] text-center text-amber-400 font-medium bg-amber-500/5 border border-amber-500/10 p-2.5 rounded-xl">
                  ⚠️ Ви не авторизовані. Натискання кнопки перенаправить вас на головну сторінку для входу. После входу просто вдруге відскануйте чіп.
                </p>
              )}
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}