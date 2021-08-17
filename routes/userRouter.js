import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../util/midware.js';

const userRouter = express.Router();

// AUTH USER ROUTES

userRouter.post('/register', expressAsyncHandler(async(req, res) => {
    const user = new User({name: req.body.name, password: bcrypt.hashSync(req.body.password, 8)});
    const createdUser = await user.save()
    .catch(err => {
        res.status(401).send({
            success: false,
            err: err.message
        })
    });  // If user exists our default error sends code 500
    res.status(200).send({
        success: true,
        _id: createdUser._id,
        name: createdUser.name,
        token: generateToken(createdUser)
    });
}));

userRouter.post('/signin', expressAsyncHandler(async(req, res) => {
    if (!req.body.name || !req.body.password) {
        res.status(400).send({success: false, message: "Missing Username or Password"});
    } else {
        const user = await User.findOne({name: req.body.name});
        if (user) {
            if (bcrypt.compareSync(req.body.password, user.password)) {
                res.status(200).send({
                    success: true,
                    _id: user._id,
                    name: user.name,
                    token: generateToken(user),
                });
                return;
            } else {
                res.status(401).send({success: false, message: "Invalid Password"});
            }
        } else {
            res.status(401).send({success: false, message: "Invalid Username"});
        }
    }
}));

// Account management ROUTES

// Update name and/or password
userRouter.put("/:id", expressAsyncHandler(async (req, res) => {
    // If we were adding admin feature do || req.body.isAdmin
    if (req.body._id === req.params.id) {
        if (req.body.password) {
            try {
                req.body.password = bcrypt.hashSync(req.body.password, 8);
            } catch (err) {
                res.status(500).send({success: false, error: err});
                return;
            }
        }
        const user = await User.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }).catch(err => {
            res.status(500).send({success: false, error: err});
            return;
        })
        res.status(200).send({success: true, message: "User successfully updated"});
    } else {
        res.status(401).send({success: false, error: "You can only update your own account"});
    }
}));

// Delete single user
userRouter.delete("/:id", expressAsyncHandler(async (req, res) => {
    if (req.body._id === req.params.id) {
        await User.findByIdAndDelete(req.params.id)
            .catch(err => {
                res.status(500).send({success: false, error: err});
                return;
            })
        res.status(200).send({success: true, message: "Account has been deleted"});
    } else {
        res.status(401).send({success: false, error: "You can only delete your own account"});
    }
}));

// Clear user Collection (ONLY USED FOR UNIT TESTING)
userRouter.delete('/removeAll', expressAsyncHandler(async (req, res) => {
    await User.deleteMany({});
    res.status(200).send({success: true, message:"All users have been deleted"});
}));

// Get user
userRouter.get('/:id', expressAsyncHandler( async( req, res) => {
    const user = await User.findById(req.params.id)
        .catch(err => {
            res.status(500).send({success: false, error: err});
            return;
        });
        const {password, ...everythingElse} = user;  // Deconstruct user JSON to split password info from all other info, send this back
        res.status(200).send({success: true, message: everythingElse});
}));

// Follow user

userRouter.put('/:id/follow', expressAsyncHandler( async(req, res) => {
    if (req.body._id !== req.params.id) {
        try {  //Use try/catch here for clarity since potential errors on > 1 operation
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body._id);
            if (!user.followers.includes(req.body._id)) {
                // Update followers of target and following of current user
                await user.updateOne({ $push: { followers: req.body._id }});
                await currentUser.updateOne({ $push: {following: req.params.id }});
                res.status(200).send({success: true, message: "User successfully followed"})
            } else {
                res.status(403).send({success: false, error: "You already follow this user"});
            }
        } catch (err) {
            res.status(500).send({success: false, error: err});
        }
        
    } else {
        res.status(403).send({success: false, error: "You cannot follow yourself"});
    }
}));


// Unfollow user

userRouter.put('/:id/unfollow', expressAsyncHandler( async(req, res) => {
    if (req.body._id !== req.params.id) {
        try {  //Use try/catch here for clarity since potential errors on > 1 operation
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body._id);
            if (user.followers.includes(req.body._id)) {
                // Update followers of target and following of current user
                await user.updateOne({ $pull: { followers: req.body._id }});
                await currentUser.updateOne({ $pull: {following: req.params.id }});
                res.status(200).send({sucess: true, message: "User successfully unfollowed" });
            } else {
                res.status(403).send({success: false, error: "You don't follow this user"});
            }
        } catch (err) {
            res.status(500).send({success: false, error: err});
        }
        
    } else {
        res.status(403).send({success: false, error: "You cannot unfollow yourself"});
    }
}));

export default userRouter;