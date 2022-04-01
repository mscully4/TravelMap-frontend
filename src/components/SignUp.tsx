import { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@material-ui/core";
import LoadingButton from '@mui/lab/LoadingButton';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { userSignUp } from '../utils/backend';
import { Transition } from '../utils/mui';
import CreateUser from '../types/createUser';
import AuthContext from '../types/authContext';

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

interface SignUpProps {
  open: boolean,
  setOpen: (value: boolean) => void,
  setLoggedIn: (value: boolean) => void,
  setLoggedInUser: (value: string | null) => void,
  setVerifyIsOpen: (value: boolean) => void,
  setAuthContext: (authContext: AuthContext) => void
}

export default function SignUp(props: SignUpProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const classes = styles()

  const signUpButtonOnClick = () => {
    setIsLoading(true)

    const data: CreateUser = {
      email,
      username,
      password
    }

    userSignUp(data)
      .then(resp => {

        if (resp.ok) {
          // the AuthContext is needed to issue tokens once the user if verified
          props.setAuthContext({
            username: username,
            password: password
          })

          setIsLoading(false);
          props.setOpen(false);

          props.setVerifyIsOpen(true);
        } else {
          setIsLoading(false);
          setPassword("");
          setConfirmPassword("");
          resp.json().then(json => {
            setError(json.message)
          })
        }
      })
  }

  const clearForm = () => {
    setEmail("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setError(null);
  }

  const onClose = () => {
    clearForm();
    props.setOpen(false);
  }

  const buttonIsDisabled = () => {
    return (email === "" ||
      username === "" ||
      password === "" ||
      password !== confirmPassword)
  }

  return (
    <Dialog
      TransitionComponent={Transition}
      open={props.open}
      onClose={onClose}
    >
      <DialogTitle>Sign Up</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          disabled={isLoading}
          margin="dense"
          label="Email"
          type="text"
          fullWidth
          variant="standard"
          onChange={(e) => { setEmail(e.target.value) }}
        />
        <TextField
          disabled={isLoading}
          margin="dense"
          label="Username"
          type="text"
          fullWidth
          variant="standard"
          onChange={(e) => { setUsername(e.target.value) }}
        />
        <TextField
          disabled={isLoading}
          margin="dense"
          label="Password"
          type="password"
          fullWidth
          variant="standard"
          autoComplete="off"
          onChange={(e) => { setPassword(e.target.value) }}
        />
        <TextField
          disabled={isLoading}
          margin="dense"
          label="Confirm Password"
          type="password"
          fullWidth
          variant="standard"
          autoComplete="new-password"
          onChange={(e) => { setConfirmPassword(e.target.value) }}
        />
        <div style={{ height: 20 }}></div>
        {error ? <h6 className={classes.errorText}>{error}</h6> : null}
      </DialogContent>
      <DialogActions>
        <LoadingButton
          className={classes.submitButton}
          loading={isLoading}
          variant="contained"
          disabled={buttonIsDisabled()}
          onClick={signUpButtonOnClick}
        >Submit</LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
