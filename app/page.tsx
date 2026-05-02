'use client';
import React, { useState, useEffect } from 'react';
import Script from 'next/script'; // Нужно для загрузки виджета оплаты

// --- НАСТРОЙКИ ТЕЛЕГРАМА ---
// Позже ты вставишь сюда свои данные
const TELEGRAM_BOT_TOKEN = '8656506280:AAGWKGyN3DSk6mSNiJVW1Da0NGMlJW5Z_1Q';
const TELEGRAM_CHAT_ID = '327225760';

// --- КОМПОНЕНТ АНИМИРОВАННОЙ ГАЛОЧКИ ---
const SuccessAnimatedCheckmark = () => {
  return (
    <div className="success-checkmark my-8">
      <div className="check-icon">
        <span className="icon-line line-tip"></span>
        <span className="icon-line line-long"></span>
        <div className="icon-circle"></div>
        <div className="icon-fix"></div>
      </div>
    </div>
  );
};

export default function Home() {
  const [cart, setCart] = useState<any[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // Новое состояние
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [phoneError, setPhoneError] = useState('');

  const products = [
    {
      id: 1,
      title: 'NFC Наклейка',
      chip: 'NTAG213',
      price: 85,
      image:
        'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=300',
    },
    {
      id: 2,
      title: 'NFC Карта',
      chip: 'NTAG216',
      price: 250,
      image:
        'https://images.unsplash.com/photo-1625217527288-93919c99650a?w=300',
    },
    {
      id: 3,
      title: 'Металлический брелок',
      chip: 'NTAG215',
      price: 180,
      image:
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=300',
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

  // Добавление в корзину
  const addToCart = (product: any) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (index: any) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  // Отправка в Telegram

  // 1. Добавь новое состояние в начале компонента Home
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' или 'card'

  // 2. Обновленная функция отправки
  const handleOrderProcess = async (e) => {
    e.preventDefault();

    if (phoneError || !formData.phone) {
      alert('Будь ласка, введіть коректний номер телефону');
      return;
    }

    const orderId = `ORDER_${Date.now()}`;

    // Функция для сборки текста сообщения
    const getMessageText = (status) => `
  ${
    status === 'PAID'
      ? '✅ **ОПЛАЧЕНО КАРТОЮ**'
      : '💵 **ЗАМОВЛЕННЯ (ПРИ ОТРЫМАННІ)**'
  }
  👤 Клієнт: ${formData.name}
  📞 Тел: ${formData.phone}
  📍 Доставка: ${formData.address}
  ---
  📦 Товари:
  ${cart.map((item) => `- ${item.title} (${item.price} грн)`).join('\n')}
  ---
  💰 РАЗОМ: ${totalPrice} грн
    `;

    // Функция отправки в Telegram
    const sendToTelegram = async (text) => {
      await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: text,
            parse_mode: 'Markdown',
          }),
        }
      );
    };

    if (paymentMethod === 'card') {
      if (typeof window.Wayforpay === 'undefined') {
        alert('Платіжний модуль завантажується, зачекайте секунду...');
        return;
      }

      const wayforpay = new window.Wayforpay();

      wayforpay.run(
        {
          merchantAccount: 'test_merch_nfc',
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
        async function (response) {
          // --- УСПЕШНАЯ ОПЛАТА ---
          // Только теперь отправляем в Telegram
          await sendToTelegram(getMessageText('PAID'));

          setIsOrderModalOpen(false);
          setIsSuccessModalOpen(true);
          setCart([]); // Очищаем корзину после оплаты
        },
        function (response) {
          // Ошибка или отмена оплаты
          console.log('Оплата не пройшла:', response);
          if (response.reasonCode !== 1100) {
            // 1100 обычно код успешной транзакции
            alert(
              'Транзакція не завершена. Спробуйте ще раз або оберіть оплату при отриманні.'
            );
          }
        }
      );
    } else {
      // --- ОПЛАТА НАЛИЧНЫМИ (При отриманні) ---
      // Отправляем сразу
      await sendToTelegram(getMessageText('CASH'));
      setIsOrderModalOpen(false);
      setIsSuccessModalOpen(true);
      setCart([]);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* Подключаем CSS для галочки прямо здесь, чтобы не плодить файлы на StackBlitz */}
      <style>{`
        .success-checkmark {
          width: 80px;
          height: 115px;
          margin: 0 auto;
        }
        .success-checkmark .check-icon {
          width: 80px;
          height: 80px;
          position: relative;
          border-radius: 50%;
          box-sizing: content-box;
          border: 4px solid #4CAF50;
        }
        .success-checkmark .check-icon::before {
          top: 3px;
          left: -2px;
          width: 30px;
          transform-origin: 100% 50%;
          border-radius: 100px 0 0 100px;
        }
        .success-checkmark .check-icon::after {
          top: 0;
          left: 30px;
          width: 60px;
          transform-origin: 0 50%;
          border-radius: 0 100px 100px 0;
          animation: rotate-circle 4.25s ease-in;
        }
        .success-checkmark .check-icon::before, .success-checkmark .check-icon::after {
          content: '';
          height: 100px;
          position: absolute;
          background: #FFFFFF;
          transform: rotate(-45deg);
        }
        .success-checkmark .check-icon .icon-line {
          height: 5px;
          background-color: #4CAF50;
          display: block;
          border-radius: 2px;
          position: absolute;
          z-index: 10;
        }
        .success-checkmark .check-icon .icon-line.line-tip {
          top: 46px;
          left: 14px;
          width: 25px;
          transform: rotate(45deg);
          animation: icon-line-tip 0.75s;
        }
        .success-checkmark .check-icon .icon-line.line-long {
          top: 38px;
          right: 8px;
          width: 47px;
          transform: rotate(-45deg);
          animation: icon-line-long 0.75s;
        }
        .success-checkmark .check-icon .icon-circle {
          top: -4px;
          left: -4px;
          z-index: 10;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 4px solid rgba(76, 175, 80, 0.5);
          box-sizing: content-box;
          position: absolute;
        }
        .success-checkmark .check-icon .icon-fix {
          top: 8px;
          width: 5px;
          left: 26px;
          z-index: 1;
          height: 85px;
          position: absolute;
          transform: rotate(-45deg);
          background-color: #FFFFFF;
        }
        @keyframes rotate-circle {
          0% { transform: rotate(-45deg); }
          5% { transform: rotate(-45deg); }
          12% { transform: rotate(-405deg); }
          100% { transform: rotate(-405deg); }
        }
        @keyframes icon-line-tip {
          0% { width: 0; left: 1px; top: 19px; }
          54% { width: 0; left: 1px; top: 19px; }
          70% { width: 50px; left: -8px; top: 37px; }
          84% { width: 17px; left: 21px; top: 48px; }
          100% { width: 25px; left: 14px; top: 46px; }
        }
        @keyframes icon-line-long {
          0% { width: 0; right: 46px; top: 54px; }
          65% { width: 0; right: 46px; top: 54px; }
          84% { width: 55px; right: 0px; top: 35px; }
          100% { width: 47px; right: 8px; top: 38px; }
        }
        /* Анимация появления модального окна */
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out;
        }
      `}</style>

      {/* Шапка */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black text-blue-600">
            NFC.STORE{' '}
            <span className="text-xs font-medium text-slate-400">UA</span>
          </h1>
          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="relative bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-2 hover:scale-105 transition"
          >
            🛒 Кошик
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 text-center px-4 max-w-4xl mx-auto">
        <h2 className="text-5xl font-extrabold mb-4 text-slate-900 leading-tight">
          Програмуй світ навколо себе
        </h2>
        <p className="text-slate-500 text-lg">
          Замовляй NFC чипи з доставкою по Україні та створюй круті
          автоматизації
        </p>
      </section>

      {/* Товары */}
      <section className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
        {products.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-[2rem] overflow-hidden shadow-xl border border-slate-100 hover:shadow-2xl transition group"
          >
            <div className="h-56 bg-slate-200">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
            <div className="p-7">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-xl font-bold">{item.title}</h3>
                <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">
                  {item.chip}
                </span>
              </div>
              <p className="text-slate-500 text-sm mb-6">
                Для візиток, посилань та дому.
              </p>
              <div className="flex justify-between items-center border-t pt-5">
                <span className="text-3xl font-black">
                  {item.price}{' '}
                  <span className="text-base font-medium text-slate-400">
                    грн
                  </span>
                </span>
                <button
                  onClick={() => addToCart(item)}
                  className="bg-blue-600 text-white px-7 py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition"
                >
                  В кошик
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* --- МОДАЛЬНОЕ ОКНО КОРЗИНЫ --- */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl p-10 max-h-[90vh] overflow-y-auto animate-fade-in-up">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Ваше замовлення</h2>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 text-4xl"
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
                <div className="space-y-3 mb-10 border-b pb-6">
                  {cart.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100"
                    >
                      <span className="font-medium">{item.title}</span>
                      <div className="flex items-center gap-5">
                        <span className="font-bold">{item.price} грн</span>
                        <button
                          onClick={() => removeFromCart(i)}
                          className="text-red-400 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="text-right text-2xl font-black mt-6">
                    Разом: {totalPrice} грн
                  </div>
                </div>

                <form onSubmit={handleOrderProcess} className="space-y-5">
                  <h3 className="font-bold text-lg">
                    Дані для доставки (Нова Пошта)
                  </h3>
                  <input
                    required
                    placeholder="Ваше ім&apos;я та прізвище"
                    className="w-full p-4 bg-slate-50 rounded-xl ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition"
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                  <div className="space-y-1">
                    <input
                      required
                      placeholder="Телефон (0XXXXXXXXX)"
                      type="tel"
                      className={`w-full p-4 bg-slate-50 rounded-xl ring-1 transition ${
                        phoneError ? 'ring-red-400' : 'ring-slate-200'
                      } focus:ring-2 focus:ring-blue-500`}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                    {phoneError && (
                      <p className="text-xs text-red-500 ml-2">{phoneError}</p>
                    )}
                  </div>
                  <textarea
                    required
                    placeholder="Місто та номер відділення"
                    className="w-full p-4 bg-slate-50 rounded-xl ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition"
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />

                  <div className="bg-emerald-50 p-5 rounded-2xl mb-5 border border-emerald-100">
                    <p className="text-sm text-emerald-900 font-medium italic">
                      💳 Оплата при отриманні або на карту. Менеджер зв&apos;яжеться
                      для підтвердження.
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <p className="font-bold text-sm text-slate-600">
                      Спосіб оплати:
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-4 rounded-xl border-2 transition ${
                          paymentMethod === 'cash'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-100'
                        }`}
                      >
                        <span className="block text-lg">💵</span>
                        <span className="text-xs font-bold text-slate-800">
                          При отриманні
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 rounded-xl border-2 transition ${
                          paymentMethod === 'card'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-100'
                        }`}
                      >
                        <span className="block text-lg">💳</span>
                        <span className="text-xs font-bold text-slate-800">
                          Картою онлайн
                        </span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl hover:bg-slate-800 transition transform active:scale-95"
                  >
                    Підтвердити замовлення
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- !!! НОВОЕ ОКНО СПАСИБО ЗА ЗАКАЗ !!! --- */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 text-center animate-fade-in-up">
            {/* Анимированная галочка */}
            <SuccessAnimatedCheckmark />

            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
              Дякуємо!
            </h2>
            <p className="text-lg text-slate-600 mb-8">
              Замовлення успішно отправлене менеджерам. Ми зв&apos;яжемося з вами
              найближчим часом для уточнення деталей.
            </p>

            <button
              onClick={() => setIsSuccessModalOpen(false)} // Закрыть
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition"
            >
              Зрозуміло
            </button>
          </div>
        </div>
      )}
      <Script
        src="https://secure.wayforpay.com/server/pay-widget.js"
        strategy="lazyOnload"
      />
    </main>
  );
}
