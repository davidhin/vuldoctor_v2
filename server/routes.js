var express = require("express");
var cveCtrl = require("./controllers/cveController");
var cpeCtrl = require("./controllers/cpeController");
var testCtrl = require("./controllers/testController");
var ghCtrl = require("./controllers/ghController");

var router = express.Router();

router.route("/search/cve").get(cveCtrl.getCVEs);
router.route("/search/cpe").get(cpeCtrl.getCPEs);
router.route("/ping").get(testCtrl.getPing);
router.route("/ping").post(testCtrl.postPing);
router.route("/gh").post(ghCtrl.postGHtoken);
router.route("/gh").get(ghCtrl.getGHtoken);

module.exports = router;
