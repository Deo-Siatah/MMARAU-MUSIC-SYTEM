const express = require("express");
const router = express.Router();

const {createService,getService,getAllServices,updateService,deleteService,getMinistersWithRecentFlag} = require("../controllers/serviceContoller");

//getroutes
router.get("/getservice/:id",getService);
router.get("/getallservices",getAllServices);
router.get("/ministers/availability",getMinistersWithRecentFlag)

//create
router.post("/createservice",createService);
//update
router.put("/updateservice/:id",updateService);
//delete
router.delete("/deleteservice/:id",deleteService);

module.exports = router;