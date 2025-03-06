const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const mysql = require("mysql2");
const cors = require("cors");
const axios = require("axios");
const sendToFacebookConversionAPI = require("./sendtoFb");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

// ตั้งค่า Facebook Conversion API
const FB_PIXEL_ID = "933503018995201"; // ใส่ Pixel ID ของคุณ
const FB_ACCESS_TOKEN =
  "EAA0K2b09n5MBOZBceDQB6r2uEnmAIZA3CMwDGKYgFVs8QeOXZA6hG6VinxBO039Lk3rnsp8hDKDG94snpM5zTj7hLSLD652kZAFf5RNJkFZClVKsaTkDSrZCUtxNnkZCi0WOe0iCHiXdwc0QZAuU9WZAVUv10VNF4Mt70Uob5VJvn6bM88ZCoYxrV5V1xzqrZAgiRHVBQZDZD"; // ใส่ Access Token ของคุณ
const FB_CONVERSION_API_URL = `https://graph.facebook.com/v18.0/${FB_PIXEL_ID}/events`;

// ใช้ body-parser อ่าน JSON
app.use(bodyParser.json());

// ตั้งค่าเชื่อมต่อ MySQL
// const db = mysql.createConnection({
//   host: "localhost", // ใส่ที่อยู่ของฐานข้อมูล
//   user: "root", // ใส่ชื่อผู้ใช้ MySQL
//   password: "", // ใส่รหัสผ่าน MySQL
//   database: "TESTCONVERSION", // ใส่ชื่อฐานข้อมูล
// });

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "DB_Conversion",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
// const db = mysql.createConnection({
//   host: process.env.host,
//   user: process.env.user,
//   password: process.env.password,
//   database: process.env.database,
// });

app.get("/", (req, res) => {
  console.log("start server");
  res.send("start server");
});

app.post("/save-gtm", async (req, res) => {
  try {
    const {
      customerID = "none",
      convUserId = "none",
      userAgent = "none",
      ipAddress = "none",
      clientID = "none",
      utm_source = "none",
      utm_medium = "none",
      utm_campaign = "none",
      utm_term = "none",
      gg_keyword = "none",
      session_id = "none",
      fbclid_source = "none",
      gclid_source = "none",
      ttclid_source = "none",
      fbp = "none",
    } = req.body;
    console.log("Received data:", req.body);
    //
    var _fbc = fbclid_source
      ? `fb.1.${Date.now()}.${fbclid_source}`
      : undefined;

    // facebook *****************
    const eventData = {
      event_name: "Viewcontent",
      event_time: Math.floor(Date.now() / 1000), // ใช้เวลาในปัจจุบัน
      user_data: {
        client_user_agent: userAgent,
        // client_ip_address: ipAddress,
        client_ip_address: req.body.ipAddress,
        fbp: fbp,
        fbc: _fbc,
      },
      event_source_url: "https://onlinesabuyme.co.th/?gtm_debug=1699965068912",
      access_token:
        "EAA0K2b09n5MBOZBceDQB6r2uEnmAIZA3CMwDGKYgFVs8QeOXZA6hG6VinxBO039Lk3rnsp8hDKDG94snpM5zTj7hLSLD652kZAFf5RNJkFZClVKsaTkDSrZCUtxNnkZCi0WOe0iCHiXdwc0QZAuU9WZAVUv10VNF4Mt70Uob5VJvn6bM88ZCoYxrV5V1xzqrZAgiRHVBQZDZD",
    };

    sendToFacebookConversionAPI(eventData)
      .then((response) => {
        console.log("Response from Facebook API:", response);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    // facebook end****************

    // Check if customerID exists in the database
    const checkQuery = "SELECT * FROM tag_conversion WHERE convUserId = ?";
    db.execute(checkQuery, [convUserId], (err, result) => {
      if (err) {
        console.error("Error checking customerID:", err);
        return res.status(500).json({ error: "Database error" });
      }

      if (result.length > 0) {
        // If customerID exists, do not insert and send a response
        console.log("CustomerID already exists.");
        return res.status(400).json({ error: "CustomerID already exists" });
      } else {
        // If customerID does not exist, proceed with insert
        const insertQuery = `
          INSERT INTO tag_conversion (
            customerID,
            convUserId,
            userAgent,
            ipAddress,
            clientID,
            utm_source,
            utm_medium,
            utm_campaign,
            utm_term,
            gg_keyword,
            session_id,
            fbclid_source,
            gclid_source,
            ttclid_source,
            fbc,
            fbp,
            line_user_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
          customerID,
          convUserId,
          userAgent,
          ipAddress,
          clientID,
          utm_source,
          utm_medium,
          utm_campaign,
          utm_term,
          gg_keyword,
          session_id,
          fbclid_source,
          gclid_source,
          ttclid_source,
          _fbc,
          fbp,
          "no",
        ];

        db.execute(insertQuery, values, (err, result) => {
          if (err) {
            console.error("Error inserting data:", err);
            return res.status(500).json({ error: "Database error" });
          }
          console.log("Data inserted successfully:", result);
          return res
            .status(200)
            .json({ success: "Data inserted successfully" });
        });
      }
    });
  } catch (error) {
    console.error("❌ Error saving to MySQL:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

// app.post("/save-gtm", async (req, res) => {
//   try {
//     const {
//       customerID = "",
//       convUserId = "",
//       userAgent = "",
//       ipAddress = "",
//       clientID = "",
//       utm_source = "",
//       utm_medium = "",
//       utm_campaign = "",
//       utm_term = "",
//       gg_keyword = "",
//       session_id = "",
//       fbclid_source = "",
//       gclid_source = "",
//       ttclid_source = "",
//     } = req.body;

//     console.log("Received data:", req.body);

//     // Insert into the table
//     const insertQuery = `
//     INSERT INTO tag_conversion (
//       customerID,
//       convUserId,
//       userAgent,
//       ipAddress,
//       clientID,
//       utm_source,
//       utm_medium,
//       utm_campaign,
//       utm_term,
//       gg_keyword,
//       session_id,
//       fbclid_source,
//       gclid_source,
//       ttclid_source,
//       fbc,
//       fbp,
//       line_user_id
//     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;
//     const values = [
//       customerID,
//       convUserId,
//       userAgent,
//       ipAddress,
//       clientID,
//       utm_source,
//       utm_medium,
//       utm_campaign,
//       utm_term,
//       gg_keyword,
//       session_id,
//       fbclid_source,
//       gclid_source,
//       ttclid_source,
//       "no",
//       "no",
//       "no",
//     ];

//     db.execute(insertQuery, values, (err, result) => {
//       if (err) {
//         console.error("Error inserting data:", err);
//         // ส่งคำตอบกลับทันทีหากเกิดข้อผิดพลาด
//         return res.status(500).json({ error: "Database error" });
//       }

//       console.log("Data inserted successfully:", result);

//       // ตรวจสอบข้อมูลที่ถูกบันทึก
//       const checkQuery = "SELECT * FROM tag_conversion WHERE id = ?";
//       db.execute(checkQuery, [result.insertId], (err, rows) => {
//         if (err) {
//           console.error("Error fetching data:", err);
//           return res.status(500).json({ error: "Error fetching data" });
//         }

//         // ส่งคำตอบกลับหลังจากที่ได้ข้อมูลจากฐานข้อมูล
//         console.log("Fetched data:", rows);
//         return res
//           .status(200)
//           .json({ success: "Data inserted successfully", data: rows });
//       });
//     });
//   } catch (error) {
//     console.error("❌ Error saving to MySQL:", error);
//     // ส่งคำตอบกลับทันทีหากเกิดข้อผิดพลาด
//     return res
//       .status(500)
//       .json({ error: "Internal Server Error", details: error.message });
//   }
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
