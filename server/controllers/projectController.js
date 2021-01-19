const downloadStr = require("../gcs");
const Project = require("../models/project");

module.exports = {
  getReport: async function (req, res) {
    const auth = req.currentUser;
    if (auth) {
      let bomfile = await downloadStr(
        `${auth.user_id}/${req.params.projectid}/bom.json`
      );
      bomfile = JSON.parse(bomfile);
      let scanfile = await downloadStr(
        `${auth.user_id}/${req.params.projectid}/depscan.json`
      );
      scanfile = JSON.parse(
        "[" +
          scanfile
            .toString("utf-8")
            .replace(/}/g, "},")
            .replace(/,([^,]*)$/, "$1") +
          "]"
      );
      let depsfile = await downloadStr(
        `${auth.user_id}/${req.params.projectid}/extracted_deps.json`
      );
      depsfile = JSON.parse(depsfile);
      return res.json({ bom: bomfile, scan: scanfile, deps: depsfile });
    }
    return res.status(403).send("Not authorized");
  },

  getProjects: async function (req, res) {
    const auth = req.currentUser;
    if (auth) {
      const projects = await Project.findOne({ uid: auth.user_id });
      return res.json(projects["projects"]);
    }
    return res.status(403).send("Not authorized");
  },

  addProject: async function (req, res) {
    const auth = req.currentUser;
    if (auth) {
      let projectID = req.body.projectID;
      Project.updateOne(
        { uid: auth.user_id },
        { $push: { projects: { pid: projectID, name: "" } } },
        { upsert: true },
        (err, results) => {
          if (err) throw err;
          console.log(results);
        }
      );
      return res.status(200).send("Added Project!");
    }
    return res.status(403).send("Not authorized");
  },
};
