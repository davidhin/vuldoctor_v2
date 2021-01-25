import AppBar from "@material-ui/core/AppBar";
import CircularProgress from "@material-ui/core/CircularProgress";
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { makeStyles, MuiThemeProvider } from "@material-ui/core/styles";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import MenuIcon from "@material-ui/icons/Menu";
import React from "react";
import { Link, Redirect, Route, Switch } from "react-router-dom";
import ProfileMenu from "./Menu";
import CPEs from "./Pages/CPEs";
import CVEs from "./Pages/CVEs";
import Dashboard from "./Pages/Dashboard";
import GitHub from "./Pages/GitHub";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Report from "./Pages/Report";
import VDTheme from "./Theme";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
    background: "transparent",
    fontWeight: "100",
    color: "black",
    padding: theme.spacing(3),
    position: "absolute",
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  drawerPaper: {
    width: drawerWidth,
    background: "#282836",
    boxShadow: "0 0px 20px 4px rgba(0,0,0,0.6)",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    paddingTop: theme.spacing(6),
  },
  logo: {
    textAlign: "center",
    padding: "12px",
    paddingTop: "20px",
    color: "white",
  },
  toolbar: theme.mixins.toolbar,
  toolbarButton: {
    color: "white",
  },
}));

function Application(props) {
  const { window } = props;
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [toolbarName, setToolbarName] = React.useState("");

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Typography variant="h5" noWrap className={classes.logo}>
        VulDoctor
      </Typography>
      <List>
        <ListItem
          button
          className={classes.toolbarButton}
          key={"Dashboard"}
          component={Link}
          to="/dashboard"
        >
          <ListItemText primary={"Dashboard"} />
        </ListItem>
        <ListItem
          button
          className={classes.toolbarButton}
          key={"Home"}
          component={Link}
          to="/"
        >
          <ListItemText primary={"Home"} />
        </ListItem>
        <ListItem
          button
          className={classes.toolbarButton}
          key={"CVEs"}
          component={Link}
          to="/cves"
        >
          <ListItemText primary={"CVEs"} />
        </ListItem>
        <ListItem
          button
          className={classes.toolbarButton}
          key={"CPEs"}
          component={Link}
          to="/cpes"
        >
          <ListItemText primary={"CPEs"} />
        </ListItem>{" "}
        <ListItem
          button
          className={classes.toolbarButton}
          key={"GitHub"}
          component={Link}
          to="/github"
        >
          <ListItemText primary={"GitHub"} />
        </ListItem>
      </List>
    </div>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <MuiThemeProvider theme={VDTheme}>
      <div className={classes.root}>
        <CssBaseline />
        <AppBar position="fixed" elevation={0} className={classes.appBar}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              className={classes.menuButton}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap style={{ flex: 1 }}>
              {toolbarName}
            </Typography>
            <ProfileMenu isLoggedIn={props.isLoggedIn} />
          </Toolbar>
        </AppBar>
        <nav className={classes.drawer} aria-label="mailbox folders">
          {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
          <Hidden smUp implementation="css">
            <Drawer
              container={container}
              variant="temporary"
              anchor={VDTheme.direction}
              open={mobileOpen}
              onClose={handleDrawerToggle}
              classes={{
                paper: classes.drawerPaper,
              }}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
            >
              {drawer}
            </Drawer>
          </Hidden>
          <Hidden xsDown implementation="css">
            <Drawer
              classes={{
                paper: classes.drawerPaper,
              }}
              variant="permanent"
              open
            >
              {drawer}
            </Drawer>
          </Hidden>
        </nav>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Switch>
            <Route exact path="/">
              <Home
                changePage={(name) => setToolbarName(name)}
                user={props.user}
              />
            </Route>
            <Route path="/dashboard">
              {props.isLoggedIn === false ? (
                <Redirect to="/login" />
              ) : (
                <div>
                  {!props.user ? (
                    <CircularProgress />
                  ) : (
                    <Dashboard
                      changePage={(name) => setToolbarName(name)}
                      user={props.user}
                    />
                  )}
                </div>
              )}
            </Route>
            <Route path="/cves">
              <CVEs changePage={(name) => setToolbarName(name)} />
            </Route>
            <Route path="/cpes">
              <CPEs changePage={(name) => setToolbarName(name)} />
            </Route>
            <Route exact path="/login">
              {props.isLoggedIn ? (
                <Redirect to="/dashboard" />
              ) : (
                <Login changePage={(name) => setToolbarName(name)} />
              )}
            </Route>
            <Route exact path="/github">
              {props.isLoggedIn === false ? (
                <Redirect to="/login" />
              ) : (
                <div>
                  {!props.user ? (
                    <CircularProgress />
                  ) : (
                    <GitHub
                      changePage={(name) => setToolbarName(name)}
                      user={props.user}
                    />
                  )}
                </div>
              )}
            </Route>
            <Route exact path="/report/:projectid">
              {props.isLoggedIn === false ? (
                <Redirect to="/login" />
              ) : (
                <div>
                  {!props.user ? (
                    <CircularProgress />
                  ) : (
                    <Report
                      changePage={(name) => setToolbarName(name)}
                      user={props.user}
                    />
                  )}
                </div>
              )}
            </Route>
          </Switch>
        </main>
      </div>
    </MuiThemeProvider>
  );
}

export default Application;
