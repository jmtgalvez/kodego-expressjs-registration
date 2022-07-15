const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const url = require('url');
const jwt = require('jsonwebtoken');


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

    let sql = `SELECT * FROM accounts WHERE email = ?`;

    db.query(sql, email, async (err, rows) => {
      if (err) console.log(err.message);
      if (!rows || !(await bcrypt.compare(password, rows[0].password))) 
        return res.status(401).render('index', {message: 'Account does not exist'});
      else {
        const id = rows[0].id;
        const token = jwt.sign(id, process.env.JWT_SECRET);
        const cookieOption = {
          expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 60 * 1000),
          httpOnly: true,
        }
        console.log(token);
        res.cookie('access_token', token, cookieOption);
        res.redirect('/auth/list');
      }
    })
  }
  catch (error) {
    console.log(error);
  }

}

exports.delete = async (req, res) => {
  const id = req.params.id;

  db.query('DELETE FROM accounts WHERE id = ?',
  id,
  (err, rows) => {
    if (err) console.log(err.message);
    else {
      res.redirect(url.format({
        pathname: '/auth/list',
        query: {
          message: 'User deleted.'
        }
      }));
    }
  });
}

exports.updateForm = async (req, res) => {
  db.query('SELECT * FROM accounts WHERE id = ?',
  req.params.id,
  (err, rows) => {
    if (err) console.log(`MySQL Error: ${err.message}`);
    else return res.render('updateForm', {user: rows[0]});
  });
}

exports.update = async (req, res) => {
  const id = req.params.id;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;

  let sql = `UPDATE accounts SET
    first_name = ?,
    last_name = ?
    WHERE id = ?`;

  let values = 
  [
    first_name,
    last_name,
    id
  ]

  db.query(sql, values, (err, rows) => {
      if (err) console.log(`MySQL Error: ${err.message}`);
      else {
        res.redirect(
          url.format({
            pathname: '/auth/list',
            query: {
              message: 'List updated.'
            }
          })
        );
      }
    });
}


exports.display = async (req, res) => {
  let sql = 'SELECT * FROM accounts';
  let message = req.query.message || null;

  db.query(sql, (err, rows) => {
    if (err) console.log(`MySQL Error ${err.message}`);
    else
      res.render(
        'list', 
        {
          title: 'List of Users',
          users: rows,
          message: message
        }
      );
  })
}