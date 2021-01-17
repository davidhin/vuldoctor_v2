const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    uid: String,
    projects: Object,
  },
  { collection: "projects" }
);
projectSchema.set("toJSON", {
  transform: (doc, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Project", projectSchema);
