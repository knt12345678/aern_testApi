var express = require("express");
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var userModel = require("../models/users");
const users = require("../models/users");

/* GET get all users */
router.get("/", async function (req, res, next) {
  try {
    const users = await userModel.find().select('-password');
    return res.status(200).json({
      status: 200,
      message: "UsersAll",
      data: users
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message
    });
  }
});

/* GET get user by ID */
router.get("/:_id", async function (req, res, next) {
  try {
    const id = req.params._id;
    const user = await userModel.findById(id).select('-password');
    if (user) {
      return res.status(200).json({
        status: 200,
        message: "UserID",
        data: user
      });
    } else {
      return res.status(404).json({
        status: 404,
        message: "Unable to display users due to an error."
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error.message
    });
  }
});

/* POST register */
router.post("/register", async function (req, res, next) {
  try {
    const { username, password, first_name, last_name, gender } = req.body; // ดึงข้อมูลผู้ใช้จาก request body
    const user = await userModel.findOne({ username }); // ค้นหาผู้ใช้ที่มี email ที่ส่งมาในฐานข้อมูล
    if (user) {
      return res.json({
        status: 401,
        massage: "มีผู้ใช้นี้ในระบบบแล้ว",
      });
    } else {
      //  สร้างผู้ใช้ใหม่
      const hashedPassword = bcrypt.hashSync(password, 10);
      const user = await userModel.create({
        username,
        first_name, 
        last_name, 
        gender,
        password: hashedPassword
      });
      return res.json({
        status: 200,
        massage: "สำเร็จ",
        data: user
      });
    }
  } catch (error) {
    return res.json({
      status: error.status,
      message: error.message,
    });
  }
});

/* POST login*/
router.post("/login", async function (req, res, next) {
  try {
    const { username, password } = req.body; // ดึงข้อมูล email และ password จาก request body
    // ค้นหาผู้ใช้ในฐานข้อมูลด้วย email
    const user = await userModel.findOne({ username }) 
    // ตรวจสอบว่ามีผู้ใช้หรือไม่
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "ไม่พบผู้ใช้ในระบบ",
      });
    }
    // ตรวจสอบรหัสผ่าน
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 401,
        message: "รหัสผ่านไม่ถูกต้อง",
      });
    }
    // สร้าง token (JWT) สำหรับการล็อกอินสำเร็จ
    const token = createToken(user);
    // ส่งข้อมูลผู้ใช้และ token กลับไปยัง client
    return res.json({
      status: 200,
      message: "ล็อกอินสำเร็จ",
      data: {
        user,
        token
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "เกิดข้อผิดพลาดในการล็อกอิน",
      error: error.message,
    });
  }
});

/* PUT*/
router.put("/:_id", async function (req, res, next) {
  try {
    // console.log(req.body);
    const id = req.params._id;
    const filter = { _id: id };
    const { password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10)
    const update = { ...req.body, password: hashedPassword }
    const user = await userModel.findOneAndUpdate(filter, update, { new: true }).select('-password');
    return res.json({
      status: 200,
      massage: "success",
      data: user,
    });
  } catch (error) {
    return res.json({
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
    const result = await userModel.findOneAndDelete(filter);
    if (result) {
      return res.json({
        status: 200,
        message: "success",
      });
    } else {
      return res.status(404).json({
        status: 404,
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

// สร้างฟังก์ชันสำหรับสร้างและส่ง token กลับ
function createToken(user) {
  // กำหนดข้อมูล payload สำหรับ token (ในกรณีนี้เราจะใช้ _id และ email ของผู้ใช้)
  const payload = {
    _id: user._id,
    username: user.username
  };

  // สร้าง token โดยใช้ payload, secret key และ options
  const token = jwt.sign(payload, 'cc0rsk!2bgkp*!0$071nqxjdw)gp0v!48xv8s^2s&+x@)mncs_', { expiresIn: '1h' }); // กำหนดเวลาหมดอายุของ token เป็น 1 ชั่วโมง
  return token;
}

module.exports = router;
