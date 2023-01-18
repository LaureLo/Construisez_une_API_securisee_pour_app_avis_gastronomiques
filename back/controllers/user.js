const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('password-validator');

require("dotenv").config();

var schemaPassword = new validator();

// Check if the password is valid
function checkPassWord(password) {
    const valid = false;

    schemaPassword.is().min(4);

    schemaPassword
    .is().min(8)
    .is().max(30)  
    .has().digits(1)
    .has().uppercase()
    .has().lowercase()    
    .has().not().spaces();

    return schemaPassword.validate(password);
}

// Create a new user in the database
module.exports.signup = (req, res, next) => {
    const password = req.body.password;
    const email = req.body.email;
    const emailValidator = /^\w+([\._]?\w)*\w@+([\._]?\w)*\.(\w{2,3})+$/;

    if (!checkPassWord(password)) {
        console.log('mot de passe invalide');
        res.status(400).json({ message: 'Mot de passe invalide! Le mot de passe comprend entre 8 et 30 caractères, au minimum 1 chiffre, 1 majuscule, 1 minuscule et sans espace' });
    }
    else if (!email.match(emailValidator)) {
        console.log('email invalide');
        res.status(400).json({ message: 'Email invalide, veuillez saisir une adresse email valide' });
    }
    else {
        // password hash with a salt of 10
        bcrypt.hash(password, 10)
        .then(hash => {
            // User creation
            const user = new User({
                email: req.body.email,
                password: hash
            })
    
            // User registration in the database
            user.save()
            .then(() => {
                res.status(201).json({ message: 'Utilisateur créé' });
            })
            .catch(error => {
                res.status(500).json({error});
            })
        })
        .catch(error => {
            res.status(500).json({ error });
        });
    }
}

// Connects the user by creating an access token
module.exports.login = (req, res, next) => {
    // Find the user in the database using his email
    User.findOne({email: req.body.email})
    .then(user => {
        if (user === null) {
            res.status(401).json({error : 'Paire identifiant/mot de passe incorrecte'});
        }
        else {
            // Compare the sent password with the hashed password
            bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if (!valid) {
                    res.status(401).json({message: 'Paire identifiant/mot de passe incorrecte'});
                }
                else {
                    res.status(200).json({
                        userId: user._id,
                        // Creation of an access token
                        token: jwt.sign(
                            {userId: user._id}, 
                            process.env.JWT_SECRET_KEY, 
                            {expiresIn: '24h'}
                        )
                    })
                }
            })
            .catch(error => res.status(500).json({error}));
        }
    })
    .catch(error => res.statut(500).json({error}));
}