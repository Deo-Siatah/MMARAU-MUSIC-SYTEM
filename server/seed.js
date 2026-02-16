require("dotenv").config();
const mongoose = require("mongoose");

const Minister = require("./models/Minister");
const Semester = require("./models/Semester");
const Service = require("./models/Service");

async function connectDB() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
}

async function seedData() {
    try {
        await connectDB();

        console.log("Clearing old data...");
        await Minister.deleteMany({});
        await Semester.deleteMany({});
        await Service.deleteMany({});

        console.log("Creating Semester...");
        const semester = await Semester.create({
            name: "Semester 1 2026",
            startDate: new Date("2026-01-01"),
            endDate: new Date("2026-04-30"),
        });

        console.log("Creating Ministers...");
        const ministers = await Minister.insertMany([
            { fullname: "John Opiyo", gender: "male", isActive: true },
            { fullname: "Mary Jane", gender: "female", isActive: true },
            { fullname: "Peter King", gender: "male", isActive: true },
            { fullname: "Grace Hope", gender: "female", isActive: false },
        ]);

        console.log("Creating Services...");
        await Service.insertMany([
            {
                date: new Date("2026-01-07"),
                serviceType: "sunday",
                semesterId: semester._id,
                ministers: [
                    {
                        ministerId: ministers[0]._id,
                        voice: "tenor",
                        role: "lead",
                    },
                    {
                        ministerId: ministers[1]._id,
                        voice: "alto",
                        role: "backup",
                    },
                ],
            },
            {
                date: new Date("2026-01-14"),
                serviceType: "sunday",
                semesterId: semester._id,
                ministers: [
                    {
                        ministerId: ministers[1]._id,
                        voice: "alto",
                        role: "lead",
                    },
                    {
                        ministerId: ministers[2]._id,
                        voice: "tenor",
                        role: "backup",
                    },
                ],
            },
        ]);

        console.log("✅ Seeding completed successfully!");
        process.exit();
    } catch (error) {
        console.error("❌ Error seeding:", error);
        process.exit(1);
    }
}

seedData();
