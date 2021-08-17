import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const generateToken = (user) => {
    return jwt.sign(
        {
            _id: user._id,
            name: user.name,
        }, process.env.JWT_SECRET || 'supersecretmessage', {
            expiresIn: '30d',
        }
    );
};

export const isAuth = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (authorization) {
      const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
      jwt.verify(
        token,
        process.env.JWT_SECRET || 'supersecretmessage',
        (err, decode) => {
          if (err) {
            res.status(401).send({ message: 'Invalid Token' });
          } else {
            req.user = decode;
            next();
          }
        }
      );
    } else {
      res.status(401).send({ message: 'No Token' });
    }
  };