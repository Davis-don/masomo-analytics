import jwt from "jsonwebtoken";

const jwtMiddleware = (req, res, next) => {
  const authToken = req.headers["authorization"];
  if (!authToken) {
    return res.status(401).json({ message: 'Token missing. Unauthorized' });
  }

  jwt.verify(authToken, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
        console.log(err.message)
      return res.status(403).json({ message: err.message });
    }
  
   
    req.userId = decoded.id; 

    next();
  });
};

export default jwtMiddleware;