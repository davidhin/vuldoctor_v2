const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    uid: String,
    ghtoken: String,
  },
  { collection: "users" }
);
userSchema.set("toJSON", {
  transform: (doc, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("User", userSchema);
