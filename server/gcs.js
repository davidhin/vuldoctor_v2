const { Storage } = require("@google-cloud/storage");
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });
const { SOLID_MANTRA_PRIVATE_KEY } = process.env;

const storage = new Storage({
  projectId: "solid-mantra-301604",
  credentials: {
    private_key: SOLID_MANTRA_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email:
      "firebase-adminsdk-gb291@solid-mantra-301604.iam.gserviceaccount.com",
  },
});

const downloadStr = async (filename) => {
  let res = await storage.bucket("vuldoctor2").file(filename).download();
  return res.toString("utf-8");
};

module.exports = downloadStr;
