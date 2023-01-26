// schema de sauce.js requis
const Sauce = require('../models/sauce');
// importation du package file system afin de modifier le système de fichiers
const fs = require('fs');
const sauce = require('../models/sauce');

/////////////////////////////////// fonction pour créer une sauce ///////////////////////////////////
exports.createSauce = (req, res, next) => {
// transformer la requête envoyée par le frontend en JSON
const sauceObject = JSON.parse(req.body.sauce);
// supprimer l'id mongoose généré par défaut
delete sauceObject._id;
// création du nouvel objet
const sauce = new Sauce({
  // récupération du corps de la requête
  ...sauceObject,
  // modification de l'url de l'image
  imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
  likes: 0,
  dislikes: 0,
  usersLiked: [],
  usersdisLiked: [],
});
// sauvegarde du nouvel objet dans la base de donnée
sauce.save()
// si aucune erreur répond 201 created et un message
  .then(() => res.status(201).json({ message: 'Article enregistrée !' }))
// si erreur répond une erreur 400 et un message d'erreur
  .catch((error) => {res.status(400).json({ error: error })})
};

/////////////////////////////////// fonction pour récupérer toutes les sauces dans la base de donnée ///////////////////////////////////
exports.getAllSauces = (req, res, next) => {
  // utilisation de find() pour trouver les sauces dans la base de donnée, tableau des sauces et réponse 200 si aucune erreur
  Sauce.find()
  .then((sauces) => {res.status(200).json(sauces)})
  // sinon répond une erreur 400
  .catch((error) => {res.status(400).json({ error: error })})
};

/////////////////////////////////// fonction pour récupérer une sauce avec son id dans la base de donnée ///////////////////////////////////
exports.getOneSauce = (req, res, next) => {
  // récupère l'objet avec ses données
  Sauce.findOne({_id: req.params.id})
  // si aucune erreur répond un 200 et l'objet
  .then((sauce) => {res.status(200).json(sauce)})
  // si erreur répond 404 not found
  .catch( (error) => {res.status(404).json({ error: error })})
};

/////////////////////////////////// fonction pour modifier une sauce dans la base de donnée ///////////////////////////////////
exports.modifySauce = (req, res, next) => {
  if (req.file) {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      // récupération du deuxième élément du tableau constitué du avant/après '/images/' donc le après
    const filename = sauce.imageUrl.split('/images/')[1];
    // supprime le après '/images/' et début du callback
    console.log(sauce.imageUrl);
    fs.unlink(`images/${filename}`, () => console.log('Image supprimée !'))
    })
  }
  // vérifie si l'objet existe
  const sauceObject = req.file ? {
    // récupération du corps de la requête
    ...JSON.parse(req.body.sauce),
    
    // traitement de la nouvelle image
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` }
  // sinon on modifie juste le corps de la requête
  : { ...req.body }
  // modification de la sauce dans la base de donnée
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
  // réponse 200 + message si aucune erreur
  .then(() => res.status(200).json({ message: 'Article modifiée !'}))
  // réponse 400 + message si erreur
  .catch(error => res.status(400).json({ error: error }));
};

/////////////////////////////////// fonction pour supprimer une sauce dans la base de donnée ///////////////////////////////////
exports.deleteOneSauce = (req, res, next) => {
// récupère l'objet avec ses données
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => {
    // récupération du deuxième élément du tableau constitué du avant/après '/images/' donc le après
    const filename = sauce.imageUrl.split('/images/')[1];
    // supprime le après '/images/' et début du callback
    console.log(sauce.imageUrl);
    fs.unlink(`images/${filename}`, () => {
      // supprime la sauce de la base de donnée
      Sauce.deleteOne({ _id: req.params.id })
      // réponse 200 + message si aucune erreur
      .then(() => res.status(200).json({ message: 'Article supprimé !'}))
      // réponse 400 + message si erreur
      .catch(error => res.status(400).json({ error: error }))
    })
  })
// réponse 500 + message si erreur
.catch(error => res.status(500).json({ error: error }));};


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

/*
const Sauce = require('../models/Sauce');
const fs = require('fs');


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
        res.status(403).json({ message : '403: unauthorized request' });
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
            res.status(403).json({ message: '403: unauthorized request' });
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
            res.status(403).json({ message: '403: unauthorized request' });
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
        res.status(403).json({ message: '403: unauthorized request'})
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
                res.status(200).json({ message: 'Like Updated'});
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
*/