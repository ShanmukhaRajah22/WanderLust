import dotenv from "dotenv";
import mongoose from "mongoose"; // MongoDB object modeling library
import { data } from "./data.js";
import Listing from "../models/listing.js";

dotenv.config();

const dbUrl = process.env.ATLASDB_URL;

const initDB = async () => {
    await Listing.deleteMany({});
    const listings = data.map((obj) => ({ ...obj, owner: "6993006094eb8ec198c65fd7" }));
    await Listing.insertMany(listings);
    console.log("data was initialized");
};

const main = async () => {
    await mongoose.connect(dbUrl);
    console.log("Connected to DB"); // Log if connected

    await initDB();
    await mongoose.connection.close();
};

main().catch(async (err) => {
    console.log(err); // Log connection error if failed
    await mongoose.connection.close();
    process.exitCode = 1;
});