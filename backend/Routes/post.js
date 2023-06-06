const { Router } = require("express");
const userModel = require('../database/schema/user');
const postModel = require('../database/schema/post');
const jwt = require("jsonwebtoken");
const commentModel = require("../database/schema/comment");
const multer = require('multer');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const routes = new Router();
const SECRET_KEY = process.env.SECRET_KEY;

const postMiddleWare = (req, res, next) => {
    const user = jwt.verify(req.headers.token, SECRET_KEY);
    req.senderId = user.id;
    next();
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images')
    },
    filename: function (req, file, cb) {
        console.log(file.mimetype);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + ".png");
    }
})

const multerFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[1] === "png" || file.mimetype.split("/")[1] === "jpeg" || file.mimetype.split("/")[1] === "jpg") {
        cb(null, true);
    } else {
        cb(new Error("Not a PDF File!!"), false);
    }
};


const upload = multer({ storage: storage, fileFilter: multerFilter });


// get an image of the post
routes.get('/images/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    const readStream = fs.createReadStream(`images/${imageName}.png`);
    readStream.pipe(res);
});

// get all the post of the user and friends of the user
routes.get('/', postMiddleWare, async (req, res) => {
    try {
        console.log("Fetching the posts");
        if (req.query.id === undefined) req.query.id = req.senderId;

        // return res.status(200).json(req.query.id);

        // find the user
        const user = await userModel.findById(req.query.id);
        // find the posts of the user
        var userPosts = await postModel.find({ authorId: req.query.id }).select({
            authorId: 1, authorName: 1, textMessage: 1, image: 1, numberOfLikes: 1, numberOfComments: 1,
            createdAt: 1
        }).sort({ createdAt: -1 }).lean();

        // get the posts of the user's friends
        const friendsPosts = await Promise.all(
            user.friends.map(async (friend) => {
                console.log(friend);
                return await postModel.find({ authorId: friend.userId }).select({
                    authorId: 1, authorName: 1, textMessage: 1, image: 1, numberOfLikes: 1, numberOfComments: 1,
                    createdAt: 1
                }).sort({ createdAt: -1 }).lean()
            })
        );

        // console.log(friendsPosts);
        // if (friendsPosts.length) userPosts = [...userPosts, ...friendsPosts[0]];

        // go to each array
        friendsPosts.forEach((post) => {
            userPosts = [...userPosts, ...post];
        })

        userPosts.sort((first, second) => {
            if (first.createdAt >= second.createdAt) return -1;
            else return 1;
        });

        // for each post add an attiribute canDelete
        userPosts.forEach((post) => {
            if (post.authorId === req.senderId) post.canDelete = true;
            else post.canDelete = false;
        })

        res.status(200).json(userPosts);

    } catch (error) {
        console.log("Error occured during the fetching of the posts");
        res.status(200).json(error);
    }
})


// insert the post
routes.post('/', [upload.single('image'), postMiddleWare], async (req, res) => {
    try {
        // first create the text object
        const imageName = req.file.filename;
        const imageOriginalName = imageName.split('.')[0];

        // also store the name of the authorId
        const user = await userModel.findById(req.senderId);

        if (!user) return res.status(200).json({ message: "No such user found" });

        const newpost = new postModel({
            authorId: req.senderId,
            authorName: user.name,
            textMessage: req.body.text,
            image: imageOriginalName
        });

        const result = await newpost.save(); // return this result

        // now insert the id of the post to the user model
        const userResult = await userModel.findByIdAndUpdate(req.senderId, {
            $push: {
                posts: result._id.toString()
            }
        }, { new: true });

        const postResult = await postModel.findById(result._id).select({
            authorId: 1, authorName: 1, textMessage: 1, image: 1, numberOfLikes: 1, numberOfComments: 1,
            createdAt: 1
        })

        res.status(200).json(postResult);
    } catch (error) {
        res.status(400).json("Some error occured");
    }
})


// delete the post
routes.delete('/', postMiddleWare, async (req, res) => {
    try {
        const postId = req.headers.postid;
        console.log(postId);
        // delete the post from post database and user post array
        const postData = await postModel.findByIdAndDelete(postId);
        if (!postData) return res.status(200).json("No such post found");
        // now we have delete the post and we have data about the post comments

        // first delete all the comments of the post from commentModel
        new Promise(
            postData.comments.forEach(async (comment) => {
                // delete this comment
                const result = await commentModel.findByIdAndDelete(comment);
                console.log(result);
            })
        );

        // now remove the post id from the user database
        const second = await userModel.findByIdAndUpdate(req.senderId, {
            $pull: {
                posts: postId
            }
        });

        res.status(200).json({ message: "Succesfully deleted" });

    } catch (error) {
        console.log(error);
        res.json(error);
    }
})

// it will return the comments of the post in fixed sizes
routes.get('/comment/:postId', postMiddleWare, async (req, res) => {
    try {

        const skip = parseInt(req.query.page) * 5; // skip this much number of elements from begin
        console.log("Number of skip: ", skip);

        // const result = await postModel.findById(req.params.postId).slice("comments", 1).select({ comments: 1, _id : 0 });
        const result = await postModel.findOne({ _id: req.params.postId }).select({
            _id: 1,
            comments: { "$slice": [skip, 5] },
        });

        // now traverse throught the comments array and then find all the comments
        // const commentsData = []; // It will store commens with canDelete key

        const commentsData = await Promise.all(
            result.comments.map(async (commentId) => {
                const data = await commentModel.findById(commentId).select({ updatedAt: 0, __v: 0 }).lean();
                if (data.authorId === req.senderId) data["canDelete"] = true;
                else data.canDelete = false;
                console.log(data.canDelete, data);
                return data;
            })
        );

        res.status(200).json(commentsData);
    } catch (error) {
        res.status(200).json("Some error occured");
    }
})


// add comment on the post
routes.post('/comment/:postId', postMiddleWare, async (req, res) => {
    try {

        const user = await userModel.findById(req.senderId);

        if (!user) res.status(200).json({ message: "No user found" });

        // create a new comment
        const newcomment = await commentModel({
            authorId: req.senderId,
            authorName: user.name,
            authorImage: user.profilePic,
            text: req.body.comment
        });

        const result = await newcomment.save();

        const data = await commentModel.findById(result._id).lean();

        data.canDelete = true;

        console.log(result);

        // now save the comment id to post and increase the comment count 
        const updatedPost = await postModel.findByIdAndUpdate(req.params.postId, {
            $push: {
                comments: result._id.toString()
            },
            $inc: {
                numberOfComments: 1
            }
        });


        res.status(200).json(data);

    } catch (error) {
        res.status(400).json(error);
    }
});

// delete comment from the post
routes.delete('/comment', postMiddleWare, async (req, res) => {
    try {
        const commentId = req.headers.commentid;
        const postId = req.headers.postid;
        // first delete the comment from the comment model
        const deleteComment = await commentModel.findByIdAndDelete(commentId);

        // now delete this comment from post array 
        const updatedPost = await postModel.findByIdAndUpdate(postId, {
            $pull: {
                comments: commentId
            },
            $inc: {
                numberOfComments: -1
            }
        });

        res.status(200).json("Succesfully deleted");

    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
})

// get if the user has liked the post or not 
routes.get('/like/:postId', postMiddleWare, async (req, res) => {
    try {

        const post = await postModel.find({ _id: req.params.postId, likes: req.senderId });

        var liked = false;
        if (post.length) liked = true;
        res.status(200).json({ liked: liked });

    } catch (error) {
        res.status(200).json({ liked: false });
        console.log("some error occured while fetching the if the user has liked");
    }
})

// like the post ( increase like count )
routes.put('/like', postMiddleWare, async (req, res) => {
    try {
        console.log("The id of the post that is to be likes is: ", req.body.postId);
        const modifiedPost = await postModel.findByIdAndUpdate(req.body.postId, {
            $push: {
                likes: req.senderId
            },
            $inc: {
                numberOfLikes: 1
            }
        }, { new: true });

        res.status(200).json(modifiedPost);

    } catch (error) {
        console.log("Some error occured during like");
        res.status(200).json(error);
    }
});

// dislike the post ( increase like count )
routes.put('/dislike', postMiddleWare, async (req, res) => {
    try {

        const modifiedPost = await postModel.findByIdAndUpdate(req.body.postId, {
            $pull: {
                likes: req.senderId
            },
            $inc: {
                numberOfLikes: -1
            }
        }, { new: true });

        res.status(200).json(modifiedPost);

    } catch (error) {
        console.log("Some error occured during like");
        res.status(200).json(error);
    }
});

module.exports = routes;