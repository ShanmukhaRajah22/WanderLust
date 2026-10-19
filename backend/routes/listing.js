import express from "express";
const router = express.Router();
import multer from "multer";
import { storage } from "../cloudConfig.js";
const upload = multer({ storage });

import wrapAsync from "../utils/wrapAsync.js";
import { isLoggedIn, isOwner, validateListing, parseFormData } from "../middleware.js";
import * as listingController from "../controllers/listings.js";

// INDEX
router.get("/", wrapAsync(listingController.index));

// NEW
router.get("/new", isLoggedIn, listingController.renderNewForm);

// CREATE
router.post("/", isLoggedIn, upload.single('listing[image]'), parseFormData, validateListing, wrapAsync(listingController.createListing));

//  SHOW
router.get("/:id", wrapAsync(listingController.showListing));

// EDIT
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// UPDATE
router.put("/:id", isLoggedIn, isOwner, upload.single('listing[image]'), parseFormData, validateListing, wrapAsync(listingController.updateListing));

// DELETE
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));


export default router;
