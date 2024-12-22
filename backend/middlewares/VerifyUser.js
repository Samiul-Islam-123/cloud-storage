const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    //token from headers
    const token = req.headers['authorization']?.split(' ')[1]//Bearer token

    if (!token)
        return res.status(401).json
            ({
                message: "No token provided"
            })

    try{
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        req.user = decoded;
        next();
    }
    catch(error){
        return res.json({
            success : false,
            message : "Invalid token. Access denined"
        })
    }
}

module.exports = verifyToken;