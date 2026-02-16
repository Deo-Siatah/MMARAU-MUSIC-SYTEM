const express = require("express");
const router = express.Router();

const {ministersByGender,ministerStats,totalMinisters,rankByGender,rankAllMinisters,getSemesterServiceCount} = require("../controllers/analyticsController");

router.get("/semester/:semesterId/ministerstats",ministerStats);
router.get("/ministers/total",totalMinisters);
router.get("/ministers/rank/gender",rankByGender);
router.get("/ministers/group/gender",ministersByGender);
router.get("/ministers/rankall",rankAllMinisters);
router.get("/semestercount/:semesterId",getSemesterServiceCount);

module.exports = router;