const path = require('path');
const root_dir = __dirname.split('src')[0];
require('dotenv').config({ path: path.join(root_dir, `.env`) });
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

module.exports = transporter;
