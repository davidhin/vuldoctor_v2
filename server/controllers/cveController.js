const cve_db = require("../models/cve");
const sanitize = require("mongo-sanitize");

module.exports = {
  getCVEs: async function (req, res) {
    let search = sanitize(req.query.search);

    // Get entries with substring matching
    const cves = await cve_db
      .find({
        $or: [
          { cve_id: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      })
      .limit(10);

    return res.json(cves.map((cve) => cve.toJSON()));
  },
  getCVEList: async function (req, res) {
    let search = req.body.map((x) => sanitize(x));
    const cves = await cve_db.find({
      cve_id: { $in: search },
    });
    return res.json(cves.map((cve) => cve.toJSON()));
  },
};
