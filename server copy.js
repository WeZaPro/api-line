const express = require("express");
const mysql = require("mysql2");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ตั้งค่า MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: process.env.user, // เปลี่ยนเป็น user ของ MySQL
  password: process.env.password, // เปลี่ยนเป็นรหัสผ่านของคุณ
  database: process.env.database,
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: ", err.stack);
    return;
  }
  console.log("Connected to MySQL Database");
});

// ใช้ middleware สำหรับ parse JSON และ cookies
app.use(express.json());
app.use(cookieParser());

app.get("/track", (req, res) => {
  // 1. ดึงข้อมูลจาก query string
  const clickId = req.query.clickId;
  const keyAds = req.query.keyAds;

  // 2. เช็ค cookies_userId ถ้าไม่มีให้สร้างใหม่
  let cookiesUserId = req.cookies.cookies_userId;
  if (!cookiesUserId) {
    cookiesUserId = uuidv4(); // สร้าง random UUID สำหรับ cookies_userId
    res.cookie("cookies_userId", cookiesUserId, {
      maxAge: 3600000,
      httpOnly: true,
    }); // Set cookie
  }

  // 3. ดึง LINE user ID จาก query string (เช่น lineUserId หรือจาก Webhook)
  const lineUserId = req.query.lineUserId;

  // 4. บันทึกข้อมูลลงในฐานข้อมูล MySQL
  const query = `
    INSERT INTO conversion (click_id, cookies_userId, queryString, line_user_id)
    VALUES (?, ?, ?, ?)
  `;
  const values = [clickId, cookiesUserId, keyAds, lineUserId];

  db.execute(query, values, (err, results) => {
    if (err) {
      console.error("Error inserting data: ", err);
      return res.status(500).json({ message: "Error inserting data" });
    }
    console.log("Data inserted successfully:", results);
    res.status(200).json({ message: "Data saved successfully" });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
