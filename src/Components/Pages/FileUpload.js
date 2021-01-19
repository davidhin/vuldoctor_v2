import { Typography } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import {
  default as Button,
  default as IconButton,
} from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import DeleteIcon from "@material-ui/icons/Delete";
import axios from "axios";
import React, { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import short from "short-uuid";
import { createToken } from "../Authentication";

function FileUploadDropZone(props) {
  const [myFiles, setMyFiles] = useState([]);

  const onDropAccepted = useCallback(
    (acceptedFiles) => {
      setMyFiles([...myFiles, ...acceptedFiles]);
    },
    [myFiles]
  );

  // Print rejected files to console
  const onDropRejected = (rejectedFiles) => {
    console.log(rejectedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDropAccepted,
    onDropRejected,
    accept:
      ".java,.py,.js,.json,.xml,.lock,.gradle,.kts,.sbt.,.txt,.sum,.csproj",
  });

  // Remove single file from myFiles state
  const removeFile = (file) => () => {
    const newFiles = [...myFiles];
    newFiles.splice(newFiles.indexOf(file), 1);
    setMyFiles(newFiles);
  };

  // Remove all files from myFiles state
  const removeAll = () => {
    setMyFiles([]);
  };

  // Populates the list of uploaded files list
  const files = myFiles.map((file) => (
    <div key={file.path}>
      {file.path} - {file.size} bytes{" "}
      <IconButton aria-label="delete" onClick={removeFile(file)}>
        <DeleteIcon />
      </IconButton>
    </div>
  ));

  // :TODO Move this styling to an external style.js file
  const baseStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    borderWidth: 2,
    borderRadius: 2,
    borderColor: "#eeeeee",
    borderStyle: "dashed",
    backgroundColor: "#fafafa",
    color: "#bdbdbd",
    outline: "none",
    transition: "border .24s ease-in-out",
  };

  const activeStyle = {
    borderColor: "#2196f3",
  };

  // Update style when isDragActive changed
  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isDragActive ? activeStyle : {}),
    }),
    [isDragActive]
  );

  return (
    <section>
      <div {...getRootProps({ style })}>
        <input {...getInputProps()} />
        <p>Drag and drop some files here, or click to select files</p>
      </div>

      {files.length > 0 && (
        <div className="center">
          <ul>{files}</ul>
          <div className="left">
            <Button variant="outlined" color="secondary" onClick={removeAll}>
              Remove All
            </Button>
          </div>
          <div className="right">
            <Button
              variant="outlined"
              color="primary"
              onClick={() => props.submit(myFiles)}
            >
              Submit
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

const FileUpload = (props) => {
  const [loading, setLoading] = useState(false);

  // Called after form submitted.
  const handleSubmit = async (files) => {
    const data = new FormData();
    let header = await createToken(props.user);
    let projectID = short.generate();
    const depCheckURL = `https://depscan-oype6ttuha-an.a.run.app?projectID=${projectID}`;
    axios.post("/addProject", { projectID: projectID }, header);
    files.map((file) => {
      data.append("file", file);
    });
    axios.post(depCheckURL, data, header).then((result) => {
      console.log(result);
    });
  };

  return (
    <div className="container">
      {loading ? (
        <div style={{ position: "fixed", top: "50%", left: "50%" }}>
          <CircularProgress />
        </div>
      ) : (
        <div>
          <div className="primaryBox">
            <Typography variant="h5" component="h5" color="black">
              <Box fontWeight="fontWeightBold" m={1}>
                Upload File
              </Box>
            </Typography>
            <br />
            <div className="center">
              <FileUploadDropZone submit={handleSubmit}>
                sdfg
              </FileUploadDropZone>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default FileUpload;
