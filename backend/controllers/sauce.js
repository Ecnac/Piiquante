const Sauce = require('../models/sauce');
const fs = require('fs');

// returns an array of all sauces in the database
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

// returns a single sauce from the database by ID
exports.getOneSauce = (req, res, next) => { 
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

// creates a new sauce in the database
exports.createSauce = (req, res, next) => { //
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    // save the sauce in the database
    sauce.save() 
        .then(() => res.status(201).json({ message: 'Sauce savec successfully !'}))
        .catch(error => res.status(400).json({ error }));
};

// updates a sauce in the database
exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
        // if there is a file, we parse the body and add the new image url
        {   ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
        delete sauceObject._userId;
        // find the sauce by ID
        Sauce.findOne({ _id: req.params.id })
            // if the sauce exists, we check if the user is the owner
            .then(sauce => {
                if (sauce.userId !== req.auth.userId) {
                    return res.status(401).json({ error: 'Unauthorized request' });
                }
                // if the user is the owner, we update the sauce
                Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id }) 
                    .then(() => res.status(200).json({ message: 'Sauce updated successfully !'}))
                    .catch(error => res.status(400).json({ error }));
            })
            .catch(error => res.status(500).json({ error }));
};

// deletes a sauce from the database
exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id})
    // if the sauce exists, we check if the user is the owner
        .then(sauce => {
            if (sauce.userId !== req.auth.userId) {
                return res.status(401).json({ error: 'Unauthorized request' });
            }
            // if the user is the owner, we delete the sauce
            const filename = sauce.imageUrl.split('/images/') [1];
            // delete the image from the server
            fs.unlink(`images/${filename}`, () => {
                // delete the sauce from the database
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce deleted successfully !'}))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

// updates the likes and dislikes of a sauce
exports.likeSauce = (req, res, next) => {
    if (req.body.like === 1) {
        // if the user likes the sauce, we add the user to the usersLiked array
        Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: req.auth.userId }})
            .then(() => res.status(200).json({ message: 'Sauce liked successfully !'}))
            .catch(error => res.status(400).json({ error }));
    } else if (req.body.like === -1) {
        // if the user dislikes the sauce, we add the user to the usersDisliked array
        Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: 1 }, $push: { usersDisliked: req.auth.userId }})
            .then(() => res.status(200).json({ message: 'Sauce disliked successfully !'}))
            .catch(error => res.status(400).json({ error }));
    } else if (req.body.like === 0) {
        // if the user removes his like or dislike, we check if he liked or disliked the sauce
        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                // if the user liked the sauce, we remove him from the usersLiked array
                if (sauce.usersLiked.includes(req.auth.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: -1 }, $pull: { usersLiked: req.auth.userId }})
                        .then(() => res.status(200).json({ message: 'Sauce unliked successfully !'}))
                        .catch(error => res.status(400).json({ error }));
                // if the user disliked the sauce, we remove him from the usersDisliked array
                } else if (sauce.usersDisliked.includes(req.auth.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.auth.userId }})
                        .then(() => res.status(200).json({ message: 'Sauce undisliked successfully !'}))
                        .catch(error => res.status(400).json({ error }));
                }
            })
            .catch(error => res.status(500).json({ error }));
    }
};