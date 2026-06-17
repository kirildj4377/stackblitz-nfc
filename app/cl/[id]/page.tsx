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
  
  const [status, setStatus] = useState('Завантаження контенту...');
  const [errorDetails, setErrorDetails] = useState('');
  const [isUnclaimed, setIsUnclaimed] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [chipName, setChipName] = useState('');
  
  // Хранение данных чипа для отображения микро-страниц
  const [chipData, setChipData] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user);
    });

    const loadChipData = async () => {
      if (!id) return;
      
      try {
        const { data: chip, error } = await supabase
          .from('chips')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          setStatus('Помилка бази даних');
          setErrorDetails(error.message);
          return;
        }

        if (!chip) {
          setStatus('Пристрій не знайдено');
          return;
        }

        // Проверка на Вариант А (чип новый)
        if (!chip.user_id) {
          setIsUnclaimed(true);
          setStatus('Новий NFC-пристрій виявлено!');
          return;
        }

        setChipData(chip);
        setStatus(''); // Контент загружен, убираем статус загрузки

        // Если тип чипа - это просто ссылка, выполняем мгновенный автоматический редирект
        if (chip.type === 'url' || !chip.type) {
          let targetUrl = (chip.content || '').trim();
          if (targetUrl && targetUrl !== 'https://') {
            if (!/^https?:\/\//i.test(targetUrl)) targetUrl = `https://${targetUrl}`;
            window.location.href = targetUrl;
          } else {
            setStatus('Чіп активовано, але посилання порожнє');
          }
        }

      } catch (err: any) {
        setStatus('Системна помилка');
        setErrorDetails(err.message);
      }
    };

    loadChipData();
  }, [id]);

  // Генерация файла контакта vCard для скачивания на смартфон
  const downloadVCard = () => {
    if (!chipData) return;
    const vcardContent = `BEGIN:VCARD
VERSION:3.0
FN:${chipData.title || 'NFC Контакт'}
TEL:${chipData.phone || ''}
EMAIL:${chipData.email || ''}
ADR:;;${chipData.address || ''};;;;
URL:${chipData.content || ''}
END:VCARD`;

    const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${chipData.title || 'contact'}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Метод привязки нового чипа (Вариант А)
  const claimChip = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Будь ласка, увійдіть в аккаунт на головній сторінці!');
      router.push('/');
      return;
    }

    const { error } = await supabase
      .from('chips')
      .update({ user_id: user.id, name: chipName.trim() || 'Мій новий чіп' })
      .eq('id', id);

    if (!error) {
      alert('Чіп успішно активовано!');
      router.push('/');
    } else {
      alert('Помилка: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm bg-slate-900/60 p-6 rounded-[2.5rem] border border-slate-800 text-center shadow-2xl backdrop-blur-md">
        
        {status && (
          <div className="py-8">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-bold text-slate-300">{status}</p>
            {errorDetails && <p className="text-xs text-red-400 font-mono mt-4 p-3 bg-red-950/20 border border-red-900/30 rounded-xl">{errorDetails}</p>}
          </div>
        )}

        {/* ЭКРАН АКТИВАЦИИ (ВАРИАНТ А) */}
        {isUnclaimed && (
          <div className="space-y-4 text-left">
            <h2 className="text-xl font-black text-center text-white">✨ Активація NFC</h2>
            <p className="text-xs text-slate-400 text-center leading-relaxed">Цей пристрій ще не прив'язаний до профілю. Бажаєте стати його власником?</p>
            <input 
              type="text" 
              placeholder="Назва мітки (напр. Моя візитка)"
              value={chipName}
              onChange={(e) => setChipName(e.target.value)}
              className="w-full p-3 bg-slate-800 rounded-xl border border-slate-700 outline-none text-xs focus:border-blue-500 text-white"
            />
            <button onClick={claimChip} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 text-xs shadow-lg shadow-blue-500/20">
              {currentUser ? 'Прив’язати до мого аккаунту' : 'Увійти та активувати'}
            </button>
          </div>
        )}

        {/* ОТОБРАЖЕНИЕ МУЛЬТИ-КОНТЕНТА */}
        {chipData && !isUnclaimed && (
          <div className="space-y-5 animate-fade-in text-left">
            
            {/* ТИП: ТЕКСТОВАЯ ЗАМЕТКА */}
            {chipData.type === 'text' && (
              <div className="space-y-3">
                <div className="text-2xl text-center">📝</div>
                <h3 className="text-base font-black text-center text-white">{chipData.name}</h3>
                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-medium">
                  {chipData.content || 'Текст відсутній.'}
                </div>
              </div>
            )}

            {/* ТИП: ЦИФРОВАЯ ВИЗИТКА (vCard) */}
            {chipData.type === 'vcard' && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-xl font-black mx-auto border-4 border-slate-800 shadow-md">
                  {chipData.title ? chipData.title.charAt(0).toUpperCase() : '👤'}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-black text-white">{chipData.title || 'Цифрова візитка'}</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">NFC Business Card</p>
                </div>
                <div className="space-y-2 text-xs bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60">
                  {chipData.phone && <p className="text-slate-300">📞 <span className="font-bold ml-1">{chipData.phone}</span></p>}
                  {chipData.email && <p className="text-slate-300">✉️ <span className="text-blue-400 ml-1 break-all">{chipData.email}</span></p>}
                  {chipData.address && <p className="text-slate-400 text-[11px] mt-1 pt-1 border-t border-slate-800/40">📍 {chipData.address}</p>}
                  {chipData.content && chipData.content !== 'https://' && (
                    <p className="text-slate-400 text-[11px]">🌐 <a href={chipData.content} target="_blank" className="text-blue-500 underline ml-1">{chipData.content}</a></p>
                  )}
                </div>
                <button onClick={downloadVCard} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition text-xs shadow-lg shadow-blue-500/15">
                  📥 Додати в контакти
                </button>
              </div>
            )}

            {/* ТИП: WI-FI СЕТЬ */}
            {chipData.type === 'wifi' && (
              <div className="space-y-4 text-center">
                <div className="text-3xl text-blue-500 animate-pulse">📶</div>
                <div>
                  <h3 className="text-base font-black text-white">Підключення до Wi-Fi</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Відскануйте дані для швидкого доступу</p>
                </div>
                <div className="space-y-2.5 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-left">
                  <p className="text-slate-400 font-medium">Мережа (SSID): <span className="text-white font-bold ml-1">{chipData.wifi_ssid || 'Не вказано'}</span></p>
                  <p className="text-slate-400 font-medium">Пароль: <span className="text-green-400 font-mono font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800 ml-1">{chipData.wifi_password || 'Без пароля'}</span></p>
                </div>
                <p className="text-[9px] text-slate-500 leading-normal px-2">
                  💡 На Android пристроях копіюйте пароль для миттєвого підключення. На iOS скористайтеся стандартною камерою для зчитування QR-кодів, якщо роутер підтримує швидку генерацію.
                </p>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}