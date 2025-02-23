import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRouter.js";
import adminRouter from "./routes/adminRouter.js";
import courseRouter from "./routes/courseRouter.js";
import paymetRouter from "./routes/paymentRouter.js"

import path from "path"
import { fileURLToPath } from 'url'



dotenv.config();

const app = express();
const port = process.env.PORT || 3000; app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: true }))

app.use('/api/v1/users', userRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/course', courseRouter);
app.use('/api/v1/payment', paymetRouter);

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const connection = async () => {
    await connectDB();
}

app.listen(port, async () => {

    connection();
    console.log(`listens on: http://localhost:${port}`);
})