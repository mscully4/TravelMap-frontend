import { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@material-ui/core";
import { postDestination } from '../utils/backend';
import AutoComplete from './AutoComplete';
import { makeStyles, Theme } from '@material-ui/core/styles';
import LoadingButton from '@mui/lab/LoadingButton';
import Destination from '../types/destination';
import { Transition } from '../utils/mui';
import { GRANULARITIES } from '../utils/granularity';

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

interface AddDestinationProps {
  open: boolean,
  setOpen: (value: boolean) => void,
  refreshUserData: () => void
}

export default function AddDestination(props: AddDestinationProps) {
  const [placeId, setPlaceId] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const classes = styles();

  const selectAutoSuggest = (data: Destination) => {
    setPlaceId(data.placeId)
    setName(data.name)
    setCountry(data.country)
    setCountryCode(data.countryCode)
    setLatitude(data.latitude.toString())
    setLongitude(data.longitude.toString())
  }

  const clearForm = () => {
    setPlaceId("")
    setName("")
    setCountry("")
    setCountryCode("")
    setLatitude("")
    setLongitude("")
    setError(null);
  }

  const addDestinationButtonClick = () => {
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
          clearForm();
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

  const buttonIsDisabled = () => {
    return placeId === ""||
      name === "" ||
      country === "" ||
      countryCode === "" ||
      latitude === "" ||
      longitude === ""
  }

  return (
    <Dialog
      TransitionComponent={Transition}
      open={props.open}
      onClose={onModalClose}
    >
      <DialogTitle>Add a Destination</DialogTitle>
      <DialogContent>
        <AutoComplete
          destinationOnChange={selectAutoSuggest}
          granularity={GRANULARITIES.DESTINATIONS}
        />
        <TextField
          margin="dense"
          label="Place Id"
          type="text"
          fullWidth
          variant="standard"
          tabIndex={2}
          value={placeId}
          onChange={(e) => { setPlaceId(e.target.value) }}
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
          disabled={buttonIsDisabled()}
          variant="contained"
          onClick={addDestinationButtonClick}
        >Submit</LoadingButton>
      </DialogActions>
    </Dialog>)
}
