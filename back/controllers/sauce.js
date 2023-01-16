const Sauce = require('../models/Sauce');
const fs = require('fs');
const path = require('path');
const { resourceLimits } = require('worker_threads');

// Find all sauces
module.exports.findAllSauces = (req, res, next) => {
    // Search all sauces in the database
    Sauce.find()
    .then(sauces => {
        res.status(200).json(sauces);
    })
    .catch(error => {
        res.status(500).json({ error });
    });
}

// Find a sauce using its identifier
module.exports.findOneSauce = (req, res, next) => {
    const sauceId = req.params.id;

    // Search the sauce in the database using its identifier
    Sauce.findOne({ _id: sauceId })
    .then(sauce => {
        res.status(200).json(sauce);
    })
    .catch(error => {
        res.status(500).json({ error });
    })
}

// Create a new sauce
module.exports.createSauce = (req, res, next) => {
    const reqSauce = JSON.parse(req.body.sauce);    

    const userId = req.auth.userId;
    const imageUrl = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;

    if (reqSauce.userId !== userId) {
        res.status(403).json({ message : 'Forbidden' });
    }
    else {
        delete reqSauce.userId;

        // Create a new sauce with master data
        const sauce = new Sauce({
            ...reqSauce,
            userId: userId,
            imageUrl: imageUrl,
            likes: 0,
            dislikes : 0,
            usersLiked: [],
            usersDisliked : []
        });

        // Register a new 'sauce' resource in the database
        sauce.save()
        .then(() => {
            res.status(201).json({ message: 'Sauce created!' })
        })
        .catch(error => {
            res.status(400).json({ error })
        });
    }
}

// Modify a sauce
module.exports.modifySauce = (req, res, next) => {
    // Create a sauce object with the elements to modify
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject.userId;

    // Find the sauce to modify in the database
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        const userId = req.auth.userId;

        // Verify user identity
        if ( userId !== sauce.userId) {
            res.status(403).json({ message: 'Forbidden' });
        }
        else {
            // Delete the old image if it has been replaced
            if (req.file) {
                const filename = sauce.imageUrl.split('/images/')[1];

                fs.unlink(`images/${filename}`, () => {
                    updateSauce(res, sauceObject, req.params.id);
                });
            }
            else {                
                updateSauce(res, sauceObject, req.params.id);
            }
        }
    })
    .catch(error => {
        req.status(500).json({ error });
    });
}

// Update of the sauce in the database
function updateSauce(res, sauceObject, sauceId) {
    Sauce.updateOne({ _id: sauceId }, { ...sauceObject, _id:sauceId })
    .then(() => {
        res.status(200).json({ message : "Updated" });
    })
    .catch(error => {
        res.status(500).json({ error });
    })
}

// Delete a sauce using its id
module.exports.deleteSauce = (req, res, next) => {
    const sauceId = req.params.id;

    // Find the sauce to clear
    Sauce.findOne({ _id: sauceId })
    .then(sauce => {
        userId = req.auth.userId;

        // Verify user identity
        if (sauce.userId !== userId) {
            res.status(403).json({ message: 'Forbidden' });
        }
        else {            
            const filename = sauce.imageUrl.split('/images/')[1];

            // Clear Sauce Image
            fs.unlink(`images/${filename}`, () => {
                // Delete sauce from database
                Sauce.deleteOne({ _is: sauceId })
                .then(() => {
                    res.status(200).json({ message : "Sauce deleted" })
                })
                .catch(error => {
                    res.status(500).json({ error });
                }); 
            });
        }
    })
    .catch(error => {
        res.status(500).json({ error });
    })
}

// Edit the likes of a sauce
module.exports.modifyLike = (req, res, next) => {   
    const user = {...req.body};    

    // Verify user identity
    if (user.userId !== req.auth.userId) {
        res.status(403).json({ message: 'Not Authorized!'})
    }
    else {
        const sauceId = req.params.id;

        // Find the sauce to modify
        Sauce.findOne({ _id: sauceId })
        .then(sauce => {
            const sauceLikes = {
                likes: sauce.likes,
                dislikes: sauce.dislikes,
                usersLiked: sauce.usersLiked,
                usersDisliked: sauce.usersDisliked
            };

            const updatedSauceLikes = updateSauceLikes(sauceLikes, user);

            // Update the sauce in the database
            Sauce.updateOne({ _id: sauceId }, {...updatedSauceLikes, _id: sauceId})
            .then(() => {
                res.status(200).json({ message: 'Liked Updated'});
            })
            .catch(error => {
                console.log('error' , error)
                res.status(500).json({ error });
            });
        })
        .catch(error => {
            res.status(500).json({ error });
        })
    }    
}

// Updates sauce item likes
function updateSauceLikes(sauceLikes, user) {
    switch (user.like) {
        // If the user removes a like or a dislike
        case 0:
            if (isUserPresent(sauceLikes.usersLiked, user.userId)) {
                sauceLikes.likes -= 1;      
                // Remove the user from the list                     
                sauceLikes.usersLiked = sauceLikes.usersLiked.filter(id => id != user.userId);
            }
            else if (isUserPresent(sauceLikes.usersDisliked, user.userId)) {
                sauceLikes.dislikes -= 1;    
                // Remove the user from the list          
                sauceLikes.usersDisliked = sauceLikes.usersDisliked.filter(id => id != user.userId);
            }
            break;
        case 1:
            if (!isUserPresent(sauceLikes.usersLiked, user.userId)) {
                sauceLikes.likes += 1;
                // Add the user to the like list
                sauceLikes.usersLiked.push(user.userId); 
            }            
            break;
        case -1:            
            
            if (!isUserPresent(sauceLikes.usersDisliked, user.userId)) {
                sauceLikes.dislikes += 1;
                // Add the user to the dislike list
                sauceLikes.usersDisliked.push(user.userId);  
            }  
            break;       
    }     

    return sauceLikes;
}

// Check if the user is present in the "users" list
function isUserPresent(users, curentUserId) {
    if (!users.length) {        
        return false;
    }
    else if (users.find(userId => userId === curentUserId)) {
        return true
    }
    return false;
}