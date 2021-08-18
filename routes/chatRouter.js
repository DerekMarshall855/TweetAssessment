import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Chat from '../models/chatModel.js';
import User from '../models/userModel.js';

const chatRouter = express.Router();

// Create new chat
chatRouter.post("/", expressAsyncHandler(async(req, res) => {
    const newChat = new Chat({
        members: [req.body.senderId, req.body.receiverId]
    });
    const createdChat = await newChat.save()
    .catch(err => {
        res.status(500).send({
            success: false,
            err: err.message
        })
    }); 
    // socket.emit newChat here to put message "Chat has been created!" into frontend UI
    res.status(200).send({
        success: true,
        _id: createdChat._id,
        members: createdChat.members
    });
}));

// Add and Remove user to chat by chatId
chatRouter.put("/add/:id", expressAsyncHandler(async(req, res) => {
    const user = await User.findById(req.body._id)  // Crashes on user doesnt exist
        .catch(err => {
            res.status(500).send({
                success: false,
                error: err
            });
        });
    const chat = await Chat.findByIdAndUpdate(req.params.id, {  // Crashes on chat doesnt exist
        $push: { members: req.body._id }
    })
        .catch(err => {
            res.status(500).send({
                success: false,
                error: err
            });
        });
    // Socket emit here to say "User has joined the chat!"
    res.status(200).send({
        success: true,
        message: "User successfully added"
    });

}));

// Add user to chat by chatId
chatRouter.put("/remove/:id", expressAsyncHandler(async(req, res) => {
    const user = await User.findById(req.body._id)  // Crashes on user doesnt exist
        .catch(err => {
            res.status(500).send({
                success: false,
                error: err
            });
        });
    const chat = await Chat.findByIdAndUpdate(req.params.id, {  // Crashes on chat doesnt exist
        $pull: { members: req.body._id }
    })
        .catch(err => {
            res.status(500).send({
                success: false,
                error: err
            });
        });
    // Socket emit here to say "User has left the chat!"
    res.status(200).send({
        success: true,
        message: "User successfully removed"
    });

}));

// Get all chats by User ID
chatRouter.get("/:id", expressAsyncHandler(async(req, res) => {
    const chat = await Chat.find({
        members: { $in:[req.params.id] }
    }).catch(err => {
        res.status(500).send({
            success: false,
            error: err
        });
    });
    if (chat) {
        res.status(200).send({
            success: true,
            chats: chat
        });
    } else {
        res.status(401).send({
            success: false,
            error: `User with id: ${req.params.id} is not in any chats`
        });
    }
}));

export default chatRouter;