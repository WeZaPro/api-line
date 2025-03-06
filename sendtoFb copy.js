const axios = require("axios");

async function sendToFacebookConversionAPI({
  event_name,
  action_source = "website",
  event_time,
  user_data,
  custom_data = {},
  event_source_url,
  access_token,
  partner_agent = "stape-gtmss-2.1.1",
  fb_testCode, // รับค่า Test Event Code
  fb_pixel, // รับค่า Pixel ID
}) {
  try {
    // ตรวจสอบว่า access_token มีค่าหรือไม่
    if (!access_token || access_token === "none") {
      throw new Error("Access Token is missing or invalid.");
    }

    // ตรวจสอบว่า fb_pixel มีค่าหรือไม่
    if (!fb_pixel || fb_pixel === "none") {
      throw new Error("Facebook Pixel ID is missing or invalid.");
    }

    const data = JSON.stringify({
      data: [
        {
          event_name: event_name,
          action_source: action_source,
          event_time: event_time,
          custom_data: custom_data,
          user_data: user_data,
          event_source_url: event_source_url,
        },
      ],
      partner_agent: partner_agent,
      test_event_code: fb_testCode, // ใช้ test_event_code ในการทดสอบ
    });

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `https://graph.facebook.com/v20.0/${fb_pixel}/events?access_token=${access_token}`,
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    const response = await axios.request(config);
    console.log("✅ Sent to Facebook:", JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error sending data to Facebook:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Failed to send data to Facebook Conversion API");
  }
}

module.exports = sendToFacebookConversionAPI;
