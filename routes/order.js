const express = require("express");
const router = express.Router();
const orderModel = require("../models/order");
const productModel = require("../models/products.js");

// Get All Orders
router.get("/", async (req, res) => {
  try {
    const orders = await orderModel.find().populate([
      { path: "buyer", select: "-user_password" }, // มาจาก doc ของ mongoose การใส่ - คือไม่เอา เช่น -user_password
      {
        path: "transaction",
        populate: { path: "product", select: "-prod_qty" },
      },
    ]);
    return res.status(200).json({
      status: 200,
      message: "success",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create order
router.post("/", async (req, res) => {
  try {
    const promises = req.body.transaction.map(async (element) => {
      const product = await productModel.findOne({ _id: element.product });
      const newProduct = {
        ...product._doc,
        prod_qty: product.prod_qty - element.qty,
      };
      if (newProduct.prod_qty >= 0) {
        const updatedProduct = await productModel.findOneAndUpdate({ _id: element.product }, newProduct);
        return updatedProduct;
      } else {
        return res.json({
          status: 400,
          message: "สินค้าไม่เพียงพอ"
        });
      }
    });
    
    await orderModel.create(req.body);
    await Promise.all(promises);
    
    return res.json({
      status: 200,
      message: "success"
    });
  } catch (error) {
    return res.status(400).json({
      status: 400,
      message: error.message,
    });
  }
});

// Get order by ID
router.get("/:id", getOrder, (req, res) => {
  res.json(res.order);
});

// Update order
router.put("/:id", getOrder, async (req, res) => {
  try {
    await res.order.set(req.body).save();
    res.json(res.order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete order
router.delete("/:id", getOrder, async (req, res) => {
  try {
    await res.order.remove();
    res.json({ message: "orderModel deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Middleware to get orderModel by ID
async function getOrder(req, res, next) {
  try {
    const order = await orderModel.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "orderModel not found" });
    }
    res.order = order;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = router;
