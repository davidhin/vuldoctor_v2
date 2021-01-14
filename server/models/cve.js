const mongoose = require("mongoose");

const cveSchema = new mongoose.Schema(
  {
    cve_id: String,
    description: String,
    references: String,
    created: String,
    modified: String,
    vector: String,
    attackVector: String,
    attackComplexity: String,
    privilegeRequired: String,
    userInteraction: String,
    scope: String,
    confidentialityImpact: String,
    integrityImpact: String,
    availabilityImpact: String,
    baseScore: Number,
    predictedScore: Number,
    severity: String,
    exploitabilityScore: Number,
    impactScore: Number,
    problemType: String,
  },
  { collection: "cve" }
);
cveSchema.set("toJSON", {
  transform: (doc, returnedObject) => {
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("cve_db", cveSchema);
