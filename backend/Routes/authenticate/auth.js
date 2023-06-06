const Router = require('express');
const userModel = require('../../database/schema/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

const routes = new Router();

routes.get('/', (req, res) => {
    res.send("Please change the route to login or register");
});

routes.post('/login', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = new userModel({
            name: req.body.userName,
            password: hashedPassword,
            email: req.body.email
        });

        const token = await jwt.sign({ id: user._id, name: user.name }, SECRET_KEY);

        const result = await user.save();

        res.json({ result, token });

    } catch (error) {
        res.json(error);
    }
})



module.exports = routes;
