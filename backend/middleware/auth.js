const jwt = require('jsonwebtoken');

// check if the user is authenticated
module.exports = (req, res, next) => {
    try {
        // get the token from the request header
        const token = req.headers.authorization.split(' ')[1];
        // decode the token
        const decodedToken = jwt.verify(token, process.env.TOKEN);
        // get the user id from the decoded token
        const userId = decodedToken.userId;
        // if the user id exists, the user is authenticated
        req.auth = {
            userId: userId
        }
        next();
    } catch {
        // if the user id doesn't exist, the user is not authenticated
        res.status(401).json({error});
    }
}
