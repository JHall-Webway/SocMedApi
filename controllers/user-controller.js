const { User, Thought } = require('../models');

module.exports = {
    getAllUsers(req, res) {
        User.find({})
            .populate({
                path: 'thoughts',
                select: '-__v -username'
            })
            .populate({
                path: 'friends',
                select: '-__v -thoughts'
            })
            .select('-__v')
            .sort({ _id: -1 })
            .then(dbUserData => {
                if (!dbUserData.length) {
                    res.status(404).json({ message: 'No users currently exist' });
                    return
                }
                res.json(dbUserData);
            })
            .catch(err => {
                console.log(err);
                res.status(400).json(err)
            });
    },
    getUserById({ params }, res) {
        User.findOne({ _id: params.id })
            .populate({
                path: 'thoughts',
                select: '-__v -username'
            })
            .select('-__v')
            .sort({ _id: -1 })
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No user with this id found'});
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => {
                console.log(err);
                res.status(400).json(err)
            });
    },
    addUser({ body }, res) {
        User.create(body)
            .then(dbUserData => res.json(dbUserData))
            .catch(err => res.status(400).json(err));
    },
    updateUser({ params, body }, res) {
        User.findByIdAndUpdate({ _id: params.id }, body, { new: true, runValidators: true })
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No User found with this id' })
                }
                res.json(dbUserData)
            })
            .catch(err => res.status(400).json(err));
    },
    deleteUser({ params }, res) {
        User.findOneAndDelete({ _id: params.id })
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No User found with this id' })
                    return;
                }
                Thought.deleteMany({ username: dbUserData._id })
                    .then(dbThoughtData => {
                        console.log('Associated thoughts deleted');
                        res.json({
                            message: 'User deleted',
                            data: {
                                user: dbUserData,
                                thoughts: dbThoughtData
                            }
                        });
                    })
                    .catch(err => res.json(err));
            })
            .catch(err => res.status(400).json(err));
    },
    addFriend({ params }, res) {
        User.findByIdAndUpdate(
            { _id: params.userId },
            { $push: { friends: params.friendId } },
            { new: true }
        )
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No User found with this id' })
                }
                res.json({ message: 'Friend added', dbUserData });
            })
            .catch(err => res.status(400).json(err));
    },
    removeFriend({ params }, res) {
        User.findByIdAndUpdate(
            { _id: params.userId },
            { $pull: { friends: params.friendId } },
            { new: true }
        )
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No User found with this id' })
                }
                res.json(dbUserData)
            })
            .catch(err => res.status(400).json(err));
    }
};