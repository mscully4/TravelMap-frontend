import { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@material-ui/core";
import { objectKeysSnakeCasetoCamelCase, resendVerificationCode, setTokensInLocalStorage, userLogin, verifyUser } from '../utils/backend';
import LoadingButton from '@mui/lab/LoadingButton';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { Transition } from '../utils/mui';
import AuthContext from '../types/authContext';
import { LoginResponse } from '../types/loginResponse';
import VerifyUser from '../types/verifyUser';
import Login from '../types/login';
import ResendVerificationCode from '../types/resendVerificationCode';

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

interface VerifyProps {
  open: boolean,
  setOpen: (value: boolean) => void,
  setLoggedIn: (value: boolean) => void,
  setLoggedInUser: (value: string | null) => void,
  authContext: AuthContext | null
}

export default function Verify(props: VerifyProps) {
  const [confirmationCode, setConfirmationCode] = useState("")
  const [error, setError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const classes = styles()

  const login = () => {
    const data: Login = {
      username: props.authContext!.username,
      password: props.authContext!.password
    }

    userLogin(data)
    .then(resp => {
      if (resp.ok) {
        resp.json().then(json => {
          const loginResponse: LoginResponse = objectKeysSnakeCasetoCamelCase(json);
          setTokensInLocalStorage(data.username, loginResponse)
          props.setLoggedIn(true);
          props.setLoggedInUser(data.username);
          setIsLoading(false);    
          props.setOpen(false);  
        })
      } else {
        resp.json().then(json => {
          setError(json.message)
          setIsLoading(false);
        })
      }
    })
    .catch((error) => {
      setIsLoading(false);
      setError(error)
    })
  }

  const onButtonClick = () => {
    setIsLoading(true)

    const data: VerifyUser = {
      username: props.authContext!.username,
      confirmation_code: confirmationCode
    }

    verifyUser(data).then(resp => {
      if (resp.ok) {
        // If the verification is successful, log the user in
        // the login call will handle closing the form and whatnot
        login()
      } else {
        setIsLoading(false);
        resp.json().then(json => {
          setError(json.message)
        })
      }
    })
    .catch(error => {
      setIsLoading(false);
      setError(error);
    })
  }

  const resendCodeClick = () => {
    const data: ResendVerificationCode = {
      username: props.authContext!.username
    }

    resendVerificationCode(data)
    .then(resp => {
      if (!resp.ok) {
        resp.json().then(json => {
          setError(json.message)
        })
      }
    })
    .catch(error => {
      setError(error);
    })
  }

  const clearForm = () => {
    setConfirmationCode("");
    setError(null)
  }

  const onClose = () => {
    clearForm();
    props.setOpen(false);
  }

  const buttonIsDisabled = () => {
    return confirmationCode.length !== 6;
  }

  return (
    <Dialog
      TransitionComponent={Transition}
      open={props.open}
      onClose={onClose}
    >
      <DialogTitle>Verify Email</DialogTitle>
      <DialogContent>
        <DialogContentText>Enter the confirmation code sent to your email.</DialogContentText>
        <DialogContentText>Need another code?  Click <a onClick={resendCodeClick} href="#">here</a></DialogContentText>
        <TextField
          autoFocus
          disabled={isLoading}
          margin="dense"
          label="Confirmation Code"
          type="text"
          fullWidth
          variant="standard"
          onChange={(e) => { setConfirmationCode(e.target.value) }}
        />
        <div style={{height: 20}}></div>
        { error ? <h6 className={classes.errorText}>{error}</h6> : null}
      </DialogContent>
      <DialogActions>
        <LoadingButton
          className={classes.submitButton}
          loading={isLoading}
          variant="contained"
          disabled={buttonIsDisabled()}
          onClick={onButtonClick}
        >Submit</LoadingButton>
      </DialogActions>
    </Dialog>
  )
}