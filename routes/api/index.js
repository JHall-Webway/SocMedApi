const { User, Thought } = require('../../models');

const router = require('express').Router();

router.use('/thoughts', require('./thought-routes'));
router.use('/users', require('./user-routes'));

router.delete('/nuke', (req, res) => {
    User.collection.drop();
    Thought.collection.drop();
    res.json({ message: 'Collections purged' });
});

module.exports = router;