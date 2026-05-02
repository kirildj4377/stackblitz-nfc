'use client'; // Это говорит Next.js, что компонент интерактивный

import React, { useState } from 'react';

const SCENARIOS = [
  {
    id: 'wifi',
    label: 'Гостевой Wi-Fi',
    icon: '📶',
    phoneTitle: 'Подключение...',
    phoneDesc: 'Смартфон автоматически подключился к сети "Home_Guest"',
    color: 'bg-emerald-500',
  },
  {
    id: 'vcard',
    label: 'Визитка',
    icon: '👤',
    phoneTitle: 'Контакт найден',
    phoneDesc: 'Добавить "Алексей Разработчик" в адресную книгу?',
    color: 'bg-blue-500',
  },
  {
    id: 'sleep',
    label: 'Режим сна',
    icon: '🌙',
    phoneTitle: 'Спокойной ночи',
    phoneDesc: 'Будильник заведен на 08:00. Свет выключен.',
    color: 'bg-indigo-600',
  },
];

export const InteractiveScenarios = () => {
  const [activeTab, setActiveTab] = useState(SCENARIOS[0]);

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Левая часть: Выбор сценария */}
          <div className="lg:w-1/2">
            <h2 className="text-4xl font-bold mb-8 text-slate-900">
              Посмотрите, как это{' '}
              <span className="text-blue-600">работает в жизни</span>
            </h2>
            <div className="space-y-4">
              {SCENARIOS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item)}
                  className={`w-full flex items-center p-6 rounded-2xl border-2 transition-all ${
                    activeTab.id === item.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <span className="text-3xl mr-4">{item.icon}</span>
                  <span className="text-xl font-semibold text-slate-700">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Правая часть: Визуализация (Смартфон) */}
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl p-4">
              {/* Динамик сверху */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-slate-800 rounded-full" />

              {/* Экран телефона */}
              <div className="h-full w-full bg-slate-100 rounded-[2rem] flex flex-col items-center justify-center p-6 text-center">
                <div
                  className={`w-20 h-20 ${activeTab.color} rounded-full mb-6 flex items-center justify-center animate-bounce shadow-lg`}
                >
                  <span className="text-4xl text-white">NFC</span>
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-2">
                  {activeTab.phoneTitle}
                </h4>
                <p className="text-slate-600">{activeTab.phoneDesc}</p>

                <div className="mt-8 w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${activeTab.color} transition-all duration-500`}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
