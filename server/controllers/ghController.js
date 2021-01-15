const User = require("../models/user");

module.exports = {
  postGHtoken: async function (req, res) {
    const auth = req.currentUser;
    if (auth) {
      User.updateOne(
        { uid: auth.user_id },
        { $set: { ghtoken: req.body.ghtoken } },
        { upsert: true },
        (err, results) => {
          if (err) throw err;
          console.log(results);
        }
      );
      return res.status(201);
    }
    return res.status(403).send("Not authorized");
  },

  getGHtoken: async function (req, res) {
    const auth = req.currentUser;
    if (auth) {
      const user = await User.findOne({ uid: auth.user_id });
      return user ? res.send(user.ghtoken) : res.send(null);
    }
    return res.status(403).send("Not authorized");
  },
};
