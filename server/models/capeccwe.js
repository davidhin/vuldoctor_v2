const mongoose = require("mongoose");

const capeccweSchema = new mongoose.Schema(
  {
    capec_id: String,
    capec_name: String,
    cwe_id: String,
  },
  { collection: "capec_cwe" }
);
capeccweSchema.set("toJSON", {
  transform: (doc, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("capeccwe", capeccweSchema);
