import { Typography } from "@material-ui/core";
import Button, { default as IconButton } from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import CircularProgress from "@material-ui/core/CircularProgress";
import DeleteIcon from "@material-ui/icons/Delete";
import axios from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import short from "short-uuid";
import { createToken } from "../Authentication";
import GenericDialog from "./GenericDialog.js";

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

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    let ret = parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    return ret;
  };

  // Populates the list of uploaded files list
  const files = myFiles.map((file) => (
    <div key={file.path}>
      {file.path} - {formatBytes(file.size)}
      <IconButton aria-label="delete" onClick={removeFile(file)}>
        <DeleteIcon />
      </IconButton>
    </div>
  ));

  // Calc file size
  let file_size = 0;
  let num_files = 0;
  myFiles.map((file) => {
    file_size += file.size;
    num_files += 1;
  });
  let file_size_str = formatBytes(file_size);

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
    borderStyle: "solid",
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
      <Card>
        <CardHeader
          action={
            <GenericDialog
              title="Uploading Files"
              body="Make sure to include a requirements file in your upload. 
              VulDoctor supports multiple formats (e.g. requirements.txt, 
              package.lock, pom.xml, etc.). The maximum total upload size is 
              5MB, and you may only have two concurrently running jobs at once."
              icon={true}
              style={{ display: "flex", float: "right" }}
            />
          }
          title="File Upload"
          style={{ textAlign: "center", paddingBottom: 0 }}
        />
        <CardContent>
          <div {...getRootProps({ style })}>
            <input {...getInputProps()} />
            <p>Drag and drop some files here, or click to select files</p>
          </div>

          {files.length > 0 && (
            <div className="center">
              <div
                style={{
                  display: "flex",
                  float: "left",
                  margin: "16px 16px 16px 0px",
                }}
              >
                <GenericDialog
                  button_text="Uploaded Files"
                  title="Uploaded Files"
                  body={files}
                />
                <Button
                  color="secondary"
                  onClick={removeAll}
                  style={{ marginLeft: "16px" }}
                >
                  Remove All
                </Button>
                <Typography
                  color="textSecondary"
                  style={{ marginLeft: "16px", marginTop: "6px" }}
                >
                  {num_files} files | Total size: {file_size_str}
                </Typography>
              </div>
              <div style={{ float: "right" }}>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ marginTop: "16px" }}
                  onClick={() => props.submit(myFiles)}
                  disabled={
                    file_size >= 5.243e6 || props.loading || props.processing
                  }
                >
                  Submit
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

const FileUpload = (props) => {
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (props.processing) {
      if (Object.keys(props.processing).length > 1) {
        setProcessing(true);
      }
    } else {
      setProcessing(false);
    }
  }, [props.processing]);

  // Called after form submitted.
  const handleSubmit = async (files) => {
    const data = new FormData();
    let header = await createToken(props.user);
    let projectID = short.generate();
    const depCheckURL = `https://depscan-oype6ttuha-an.a.run.app?projectID=${projectID}`;
    axios.post("/addProject", { projectID: projectID }, header).then((res) => {
      props.getProjects();
    });
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
            <div className="center">
              <FileUploadDropZone
                submit={handleSubmit}
                loading={props.loading}
                processing={processing}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default FileUpload;
