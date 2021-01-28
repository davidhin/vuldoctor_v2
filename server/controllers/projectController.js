const { downloadStr, deleteFolder } = require("../gcs");
const Project = require("../models/project");
const sanitize = require("mongo-sanitize");

module.exports = {
  getReport: async function (req, res) {
    const auth = req.currentUser;
    try {
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

        // Get project data
        let projectData = await Project.findOne(
          {
            uid: auth.user_id,
            projects: { $elemMatch: { pid: req.params.projectid } },
          },
          { ["projects.$.pid"]: req.params.projectid }
        );
        projectData = projectData["projects"][0];

        return res.json({
          bom: bomfile,
          scan: scanfile,
          deps: depsfile,
          projdata: projectData,
        });
      }
      return res.status(403).send("Not authorized");
    } catch {
      return res.status(400).send("Error in retrieving project.");
    }
  },

  deleteProject: async function (req, res) {
    const auth = req.currentUser;
    if (auth) {
      await deleteFolder(`${auth.user_id}/${req.body.pid}/`);
      await Project.updateOne(
        { uid: auth.user_id },
        {
          $pull: { projects: { pid: req.body.pid } },
        }
      );
      return res.status(200).send("Deleted project");
    }
    return res.status(403).send("Not authorized");
  },

  updateProjectName: async function (req, res) {
    const auth = req.currentUser;
    if (auth) {
      let new_name = sanitize(req.body.name);
      let update = await Project.updateOne(
        { uid: auth.user_id, projects: { $elemMatch: { pid: req.body.pid } } },
        {
          $set: { ["projects.$.name"]: new_name },
        }
      );
      return res.status(200).send("Updated Project Name");
    }
    return res.status(403).send("Not authorized");
  },

  updateProjectAuto: async function (req, res) {
    const auth = req.currentUser;
    if (auth) {
      await Project.updateOne(
        { uid: auth.user_id, projects: { $elemMatch: { pid: req.body.pid } } },
        {
          $set: { ["projects.$.autorepo"]: req.body.autorepo },
        }
      );
      return res.status(200).send("Updated Project Auto Check");
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
        {
          $push: {
            projects: {
              pid: projectID,
              name: projectID,
              date: new Date().toLocaleString(),
            },
          },
        },
        { upsert: true },
        (err, results) => {
          if (err) throw err;
        }
      );
      return res.status(200).send("Added Project!");
    }
    return res.status(403).send("Not authorized");
  },

  addGitHubProject: async function (req, res) {
    const auth = req.currentUser;
    if (auth) {
      Project.updateOne(
        {
          uid: auth.user_id,
          projects: { $elemMatch: { repoid: req.body.repoid } },
        },
        {
          $set: { ["projects.$.checked"]: req.body.checked },
        },
        (err, results) => {
          if (err) throw err;
          if (results.nModified == 0) {
            Project.updateOne(
              { uid: auth.user_id },
              {
                $push: {
                  projects: {
                    pid: req.body.pid,
                    name: req.body.reponame,
                    date: "Never",
                    repoid: req.body.repoid,
                    checked: req.body.checked,
                    autorepo: false,
                  },
                },
              },
              (err, results) => {
                if (err) throw err;
              }
            );
          }
        }
      );
      return res.status(200).send("Added Project!");
    }
    return res.status(403).send("Not authorized");
  },

  updateProjectVulns: async function (req, res) {
    const auth = req.currentUser;
    if (auth) {
      await Project.updateOne(
        { uid: auth.user_id, projects: { $elemMatch: { pid: req.body.pid } } },
        {
          $set: {
            ["projects.$.high_sev"]: req.body["HIGH"],
            ["projects.$.med_sev"]: req.body["MEDIUM"],
            ["projects.$.low_sev"]: req.body["LOW"],
            ["projects.$.reqOnly"]: req.body["reqOnly"],
          },
        }
      );
      return res.status(200).send("Updated Vulns");
    }
    return res.status(403).send("Not authorized");
  },
};
