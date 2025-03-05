CREATE DATABASE DB_Conversion;



CREATE TABLE conversion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fb_click_id VARCHAR(255) NOT NULL,
  google_click_id VARCHAR(255) NOT NULL,
  tiktok_click_id VARCHAR(255) NOT NULL,
  cookies_userId VARCHAR(255) NOT NULL,
  ip_address VARCHAR(255) NOT NULL,
  user_agent VARCHAR(255) NOT NULL,
  ads_code VARCHAR(255) NOT NULL,
  fbc VARCHAR(255) NOT NULL,
  fbp VARCHAR(255) NOT NULL,
  queryString VARCHAR(255) NOT NULL,
  line_user_id VARCHAR(255) NOT NULL,
  line_chat_use_status TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
