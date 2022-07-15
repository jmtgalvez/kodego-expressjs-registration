const express = require('express');
const router = express.Router();
const regController = require('../controllers/authAccount');

router.post('/login', regController.login);

router.post('/register', regController.register);

router.get('/delete/:id', regController.delete);

router.get('/update/:id', regController.updateForm);

router.post('/update/:id', regController.update);

router.get('/list', regController.display);

router.get('/logout', (req, res) => {
  res.clearCookie('access_token');
  res.redirect('/');

  // if (req.session) {
  //   req.session.destroy( (err) => {
  //     if (err) res.status(400).send('Unable to logout.');
  //     else {
  //       res.clearCookie('access_token')
  //          .status(200)
  //          .json({
  //           message: 'Successfully logged out.'
  //          });
  //       res.redirect('/');
  //     }
  //   })
  // } else {
  //   console.log('No session');
  //   res.end();
  // }
});

module.exports = router;