import { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@material-ui/core";
import { postDestination } from '../utils/backend';
import { makeStyles, Theme } from '@material-ui/core/styles';
import LoadingButton from '@mui/lab/LoadingButton';
import Destination from '../types/destination';
import { Transition } from '../utils/mui';

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

interface EditDestinationProps {
  open: boolean,
  setOpen: (value: boolean) => void,
  destination: Destination | null,
  refreshUserData: () => void
}

export default function EditDestination(props: EditDestinationProps) {
  const [placeId, setPlaceId] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const classes = styles();
  const destination = props.destination;

  useEffect(() => {
    if (props.open) {
      setPlaceId(destination!.placeId);
      setName(destination!.name);
      setCountry(destination!.country);
      setCountryCode(destination!.countryCode);
      setLatitude(destination!.latitude.toString());
      setLongitude(destination!.longitude.toString());
    }
  }, [props.open])

  const clearForm = () => {
    setPlaceId("")
    setName("")
    setCountry("")
    setCountryCode("")
    setLatitude("")
    setLongitude("")
    setError(null)
  }

  const editDestinationButtonClick = () => {
    setIsLoading(true);

    const data: Destination = {
      name: name,
      placeId: placeId,
      country: country,
      countryCode: countryCode,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    }

    postDestination(data)
      .then(resp => {
        if (resp.ok) {
          props.refreshUserData();
          props.setOpen(false);
        } else {
          resp.json().then(json => {
            setError(json.message)
          })
        }
        setIsLoading(false)

      })
      .catch(error => {
        setError(error)
        setIsLoading(false)
      })
  }

  const onModalClose = () => {
    props.setOpen(false);
    clearForm()
  }

  const somethingHasChanged = () => {
    if (destination == null) return false;
    return destination.name !== name
      || destination.country !== country
      || destination.countryCode !== countryCode
      || destination.latitude.toString() !== latitude
      || destination.longitude.toString() !== longitude
  }

  const buttonDisabled = !somethingHasChanged();

  return (
    <Dialog
      TransitionComponent={Transition}
      open={props.open}
      onClose={onModalClose}
    >
      <DialogTitle>Edit a Destination</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          variant="standard"
          tabIndex={1}
          value={name}
          onChange={(e) => { setName(e.target.value) }}
        />
        <TextField
          margin="dense"
          label="Country"
          type="text"
          variant="standard"
          fullWidth
          tabIndex={3}
          value={country}
          onChange={(e) => { setCountry(e.target.value) }}
        />
        <TextField
          margin="dense"
          label="Country Code"
          type="text"
          fullWidth
          variant="standard"
          tabIndex={4}
          value={countryCode}
          onChange={(e) => { setCountryCode(e.target.value) }}
        />
        <TextField
          margin="dense"
          label="Latitude"
          type="text"
          fullWidth
          variant="standard"
          tabIndex={5}
          value={latitude}
          onChange={(e) => { setLatitude(e.target.value) }}
        />
        <TextField
          margin="dense"
          label="Longitude"
          type="text"
          fullWidth
          variant="standard"
          tabIndex={6}
          value={longitude}
          onChange={(e) => { setLongitude(e.target.value) }}
        />
        <div style={{ height: 20 }}></div>
        {error ? <h6 className={classes.errorText}>{error}</h6> : null}
      </DialogContent>
      <DialogActions>
        <LoadingButton
          className={classes.submitButton}
          loading={isLoading}
          variant="contained"
          disabled={buttonDisabled}
          onClick={editDestinationButtonClick}
        >Submit</LoadingButton>
      </DialogActions>
    </Dialog>)
}
