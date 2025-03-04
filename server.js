const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// ใช้ body-parser อ่าน JSON
app.use(bodyParser.json());

// ตั้งค่าเชื่อมต่อ MySQL
const db = mysql.createConnection({
  host: "localhost", // ใส่ที่อยู่ของฐานข้อมูล
  user: process.env.user, // ใส่ชื่อผู้ใช้ MySQL
  password: process.env.password, // ใส่รหัสผ่าน MySQL
  database: process.env.database, // ใส่ชื่อฐานข้อมูล
});

// const db = mysql.createConnection({
//   host: "localhost", // ใส่ที่อยู่ของฐานข้อมูล
//   user: "root", // ใส่ชื่อผู้ใช้ MySQL
//   password: "", // ใส่รหัสผ่าน MySQL
//   database: "line_chatbot", // ใส่ชื่อฐานข้อมูล
// });

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database!");
});

app.get("/", (req, res) => {
  console.log("start server");
  res.send("start server");
});

// สร้าง API สำหรับรับข้อมูลผู้ใช้และบันทึกลงฐานข้อมูล
app.post("/save-user", (req, res) => {
  const { click_id, cookies_userId, queryString, line_user_id } = req.body;

  const query = `INSERT INTO ${process.env.table_name} (click_id, cookies_userId, queryString,line_user_id) VALUES (?, ?, ?, ?)`;
  db.query(
    query,
    [click_id, cookies_userId, queryString, line_user_id],
    (err, result) => {
      if (err) {
        console.error("Error saving user to database:", err);
        return res.status(500).send("Failed to save user");
      }
      res.status(200).send("User saved successfully");
    }
  );
});

app.post("/webhook", (req, res) => {
  const events = req.body.events;
  const _replyToken = req.body.events[0].replyToken;

  console.log(`👤 _replyToken: ${_replyToken}`);
  events.forEach((event) => {
    if (event.type === "message") {
      const userId = event.source.userId;
      const messageText = event.message.text;

      console.log(`👤 LINE User ID: ${userId}`);
      console.log(`💬 Message: ${messageText}`);

      // ✅ ตอบกลับผู้ใช้
      replyMessage(_replyToken, userId, `Hello! Your LINE ID is: ${userId}`);
    }
  });

  res.sendStatus(200); // ตอบกลับ LINE ว่ารับข้อมูลแล้ว
});

// 📌 ฟังก์ชันตอบกลับข้อความไปยัง LINE
const axios = require("axios");
const LINE_ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN; // 🔑 ใส่ Token ของคุณ

const replyMessage = (_replyToken, userId, text) => {
  axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      //   replyToken: userId,
      replyToken: _replyToken,
      messages: [{ type: "text", text }],
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LINE_ACCESS_TOKEN}`,
      },
    }
  );
};

app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on http://localhost:${PORT}`);
});
