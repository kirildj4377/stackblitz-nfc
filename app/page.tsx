'use client';
import React, { useState, useEffect } from 'react';
import Script from 'next/script'; 
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/utils/supabase';
 
declare global {
  interface Window {
    Wayforpay: any;
  }
}



const TELEGRAM_BOT_TOKEN = '8656506280:AAGWKGyN3DSk6mSNiJVW1Da0NGMlJW5Z_1Q';
const TELEGRAM_CHAT_ID = '327225760';

const SuccessAnimatedCheckmark = () => {
  return (
    <div className="success-checkmark my-8">
      <div className="check-icon">
        <span className="icon-line line-tip"></span>
        <span className="icon-line line-long"></span>
        <div className="icon-circle"></div>
        <div className="icon-fix dark:!bg-slate-800"></div> {/* Исправлено для темной темы */}
      </div>
    </div>
  );
};

export default function Home() {
  const [cart, setCart] = useState<any[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    comment: '',
  });
  const [phoneError, setPhoneError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
const [isSignUp, setIsSignUp] = useState(false); // переключатель Вход / Регистрация
const [authEmail, setAuthEmail] = useState('');
const [authPassword, setAuthPassword] = useState('');
const [user, setUser] = useState<any>(null); // тут будем хранить вошедшего юзера
const [authError, setAuthError] = useState('');

const [chips, setChips] = useState<any[]>([]);
const [isDashboardOpen, setIsDashboardOpen] = useState(false);
const [loadingChips, setLoadingChips] = useState(false);

// Состояния для добавления нового чипа
const [newChipName, setNewChipName] = useState('');

// Функция для загрузки чипов текущего пользователя из базы данных
const fetchUserChips = async () => {
  if (!user) return;
  setLoadingChips(true);
  const { data, error } = await supabase
    .from('chips')
    .select('*')
    .order('created_at', { ascending: false });

  if (!error && data) {
    setChips(data);
  }
  setLoadingChips(false);
};

// Загружаем чипы при входе пользователя или при открытии кабинета
useEffect(() => {
  if (user && isDashboardOpen) {
    fetchUserChips();
  }
}, [user, isDashboardOpen]);

useEffect(() => {
  // Проверяем текущего юзера при загрузке
  supabase.auth.getUser().then(({ data: { user } }) => {
    setUser(user);
  });

  // Слушаем изменения (вход/выход)
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}, []);

// Сбрасываем выбор при открытии нового товара
useEffect(() => {
  if (selectedProduct) {
    setSelectedOption(selectedProduct.options[0]);
  }
}, [selectedProduct]);

  const products = [
    {
      id: 1,
      title: 'NFC Наклейка',
      // Основная цена для отображения в каталоге
    price: 85, 
    // Значение по умолчанию для бейджа на главной
    chip: 'NTAG213',
      image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=300',
      options: [
        { chip: 'NTAG213', price: 85 },
        { chip: 'NTAG216', price: 160 },
        { chip: 'NTAG424 DNA', price: 210 },
      ],
      description: 'Для візиток, посилань та дому.',
    },
    {
      id: 2,
      title: 'NFC Карта',
      chip: 'NTAG216',
      price: 250,
      image: 'https://images.unsplash.com/photo-1625217527288-93919c99650a?w=300',
      options: [
      { chip: 'NTAG216', price: 250 },
      { chip: 'NTAG424 DNA', price: 320 },
    ],
    description: 'Для бізнес-візиток та доступу.',
    },
  ];

  useEffect(() => {
    if (formData.phone) {
      const phoneRegex = /^(?:\+38)?(0\d{9})$/;
      if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
        setPhoneError('Формат: 0XXXXXXXXX (10 цифр)');
      } else {
        setPhoneError('');
      }
    } else {
      setPhoneError('');
    }
  }, [formData.phone]);

  const addToCart = (product: any) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (index: any) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const handleOrderProcess = async (e: any) => {
    e.preventDefault();
    if (phoneError || !formData.phone) {
      alert('Будь ласка, введіть коректний номер телефону');
      return;
    }

    const orderId = `ORDER_${Date.now()}`;

    const getMessageText = (status: any) => `
  ${status === 'PAID' ? '✅ **ОПЛАЧЕНО КАРТОЮ**' : '💵 **ЗАМОВЛЕННЯ (ПРИ ОТРЫМАННІ)**'}
  👤 Клієнт: ${formData.name}
  📞 Тел: ${formData.phone}
  📍 Доставка: ${formData.address}
  💬 Коментар: ${formData.comment || '—'}
  ---
  📦 Товари:
  ${cart.map((item) => `- ${item.title} (${item.price} грн)`).join('\n')}
  ---
  💰 РАЗОМ: ${totalPrice} грн
    `;

    const sendToTelegram = async (text: any) => {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: text,
          parse_mode: 'Markdown',
        }),
      });
    };

    if (paymentMethod === 'card') {
      if (typeof window.Wayforpay === 'undefined') {
        alert('Платіжний модуль завантажується, зачекайте секунду...');
        return;
      }
      const wayforpay = new window.Wayforpay();
      wayforpay.run({
          merchantAccount: 'stackblitz_nfc_vercel_app',
          merchantDomainName: window.location.hostname,
          authorizationType: 'SimpleSignature',
          merchantSignature: '',
          orderReference: orderId,
          orderDate: Math.floor(Date.now() / 1000),
          amount: totalPrice,
          currency: 'UAH',
          productName: cart.map((i) => i.title),
          productCount: cart.map(() => 1),
          productPrice: cart.map((i) => i.price),
          clientFirstName: formData.name,
          clientPhone: formData.phone,
        },
        async function (response: any) {
          await sendToTelegram(getMessageText('PAID'));
          setIsOrderModalOpen(false);
          setIsSuccessModalOpen(true);
          setCart([]);
        },
        function (response: any) {
          console.log('Оплата не пройшла:', response);
        }
      );
    } else {
      await sendToTelegram(getMessageText('CASH'));
      setIsOrderModalOpen(false);
      setIsSuccessModalOpen(true);
      setCart([]);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <style>{`
        .success-checkmark .check-icon::before, .success-checkmark .check-icon::after {
          background: transparent !important; /* Убираем конфликты с фоном */
        }
        .success-checkmark .check-icon .icon-fix {
          background-color: white;
        }
        .dark .success-checkmark .check-icon .icon-fix {
          background-color: #1e293b; /* slate-800 */
        }
        @keyframes rotate-circle { 0% { transform: rotate(-45deg); } 5% { transform: rotate(-45deg); } 12% { transform: rotate(-405deg); } 100% { transform: rotate(-405deg); } }
        @keyframes icon-line-tip { 0% { width: 0; left: 1px; top: 19px; } 54% { width: 0; left: 1px; top: 19px; } 70% { width: 50px; left: -8px; top: 37px; } 84% { width: 17px; left: 21px; top: 48px; } 100% { width: 25px; left: 14px; top: 46px; } }
        @keyframes icon-line-long { 0% { width: 0; right: 46px; top: 54px; } 65% { width: 0; right: 46px; top: 54px; } 84% { width: 55px; right: 0px; top: 35px; } 100% { width: 47px; right: 8px; top: 38px; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.4s ease-out; }
        .tooltip-trigger:hover .tooltip-content {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .tooltip-content {
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.3s ease;
        }
      `}</style>

      {/* Шапка */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800 p-4 transition-colors">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black text-blue-600 dark:text-blue-400">
            NFC.STORE{' '}
            <span className="text-xs font-medium text-slate-400">UA</span>
          </h1>
          {/* Кнопка профиля/авторизации */}
{/* Кнопка профиля/авторизации в Хедере */}
{user ? (
  <div className="flex items-center gap-2">
    <button 
      onClick={() => setIsDashboardOpen(true)}
      className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
    >
      👤 Особистий кабінет
    </button>
    <button 
      onClick={async () => {
        await supabase.auth.signOut();
        setUser(null);
        setIsDashboardOpen(false);
      }}
      className="px-3 py-2 text-xs font-bold bg-slate-800 text-slate-400 rounded-xl hover:text-red-400 transition"
      title="Вийти з аккаунту"
    >
      Вихід
    </button>
  </div>
) : (
  <button
    onClick={() => { setIsSignUp(false); setIsAuthModalOpen(true); }}
    className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition"
  >
    Увійти
  </button>
)}
          <div className="flex items-center gap-3">
            {/* Кнопка Кастомізація */}
  <button
    onClick={() => setIsCustomModalOpen(true)}
    className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-800 hover:scale-105 transition"
  >
    <span>🎨</span>
    <span className="text-sm">Кастом</span>
  </button>
  {/* Новая кнопка Доставка та оплата */}
  <button
    onClick={() => setIsInfoModalOpen(true)}
    className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition"
  >
    <span>📦</span>
    <span className="text-sm">Доставка</span>
  </button>

  {/* Твоя кнопка корзины */}
  <button
    onClick={() => setIsOrderModalOpen(true)}
    className="relative bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-2xl flex items-center gap-2 hover:scale-105 transition"
  >
    🛒 Кошик
    {cart.length > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-bounce">
        {cart.length}
      </span>
    )}
  </button>
</div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 text-center px-4 max-w-4xl mx-auto">
        <h2 className="text-5xl font-extrabold mb-4 text-slate-900 dark:text-white leading-tight">
          Програмуй світ навколо себе
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Замовляй NFC чипи з доставкою по Україні та створюй круті
          автоматизації
        </p>
      </section>

      {/* Товары */}
      {/* Товары — Сетка стала 3 колонки на больших экранах */}
<section className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
  {products.map((item) => (
    <div
      key={item.id}
      onClick={() => setSelectedProduct(item)}
      className="cursor-pointer bg-white dark:bg-slate-900 rounded-[1.5rem] overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition-all duration-300 group flex flex-col"
    >
      {/* Высота картинки уменьшена с h-56 до h-44 */}
      <div className="h-44 bg-slate-200 dark:bg-slate-800 relative overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />
        {/* Маленький бейдж чипа прямо на фото */}
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-[10px] text-white px-2 py-1 rounded-lg font-mono">
          {item.chip}
        </div>
      </div>

      {/* Отступы внутри уменьшены с p-7 до p-5 */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold dark:text-white mb-1 leading-tight">
          {item.title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs mb-4 line-clamp-1">
          Для візиток, посилань та дому.
        </p>
        
        <div className="flex justify-between items-center mt-auto pt-4 border-t dark:border-slate-800">
          <div className="flex flex-col">
            <span className="text-2xl font-black dark:text-white leading-none">
              {item.price}
            </span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              грн
            </span>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(item);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2.5 rounded-xl font-bold transition-all active:scale-95 shadow-md shadow-blue-500/20"
          >
            Детальніше
          </button>
        </div>
      </div>
    </div>
  ))}
</section>

      {/* МОДАЛЬНОЕ ОКНО КОРЗИНЫ */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[2rem] shadow-2xl p-10 max-h-[90vh] overflow-y-auto animate-fade-in-up border dark:border-slate-800">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold dark:text-white">Ваше замовлення</h2>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-4xl"
              >
                &times;
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="text-center py-16 text-slate-400 text-lg">
                У кошику поки порожньо...
              </p>
            ) : (
              <>
                <div className="space-y-3 mb-10 border-b dark:border-slate-800 pb-6">
                  {cart.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700"
                    >
                      <span className="font-medium dark:text-slate-200">{item.title}</span>
                      <div className="flex items-center gap-5">
                        <span className="font-bold dark:text-white">{item.price} грн</span>
                        <button onClick={() => removeFromCart(i)} className="text-red-400 hover:text-red-600">✕</button>
                      </div>
                    </div>
                  ))}
                  <div className="text-right text-2xl font-black mt-6 dark:text-white">
                    Разом: {totalPrice} грн
                  </div>
                </div>

                <form onSubmit={handleOrderProcess} className="space-y-5">
                  <h3 className="font-bold text-lg dark:text-white">Дані для доставки</h3>
                  <input
                    required
                    placeholder="Ваше ім'я"
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500 transition"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <div className="space-y-1">
                    <input
                      required
                      placeholder="Телефон (0XXXXXXXXX)"
                      type="tel"
                      className={`w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl ring-1 transition ${phoneError ? 'ring-red-400' : 'ring-slate-200 dark:ring-slate-700'} focus:ring-2 focus:ring-blue-500`}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    {phoneError && <p className="text-xs text-red-500 ml-2">{phoneError}</p>}
                  </div>
                  <textarea
                    required
                    placeholder="Місто та номер відділення"
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500 transition"
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />

                  {/* Поле комментария */}
<div className="space-y-1">
  <label className="text-sm font-bold text-slate-600 dark:text-slate-400 ml-1">
    Коментар до замовлення
  </label>
  <textarea
    placeholder="Наприклад: колір логотипу, особливості кастомізації..."
    className="w-full p-4 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500 transition min-h-[100px]"
    onChange={(e) =>
      setFormData({ ...formData, comment: e.target.value })
    }
  />
</div>

                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-2xl mb-5 border border-emerald-100 dark:border-emerald-900/30">
                    <p className="text-sm text-emerald-900 dark:text-emerald-400 font-medium italic">
                      💳 Оплата при отриманні або на карту.
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <p className="font-bold text-sm text-slate-600 dark:text-slate-400">Спосіб оплати:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-4 rounded-xl border-2 transition ${paymentMethod === 'cash' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800'}`}
                      >
                        <span className="block text-lg">💵</span>
                        <span className="text-xs font-bold dark:text-slate-200">При отриманні</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 rounded-xl border-2 transition ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800'}`}
                      >
                        <span className="block text-lg">💳</span>
                        <span className="text-xs font-bold dark:text-slate-200">Картою онлайн</span>
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-slate-900 dark:bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-slate-800 dark:hover:bg-blue-700 transition transform active:scale-95">
                    Підтвердити замовлення
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ОКНО СПАСИБО */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 text-center animate-fade-in-up border dark:border-slate-700">
            <SuccessAnimatedCheckmark />
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Дякуємо!</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">Ми зв'яжемося з вами найближчим часом.</p>
            <button onClick={() => setIsSuccessModalOpen(false)} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition">
              Зрозуміло
            </button>
          </div>
        </div>
      )}

      <Script src="https://secure.wayforpay.com/server/pay-widget.js" strategy="lazyOnload" />
      <ThemeToggle />
      {selectedProduct && (
  <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedProduct(null)}>
    <div 
      className="bg-[#0f172a] w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-fade-in-up flex flex-col md:flex-row border border-slate-800"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Левая часть: Изображение */}
      <div className="w-full md:w-1/2 h-64 md:h-[550px] relative">
        <img 
          src={selectedProduct.image} 
          alt={selectedProduct.title} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Правая часть: Описание и Выбор */}
      <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-[#0f172a] text-white">
        <div className="relative">
          <button 
            onClick={() => setSelectedProduct(null)} 
            className="absolute top-0 right-0 text-slate-400 hover:text-white text-3xl transition"
          >
            &times;
          </button>

          {/* Модель чипа */}
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold mb-4 uppercase tracking-widest border border-blue-500/20">
            Модель {selectedOption?.chip || selectedProduct.chip}
          </span>
    
          <h2 className="text-2xl md:text-3xl font-black mb-3 text-white leading-tight">
            {selectedProduct.title}
          </h2>
    
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-5">
            Це не просто NFC-мітка, а ваш цифровий інструмент. 
            Ми пропонуємо <b>індивідуальне виготовлення</b>: додамо ваш логотип та заллємо виріб <b>міцною епоксидною смолою</b>.
          </p>

          {/* Кастомизация */}
          <div className="flex items-center gap-2 mb-5 group relative w-fit">
            <h3 className="text-xs font-bold text-slate-300">Доступна кастомізація</h3>
            <div className="cursor-help w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px] text-slate-400 group-hover:text-blue-400 group-hover:border-blue-400 transition-colors">?</div>
            
            {/* Tooltip под темную тему */}
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute bottom-full left-0 mb-2 w-60 p-3 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 z-[130] transition-all text-[11px] text-slate-300">
               <div className="space-y-1.5">
                  <p>🎨 <b>Дизайн:</b> Друк вашого логотипу.</p>
                  <p>🛡️ <b>Захист:</b> Водонепроникна смола.</p>
               </div>
               <div className="absolute -bottom-1 left-4 w-2.5 h-2.5 bg-slate-800 border-r border-b border-slate-700 rotate-45"></div>
            </div>
          </div>
        </div>

        {/* Секция выбора чипа */}
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 ml-1 tracking-wider">Оберіть тип чипа</label>
            <select 
              value={selectedOption?.chip}
              onChange={(e) => {
                const opt = selectedProduct.options?.find((o: any) => o.chip === e.target.value);
                if (opt) setSelectedOption(opt);
              }}
              className="w-full p-3 bg-slate-800 text-white rounded-xl border border-slate-700 outline-none text-xs focus:border-blue-500 cursor-pointer"
            >
              {selectedProduct.options?.map((opt: any) => (
                <option key={opt.chip} value={opt.chip} className="bg-slate-800 text-white">
                  {opt.chip} — {opt.price} грн
                </option>
              ))}
            </select>
          </div>

          {/* Низ: Цена и Кнопка */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div>
              <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Разом</p>
              <span className="text-2xl font-black text-white">{selectedOption?.price || selectedProduct.price} грн</span>
            </div>
            <button
              onClick={() => {
                const currentOption = selectedOption || selectedProduct.options?.[0] || { chip: selectedProduct.chip, price: selectedProduct.price };
                addToCart({ 
                  ...selectedProduct, 
                  title: `${selectedProduct.title} (${currentOption.chip})`, 
                  price: currentOption.price, 
                  chip: currentOption.chip 
                });
                setSelectedProduct(null);
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition active:scale-95 text-xs shadow-lg shadow-blue-500/10"
            >
              В кошик
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{/* --- МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ --- */}
{isAuthModalOpen && (
  <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setIsAuthModalOpen(false)}>
    <div 
      className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-fade-in-up relative"
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        onClick={() => setIsAuthModalOpen(false)}
        className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white text-2xl"
      >
        &times;
      </button>

      <h2 className="text-3xl font-black mb-2 dark:text-white text-center">
        {isSignUp ? 'Реєстрація' : 'Вхід до кабінету'}
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 text-center">
        {isSignUp ? 'Створіть аккаунт для керування чіпами' : 'Керуйте своїми NFC-мітками в один клік'}
      </p>

      {authError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-100 dark:border-red-900/50 text-center font-medium">
          {authError}
        </div>
      )}

      <form onSubmit={async (e) => {
        e.preventDefault();
        setAuthError('');
        
        if (isSignUp) {
          // Регистрация в Supabase
          const { data, error } = await supabase.auth.signUp({
            email: authEmail,
            password: authPassword,
          });
          if (error) setAuthError(error.message);
          else {
            alert('Реєстрація успішна! Перевірте пошту для підтвердження (якщо увімкнено в Supabase).');
            setIsAuthModalOpen(false);
          }
        } else {
          // Вход в Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email: authEmail,
            password: authPassword,
          });
          if (error) setAuthError('Невірна пошта або пароль');
          else {
            setUser(data.user);
            setIsAuthModalOpen(false);
          }
        }
      }} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Email</label>
          <input 
            type="email" 
            required
            placeholder="your@email.com"
            value={authEmail}
            onChange={(e) => setAuthEmail(e.target.value)}
            className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-sm focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Пароль</label>
          <input 
            type="password" 
            required
            placeholder="••••••••"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-sm focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <button 
          type="submit"
          className="w-full mt-4 bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 text-sm"
        >
          {isSignUp ? 'Створити аккаунт' : 'Увійти'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button 
          onClick={() => { setAuthError(''); setIsSignUp(!isSignUp); }}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          {isSignUp ? 'Вже є аккаунт? Увійти' : 'Немає аккаунту? Зареєструватися'}
        </button>
      </div>
    </div>
  </div>
)}

{/* --- ЛИЧНЫЙ КАБИНЕТ (ПАНЕЛЬ УПРАВЛЕНИЯ ЧИПАМИ) --- */}
{isDashboardOpen && user && (
  <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setIsDashboardOpen(false)}>
    <div 
      className="bg-[#0f172a] w-full max-w-3xl rounded-[2.5rem] shadow-2xl p-6 md:p-8 border border-slate-800 text-white max-h-[85vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Шапка кабинета */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black">Власний кабінет</h2>
          <p className="text-xs text-slate-400 mt-0.5">Керування вашими NFC-пристроями</p>
        </div>
        <button 
          onClick={() => setIsDashboardOpen(false)}
          className="text-slate-400 hover:text-white text-3xl"
        >
          &times;
        </button>
      </div>

      {/* Форма добавления нового чипа (симуляция сканирования/привязки) */}
      <div className="mb-8 p-4 bg-slate-900 rounded-2xl border border-slate-800">
        <h3 className="text-sm font-bold mb-3 text-blue-400">🔗 Прив'язати новий чіп</h3>
        <form onSubmit={async (e) => {
          e.preventDefault();
          if (!newChipName.trim()) return;

          const { data, error } = await supabase
            .from('chips')
            .insert([
              { 
                user_id: user.id, 
                name: newChipName, 
                type: 'url', 
                content: 'https://' 
              }
            ])
            .select();

          if (!error) {
            setNewChipName('');
            fetchUserChips(); // Перезагружаем список
          } else {
            alert('Помилка додавання: ' + error.message);
          }
        }} className="flex gap-3">
          <input 
            type="text" 
            placeholder="Назва (напр. Моя Візитка, Ключ від авто)"
            value={newChipName}
            onChange={(e) => setNewChipName(e.target.value)}
            className="flex-1 p-3 bg-slate-800 text-white rounded-xl border border-slate-700 outline-none text-xs focus:border-blue-500"
          />
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold text-xs transition"
          >
            Додати
          </button>
        </form>
      </div>

      {/* Список чипов */}
      <div>
        <h3 className="text-sm font-bold mb-4 text-slate-300">Ваші активні мітки ({chips.length})</h3>
        
        {loadingChips ? (
          <p className="text-center text-xs text-slate-500 py-4">Завантаження міток...</p>
        ) : chips.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-8 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
            У вас ще немає прив'язаних чіпів. Додайте перший вище!
          </p>
        ) : (
          <div className="space-y-4">
            {chips.map((chip) => (
              <div key={chip.id} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-white">{chip.name}</h4>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">ID: {chip.id}</p>
                </div>

                {/* Поле ввода для мгновенного изменения ссылки чипа */}
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <span className="text-xs text-slate-500 font-bold">URL:</span>
                  <input 
                    type="text" 
                    defaultValue={chip.content}
                    onBlur={async (e) => {
                      // Сохраняем в базу, когда пользователь уводит фокус с инпута
                      const newUrl = e.target.value;
                      if (newUrl === chip.content) return;

                      const { error } = await supabase
                        .from('chips')
                        .update({ content: newUrl })
                        .eq('id', chip.id);

                      if (error) {
                        alert('Не вдалося зберегти: ' + error.message);
                      }
                    }}
                    placeholder="https://your-link.com"
                    className="w-full p-2 bg-slate-800 text-white rounded-lg border border-slate-700 outline-none text-xs focus:border-green-500 transition"
                  />
                </div>

                {/* Кнопка удаления */}
                <button 
                  onClick={async () => {
                    if (!confirm('Ви впевнені, що хочете видалити цей чіп?')) return;
                    const { error } = await supabase
                      .from('chips')
                      .delete()
                      .eq('id', chip.id);
                    
                    if (!error) fetchUserChips();
                  }}
                  className="text-xs text-red-400 hover:text-red-500 font-medium px-2 py-1"
                >
                  Видалити
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)}


{/* --- МОДАЛЬНОЕ ОКНО ИНФОРМАЦИИ --- */}
{isInfoModalOpen && (
  <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsInfoModalOpen(false)}>
    <div 
      className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 md:p-12 animate-fade-in-up relative"
      onClick={(e) => e.stopPropagation()}
    >
      <button 
        onClick={() => setIsInfoModalOpen(false)}
        className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white text-3xl"
      >
        &times;
      </button>

      <h2 className="text-3xl font-black mb-8 dark:text-white">Інформація</h2>

      <div className="space-y-8">
        {/* Доставка */}
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 text-2xl">
            🚚
          </div>
          <div>
            <h3 className="font-bold text-lg dark:text-white">Доставка</h3>
            <p className="text-slate-500 dark:text-slate-400">Відправляємо Новою Поштою по всій Україні. Відправка готових чіпів — у день замовлення або наступного ранку.</p>
          </div>
        </div>

        {/* Оплата */}
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 text-2xl">
            💳
          </div>
          <div>
            <h3 className="font-bold text-lg dark:text-white">Оплата</h3>
            <p className="text-slate-500 dark:text-slate-400">Онлайн на сайті через WayForPay або при отриманні у відділенні (післяплата).</p>
          </div>
        </div>

        {/* Сроки кастома */}
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center shrink-0 text-2xl">
            ⏳
          </div>
          <div>
            <h3 className="font-bold text-lg dark:text-white">Кастомні замовлення</h3>
            <p className="text-slate-500 dark:text-slate-400">Виготовлення чіпів з вашим дизайном та епоксидною смолою займає <b>2-4 робочих дні</b>. Це час, необхідний для якісного застигання покриття.</p>
          </div>
        </div>
      </div>

      <button 
        onClick={() => setIsInfoModalOpen(false)}
        className="w-full mt-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-bold hover:opacity-90 transition"
      >
        Зрозуміло
      </button>
    </div>
  </div>
)}
{/* --- МОДАЛЬНОЕ ОКНО ВАРИАНТОВ КАСТОМИЗАЦИИ (КОМПАКТНОЕ) --- */}
{isCustomModalOpen && (
  <div className="fixed inset-0 z-[160] bg-black/70 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setIsCustomModalOpen(false)}>
    <div 
      className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] shadow-2xl p-6 md:p-8 animate-fade-in-up relative overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Декоративный эффект поменьше */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>

      <button 
        onClick={() => setIsCustomModalOpen(false)}
        className="absolute top-4 right-5 text-slate-400 hover:text-slate-900 dark:hover:text-white text-2xl z-10"
      >
        &times;
      </button>

      <h2 className="text-2xl font-black mb-1 dark:text-white">Що ми можемо?</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Варіанти дизайну вашого чіпа:</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Соцсети */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-100 dark:border-purple-800">
          <div className="text-xl mb-2">📱</div>
          <h3 className="font-bold text-sm mb-1 dark:text-white">Соцмережі</h3>
          <p className="text-[11px] leading-tight text-slate-600 dark:text-slate-400">Instagram, TikTok або персональний QR-код.</p>
        </div>

        {/* Авто */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700">
          <div className="text-xl mb-2">🚗</div>
          <h3 className="font-bold text-sm mb-1 dark:text-white">Авто бренди</h3>
          <p className="text-[11px] leading-tight text-slate-600 dark:text-slate-400">Лого вашої машини (BMW, Audi, Tesla тощо).</p>
        </div>

        {/* Бизнес */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800">
          <div className="text-xl mb-2">💼</div>
          <h3 className="font-bold text-sm mb-1 dark:text-white">Бізнес-лого</h3>
          <p className="text-[11px] leading-tight text-slate-600 dark:text-slate-400">Стильні візитки для вашої компанії.</p>
        </div>

        {/* Эпоксидка */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-100 dark:border-emerald-800">
          <div className="text-xl mb-2">💎</div>
          <h3 className="font-bold text-sm mb-1 dark:text-white">3D Ефект</h3>
          <p className="text-[11px] leading-tight text-slate-600 dark:text-slate-400">Захисний шар епоксидної смоли та об'єм.</p>
        </div>
      </div>

      <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
        <p className="text-[12px] text-blue-700 dark:text-blue-300 font-medium">
          Пишіть побажання у коментарі до замовлення!
        </p>
      </div>

      <button 
        onClick={() => setIsCustomModalOpen(false)}
        className="w-full mt-4 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
      >
        Зрозуміло
      </button>
    </div>
  </div>
)}
    </main>
  );
}