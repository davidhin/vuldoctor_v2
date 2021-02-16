var express = require("express");
var cveCtrl = require("./controllers/cveController");
var cpeCtrl = require("./controllers/cpeController");
var ghCtrl = require("./controllers/ghController");
var projectCtrl = require("./controllers/projectController");
var capeccweCtrl = require("./controllers/capeccweController");

var router = express.Router();

router.route("/search/cve").get(cveCtrl.getCVEs);
router.route("/search/cpe").get(cpeCtrl.getCPEs);
router.route("/getCVEList").post(cveCtrl.getCVEList);
router.route("/gh").post(ghCtrl.postGHtoken);
router.route("/gh").get(ghCtrl.getGHtoken);
router.route("/getreport/:projectid").get(projectCtrl.getReport);
router.route("/addProject").post(projectCtrl.addProject);
router.route("/addGitHubProject").post(projectCtrl.addGitHubProject);
router.route("/getProjects").get(projectCtrl.getProjects);
router.route("/updateProjectName").put(projectCtrl.updateProjectName);
router.route("/updateProjectAuto").put(projectCtrl.updateProjectAuto);
router.route("/updateProjectVulns").put(projectCtrl.updateProjectVulns);
router.route("/deleteProject").delete(projectCtrl.deleteProject);
router.route("/getHistory/:projectid").get(projectCtrl.getHistory);
router.route("/getCapecs/:cweid").get(capeccweCtrl.getCapecs);

module.exports = router;
