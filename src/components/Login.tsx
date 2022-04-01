import { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@material-ui/core";
import { objectKeysSnakeCasetoCamelCase, setTokensInLocalStorage, userLogin } from '../utils/backend';
import LoadingButton from '@mui/lab/LoadingButton';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { Transition } from '../utils/mui';
import { LoginResponse } from '../types/loginResponse';
import AuthContext from '../types/authContext';
import Login from '../types/login';

const styles = makeStyles((theme: Theme) => ({
  title: {
    fontFamily: "aguafina-script"
  },
  buttonContainer: {
    position: "absolute",
    right: "5%"
  },
  submitButton: {
    width: "100%",
    margin: "auto"
  },
  errorText: {
    margin: "unset",
    color: theme.palette.error.main
  }
}))

interface LoginProps {
  open: boolean,
  setLoggedIn: (value: boolean) => void,
  setOpen: (value: boolean) => void,
  setLoggedInUser: (value: string | null) => void,
  setVerifyIsOpen: (value: boolean) => void
  setAuthContext: (authContext: AuthContext) => void
}

export default function Header(props: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const classes = styles()

  const clearForm = () => {
    setUsername("");
    setPassword("");
    setError(null);
  }

  const loginButtonOnClick = () => {
    setIsLoading(true)

    const data: Login = {
      username,
      password
    }

    userLogin(data)
      .then(resp => {
        if (resp.ok) {
          resp.json().then(json => {
            const loginResponse: LoginResponse = objectKeysSnakeCasetoCamelCase(json);
            setTokensInLocalStorage(username, loginResponse);
            props.setLoggedIn(true)
            props.setLoggedInUser(username);
            props.setOpen(false)
            clearForm()
          })
        } else if (resp.status === 403) {
          // A 403 indicates the user still needs to verify their account
          // The AuthContext saves the user's credentials so that once they verify their
          // account, we can auto-log them in
          props.setAuthContext({
            username: username,
            password: password
          })
          clearForm()
          props.setOpen(false);
          props.setVerifyIsOpen(true);
        } else {
          setPassword("");
          resp.json().then(json => {
            setError(json.message)
          })
        }
        setIsLoading(false)
      })
      .catch((error) => {
        setIsLoading(false);
        setPassword("");
        setError(error)
      })
  }

  const onClose = () => {
    clearForm()
    props.setOpen(false)
  }

  const buttonIsDisabled = () => {
    return (username === "" || password === "")
  }

  return (
    <Dialog
      TransitionComponent={Transition}
      open={props.open}
      onClose={onClose}
    >
      <DialogTitle>Login</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          disabled={isLoading}
          margin="dense"
          label="Username"
          type="text"
          fullWidth
          variant="standard"
          value={username}
          onChange={(e) => { setUsername(e.target.value) }}
        />
        <TextField
          disabled={isLoading}
          margin="dense"
          label="Password"
          type="password"
          fullWidth
          variant="standard"
          value={password}
          onChange={(e) => { setPassword(e.target.value) }}
        />
        <div style={{ height: 20 }}></div>
        {error ? <h6 className={classes.errorText}>{error}</h6> : null}
      </DialogContent>
      <DialogActions>
        <LoadingButton
          className={classes.submitButton}
          loading={isLoading}
          variant="contained"
          onClick={loginButtonOnClick}
          disabled={buttonIsDisabled()}
        >Submit</LoadingButton>
      </DialogActions>
    </Dialog>
  )
}