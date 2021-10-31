const router = require('express').Router();

router.use('/api', require('./api'));

router.use((req, res) => {
  res.status(404).send('<h1>404 Error!</h1>');
});

module.exports = router;