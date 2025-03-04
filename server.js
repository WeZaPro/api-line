const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ใช้ body-parser อ่าน JSON
app.use(bodyParser.json());

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
