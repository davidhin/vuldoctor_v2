import { createMuiTheme } from "@material-ui/core/styles";
import "typeface-roboto";

const VDTheme = createMuiTheme({
  typography: {
    h5: {
      fontWeight: 300,
    },
    h6: {
      fontWeight: 300,
    },
  },
  direction: "left",
  palette: {
    primary: {
      main: "rgb(0, 150, 136)",
    },
    secondary: {
      main: "rgb(244, 67, 54)",
    },
  },
});

export default VDTheme;
