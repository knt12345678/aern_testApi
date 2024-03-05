const db = require('../db');

const OrderSchema = db.Schema({
    // รหัสผู้ซื้อที่อ้างอิงจากโมเดล users_id
    buyer: { type: db.Schema.Types.ObjectId, ref: 'users' }, 
    transaction: [{
       product: { type: db.Schema.Types.ObjectId, ref: 'products' },
       qty: Number,
       total_price: Number
    }],
    updated_at: { type: Date, default: Date.now },
    created_at: { type: Date, default: Date.now }
});

module.exports = db.model('orders', OrderSchema);