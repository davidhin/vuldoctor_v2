const { downloadStr } = require("../gcs");
const Project = require("../models/project");

const getProjectStats = async (uid, projects) => {
  for (p in projects) {
    if ("high_sev" in projects[p]) {
      continue;
    }
    let vulns = {};
    vulns["HIGH"] = 0;
    vulns["MEDIUM"] = 0;
    vulns["LOW"] = 0;
    try {
      let scanfile = await downloadStr(
        `${uid}/${projects[p].pid}/depscan.json`
      );
      scanfile = JSON.parse(
        "[" +
          scanfile
            .toString("utf-8")
            .replace(/}/g, "},")
            .replace(/,([^,]*)$/, "$1") +
          "]"
      );
      scanfile.forEach((x) => {
        if (x.package_usage == "required") {
          vulns[x.severity] += 1;
        }
      });
      let update = await Project.updateOne(
        { uid: uid, projects: { $elemMatch: { pid: projects[p].pid } } },
        {
          $set: {
            ["projects.$.high_sev"]: vulns["HIGH"],
            ["projects.$.med_sev"]: vulns["MEDIUM"],
            ["projects.$.low_sev"]: vulns["LOW"],
          },
        }
      );
    } catch {
      continue;
    }
  }
};

module.exports = getProjectStats;
