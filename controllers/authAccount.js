const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

exports.register =  (req, res) => {
  console.log(req.body);

  // const first_name = req.body.first_name;
  // const last_name = req.body.last_name;
  // const email = req.body.email;
  // const password = req.body.password;
  // const cPassword = req.body.cPassword;

  const {first_name, last_name, email, password, cPassword} = req.body;

  if (password !== cPassword) {
    return res.render('registration', {message: 'Passwords must match.'});
  }
  
  db.query(`SELECT * FROM accounts WHERE email = ?`,
  email,
  async (err, results) => {
    if (err)
      console.log(err.message);
    if (results.length > 0)
      return res.render('registration', {message: 'Email already in use'});
    
    const hashPwd = await bcrypt.hash(password, 8);
      
    db.query(`INSERT INTO accounts SET ?`,  
    {
      first_name: first_name,
      last_name: last_name,
      email: email,
      password: hashPwd
    },
    (err, results) => {
      if(err) console.log(err.message);
      else {
        console.log(results);
        return res.render('registration', {message: `User Registered.`});
      }
    })
  })
}

exports.login = async (req, res) => {
  try {
    const {email, password} = req.body;

    if (!email || !password) 
      return res.status(400).render('index', {message: 'Provide email / password.'});

    db.query(`SELECT password FROM accounts WHERE email = ?`,
    email,
    async (err, results) => {
      if (err) console.log(err.message);
      if (!results || !(await bcrypt.compare(password, results[0].password))) 
        return res.status(401).render('index', {message: 'Account does not exist'});
      else {
        return res.render('index', {message: 'Login Success!'});
      }
    })
  }
  catch (error) {
    console.log(error);
  }

}