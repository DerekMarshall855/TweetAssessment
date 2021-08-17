import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Message from '../models/messageModel.js';

const messageRouter = express.Router();

// Add message to chat
// Add check to see if chatId exists or not (Check on post, err throws on get if it doesnt exists)
// Import Chat schema => Chat.findById(chatId) => Yes | No

messageRouter.post("/", expressAsyncHandler(async(req, res) => {
    const newMessage = new Message({
        chatId: req.body.chatId,
        sender: req.body.sender,
        text: req.body.text
    });
    const createdMessage = newMessage.save()
        .catch(err => {
            res.status(401).send({
                success: false,
                err: err.message
            })
        });
    //Saves correctly but postman (MongoDB Compass) -> Only sends success: true back to Postman
    res.status(200).send({
        success: true,
        _id: createdMessage._id,
        chatId: createdMessage.chatId,
        sender: createdMessage.sender,
        text: createdMessage.text
    });  // Probably dont want to send entire text everytime, good for non business app tho
    
}));

// Get messages from chatId

messageRouter.get("/:chatId", expressAsyncHandler(async(req, res) => {
    const allMessages = await Message.find({
        chatId: req.params.chatId
    }).catch(err => {
        res.status(500).send({
            success: false,
            error: err
        });
    });
    if (allMessages) {
        res.status(200).send({
            success: true,
            messages: allMessages
        })
    } else {
        res.status(401).send({
            success: false,
            error: `There are no chats with the given id: ${req.params.chatId}`
        });
    }
}));


export default messageRouter;