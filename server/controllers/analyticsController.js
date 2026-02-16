const Service = require("../models/Service");
const Minister = require("../models/Minister");
const mongoose = require("mongoose");

exports.ministersByGender = async(req,res) => {
    try {
        const data = await Minister.aggregate([
            {$group: {
                _id: "$gender",
                total: {$sum: 1}
            }}
        ]);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({message: "Failed to get ministers by gender", error: error.message})
    }
}

//get minister stats
exports.ministerStats = async(req,res) => {
    try {
        const {semesterId} = req.params;

        const data = await Service.aggregate([
            {
                $match: {
                    semesterId: new mongoose.Types.ObjectId(semesterId)
                }
            },
            {$unwind: "$ministers"},
            {
                $group: {
                    _id: "$ministers.ministerId",
                    totalServices: {$sum: 1},
                    leadCount: {
                        $sum: {
                            $cond: [{$eq: ["$ministers.role", "lead"]}, 1, 0]
                        }
                    },
                    backupCount: {
                        $sum: {
                            $cond: [{$eq: ["$ministers.role", "backup"]}, 1, 0]
                        }
                        },
                        serviceDates: {$push: "$date"}
                    }
                },
                {
                    $lookup: {
                        from: "ministers",
                        localField: "_id",
                        foreignField: "_id",
                        as: "minister"
                    }
                },
                {$unwind: "$minister"},
                {
                    $project: {
                        _id: "$minister._id",
                        name: "$minister.fullname",
                        gender: "$minister.gender",
                        totalServices: 1,
                        leadCount:{$ifNull: ["$leadCount",0]},
                        backupCount:{$ifNull: ["$backupCount",0]},
                        serviceDates:{$ifNull: ["$serviceDates",[]]}
                    }
                }
        ]);
        res.status(200).json(data);
    } catch(error) {
        res.status(500).json({message: "Failed to load ministers stats", error: error.message})
    }
}
//total ministers
exports.totalMinisters = async(req,res) => {
    try {
        const total = await Minister.countDocuments();
        res.json({total});
    } catch (error) {
        res.status(500).json({message: "Failed to get total ministers"})
    }
} 
//rank by gender
exports.rankByGender = async (req, res) => {
  try {
    const data = await Minister.aggregate([
      // Start from ministers so even those with zero services are included
      {
        $lookup: {
          from: "services",
          let: { ministerId: "$_id" },
          pipeline: [
            { $unwind: "$ministers" },
            {
              $match: {
                $expr: { $eq: ["$ministers.ministerId", "$$ministerId"] }
              }
            }
          ],
          as: "services"
        }
      },
      {
        $addFields: {
          totalServices: { $size: "$services" }
        }
      },
      {
        $group: {
          _id: "$gender",
          ministers: {
            $push: {
              name: "$fullname",
              totalServices: "$totalServices"
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          ministers: {
            $map: {
              input: { $range: [0, { $size: "$ministers" }] },
              as: "idx",
              in: {
                $mergeObjects: [
                  { rank: { $add: ["$$idx", 1] } },
                  { $arrayElemAt: ["$ministers", "$$idx"] }
                ]
              }
            }
          }
        }
      }
    ]);

    // Sort ministers within each gender by totalServices descending
    data.forEach(group => {
      group.ministers.sort((a, b) => b.totalServices - a.totalServices);
      group.ministers.forEach((m, i) => (m.rank = i + 1));
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Failed to rank by gender" });
  }
};


exports.rankAllMinisters = async (req, res) => {
  try {
    const data = await Minister.aggregate([
      // 1. Lookup services for each minister
      {
        $lookup: {
          from: "services",
          let: { ministerId: "$_id" },
          pipeline: [
            { $unwind: "$ministers" },
            {
              $match: {
                $expr: { $eq: ["$ministers.ministerId", "$$ministerId"] }
              }
            }
          ],
          as: "services"
        }
      },

      // 2. Count how many times each minister appears
      {
        $addFields: {
          totalServices: { $size: "$services" }
        }
      },

      // 3. Sort from most to least ministrations
      { $sort: { totalServices: -1 } },

      // 4. Shape final output
      {
        $project: {
          _id: 0,
          ministerId: "$_id",
          name: "$fullname",
          gender: "$gender",
          isActive: "$isActive",
          totalServices: 1
        }
      }
    ]);

    // 5. Add rank numbers in Node.js
    const ranked = data.map((item, index) => ({
      rank: index + 1,
      ...item
    }));

    res.status(200).json(ranked);
  } catch (error) {
    res.status(500).json({
      message: "Failed to rank ministers",
      error: error.message
    });
  }
};

//services 

exports.getSemesterServiceCount = async (req, res) => {
  try {
    const { semesterId } = req.params; // or req.query

    // Safety check for valid ID
    if (!mongoose.Types.ObjectId.isValid(semesterId)) {
      return res.status(400).json({ success: false, message: "Invalid Semester ID" });
    }

    const result = await Service.aggregate([
      { 
        $match: { 
          semesterId: new mongoose.Types.ObjectId(semesterId) 
        } 
      },
      { 
        $count: "totalCount" 
      }
    ]);

    const total = result.length > 0 ? result[0].totalCount : 0;

    res.status(200).json({ 
      success: true, 
      total 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};