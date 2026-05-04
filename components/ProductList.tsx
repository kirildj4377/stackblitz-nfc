import { products } from '@/data/mockProducts';

export const ProductList = ({ setSelectedProduct }: { setSelectedProduct: (p: any) => void }) => {
  return (
    <section className="py-20 bg-slate-50 dark:bg-[#0f172a] transition-colors">
      <div className="container mx-auto px-6 bg-white dark:bg-slate-800/50 dark:backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-transparent dark:border-slate-700 transition-all flex flex-col h-full">
        <h2 className="text-3xl font-bold mb-12 dark:text-white">Популярні рішення</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div 
              key={product.id} 
              // Добавляем клик на всю карточку для удобства
              onClick={() => setSelectedProduct(product)}
              className="cursor-pointer bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm dark:shadow-none border border-transparent dark:border-slate-700 transition-all group flex flex-col hover:scale-[1.02]"
            >
              <div className={`w-16 h-16 ${product.color} rounded-2xl mb-6 flex items-center justify-center text-white font-bold shadow-lg`}>
                NFC
              </div>
              
              <h3 className="text-2xl font-bold mb-2 dark:text-slate-100">{product.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">{product.useCase}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4">
                <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded text-slate-600 dark:text-slate-300">
                  {product.chip}
                </span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {product.price} грн
                </span>
              </div>

              {/* Кнопка "Детальніше" вместо "Купити" */}
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Чтобы не срабатывал клик по карточке дважды
                  setSelectedProduct(product);
                }}
                className="w-full mt-6 py-3 border-2 border-slate-900 dark:border-slate-100 dark:text-white rounded-xl font-bold group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900 transition-all"
              >
                Детальніше
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};