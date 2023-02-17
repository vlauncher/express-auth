const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

function sendEmail(to, subject, message) {
  const mailOptions = {
    from: "youremail@gmail.com",
    to,
    subject,
    text: message,
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.log(err);
    }
  });
}

module.exports = {
    sendEmail
}