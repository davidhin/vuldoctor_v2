var express = require("express");
var cveCtrl = require("./controllers/cveController");
var cpeCtrl = require("./controllers/cpeController");
var testCtrl = require("./controllers/testController");
var ghCtrl = require("./controllers/ghController");
var projectCtrl = require("./controllers/projectController");

var router = express.Router();

router.route("/search/cve").get(cveCtrl.getCVEs);
router.route("/search/cpe").get(cpeCtrl.getCPEs);
router.route("/getCVEList").post(cveCtrl.getCVEList);
router.route("/ping").get(testCtrl.getPing);
router.route("/ping").post(testCtrl.postPing);
router.route("/gh").post(ghCtrl.postGHtoken);
router.route("/gh").get(ghCtrl.getGHtoken);
router.route("/getreport/:projectid").get(projectCtrl.getReport);
router.route("/addProject").post(projectCtrl.addProject);
router.route("/getProjects").get(projectCtrl.getProjects);

module.exports = router;
