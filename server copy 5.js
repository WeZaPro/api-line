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
  user: "root", // ใส่ชื่อผู้ใช้ MySQL
  password: "", // ใส่รหัสผ่าน MySQL
  database: "DB_Conversion", // ใส่ชื่อฐานข้อมูล
});

// const db = mysql.createConnection({
//   host: process.env.host,
//   user: process.env.user,
//   password: process.env.password,
//   database: process.env.database,
// });

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL database!");
});

app.get("/", (req, res) => {
  console.log("start server");
  res.send("start server");
});

app.post("/save-gtm", (req, res) => {
  const {
    customerID,
    fbclid_source,
    gclid_source,
    ttclid_source,
    convUserId,
    userAgent,
    ipAddess,
    clientID,
    utm_source,
    utm_medium,
    utm_campaign,
    utm_term,
    gg_keyword,
    session_id,
  } = req.body;
  console.log("data gtm customerID >>>", customerID);
  console.log("data gtm convUserId >>>", convUserId);
  console.log("data gtm userAgent >>>", userAgent);
  console.log("data gtm ipAddess >>>", ipAddess);
  console.log("data gtm clientID >>>", clientID);
  console.log("data gtm utm_source >>>", utm_source);
  console.log("data gtm utm_medium >>>", utm_medium);

  console.log("data gtm utm_campaign >>>", utm_campaign);
  console.log("data gtm utm_term >>>", utm_term);
  console.log("data gtm gg_keyword >>>", gg_keyword);
  console.log("data gtm session_id >>>", session_id);

  console.log("data gtm fbclid_source >>>", fbclid_source);
  console.log("data gtm gclid_source >>>", gclid_source);
  console.log("data gtm ttclid_source >>>", ttclid_source);
});

app.post("/save-user", (req, res) => {
  console.log("📌 Received data:", req.body); // ✅ Debug จุดนี้

  const {
    fb_click_id,
    google_click_id,
    tiktok_click_id,
    cookies_userId,
    queryString,
    line_user_id,
    ip_address,
    user_agent,
    ads_code,
    fbc,
    fbp,
  } = req.body;

  const checkQuery = `SELECT COUNT(*) AS count FROM ${process.env.table_name} WHERE line_user_id = ?`;

  db.query(checkQuery, [line_user_id], (err, results) => {
    if (err) {
      console.error("❌ Error checking user in database:", err);
      return res.status(500).send("Database error");
    }

    if (results[0].count > 0) {
      console.log("✅ User already exists in database");
      return res.status(200).send("User already exists");
    }

    const insertQuery = `INSERT INTO ${process.env.table_name} 
      (fb_click_id, google_click_id, tiktok_click_id, cookies_userId, queryString, line_user_id, ip_address, user_agent, ads_code, fbc, fbp) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      insertQuery,
      [
        fb_click_id || "",
        google_click_id || "",
        tiktok_click_id || "",
        cookies_userId || "",
        queryString || "",
        line_user_id || "",
        ip_address || "",
        user_agent || "",
        ads_code || "",
        fbc || "",
        fbp || "",
      ],
      (err, result) => {
        if (err) {
          console.error("❌ Error saving user to database:", err);
          return res.status(500).send("Failed to save user");
        }
        console.log("✅ User saved successfully");
        res.status(200).send("User saved successfully");
      }
    );
  });
});

// app.post("/save-user", (req, res) => {
//   console.log("📌 Received data:", req.body); // ✅ Debug จุดนี้

//   const {
//     fb_click_id, //fbclid
//     google_click_id, //GCLID
//     tiktok_click_id, //TTCID
//     cookies_userId,
//     queryString,
//     line_user_id,
//     ip_address,
//     user_agent,
//     ads_code,
//     fbc,
//     fbp,
//   } = req.body;

//   // ตรวจสอบค่าที่ได้รับ
//   // if (!click_id || !cookies_userId || !line_user_id) {
//   //   return res.status(400).send("Missing required fields");
//   // }

//   const checkQuery = `SELECT COUNT(*) AS count FROM ${process.env.table_name} WHERE line_user_id = ?`;

//   db.query(checkQuery, [line_user_id], (err, results) => {
//     if (err) {
//       console.error("❌ Error checking user in database:", err);
//       return res.status(500).send("Database error");
//     }

//     if (results[0].count > 0) {
//       console.log("✅ User already exists in database");
//       return res.status(200).send("User already exists");
//     }

//     const insertQuery = `INSERT INTO ${process.env.table_name}
//       (fb_click_id, google_click_id, tiktok_click_id, cookies_userId, queryString, line_user_id, ip_address, user_agent, ads_code, fbc, fbp)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//     db.query(
//       insertQuery,
//       [
//         fb_click_id || "",
//         google_click_id || "",
//         tiktok_click_id || "",
//         cookies_userId || "",
//         queryString || "",
//         line_user_id || "",
//         ip_address || "",
//         user_agent || "",
//         ads_code || "",
//         fbc || "",
//         fbp || "",
//       ],
//       (err, result) => {
//         if (err) {
//           console.error("❌ Error saving user to database:", err);
//           return res.status(500).send("Failed to save user");
//         }
//         console.log("✅ User saved successfully");
//         res.status(200).send("User saved successfully");
//       }
//     );
//   });
// });

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

      // 📌 ค้นหา userId ในฐานข้อมูล
      const query = `SELECT ads_code, line_chat_use_status FROM ${process.env.table_name} WHERE line_user_id = ?`;

      db.query(query, [userId], (err, results) => {
        if (err) {
          console.error("❌ Database error:", err);
          return res.sendStatus(500);
        }

        if (results.length > 0) {
          const { ads_code, line_chat_use_status } = results[0];

          if (line_chat_use_status === 0) {
            // ถ้าเป็น false (0)
            const updateQuery = `UPDATE ${process.env.table_name} SET line_chat_use_status = 1 WHERE line_user_id = ?`;

            db.query(updateQuery, [userId], (updateErr) => {
              if (updateErr) {
                console.error(
                  "❌ Error updating line_chat_use_status:",
                  updateErr
                );
                return res.sendStatus(500);
              }
              console.log("✅ Updated line_chat_use_status to true");
            });

            replyMessage(_replyToken, userId, `Your ads_code: ${ads_code}`);
          }

          // ✅ ตอบกลับ ads_code ไปยังผู้ใช้
          // replyMessage(_replyToken, userId, `Your ads_code: ${ads_code}`);
        } else {
          console.log("🚫 User ID not found in database");
          replyMessage(_replyToken, userId, "User ID not found.");
        }
      });
    }
  });

  res.sendStatus(200);
});

// app.post("/webhook", (req, res) => {
//   const events = req.body.events;
//   const _replyToken = req.body.events[0].replyToken;

//   console.log(`👤 _replyToken: ${_replyToken}`);
//   events.forEach((event) => {
//     if (event.type === "message") {
//       const userId = event.source.userId;
//       const messageText = event.message.text;

//       console.log(`👤 LINE User ID: ${userId}`);
//       console.log(`💬 Message: ${messageText}`);

//       // ✅ ตอบกลับผู้ใช้
//       replyMessage(_replyToken, userId, `Hello! Your LINE ID is: ${userId}`);
//     }
//   });

//   res.sendStatus(200); // ตอบกลับ LINE ว่ารับข้อมูลแล้ว
// });

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
