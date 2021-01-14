const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    name: String,
    number: String,
    uid: String,
  },
  { collection: "test" }
);
testSchema.set("toJSON", {
  transform: (doc, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Test", testSchema);
