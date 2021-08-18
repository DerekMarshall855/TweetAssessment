import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Tweet from '../models/tweetModel.js';

const tweetRouter = express.Router();

// Create tweet
// If req.body contains parentId then it's a retweet
tweetRouter.post("/", expressAsyncHandler( async(req, res) => {
    const newTweet = new Tweet(req.body);
    const saveTweet = await newTweet.save()
        .catch(err => {
            res.status(500).send({success: false, error: err});
            return;
        });
    res.status(200).send({success: true, message: saveTweet});
}));

// Create subtweet (Cannot contain parentId)
tweetRouter.post("/subtweet/:id", expressAsyncHandler( async(req, res) => {
    if (req.body.parentId && req.body.parentId.length > 0) {
        res.status(403).send({success: false, error: "Cannot be both subtweet and retweet"});
    } else {
        // Find tweet we're subtweeting
        const currentTweet = await Tweet.findById(req.params.id)
            .catch(err => {
                res.status(500).send({success: false, error: err});
                return;
            });
        // Create new tweet body
        const newTweet = new Tweet(req.body);
        const saveTweet = await newTweet.save()
            .catch(err => {
                res.status(500).send({success: false, error: err});
                return;
            });
        const updatedTweet = await currentTweet.updateOne({
            $push : {subTweets: saveTweet._id}
        })
            .catch(err => {
                res.status(500).send({success: false, error: err});
                return;
            })
        res.status(200).send({success: true, message: "Subtweet successful"});
    }

}));

// Get posts

// GET tweet by Id (Works for getParentTweet too since theres max 1 parent tweet)

tweetRouter.get("/:id", expressAsyncHandler( async( req, res) => {
    const tweet = await Tweet.findById(req.params.id)
        .catch(err => {
            res.status(500).send({success: false, error: err});
            return;
        });
    res.status(200).send({success: true, message: tweet});
}));

// GET subTweets for loading comments (By tweetId)

tweetRouter.get("/comments/:id", expressAsyncHandler( async(req, res) => {
    try {
        const currentTweet = await Tweet.findById(req.params.id);
        const tweets = await Promise.all(
            currentTweet.subTweets.map(async (tweetId) => {
                return Tweet.findById(tweetId);
            })
        );
        res.status(200).send({success: true, message: tweets});
    } catch (err) {
        res.status(500).send({success: false, error: err});
    }
}));

// Get posts that user follows (timeline)

tweetRouter.get("/find/timeline", expressAsyncHandler( async(req, res) => {
    try {
        const currentUser = await User.findById(req.body.id);
        const tweets = await Tweet.findById({ userId: currentUser._id });
        const followingTweets = await Promise.all(  // Promise all takes list of promises and returns list of results
            currentUser.following.map(async (followId) => {  // use .map to loop through all userId in following array (followId), then create promise (Post.find) to fetch that users tweets
                return Tweet.find({ userId: followId });
            })
        );
        res.status(200).send({success: true, message: tweets.concat(...followingTweets)});
    } catch (err) {
        res.status(500).send({success: false, error: err});
    }
}));

// Update tweet

tweetRouter.put("/:id", expressAsyncHandler( async(req, res) => {
    const tweet = await Tweet.findById(req.params.id)
        .catch(err => {
            res.status(500).send({success: false, error: err});
            return;
        });
    if (tweet.userId === req.body.id) {
        await tweet.updateOne({ $set: req.body });
        res.status(200).send({success: true, message: "The tweet has been updated" });
    } else {
        res.status(401).send({success: false, error: "You can only update your own tweets" });
    }
}));

// Add UPDATE to add a subtweet (Comment should create own tweet then add that tweets ID to subTweets array)

// Delete tweet

// Clear tweet Collection (ONLY USED FOR UNIT TESTING)
tweetRouter.delete('/remove/all', expressAsyncHandler(async (req, res) => {
    await Tweet.deleteMany({});
    res.status(200).send({success: true, message:"All tweets have been deleted"});
}));

tweetRouter.delete("/:id", expressAsyncHandler( async(req, res) => {
    const tweet = await Tweet.findById(req.params.id)
        .catch(err => {
            res.status(500).send({success: false, error: err});
            return;
        });
    if (tweet.userId === req.body.id) {  // Again if admin feat added check || req.body.isAdmin
        await tweet.deleteOne();
        res.status(200).send({success: true, message: "The tweet has been deleted"});
    } else {
        res.status(401).send({success: false, error: "You can only delete your own tweets" });
    }
}));

// Like & Dislike tweet
// param.id == tweet Id, body.id == userId (user liking or unliking post)
tweetRouter.put("/like/:id", expressAsyncHandler( async(req, res) => {
    const tweet = await Tweet.findById(req.params.id)
        .catch(err => {
            res.status(500).send({success: false, error: err});
            return;
        });
    if (!tweet.likes.includes(req.body.id)) {  // Tweet not liked, add id to likes array
        await tweet.updateOne({ $push: { likes: req.body.id }});
        res.status(200).send({success: true, message: "Tweet has been liked"});
    } else {  // Tweet liked, remove id from likes array
        await tweet.updateOne({ $pull: { likes: req.body.id }});
        res.status(200).send({success: true, message: "Tweet has been unliked"});
    }
}));


export default tweetRouter;