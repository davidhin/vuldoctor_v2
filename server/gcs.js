const { Storage } = require("@google-cloud/storage");

const storage = new Storage();

const downloadStr = async (filename) => {
  let res = await storage.bucket("vuldoctor2").file(filename).download();
  return res.toString("utf-8");
};

module.exports = downloadStr;
