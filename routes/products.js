var express = require("express");
var router = express.Router();
var productModel = require("../models/products.js");
const orderModel = require("../models/order");

/* GET all */
router.get("/", async function (req, res, next) {
  try {
    const products = await productModel.find();
    return res.status(200).json({
      status: 200,
      massage: "success",
      data: products,
    });
  } catch (error) {
    return res.status.json({
      status: error.status,
      message: error.message,
    });
  }
});
/* GET 1 */
router.get("/:_id", async function (req, res, next) {
  try {
    const id = req.params._id;
    const filter = { _id: id };
    const products = await productModel.findOne(filter);
    return res.status(200).json({
      status: 200,
      massage: "success",
      data: products,
    });
  } catch (error) {
    return res.status.json({
      status: error.status,
      message: error.message,
    });
  }
});

router.get("/:_id/orders", async (req, res) => {
  try {
    const productId = req.params._id;
    
    // ค้นหาข้อมูลของสินค้า
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "ไม่พบสินค้าที่ค้นหา" });
    }
    
    // ค้นหา order ที่มีการสั่งซื้อสินค้าด้วย product id นี้
    const orders = await orderModel.find({ 'transaction.product': productId })
      .populate('buyer', '-user_password') // เลือกที่ไม่เอา user_password ของ buyer
      .select('order_id buyer transaction'); // เลือก transaction
    
    // สร้าง response ตามที่ต้องการ
    const responseData = {
      product: product,
      orders: orders.map(order => {
        // กรอง transaction ที่เป็นของ product ที่ค้นหาเท่านั้น
        const productTransactions = order.transaction.filter(transaction => transaction.product.toString() === productId);
        const transaction = productTransactions.map(transaction => ({
          qty: transaction.qty,
          total_price: transaction.total_price
        }))
        return {
          buyer: order.buyer,
          order_id: order._id,
          qty: transaction[0].qty,
          total_price: transaction[0].total_price
        };
      })
    };
    return res.status(200).json({
      status: 200,
      massage: "success",
      data: responseData,
    })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* POST*/
router.post("/", async function (req, res, next) {
  try {
    // console.log(req.body);
    const products = await productModel.create(req.body);
    return res.status(200).json({
      status: 200,
      massage: "success",
      data: products,
    });
  } catch (error) {
    return res.status.json({
      status: error.status,
      message: error.message,
    });
  }
});

/* PUT*/
router.put("/:_id", async function (req, res, next) {
  try {
    // console.log(req.body);
    const filter = { _id: req.params._id };
    const update = req.body;
    const product = await productModel.findOneAndUpdate(filter, update, { new: true });
    return res.status(200).json({
      status: 200,
      massage: "success",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      status: error.status,
      message: error.message,
    });
  }
});

/* DELETE*/
router.delete("/:_id", async function (req, res, next) {
  try {
    const id = req.params._id;
    const filter = { _id: id };
    const result = await productModel.findOneAndDelete(filter);
    if (result) {
      return res.status(200).json({
        status: 200,
        message: "success",
      });
    } else {
      return res.status(400).json({
        status: 400,
        message: "Not found",
      });
    }
  } catch (error) {
    return res.json({
      status: error.status,
      message: error.message,
    });
  }
});

// Create Order
router.post('/', async (req, res) => {
  try {
    const order = await order.create(req.body);
    res.status(200).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;