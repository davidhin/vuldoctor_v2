const cpe_db = require("../models/cpe");
const sanitize = require("mongo-sanitize");

module.exports = {
  getCPEs: async function (req, res) {
    let search = sanitize(req.query.search);

    // Get entries with substring matching
    const cpes = await cpe_db
      .find({
        cpes: {
          $in: [new RegExp(search, "i")],
        },
      })
      .limit(100);

    return res.json(cpes.map((cpe) => cpe.toJSON()));
  },
};
