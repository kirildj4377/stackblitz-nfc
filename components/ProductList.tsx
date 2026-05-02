import { products } from '@/data/mockProducts';

export const ProductList = () => {
  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold mb-12 text-slate-900 text-slate-900 dark:text-white">Популярні рішення</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm dark:shadow-none border border-transparent dark:border-slate-700 transition-all group flex flex-col">
              {/* Верхняя часть карточки */}
              <div className={`w-16 h-16 ${product.color} rounded-2xl mb-6 flex items-center justify-center text-white font-bold`}>
                NFC
              </div>
              
              <h3 className="text-2xl font-bold mb-2 dark:text-slate-100">{product.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">{product.useCase}</p>
              
              {/* Блок цены и чипа */}
              <div className="flex items-center justify-between mt-auto pt-4">
                <span className="text-sm font-mono bg-slate-100 px-3 py-1 rounded text-slate-600">
                  {product.chip}
                </span>
                <span className="text-xl font-bold text-slate-900">
                  {product.price} грн
                </span>
              </div>

              {/* Кнопка покупки */}
              <button className="w-full mt-6 py-3 border-2 border-slate-900 rounded-xl font-bold group-hover:bg-slate-900 group-hover:text-white transition-all">
                Купити
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
