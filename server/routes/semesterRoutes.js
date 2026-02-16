const express = require("express");
const router = express.Router();

const {createSemester,getSemester,getAllSemesters,updateSemester,deleteSemester,softdeleteSemester} = require("../controllers/semesterController");

router.get("/getsemester/:id",getSemester);
router.get("/getallsemesters",getAllSemesters);
//create
router.post("/createsemester",createSemester);

//update
router.put("/updatesemester/:id",updateSemester);
//delete
router.delete("/deletesemester/:id",deleteSemester);
//softdelete
router.put("/deactivatesemester/:id",softdeleteSemester);

module.exports = router;