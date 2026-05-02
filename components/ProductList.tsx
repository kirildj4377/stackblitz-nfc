import { products } from '@/data/mockProducts';

export const ProductList = () => {
  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold mb-12 text-slate-900">Популярные решения</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition group">
              <div className={`w-16 h-16 ${product.color} rounded-2xl mb-6 flex items-center justify-center text-white font-bold`}>
                NFC
              </div>
              <h3 className="text-2xl font-bold mb-2">{product.title}</h3>
              <p className="text-slate-500 mb-4">{product.useCase}</p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-sm font-mono bg-slate-100 px-3 py-1 rounded text-slate-600">
                  {product.chip}
                </div>
                <span className="text-xl font-bold">{product.price} ₽</span>
              </div>
              <button className="w-full mt-6 py-3 border-2 border-slate-900 rounded-xl font-bold group-hover:bg-slate-900 group-hover:text-white transition">
                Купить
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};