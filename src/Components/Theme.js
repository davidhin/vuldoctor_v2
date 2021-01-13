import { createMuiTheme } from "@material-ui/core/styles";
import "typeface-roboto";

const VDTheme = createMuiTheme({
  typography: {
    h6: {
      fontWeight: 300,
    },
  },
  direction: "left",
});

export default VDTheme;
