const jwt = require('jsonwebtoken');
require("dotenv").config();


module.exports = (req, res, next) => {
    try {
        // Header data recovery
        const headers = req.rawHeaders;
        let token = "";

        // Retrieve the client token with the "Bearer" key
        for(const header of headers) {
            if(header.indexOf('Bearer') > -1) {
                token = header.split(' ')[1];
            }
        }
        
        // Retrieve the "userId" contained in the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const userId = decodedToken.userId;

        // Returns the "userId"
        req.auth = {
            userId: userId
        };

        next();
    }
    catch (error) {
        res.status(401).json({ error });
    }
}