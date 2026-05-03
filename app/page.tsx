'use client';
import React, { useState, useEffect } from 'react';
import Script from 'next/script'; 
import { ThemeToggle } from '@/components/ThemeToggle';

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
  });
  const [phoneError, setPhoneError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const products = [
    {
      id: 1,
      title: 'NFC Наклейка',
      chip: 'NTAG213',
      price: 85,
      image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=300',
    },
    {
      id: 2,
      title: 'NFC Карта',
      chip: 'NTAG216',
      price: 250,
      image: 'https://images.unsplash.com/photo-1625217527288-93919c99650a?w=300',
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
      `}</style>

      {/* Шапка */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800 p-4 transition-colors">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black text-blue-600 dark:text-blue-400">
            NFC.STORE{' '}
            <span className="text-xs font-medium text-slate-400">UA</span>
          </h1>
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
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        {products.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedProduct(item)} // Открываем предпросмотр
            className="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-xl border border-slate-100 dark:border-slate-800 hover:shadow-2xl transition group"
          >
            <div className="h-56 bg-slate-200 dark:bg-slate-800">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
            <div className="p-7">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-xl font-bold dark:text-white">{item.title}</h3>
                <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 dark:text-slate-400">
                  {item.chip}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Для візиток, посилань та дому.
              </p>
              <div className="flex justify-between items-center border-t dark:border-slate-800 pt-5">
                <span className="text-3xl font-black dark:text-white">
                  {item.price}{' '}
                  <span className="text-base font-medium text-slate-400">
                    грн
                  </span>
                </span>
                <button
                
                  onClick={() => {
                    e.stopPropagation();
                     addToCart(item)}}
                  className="bg-blue-600 text-white px-7 py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition"
                >
                  В кошик
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
      className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl animate-fade-in-up flex flex-col md:flex-row"
      onClick={(e) => e.stopPropagation()} // Чтобы окно не закрывалось при клике внутри
    >
      {/* Левая часть: Изображение */}
      <div className="md:w-1/2 h-64 md:h-auto bg-slate-100 dark:bg-slate-800">
        <img 
          src={selectedProduct.image} 
          alt={selectedProduct.title} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Правая часть: Описание */}
      <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
        <button 
          onClick={() => setSelectedProduct(null)}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white text-3xl"
        >
          &times;
        </button>

        <span className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold mb-4 w-fit">
          Чип {selectedProduct.chip}
        </span>
        
        <h2 className="text-4xl font-black mb-4 dark:text-white">
          {selectedProduct.title}
        </h2>
        
        <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 leading-relaxed">
          Професійне рішення для ваших задач. Використовуйте цей {selectedProduct.title} для миттєвої передачі контактів, запуску команд або автоматизації розумного будинку. Працює з усіма сучасними смартфонами.
        </p>

        <div className="flex items-center justify-between mt-auto pt-8 border-t dark:border-slate-800">
          <div>
            <p className="text-sm text-slate-400 uppercase tracking-widest font-bold">Ціна</p>
            <span className="text-4xl font-black dark:text-white">{selectedProduct.price} грн</span>
          </div>
          
          <button
            onClick={() => {
              addToCart(selectedProduct);
              setSelectedProduct(null);
            }}
            className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 transition transform active:scale-95 shadow-lg shadow-blue-500/30"
          >
            Додати в кошик
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </main>
  );
}