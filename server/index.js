import express from "express"
import cors from "cors";
import mongoose from "mongoose";
import * as dotenv from 'dotenv'
import UserModel from "./models/User.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser";
import axios from "axios"
import { v4 as uuidv4 } from 'uuid';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer"
import PlaceModel from "./models/Place.js"
import BookingModel from "./models/Booking.js"

const bcryptSalt = bcrypt.genSaltSync();
const jwtSecret = "fjoifj39fjd9sajf93";

dotenv.config()

const app = express();

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const DB_URL = process.env.DB_URL;

app.use(express.json())
app.use(cookieParser())
/*
app.use(cors({
    credentials: true,
    origin: 'https://booker-frontend.onrender.com'
}));
*/
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}));
const PORT = 3001;

await mongoose.connect(DB_URL)

const client = new S3Client({
    region: 'us-east-1'
});

function BucketParams(key, body) {
    this.Bucket = "booker-images";
    this.Key = key;
    this.Body = body;
}

function fileExtensionChecker(name) {
    const extension = name.slice(name.indexOf('/')).replace('/', '.')
    return extension;
}

const uploadImage = async (name, buffer) => {
    const upload = new BucketParams(name, buffer);
    const command = new PutObjectCommand(upload);
    
    try {
        const data = await client.send(command);
        return data;  
    } catch (error) {
      // error handling.
      console.log(error);
    } 
}

const uploadMultipleImages = async (photos) => {
    var name = "";
    const photoLinks = []; 
    try {
        for(let i=0; i<photos.length; i++) {
            name = uuidv4() + fileExtensionChecker(photos[i].mimetype);
            await uploadImage(name, photos[i].buffer);
            photoLinks.push(process.env.AWS_IMAGE_PREFIX + name);
        } 
    } catch(e) {
        console.log(e);
        return "error";
    } finally {
        return photoLinks;
    }
}

async function downloadImageWithLink(url) {
    const response = await axios({
        url,
        method: "GET",
        responseType: "arraybuffer"
    })
    return response;
}

function getUserDataFromToken(req) {
    return new Promise((resolve, reject) => {
        jwt.verify(req.cookies.token, jwtSecret, {}, async (err, data) => {
            if (err) throw err;
            resolve(data) 
        });
    })
}

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
    const promise = downloadImageWithLink(link)
    var name = "";
    promise.then((response) => {
        const contentType = response.headers.getContentType();
        name = uuidv4() + fileExtensionChecker(contentType);
        const result = uploadImage(name, response.data);
        return result;
    }).then(() => {
        name = process.env.AWS_IMAGE_PREFIX + name;
        res.status(200).json({link: name})
    })
})

app.post('/upload', upload.array('photos', 10), (req, res) => {
    const result = uploadMultipleImages(req.files);
    result.then((response) => {
        if(result === "error") {
            res.status(400).json({message: "Error uploading the images"})
        }
        else {
            res.status(200).json({message: "Uploaded the images", links: response});
        }
    })
})

app.post('/places', (req, res) => {
    const {token} = req.cookies;
    const {
        title, address, addedPhotos, description,
        perks, extraInfo, checkIn, checkOut, maxGuests, price
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, data) => {
        if (err) throw err;
        const placeDoc = await PlaceModel.create({
            owner: data.id,
            title, address, photos:addedPhotos, description,
            perks, extraInfo, checkIn, checkOut, maxGuests, price
        })   
        res.json(placeDoc);
    });
})

app.get('/user-places', (req, res) => {
    const {token} = req.cookies;
    jwt.verify(token, jwtSecret, {}, async (err, data) => {
        const {id} = data;
        res.json( await PlaceModel.find({owner:id}) );
    })
})

app.get('/places', async (req, res) => {
    res.json(await PlaceModel.find());
})

app.put('/places', async (req, res) => {
    const {token} = req.cookies;
    const {
        id, title, address, addedPhotos, description,
        perks, extraInfo, checkIn, checkOut, maxGuests, price
    } = req.body;
    jwt.verify(token, jwtSecret, {}, async (err, data) => {
        if (err) throw err;
        const placeDoc = await PlaceModel.findById(id);
        if (data.id === placeDoc.owner.toString()) {
            placeDoc.set({
                maxGuests, title, address, photos:addedPhotos, description,
                perks, extraInfo, checkIn, checkOut, price
            })
            await placeDoc.save();
            res.json('saved');
        }
    })
})

app.get('/places/:id', async (req, res) => {
    const {id} = req.params;
    res.json(await PlaceModel.findById(id));
})

app.post('/bookings', async (req, res) => {
    const userData = await getUserDataFromToken(req);
    
    const {checkIn, checkOut, place, numberOfGuests, name, phone, price} = req.body;
    BookingModel.create({
        place, checkIn, checkOut, numberOfGuests, name, phone, price, user: userData.id
    }).then((doc) => {
        res.status(200).json(doc);
    }).catch((err) => {
        throw err;
    })
})

app.get('/bookings', async (req, res) => {
    const userData = await getUserDataFromToken(req);
    res.json(await BookingModel.find({user: userData.id}).populate('place'))
})

app.listen(PORT);
console.log(`Listening on port ${PORT}`);