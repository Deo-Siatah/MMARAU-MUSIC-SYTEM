require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
    "http://localhost:5173",
    "https://mmarau-music-sytem.vercel.app"
];

//initialize express app
const app = express();

//mongoose connection
const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("[MONGODB] Mongodb connected successfuly")
    } catch(error) {
        console.log("[MONGODB] Error connecting Mongodb",error)
    }
};
connectDB();

//middleware
app.use(express.json());
app.use(cors({
    origin: function (origin,callback) {
        if (!origin || allowedOrigins.includes(origin)){
            callback(null,true);
        } else {
            console.log("❌CORS BLOCKED ORIGIN:",origin)
            callback (new Error("Not allowed by for this origin" + origin))
        }
    },
    credentials: true
}))
//cors

//routes
app.get("/",(req,res) => {res.send("Welcome to MM API")});
app.use("/api/v1/service", require("./routes/serviceRoutes"));
app.use("/api/v1/semester", require("./routes/semesterRoutes"));
app.use("/api/v1/minister", require("./routes/ministerRoutes"));
app.use("/api/v1/analytics", require("./routes/analyticsRoutes"));


//start server
app.listen(PORT, () => {
    console.log(`[SERVER] Server running at http://localhost:${PORT}`);
})