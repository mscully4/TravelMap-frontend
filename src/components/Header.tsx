import React, { useState } from "react";
import { AppBar, Button, Toolbar, Typography } from "@material-ui/core";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Login from './Login'
import SignUp from "./SignUp";
import Verify from "./Verify";
import AuthContext from "../types/authContext";

const styles = makeStyles((theme: Theme) => ({
  appBar: {
    backgroundColor: theme.palette.primary[900]
  },
  title: {
    fontFamily: "aguafina-script",
    color: theme.palette.primary.contrastText
  },
  loggedInUser: {
    display: "inline-block",
    paddingRight: theme.spacing(3)
  },
  buttonContainer: {
    position: "absolute",
    right: theme.spacing(5)
  },
  button: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    color: theme.palette.primary.contrastText,
  }
}))

interface HeaderProps {
  isLoggedIn: boolean,
  setIsLoggedIn: (value: boolean) => void,
  loggedInUser: string | null,
  setLoggedInUser: (value: string | null) => void
}

export default function Header(props: HeaderProps) {
  const classes = styles()

  const [loginIsOpen, setLoginIsOpen] = React.useState(false);
  const [signUpIsOpen, setSignUpIsOpen] = React.useState(false);
  const [verifyIsOpen, setVerifyIsOpen] = useState(false);
  const [authContext, setAuthContext] = useState<AuthContext | null>(null);

  const logOut = () => {
    localStorage.clear()
    props.setIsLoggedIn(false)
    props.setLoggedInUser(null);
  }

  const notloggedInButtons = (
    <div className={classes.buttonContainer}>
      <Button className={classes.button} color="secondary" variant="contained" onClick={() => setSignUpIsOpen(true)}>Signup</Button>
      <Button className={classes.button} color="secondary" variant="contained" onClick={() => setLoginIsOpen(true)}>Login</Button>
    </div>
  )

  const loggedInButtons = (
    <div className={classes.buttonContainer}>
      <div className={classes.loggedInUser}>Hi {props.loggedInUser}!</div>
      <Button className={classes.button} color="secondary" variant="contained" onClick={() => logOut()}>Logout</Button>
    </div>
  )

  const appBarClasses = {
    root: classes.appBar
  }

  return (
    <AppBar classes={appBarClasses}>
      <Toolbar>
        <Typography variant="h4" className={classes.title}>TravelMap</Typography>
        {props.isLoggedIn ? loggedInButtons : notloggedInButtons}
      </Toolbar>
      <Login
        open={loginIsOpen}
        setOpen={setLoginIsOpen}
        setLoggedIn={props.setIsLoggedIn}
        setLoggedInUser={props.setLoggedInUser}
        setVerifyIsOpen={setVerifyIsOpen}
        setAuthContext={setAuthContext}
      />
      <SignUp
        open={signUpIsOpen}
        setOpen={setSignUpIsOpen}
        setLoggedIn={props.setIsLoggedIn}
        setLoggedInUser={props.setLoggedInUser}
        setVerifyIsOpen={setVerifyIsOpen}
        setAuthContext={setAuthContext}
      />
      <Verify
        open={verifyIsOpen}
        setOpen={setVerifyIsOpen}
        setLoggedIn={props.setIsLoggedIn}
        setLoggedInUser={props.setLoggedInUser}
        authContext={authContext}
      />
    </AppBar>
  );
}
