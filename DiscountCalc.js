function DiscountCalc() {
    const [price, setPrice] = React.useState('');
    const [discount, setDiscount] = React.useState(20);

    const saved = (Number(price) * Number(discount)) / 100;
    const finalPrice = Number(price) - saved;

    return (
        <div className="flex-1 bg-gray-50 p-6 md:p-10 overflow-y-auto">
            <div className="max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="icon-tag text-4xl text-red-500 mb-4 mx-auto"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-8">折扣計算機</h2>
                
                <div className="space-y-6 mb-8 text-left">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">原價</label>
                        <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="輸入商品原價..." className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-100 outline-none" />
                    </div>
                    <div className="py-2">
                        <label className="flex justify-between text-sm font-bold text-gray-700 mb-3">
                            <span>折扣 (Discount)</span>
                            <span className="text-red-500">{discount}% off</span>
                        </label>
                        <input type="range" min="1" max="99" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500" />
                    </div>
                </div>

                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                    <div className="flex justify-between text-red-800 mb-2 text-lg"><span>節省金額:</span> <span className="font-bold">${saved.toFixed(2)}</span></div>
                    <div className="flex justify-between text-2xl font-bold text-red-600 mt-4 pt-4 border-t border-red-200">
                        <span>折扣後價格:</span> <span>${finalPrice.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}