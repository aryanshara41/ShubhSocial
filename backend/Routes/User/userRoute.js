const Router = require("express");
const userModel = require("../../database/schema/user");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const routes = new Router();
const SECRET_KEY = process.env.SECRET_KEY;

const makefriendMiddleware = async (req, res, next) => {
    // here I will get the token and then decrpt
    const user = await jwt.verify(req.headers.token, SECRET_KEY);
    req.senderId = user.id;
    next();
}

// get the user details
routes.get('/', makefriendMiddleware, async (req, res) => {
    try {
        console.log(req.query.id);
        // return res.status(200).json(req.query.id);
        const id = (req.query.id ? req.query.id : req.senderId);
        // userid will be in req.body.userId
        const user = await userModel.findById(id).lean();

        if (!user) {
            return res.status(200).json({ message: "User not found" });
        }

        // console.log(user.password);

        var admin = false;
        var requestStatus = 0;
        // 1-> request has been sent but not accepted
        // 2-> request has been sent and also accepted
        // 3-> request has not been send means they are not friends

        if (req.senderId === id) {
            // means this is the admin
            admin = true;
        }
        else {
            // means this is not the profile of the admin
            // check in the friends array if the user is friend or not 

            if (user.friends.filter((data) => data.userId == req.senderId).length) {
                // means it is in the friends list 
                requestStatus = 2;
            }
            else if (user.friendRequests.filter((data) => data.userId == req.senderId).length) {
                // means this user has sent the request but request has not been accepted yet 
                requestStatus = 1;
            }
            else requestStatus = 3;
        }


        res.status(200).json({ userId: user._id, userName: user.name, profilePic: user.profilePic, Address: user.Address, admin: admin, requestStatus: requestStatus });
    } catch (error) {
        console.log(error);
        res.json(error);
    }
});

// get the list of friends of the user
routes.get('/friends', makefriendMiddleware, async (req, res) => {
    try {
        const id = (req.query.id ? req.query.id : req.senderId);

        // now I will get the list of the friends

        const user = await userModel.findById(id).select({ friends: 1 });

        // return only friends array

        res.status(200).json(user.friends);

    } catch (error) {
        console.log(error);
        res.json(error);
    }
})

// get the list of friend request of the user
routes.get('/friendRequest', makefriendMiddleware, async (req, res) => {
    try {
        const id = (req.query.id ? req.query.id : req.senderId);

        // now I will get the list of the friends
        const user = await userModel.findById(id).select({ friendRequests: 1 });

        // return only friends array

        res.status(200).json(user.friendRequests);

    } catch (error) {
        console.log(error);
        res.json(error);
    }
})

// get the list of people with whom the user has done chat
routes.get('/chatpeople', makefriendMiddleware, async (req, res) => {
    try {
        const result = await userModel.findById(req.senderId).select({ _id: 0, chatPeople: 1 });
        const people = result.chatPeople;
        res.status(200).json(people);
    } catch (error) {
        console.log(error);
        res.json(error);
    }
});

// get the chat of the person with me 
routes.get('/chats/:userId', makefriendMiddleware, async (req, res) => {
    try {
        const result = await userModel.findById(req.senderId).select({ _id: 0, chats: 1 });

        const chats = result.chats;

        const data = (chats[req.params.userId] ? chats[req.params.userId] : []);

        res.status(200).json(data);

    } catch (error) {
        console.log(error);
        res.json(error);
    }
})


//search the users by search value
routes.get('/search/:value', async (req, res) => {
    try {
        console.log(req.params.value);
        const users = await userModel.find({
            name: { $regex: `${req.params.value}` }
        }).select({ name: 1, profilePic: 1 });

        res.status(200).json(users);

    } catch (error) {
        res.status(200).json(error);
    }
});


// make friend
// put request since we are modifying the existing data
routes.put('/makefriend', makefriendMiddleware, async (req, res) => {
    try {
        // sender is receiving the friend request of receiver
        // so pull the details of receiver who had sent the request to sender in past
        // now sender is receiving the request of the receiver so we have to remove it from friendRequest 
        // array
        const sender = req.senderId;
        const receiver = req.body.receiverId;

        await userModel.findByIdAndUpdate(sender, {
            $pull: {
                friendRequests: {
                    userId: receiver
                }
            }
        }, { new: true });

        // console.log(result);

        const senderData = await userModel.findById(sender);
        const receiverData = await userModel.findById(receiver);

        // now make both of them friend
        await userModel.findByIdAndUpdate(sender, {
            $push: {
                friends: {
                    userId: receiverData._id.toString(),
                    userName: receiverData.name,
                    image: receiverData.profilePic
                }
            }
        });

        await userModel.findByIdAndUpdate(receiver, {
            $push: {
                friends: {
                    userId: senderData._id.toString(),
                    userName: senderData.name,
                    image: senderData.profilePic
                }
            }
        });

        // return the data of the receiver

        res.status(200).json({
            userId: receiverData._id, userName: receiverData.name, image: receiverData.profilePic
        });

    } catch (error) {
        res.status(200).json({ message: 'Rejected' });
    }
});

// unfriend two users
routes.put('/unfriend', makefriendMiddleware, async (req, res) => {
    try {

        const firstUser = req.senderId;
        const secondUser = req.body.receiverId;

        console.log(firstUser, secondUser);

        // go to first user and remove the instance of the second user
        const firstResult = await userModel.findByIdAndUpdate(firstUser, {
            $pull: {
                friends: {
                    userId: secondUser
                }
            }
        }, { new: true });

        const secondResult = await userModel.findByIdAndUpdate(secondUser, {
            $pull: {
                friends: {
                    userId: firstUser
                }
            }
        }, { new: true });

        res.status(200).json({ firstResult, secondResult });
    } catch (error) {
        console.log(error);
        res.json(error);
    }
})

// unfriend two users
routes.delete('/unfriend', makefriendMiddleware, async (req, res) => {
    try {

        const first = await userModel.findByIdAndUpdate(req.senderId, {
            $pull: {
                friends: req.body.receiverId
            }
        });

        const second = await userModel.findByIdAndUpdate(req.body.receiverId, {
            $pull: {
                friends: req.senderId
            }
        });

        res.status(200).json({ first, second });

    } catch (error) {
        res.status(200).json(error);
    }
});

module.exports = routes;
