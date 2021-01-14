const cpe_db = require("../models/cpe");
const sanitize = require("mongo-sanitize");

module.exports = {
  getCPEs: async function (req, res) {
    let search = sanitize(req.query.search);

    // Get entries with substring matching
    const cpes = await cpe_db
      .find({
        $or: [
          { vendor: { $regex: search, $options: "i" } },
          { product: { $regex: search, $options: "i" } },
        ],
      })
      .limit(10);

    return res.json(cpes.map((cpe) => cpe.toJSON()));
  },
};
