const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User.js');
const Event = require('./models/Event.js');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

require('dotenv').config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
}));

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer with Cloudinary storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'crowdfunding-events', // Folder name in Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 800, height: 600, crop: 'limit' }], // Resize images
    },
});

// Multer configuration with file size and count limits
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
        files: 5, // Maximum 5 files
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
        }
    },
});

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = process.env.JWT_SECRET;

const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    throw new Error('MONGO_URI environment variable is not defined');
}
mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Utility function to get user data from request token
function getUserDataFromReq(req) {
    return new Promise((resolve, reject) => {
        jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
            if (err) return reject(err);
            resolve(userData);
        });
    });
}

// Middleware to authenticate user
const authenticateToken = async (req, res, next) => {
    try {
        const userData = await getUserDataFromReq(req);
        req.user = userData;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Authentication required' });
    }
};

app.get('/api/test', (req, res) => {
    res.json('test ok');
});

// === IMAGE UPLOAD ROUTES ===

// Upload images to Cloudinary
app.post('/api/upload-images', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No images uploaded' });
        }

        const imageUrls = req.files.map(file => ({
            url: file.path,
            public_id: file.filename
        }));

        res.json({
            message: 'Images uploaded successfully',
            images: imageUrls
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete image from Cloudinary
app.delete('/api/delete-image/:publicId', authenticateToken, async (req, res) => {
    try {
        const { publicId } = req.params;
        
        // Delete from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId);
        
        if (result.result === 'ok') {
            res.json({ message: 'Image deleted successfully' });
        } else {
            res.status(400).json({ error: 'Failed to delete image' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// === USER ROUTES ===
app.post('/api/register', async (req, res) => {
    const { firstName, lastName, username, email, password, avatar } = req.body;
    try {
        const userDoc = await User.create({
            firstName,
            lastName,
            username,
            email,
            password: bcrypt.hashSync(password, bcryptSalt),
            avatar,
        });
        res.status(201).json(userDoc);
    } catch (e) {
        res.status(422).json({ error: e.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const userDoc = await User.findOne({ email });
    if (userDoc) {
        const passOk = bcrypt.compareSync(password, userDoc.password);
        if (passOk) {
            jwt.sign({
                email: userDoc.email,
                id: userDoc._id,
                username: userDoc.username,
            }, jwtSecret, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token).json(userDoc);
            });
        } else {
            res.status(422).json('Password not correct');
        }
    } else {
        res.status(404).json('User not found');
    }
});

app.get('/api/profile', (req, res) => {
    const { token } = req.cookies;
    if (token) {
        jwt.verify(token, jwtSecret, {}, async (err, userData) => {
            if (err) {
                return res.status(401).json({ error: 'Invalid token' });
            }
            const userDoc = await User.findById(userData.id);
            if (userDoc) {
                const { _id, firstName, lastName, username, email, avatar } = userDoc;
                res.json({ _id, firstName, lastName, username, email, avatar });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        });
    } else {
        res.status(401).json({ error: 'No token provided' });
    }
});

app.post('/api/logout', (req, res) => {
    res.cookie('token', '').json(true);
});

// === EVENT ROUTES ===

// Get all events (with optional filtering)
app.get('/api/events', async (req, res) => {
    try {
        const { category, status, page = 1, limit = 10, search } = req.query;
        
        // Build filter object
        const filter = {};
        if (category) filter.category = category;
        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get events with pagination
        const events = await Event.find(filter)
            .populate('creator', 'firstName lastName username avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const totalEvents = await Event.countDocuments(filter);
        const totalPages = Math.ceil(totalEvents / limit);

        res.json({
            events,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalEvents,
                hasMore: page < totalPages
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single event by ID
app.get('/api/events/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id)
            .populate('creator', 'firstName lastName username avatar')
            .populate('backers.user', 'firstName lastName username');

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new event (requires authentication)
app.post('/api/event-create', authenticateToken, async (req, res) => {
    try {
        const {
            title,
            category,
            description,
            targetAmount,
            currency,
            endDate,
            images,
            tags
        } = req.body;

        const eventDoc = await Event.create({
            title,
            category,
            description,
            targetAmount,
            currency: currency || 'USD',
            creator: req.user.id,
            endDate: new Date(endDate),
            images: images || [],
            tags: tags || []
        });

        // Populate creator info before sending response
        await eventDoc.populate('creator', 'firstName lastName username avatar');

        res.status(201).json(eventDoc);
    } catch (error) {
        res.status(422).json({ error: error.message });
    }
});

// Update event by ID (only creator can update)
app.put('/api/events/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if user is the creator
        if (event.creator.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied. Only the creator can update this event.' });
        }

        // Don't allow updating certain fields if event is funded or has backers
        const restrictedFields = ['targetAmount', 'currency'];
        if (event.backers.length > 0) {
            for (const field of restrictedFields) {
                if (req.body[field] !== undefined) {
                    delete req.body[field];
                }
            }
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).populate('creator', 'firstName lastName username avatar');

        res.json(updatedEvent);
    } catch (error) {
        res.status(422).json({ error: error.message });
    }
});

// Delete event by ID (only creator can delete)
app.delete('/api/events/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if user is the creator
        if (event.creator.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied. Only the creator can delete this event.' });
        }

        // Don't allow deletion if event has backers (has received funding)
        if (event.backers.length > 0) {
            return res.status(400).json({ error: 'Cannot delete event that has received backing.' });
        }

        // Delete associated images from Cloudinary
        if (event.images && event.images.length > 0) {
            for (const image of event.images) {
                if (image.public_id) {
                    try {
                        await cloudinary.uploader.destroy(image.public_id);
                    } catch (error) {
                        console.error('Error deleting image from Cloudinary:', error);
                    }
                }
            }
        }

        await Event.findByIdAndDelete(id);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get events by user (creator)
app.get('/api/user/events', authenticateToken, async (req, res) => {
    try {
        const events = await Event.find({ creator: req.user.id })
            .populate('creator', 'firstName lastName username avatar')
            .sort({ createdAt: -1 });

        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Back an event (contribute money)
app.post('/api/events/:id/back', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid backing amount' });
        }

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (event.status !== 'active') {
            return res.status(400).json({ error: 'Event is not active' });
        }

        if (new Date() > event.endDate) {
            return res.status(400).json({ error: 'Event has ended' });
        }

        // Check if user is trying to back their own event
        if (event.creator.toString() === req.user.id) {
            return res.status(400).json({ error: 'Cannot back your own event' });
        }

        // Add backer
        event.backers.push({
            user: req.user.id,
            amount: amount
        });

        // Update raised amount
        event.raisedAmount += amount;

        // Check if event is fully funded
        if (event.raisedAmount >= event.targetAmount) {
            event.status = 'funded';
        }

        await event.save();

        // Return updated event
        const updatedEvent = await Event.findById(id)
            .populate('creator', 'firstName lastName username avatar')
            .populate('backers.user', 'firstName lastName username');

        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add update to event (only creator)
app.post('/api/events/:id/updates', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (event.creator.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied. Only the creator can add updates.' });
        }

        event.updates.push({
            title,
            content,
            createdAt: new Date()
        });

        await event.save();
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Error handling middleware for multer
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 5MB per file.' });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ error: 'Too many files. Maximum 5 files allowed.' });
        }
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ error: 'Unexpected field name for file upload.' });
        }
    }
    
    if (error.message === 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.') {
        return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: error.message });
});

//get contribution
// In index.js
app.get('/api/user/contributions', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'contributions.event',
            select: 'title _id', // Now also selecting the _id
        }).sort({ 'contributions.date': -1 });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const validContributions = user.contributions.filter(c => c.event !== null);
        res.json(validContributions);
    } catch (err) {
        console.error('Error fetching user contributions:', err);
        res.status(500).json({ error: 'Failed to fetch contributions' });
    }
});

const port = 4000;

app.listen(port, () => {
    console.log(`Server is listening at port no ${port} 🚀`);
});