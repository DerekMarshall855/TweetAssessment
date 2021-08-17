import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Tweet from '../models/tweetModel.js';

const tweetRouter = express.Router();

// Create tweet

tweetRouter.post("/", expressAsyncHandler( async(req, res) => {
    const newTweet = new Tweet(req.body);
    const saveTweet = newTweet.save()
        .catch(err => {
            res.status(500).send({success: false, error: err});
            return;
        });
    res.status(200).send({success: true, message: saveTweet});
}));

// Get posts

tweetRouter.get("/:id", expressAsyncHandler( async( req, res) => {
    // Do after (Very late) commit
}));

// Update tweet

tweetRouter.put("/:id", expressAsyncHandler( async(req, res) => {
    const tweet = await Tweet.findById(req.params.id)
        .catch(err => {
            res.status(500).send({success: false, error: err});
            return;
        });
    if (tweet.userId === req.body._id) {
        await tweet.updateOne({ $set: req.body });
        res.status(200).send({success: true, message: "The tweet has been updated" });
    } else {
        res.status(401).send({success: false, error: "You can only update your own tweets" });
    }
}));

// Delete tweet

tweetRouter.delete("/:id", expressAsyncHandler( async(req, res) => {
    const tweet = await Tweet.findById(req.params.id)
        .catch(err => {
            res.status(500).send({success: false, error: err});
            return;
        });
    if (tweet.userId === req.body._id) {  // Again if admin feat added check || req.body.isAdmin
        await tweet.deleteOne();
        res.status(200).send({success: true, message: "The tweet has been deleted"});
    } else {
        res.status(401).send({success: false, error: "You can only delete your own tweets" });
    }
}))

// Like & Dislike tweet

// Get posts that user follows (timeline)

export default tweetRouter;