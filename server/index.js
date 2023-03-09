import express from "express"
import cors from "cors";
import mongoose from "mongoose";
import * as dotenv from 'dotenv'
import UserModel from "./models/User.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser";

const bcryptSalt = bcrypt.genSaltSync();
const jwtSecret = "fjoifj39fjd9sajf93";

dotenv.config()

const app = express();

const DB_URL = process.env.DB_URL;

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}));
const PORT = 3001;

await mongoose.connect(DB_URL)

app.get('/profile', (req, res) => {
    const {token} = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, data) => {
            if (err) throw err;
            const {name, email, _id} = await UserModel.findById(data.id)
            res.json({name, email, _id});
        });
    } else {
        res.json(null);
    }
})

app.post('/register', async (req, res) => {
    const {name, email, password} = req.body;
    try {
        const userDoc = await UserModel.create({
            name,
            email,
            password:bcrypt.hashSync(password, bcryptSalt)
        })
        res.status(200).json("User added to the database!");
    } catch(err) {
        res.status(422).json(e);
    }  
})

app.post('/login', async (req,res) => {
    const {email, password} = req.body;
    
    try {
        const userDoc = await UserModel.findOne({email})    
        if (userDoc) {
            const isCorrectPass = bcrypt.compareSync(password, userDoc.password)
            
            if(isCorrectPass) {
                jwt.sign({email: userDoc.email, id:userDoc._id}, jwtSecret, {}, function (err,token) {
                    if (err) { 
                        console.log(err);
                        res.status(500).json('Error has occured');
                        return;
                    }
                    res.cookie('token', token).json(userDoc)
                });
            }
            else {
                res.status(422).json('Password is incorrect')
            }
        }
        else {
            res.status(200).json('Not Found')
        }
    } catch(err) {
        
    }
})

app.post('/logout', (req, res)=> {
    res.cookie('token', '').json(true);
})

app.post('/upload-by-link', (req, res) => {
    const {link} = req.body;
})

app.listen(PORT);
console.log(`Listening on port ${PORT}`);