import { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@material-ui/core";
import { deleteDestination, deletePlace } from '../utils/backend';
import { makeStyles, Theme } from '@material-ui/core/styles';
import LoadingButton from '@mui/lab/LoadingButton';
import Destination from '../types/destination';
import { Transition } from '../utils/mui';
import Place from '../types/place';
import { GRANULARITIES, granularitySwitcher } from '../utils/granularity';

const styles = makeStyles((theme: Theme) => ({
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

interface DeleteObjectProps {
  open: boolean,
  setOpen: (value: boolean) => void,
  object: Destination | Place | null,
  granularity: GRANULARITIES,
  refreshUserData: () => void
}

export default function DeleteObject(props: DeleteObjectProps) {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const classes = styles();

  const deleteFunction = granularitySwitcher(props.granularity, deleteDestination, deletePlace);

  const deleteObject = () => {
    setIsLoading(true);
    deleteFunction(props.object)
      .then(resp => {
        if (resp.ok) {
          props.refreshUserData()
          setIsLoading(false);
          props.setOpen(false);
        } else {
          resp.json().then(json => {
            setIsLoading(false);
            setError(json.message)
          })
        }
      })
      .catch(error => {
        setIsLoading(false);
        setError(error);
      })
  }

  const onModalClose = () => {
    props.setOpen(false);
  }

  return (
    <Dialog
      TransitionComponent={Transition}
      open={props.open}
      onClose={onModalClose}
    >
      <DialogTitle>Are you sure you want to delete?</DialogTitle>
      <DialogContent>
        <div>
          {`${granularitySwitcher(props.granularity, "Destination", "Place")}: ${props.object?.name}`}
        </div>
        { error ? <h6 className={classes.errorText}>{error}</h6> : null}
      </DialogContent>
      <DialogActions>
        <LoadingButton
          className={classes.submitButton}
          loading={isLoading}
          variant="contained"
          onClick={deleteObject}
        >Delete</LoadingButton>
      </DialogActions>
    </Dialog>)
}
