import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Message from '../models/messageModel.js';
import Chat from '../models/chatModel.js';

const messageRouter = express.Router();

// Add message to chat
// Add check to see if chatId exists or not (Check on post, err throws on get if it doesnt exists)
// Import Chat schema => Chat.findById(chatId) => Yes | No

messageRouter.post("/", expressAsyncHandler(async(req, res) => {
    const chat = await Chat.findById(req.body.chatId)
        .catch(err => {
            res.status(500).send({
                success: false,
                error: err
            });
        });
    const newMessage = new Message({
        chatId: req.body.chatId,
        sender: req.body.sender,
        text: req.body.text
    });
    const createdMessage = newMessage.save()
        .catch(err => {
            res.status(500).send({
                success: false,
                error: err.message
            })
        });
    // socket.emit message here to send message to people in chat
    // Saves correctly but postman (MongoDB Compass) -> Only sends success: true back to Postman
    res.status(200).send({
        success: true,
        _id: createdMessage._id,
        chatId: createdMessage.chatId,
        sender: createdMessage.sender,
        text: createdMessage.text
    });  // Probably dont want to send entire text everytime, good for non complete app/testing tho
    
    
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
    // Dont throw error for empty messages (May be empty chat)
    // Likely used for fetching chat on frontend, -> Don't need to emit entire allMessages
    res.status(200).send({
        success: true,
        messages: allMessages
    });
}));

// Clear message Collection (ONLY USED FOR UNIT TESTING)
messageRouter.delete('/remove/all', expressAsyncHandler(async (req, res) => {
    await Message.deleteMany({});
    res.status(200).send({success: true, message:"All messages have been deleted"});
}));

export default messageRouter;