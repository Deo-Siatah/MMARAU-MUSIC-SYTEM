const Service = require("../models/Service");
const Semester = require("../models/Semester")
const Minister = require("../models/Minister");

/* ---------------------------------------
   HELPERS
---------------------------------------- */

// Normalize ministerId (handles populated or raw ID)
const normalizeMinisterId = (minister) => {
    if (typeof minister.ministerId === "object") {
        return minister.ministerId._id.toString();
    }
    return minister.ministerId.toString();
};

// Check duplicate ministers
const hasDuplicateMinisters = (ministers) => {
    const ids = ministers.map(m => normalizeMinisterId(m));
    return ids.length !== new Set(ids).size;
};

// Ensure service completeness (all voices have lead + backup)
const isServiceComplete = (ministers) => {
    const voices = ["soprano", "alto", "tenor"];
    
    // Get  backups
    const backups = ministers.filter(m => m.role === "backup");

    // Check that each voice has at least one backup
    return voices.every(voice => backups.some(b => b.voice === voice));
};

//  date range helper
const getDayRange = (date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return { start, end };
};

//check if data is within semester range
const isWithinSemester = (date,semester) => {
    const serviceDate = new Date(date);
    const start = new Date(semester.startDate);
    start.setHours(0,0,0,0);
    const end = new Date(semester.endDate);
    end.setHours(23,59,59,999);

    return serviceDate >= start && serviceDate <= end;
};

/* ---------------------------------------
   CREATE SERVICE
---------------------------------------- */

exports.createService = async (req, res) => {
    try {
        const { date, serviceType, semesterId, ministers } = req.body;

        // 1. Basic validation
        if (!date || !serviceType || !semesterId || !ministers?.length) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Fetch semester
        const semester = await Semester.findById(semesterId);
        if (!semester) {
            return res.status(404).json({ message: "Semester not found" });
        }

        // Check date is within semester
        if (!isWithinSemester(date, semester)) {
            return res.status(400).json({
                message: `Service date must be within the semester: ${semester.startDate.toDateString()} - ${semester.endDate.toDateString()}`
            });
        }


        // 2. Duplicate minister check
        if (hasDuplicateMinisters(ministers)) {
            return res.status(400).json({
                message: "A minister cannot appear more than once in a service"
            });
        }

        // 3. Ensure full service structure
        if (!isServiceComplete(ministers)) {
            return res.status(400).json({
                message: "Service must have lead and backup for soprano, alto, and tenor"
            });
        }

        // 4. Prevent duplicate service same date & type
        const { start, end } = getDayRange(date);

        const exists = await Service.findOne({
            date: { $gte: start, $lte: end },
            serviceType
        });

        if (exists) {
            return res.status(400).json({
                message: "Service already exists for this date and type"
            });
        }

        // 5. Create service
        const service = await Service.create({
            date,
            serviceType,
            semesterId,
            ministers
        });

        res.status(201).json(service);

    } catch (error) {
        res.status(500).json({
            message: "Failed to create service",
            error: error.message
        });
    }
};


/* ---------------------------------------
   GET SINGLE SERVICE
---------------------------------------- */

exports.getService = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await Service.findById(id)
            .populate("semesterId", "name")
            .populate("ministers.ministerId", "fullname gender")
            .lean();

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json(service);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get service",
            error: error.message
        });
    }
};


/* ---------------------------------------
   GET ALL SERVICES
---------------------------------------- */

exports.getAllServices = async (req, res) => {
    try {
        const { semesterId, serviceType } = req.query;

        const filter = {};
        if (semesterId) filter.semesterId = semesterId;
        if (serviceType) filter.serviceType = serviceType;

        const services = await Service.find(filter)
            .sort({ date: -1 })
            .populate("semesterId", "name")
            .lean();

        res.status(200).json(services);

    } catch (error) {
        res.status(500).json({
            message: "Failed to load services",
            error: error.message
        });
    }
};


/* ---------------------------------------
   UPDATE SERVICE
---------------------------------------- */

exports.updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, serviceType, semesterId, ministers } = req.body;

        const service = await Service.findById(id);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        // If updating date or semester, validate against semester range
        let semesterToCheck = semesterId ? await Semester.findById(semesterId) : await Semester.findById(service.semesterId);
        if (!semesterToCheck) {
            return res.status(404).json({ message: "Semester not found" });
        }

        const dateToCheck = date || service.date;
        if (!isWithinSemester(dateToCheck, semesterToCheck)) {
            return res.status(400).json({
                message: `Service date must be within the semester: ${semesterToCheck.startDate.toDateString()} - ${semesterToCheck.endDate.toDateString()}`
            });
        }


        // 1. Validate ministers if provided
        if (ministers) {

            if (hasDuplicateMinisters(ministers)) {
                return res.status(400).json({
                    message: "A minister cannot appear more than once in a service"
                });
            }

            if (!isServiceComplete(ministers)) {
                return res.status(400).json({
                    message: "Service must have lead and backup for soprano, alto, and tenor"
                });
            }

            service.ministers = ministers;
        }

        // 2. Prevent duplicate date/type collision
        if (date || serviceType) {

            const checkDate = date || service.date;
            const checkType = serviceType || service.serviceType;

            const { start, end } = getDayRange(checkDate);

            const exists = await Service.findOne({
                _id: { $ne: id },
                date: { $gte: start, $lte: end },
                serviceType: checkType
            });

            if (exists) {
                return res.status(400).json({
                    message: "Another service already exists for this date and type"
                });
            }
        }

        // 3. Apply updates
        if (date !== undefined) service.date = date;
        if (serviceType !== undefined) service.serviceType = serviceType;
        if (semesterId !== undefined) service.semesterId = semesterId;

        await service.save();

        res.status(200).json({
            message: "Service updated successfully",
            service
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update service",
            error: error.message
        });
    }
};


/* ---------------------------------------
   DELETE SERVICE
---------------------------------------- */

exports.deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await Service.findByIdAndDelete(id);

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json({ message: "Service deleted successfully" });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete service",
            error: error.message
        });
    }
};

//served recently



exports.getMinistersWithRecentFlag = async (req, res) => {
  try {
    const { semesterId } = req.query;

    if (!semesterId) {
      return res.status(400).json({ message: "semesterId is required" });
    }

    // 1. Fetch all active ministers
    const ministers = await Minister.find({ isActive: true }).lean();

    // 2. Fetch last 6 services for this semester
    const services = await Service.find({ semesterId })
      .sort({ date: -1 })
      .limit(6)
      .lean();

    // 3. Flatten minister IDs from these services
    const recentMinisterIds = new Set(
      services.flatMap(s => s.ministers.map(m => m.ministerId.toString()))
    );

    // 4. Attach hasServedRecently flag
    const result = ministers.map(m => ({
      ...m,
      hasServedRecently: recentMinisterIds.has(m._id.toString())
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch ministers with recent flag",
      error: error.message
    });
  }
};
