const express = require("express");
const router = express.Router();

const {getMinister,getAllMinisters,createMinister,updateMinister,deactivateMinister,deleteMinister} = require("../controllers/ministerController");

router.get("/getminister/:id",getMinister);
router.get("/getallministers",getAllMinisters);

//create
router.post("/createminister",createMinister);
//update
router.put("/updateminister/:id",updateMinister);
//deactivate
router.put("/deactivateminister/:id",deactivateMinister);
//delete
router.delete("/deleteminister/:id",deleteMinister);

module.exports = router;