const capeccwe_db = require("../models/capeccwe");
const sanitize = require("mongo-sanitize");

module.exports = {
  getCapecs: async function (req, res) {
    let cwe_id = sanitize(req.params.cweid);
    const capecs = await capeccwe_db.find({
      cwe_id: cwe_id,
    });
    return res.json(capecs.map((capec) => capec.toJSON()));
  },
};
