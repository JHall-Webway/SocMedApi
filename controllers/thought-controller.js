const { User, Thought } = require('../models');

module.exports = {
    getAllThoughts(req, res) {
        Thought.find({})
            .select('-__v')
            .sort({ _id: -1 })
            .then(dbThoughtData => {
                if (!dbThoughtData.length) {
                    res.status(404).json({ message: 'No thoughts currently exist' });
                    return;
                }
                res.json(dbThoughtData);
            })
            .catch(err => res.status(400).json({ message: 'Get request error', data: err }));
    },
    getThoughtById({ params }, res) {
        Thought.findOne({ _id: params.id })
            .select('-__v')
            .sort({ _id: -1 })
            .then(dbThoughtData => {
                if (!dbThoughtData) {
                    res.status(404).json({ message: 'Thought not found' });
                    return;
                }
                res.json(dbThoughtData);
            })
            .catch(err => res.status(400).json({ message: 'Get request error', data: err }));
    },
    addThought({ body }, res) {
        Thought.create(body)
            .then(dbThoughtData => {
                return User.findOneAndUpdate(
                    { _id: body.userId },
                    { $push: { thoughts: dbThoughtData._id } },
                    { new: true })
                    .then(dbUserData => {
                        if (!dbUserData) {
                            res.status(404).json({ message: 'No user found with this id!', dbUserData })
                            return;
                        }
                        return dbThoughtData;
                    })
            })
            .then(dbThoughtData => res.json({ message: 'Thought Added', dbThoughtData }))
            .catch(err => res.status(400).json({ message: 'Post request error', data: err }));
    },
    updateThought({ params, body }, res) {
        Thought.findOneAndUpdate({ _id: params.id }, body, { new: true, runValidators: true })
            .then(dbThoughtData => {
                if (!dbThoughtData) {
                    res.status(404).json({ message: 'No thoughts found' });
                    return;
                }
                res.json({ message: 'Thought updated', data: dbThoughtData });
            })
            .catch(err => res.status(400).json({ message: 'Put request error', data: err }));
    },
    deleteThought({ params }, res) {
        Thought.findOneAndDelete({ _id: params.id })
            .then(dbThoughtData => {
                if (!dbThoughtData) {
                    res.status(404).json({ message: 'No thoughts found' });
                    return;
                }
                res.json({
                    message: 'Thought deleted',
                    data: dbThoughtData
                });
            })
            .catch(err => res.status(400).json({ message: 'Delete request error', data: err }));
    },
    addReaction({ params, body }, res) {
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $push: { reactions: body } },
            { new: true, runValidators: true })
            .then(dbThoughtData => {
                if (!dbThoughtData) {
                    res.status(404).json({ message: 'No thoughts found' });
                    return;
                }
                res.json({ message: 'Reaction added', ReactionData: dbThoughtData.reactions[0] });
            })
            .catch(err => res.status(400).json({ message: 'Post request error', data: err }));
    },
    deleteReaction({ params }, res) {
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $pull: { reactions: { reactionId: params.reactionId } } },
            { new: true, runValidators: true }
        )   
            .then(dbThoughtData => {
                if (!dbThoughtData) {
                    res.status(404).json({ message: 'No thoughts found' });
                    return;
                }
                res.json({
                    message: 'Reaction deleted',
                    data: dbThoughtData.reactions
                });
            })
            .catch(err => res.status(400).json({ message: 'Delete request error', data: err }));
    }
};