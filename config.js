require('dotenv').config()

module.exports =  {
  url: process.env.BASE_URL || 'http://localhost:3000',
  domain: process.env.DOMAIN || 'http://localhost:',
  port: process.env.PORT || 3000,
  db: process.env.MONGODB_URI,
  email: {
    host: "smtp.comerdespierto.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAILPASSWORD
    }
  },
  SECRET_TOKEN:  process.env.TOKENKEY || 'estaEsMiClaveDeTokens',
};