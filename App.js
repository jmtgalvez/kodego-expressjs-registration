const express = require('express');
const cookieParser = require('cookie-parser');

// dotenv to "hide" database info
// uses .env
// usually included in .gitignore
const dotenv = require('dotenv');
dotenv.config({path: './.env'});

const app = express();
const port = 3000;

app.set('view engine', 'hbs');

app.use(cookieParser());

app.use(express.json());  
app.use(express.urlencoded({extended: true}));

app.use('/', require('./routes/accountRoutes'));
app.use('/auth', require('./routes/auth'));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port} ...`);
});