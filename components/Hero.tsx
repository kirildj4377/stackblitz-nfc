import React from 'react';

export const Hero = () => {
  return (
    <section className="relative h-[80vh] flex items-center justify-center bg-slate-900 text-white overflow-hidden">
      <div className="container mx-auto px-6 z-10 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Оживи вещи одним касанием
        </h1>
        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
          Программируемые NFC-чипы для автоматизации дома, бизнеса и твоих
          соцсетей. Просто поднеси телефон.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-full font-semibold transition">
            Выбрать чип
          </button>
          <button className="border border-slate-700 hover:bg-slate-800 px-8 py-4 rounded-full font-semibold transition">
            Сценарии использования
          </button>
        </div>
      </div>
      {/* Декоративный элемент - имитация радиоволн */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-blue-500 rounded-full animate-ping" />
      </div>
    </section>
  );
};
