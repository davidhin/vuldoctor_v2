const mongoose = require("mongoose");

const cpeSchema = new mongoose.Schema(
  {
    vendor: String,
    product: String,
    configs: Object,
  },
  { collection: "cpe" }
);
cpeSchema.set("toJSON", {
  transform: (doc, returnedObject) => {
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("cpe_db", cpeSchema);
