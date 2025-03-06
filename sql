CREATE DATABASE DB_Conversion;



CREATE TABLE conversion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fb_click_id VARCHAR(255) NOT NULL,
  google_click_id VARCHAR(255) NOT NULL,
  tiktok_click_id VARCHAR(255) NOT NULL,
  cookies_userId VARCHAR(255) NOT NULL,
  ipAddress VARCHAR(255) NOT NULL,
  user_agent VARCHAR(255) NOT NULL,
  ads_code VARCHAR(255) NOT NULL,
  fbc VARCHAR(255) NOT NULL,
  fbp VARCHAR(255) NOT NULL,
  queryString VARCHAR(255) NOT NULL,
  line_user_id VARCHAR(255) NOT NULL,
  line_chat_use_status TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tag_ads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ads_number VARCHAR(255) DEFAULT 'none',
  platform VARCHAR(255) DEFAULT 'none',
  ads_image TEXT DEFAULT 'none',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE tag_conversion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customerID VARCHAR(255) NOT NULL DEFAULT 0,
  fbclid_source VARCHAR(255) DEFAULT 'none',
  gclid_source VARCHAR(255) DEFAULT 'none',
  ttclid_source VARCHAR(255) DEFAULT 'none',
  convUserId VARCHAR(255) NOT NULL DEFAULT 0,
  ipAddress VARCHAR(255) DEFAULT 'none',
  event_name VARCHAR(255) DEFAULT 'none',
  userAgent VARCHAR(255) DEFAULT 'none',
  clientID VARCHAR(255) DEFAULT 'none',
  utm_source VARCHAR(255) DEFAULT 'none',
  utm_medium VARCHAR(255) DEFAULT 'none',
  utm_campaign VARCHAR(255) DEFAULT 'none',
  utm_term VARCHAR(255) DEFAULT 'none',
  gg_keyword VARCHAR(255) DEFAULT 'none',
  session_id VARCHAR(255) DEFAULT 'none',
  fbc VARCHAR(255) DEFAULT 'none',
  fbp VARCHAR(255) DEFAULT 'none',
  line_user_id VARCHAR(255) DEFAULT "none",
  line_chat_use_status TINYINT(1) NOT NULL DEFAULT 0,
  ads_number VARCHAR(255) DEFAULT "000",
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- sample insert data
INSERT INTO tag_ads (ads_number, platform, ads_image)
VALUES ('AD001', 'Facebook', 'image_url_1'),
       ('AD002', 'Google', 'image_url_2'),
       ('AD003', 'TikTok', 'image_url_3');
