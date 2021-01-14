const Test = require("../models/test");

module.exports = {
  getPing: async function (req, res) {
    const auth = req.currentUser;
    if (auth) {
      const cves = await Test.find({}).limit(10);
      return res.json(cves.map((cve) => cve.toJSON()));
    }
    return res.status(403).send("Not authorized");
  },

  postPing: async function (req, res) {
    const auth = req.currentUser;
    if (auth) {
      console.log("authenticated!", auth);
      let test = new Test(req.body);
      test["uid"] = auth.user_id;
      test["number"] = "asdf";
      console.log(auth.user_id);
      console.log(test);
      const savedTest = test.save();
      return res.status(201).json(savedTest);
    }
    return res.status(403).send("Not authorized");
  },
};
