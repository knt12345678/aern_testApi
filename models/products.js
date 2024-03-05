const db = require("../db");

const ProductSchema = db.Schema({
  prod_img: String,
  prod_name: String,
  prod_price: Number,
  prod_description: String,
  prod_qty: Number,
  orders: { type: db.Schema.Types.ObjectId, ref: 'orders' },
  updated_at: { type: Date, default: Date.now },
  created_at: { type: Date, default: Date.now },
});

module.exports = db.model("products", ProductSchema);