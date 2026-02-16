const Semester = require("../models/Semester");

//create semester
exports.createSemester = async (req, res) => {
    try {
        const { name, startDate, endDate, isActive } = req.body;

        // 1. Check if name already exists
        const exists = await Semester.findOne({ name }).lean();
        if (exists) {
            return res.status(400).json({ message: "Name already exists" });
        }

        
        if (isActive !== false) {
            await Semester.updateMany(
                { isActive: true }, 
                { $set: { isActive: false } }
            );
        }

        // 3. Create the new semester
        const semester = await Semester.create({
            name,
            startDate,
            endDate,
            isActive: isActive !== undefined ? isActive : true,
        });

        return res.status(201).json(semester);
    } catch (error) {
        return res.status(500).json({ 
            message: "Failed to create semester", 
            error: error.message 
        });
    }
};
//getsemester
exports.getSemester = async (req,res) => {
    try {
    const {id} = req.params;
    const semester = await Semester.findById(id).lean();

    if (!semester) 
        return res.status(404).json({message: "Semester not found"});

     res.status(200).json(semester);
    } catch(error) {
        res.status(500).json({message:"Failed to get semester",error:error.message})
    }
};

//get semesters
exports.getAllSemesters = async(req,res) => {
    try {
        const semesters = await Semester.find().sort({startDate: -1}).lean();
        return res.status(200).json(semesters)
    } catch (error) {
        res.status(500).json({message: "Failed to load semesters",error: error.message});
    }
};

//update semester
exports.updateSemester = async(req,res) => {
    try {
        const {id} = req.params;
        const {name,startDate,endDate,isActive} = req.body;

        const semester = await Semester.findById(id);
        if (!semester) 
            return res.status(404).json({message: "Semester Not Found"});

        if (name !== undefined) semester.name = name;
        if (startDate !== undefined) semester.startDate = startDate;
        if (endDate !== undefined) semester.endDate = endDate;
        if (isActive === true) {
        await Semester.updateMany(
            { _id: { $ne: id } },
            { isActive: false }
        );
        }

        if (isActive !== undefined) semester.isActive = isActive;

        await semester.save();
        res.status(200).json({
            message: "Semester updated successfully",
            semester
        })
    } catch (error) {
        res.status(500).json({message: "Error updating semester",error:error.message})
    }
};

//delete semester
exports.deleteSemester = async(req,res) => {
    try {
        const {id} = req.params;
        const semester = await Semester.findByIdAndDelete(id)

        if (!semester) 
            return res.status(404).json({message: "Semester Not Found"})

        res.status(200).json({message: "Semester deleted successfully"});
    } catch (error) {
        res.status(500).json({message: "Failed to delete semester",error: error.message});
    }
};


//deactivating 
exports.softdeleteSemester = async (req, res) => {
    try {
        const { id } = req.params;

        const semester = await Semester.findById(id);
        if (!semester)
            return res.status(404).json({ message: "Semester Not Found" });

        semester.isActive = false;
        await semester.save();

        res.status(200).json({ message: "Semester deactivated successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Failed to deactivate semester",
            error: error.message
        });
    }
};
