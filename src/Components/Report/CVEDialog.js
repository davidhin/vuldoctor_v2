import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Link from "@material-ui/core/Link";
import React from "react";
import ReactMarkdown from "react-markdown";

export default function ScrollDialog(props) {
  const [open, setOpen] = React.useState(false);
  const scroll = "paper";

  const handleClickOpen = (scrollType) => () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const descriptionElementRef = React.useRef(null);
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  return (
    <div>
      <Button
        variant="outlined"
        color="primary"
        onClick={handleClickOpen("paper")}
      >
        More Info
      </Button>
      <Dialog
        open={open}
        fullWidth={false}
        maxWidth={"md"}
        onClose={handleClose}
        scroll={scroll}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">{props.cve_id}</DialogTitle>
        <DialogContent dividers={scroll === "paper"}>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
            <ReactMarkdown>
              {props.cve_description
                ? props.cve_description.replace("###", "### ")
                : ""}
            </ReactMarkdown>

            {props.related_urls
              ? props.related_urls.map((x) => {
                  return (
                    <div>
                      <Link href={x}>{x}</Link>
                      <br />
                    </div>
                  );
                })
              : ""}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
