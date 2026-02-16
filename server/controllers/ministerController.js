const Minister = require("../models/Minister");
//getminister
exports.getMinister = async(req,res) => {
    try {
        const minister = await Minister.findById(req.params.id).lean();
        if (!minister) return res.status(404).json({message:"Minister not found"})

        res.status(200).json(minister);
    } catch (error) {
        res.status(500).json({message:"Failed to load minister",error:error.message})
    }
};
//getallministers
exports.getAllMinisters = async(req,res) => {
    try {
        const ministers = await Minister.find().lean();
        res.status(200).json(ministers)
    } catch (error) {
        return res.status(500).json({message: "Failed to get ministers"})
    }
}
//newminister
exports.createMinister = async(req,res) => {
    try {
        const {fullname,gender,voices} = req.body;
        const exists = await Minister.findOne({fullname});
        if (exists) {
            return res.status(400).json({message: "Minister already exists"});
        } 

         const minister = await Minister.create({
                fullname: fullname,
                gender:gender,
                voices:voices,
            });
           
        
        res.status(200).json({message: "Minister created successfully", minister});

    } catch (error) {
        res.status(500).json({message: "Failed to create the minister"});
    }
}



// UPDATE minister
exports.updateMinister = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullname, gender, voices, isActive } = req.body;

        const minister = await Minister.findById(id);
        if (!minister) {
            return res.status(404).json({ message: "Minister not found" });
        }

        // Update only provided fields
        if (fullname !== undefined) minister.fullname = fullname;
        if (gender !== undefined) minister.gender = gender;
        if (voices !== undefined) minister.voices = voices;
        if (isActive !== undefined) minister.isActive = isActive;

        await minister.save();

        res.status(200).json({
            message: "Minister updated successfully",
            minister
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update minister",
            error: error.message
        });
    }
};
//deactivate minister

exports.deactivateMinister = async (req, res) => {
    try {
        const { id } = req.params;

        const minister = await Minister.findById(id);
        if (!minister) {
            return res.status(404).json({ message: "Minister not found" });
        }

        minister.isActive = false;
        await minister.save();

        res.status(200).json({
            message: "Minister deactivated successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to deactivate minister",
            error: error.message
        });
    }
};

//delete minister
exports.deleteMinister = async (req, res) => {
    try {
        const { id } = req.params;

        const minister = await Minister.findByIdAndDelete(id);
        if (!minister) {
            return res.status(404).json({ message: "Minister not found" });
        }

        res.status(200).json({
            message: "Minister permanently deleted"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete minister",
            error: error.message
        });
    }
};
