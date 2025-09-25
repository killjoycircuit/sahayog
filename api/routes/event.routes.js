// routes/event.routes.js

const express = require("express");
const router = express.Router();
const multer = require("multer"); // 1. Import multer
const {
  createEvent,
  getAllEvents,
  getEventById,
  getMyEvents,
  updateEvent,
  deleteEvent,
  contributeToEvent,
} = require("../controllers/event.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

// 2. Configure multer to save uploaded files to an 'uploads' directory
//    (Make sure you have a folder named 'uploads' in your project's root)
const upload = multer({ dest: "uploads/" });

// Public routes
router.get("/events", getAllEvents);
router.get("/events/:id", getEventById);
router.patch("/events/:id/contribute", contributeToEvent);

// Protected routes (require authentication)
// 3. Add the multer middleware to the createEvent route.
//    The order is important: first authenticate, then handle the file, then create the event.
router.post(
  "/events",
  authenticateToken,
  upload.single("imageFile"),
  createEvent,
);

router.get("/my-events", authenticateToken, getMyEvents);
router.put(
  "/events/:id",
  authenticateToken,
  upload.single("imageFile"),
  updateEvent,
);
router.delete("/events/:id", authenticateToken, deleteEvent);

module.exports = router;
