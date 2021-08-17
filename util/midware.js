import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Generates token for user
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

/*
Can be used on path to check if user is authorized (middleware)
-------------------------------
Backend Use case:
userRouter.get("/:id", isAuth, expressAsyncHandler( async(req, res) => {}));
^ Adding isAuth middleware means this path is only accessible to users with valid token ^
-------------------------------
Frontend Use case:
const { data } = await axios.get(`https://localhost:5000/api/users/${userId}`,{
            headers: { Authorization: `Bearer ${userInfo.token}`},
        });
^ Pass in headers with auth token on backend fetch requests that use isAuth middleware ^
*/
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