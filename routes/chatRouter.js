import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Chat from '../models/chatModel.js';

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
    res.status(200).send({
        success: true,
        _id: createdChat._id,
        members: createdChat.members
    });
}));

// Get chat by User ID
chatRouter.get("/:id", expressAsyncHandler(async(req, res) => {
    const conversation = await Chat.find({
        members: { $in:[req.params.id] }
    }).catch(err => {
        res.status(500).send({
            success: false,
            error: err
        });
    });
    if (conversation) {
        res.status(200).send({
            success: true,
            conversations: conversation
        });
    } else {
        res.status(401).send({
            success: false,
            err: `User with id: ${req.params.id} is not in any chats`
        });
    }
}))

export default chatRouter;