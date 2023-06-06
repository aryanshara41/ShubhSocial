const userModel = require("../database/schema/user");

const sendFriendRequest = async (sender, receiver) => {
    try {
        // store senderId, senderName, senderProfilePic
        const senderData = await userModel.findById(sender);

        await userModel.findByIdAndUpdate(receiver, {
            $push: {
                friendRequests: { userId: sender, userName: senderData.name, image: senderData.profilePic }
            }
        });
        return "The request has been send";
    } catch (error) {
        return "Something error occured";
    }
}

// function to store the chat
const storeMessages = async (sender, receiver, message) => {
    try {
        const senderData = await userModel.findById(sender).select({ profilePic: 1, _id: 0, name: 1 });
        const receiverData = await userModel.findById(receiver).select({ profilePic: 1, _id: 0, name: 1 });

        // store this message to sender and receiver
        const first = await userModel.findByIdAndUpdate(sender, {
            $addToSet: {
                chatPeople: {
                    userName: receiverData.name,
                    userId: receiver,
                    image: receiverData.profilePic
                }
            },
            $push: {
                [`chats.${receiver}`]: {
                    message: message,
                    send: true,
                    date: new Date().toISOString()
                }
            }
        });

        const second = await userModel.findByIdAndUpdate(receiver, {
            $addToSet: {
                chatPeople: {
                    userName: senderData.name,
                    userId: sender,
                    image: senderData.profilePic
                }
            },
            $push: {
                [`chats.${sender}`]: {
                    message: message,
                    send: false,
                    date: new Date().toISOString()
                }
            },
        },
            {
                upsert: true   // options
            },
        );

        return "The message has been successfully stored";
    } catch (error) {
        console.log(error);
        return "Some error occured while storing the message";
    }
}

module.exports = {
    storeMessages,
    sendFriendRequest
}