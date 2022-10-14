const jwt = require('jsonwebtoken');

// check if the user is authenticated
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')('_')[1];
        const decodedToken = jwt.verify(token, process.env.TOKEN);
        const userId = decodedToken.userId;
        req.auth = {
            userId: userId
        }
        next();
    } catch {
        res.status(401).json({error});
    }
}