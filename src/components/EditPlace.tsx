import { useEffect, useState } from 'react';
import { Theme } from '@material-ui/core/styles';
import { makeStyles } from '@material-ui/styles'
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@material-ui/core";
import { postPlace } from '../utils/backend';
import LoadingButton from '@mui/lab/LoadingButton';
import Place from '../types/place';
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

interface EditPlaceProps {
  open: boolean,
  setOpen: (value: boolean) => void,
  place: Place | null,
  refreshUserData: () => void
}

export default function EditPlace(props: EditPlaceProps) {
  const [placeId, setPlaceId] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [destinationId, setDestinationId] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const classes = styles();
  const place = props.place;

  useEffect(() => {
    if (props.open) {
      setPlaceId(place!.placeId);
      setName(place!.name);
      setAddress(place!.address);
      setCity(place!.city)
      setState(place!.state)
      setCountry(place!.country);
      setZipCode(place!.zipCode);
      setLatitude(place!.latitude.toString());
      setLongitude(place!.longitude.toString());
      setDestinationId(place!.destinationId);
    }
  }, [props.open])

  const clearForm = () => {
    setPlaceId("")
    setName("")
    setAddress("")
    setCity("")
    setState("")
    setCountry("")
    setZipCode("")
    setLatitude("")
    setLongitude("")
    setDestinationId("")
    setError(null)
  }

  const addPlaceButtonClick = () => {
    setIsLoading(true);

    const data: Place = {
      placeId: placeId,
      name: name,
      address: address,
      city: city,
      state: state,
      country: country,
      zipCode: zipCode,
      longitude: parseFloat(longitude),
      latitude: parseFloat(latitude),
      destinationId: destinationId
    }

    postPlace(data)
      .then(resp => {
        if (resp.ok) {
          props.refreshUserData();
          props.setOpen(false);
        } else {
          resp.json().then(json => {
            setError(json.message)
            console.log(json.message)
          })
        }
        setIsLoading(false);
        clearForm()
      })
      .catch(error => {
        setError(error);
        setIsLoading(false)
      })
  }

  const onModalClose = () => {
    props.setOpen(false);
    clearForm()
  }

  const somethingHasChanged = () => {
    if (props.place == null) return false;

    return place!.name !== name ||
      place!.address !== address ||
      place!.city !== city ||
      place!.state !== state ||
      place!.country !== country ||
      place!.zipCode !== zipCode ||
      place!.latitude.toString() !== latitude ||
      place!.longitude.toString() !== longitude;
  }

  return (
    <Dialog
      TransitionComponent={Transition}
      open={props.open}
      onClose={onModalClose}
    >
      <DialogTitle>Edit a Place</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          variant="standard"
          value={name}
          onChange={(e) => { setName(e.target.value) }}
        />
        <TextField
          margin="dense"
          label="Address"
          type="text"
          fullWidth
          variant="standard"
          value={address}
          onChange={(e) => { setAddress(e.target.value) }}
        />
        <TextField
          margin="dense"
          label="City"
          type="text"
          fullWidth
          variant="standard"
          value={city}
          onChange={(e) => { setCity(e.target.value) }}
        />
        <TextField
          margin="dense"
          label="State"
          type="text"
          fullWidth
          variant="standard"
          value={state}
          onChange={(e) => { setState(e.target.value) }}
        />
        <TextField
          margin="dense"
          label="Country"
          type="text"
          fullWidth
          variant="standard"
          value={country}
          onChange={(e) => { setCountry(e.target.value) }}
        />
        <TextField
          margin="dense"
          label="Zip Code"
          type="text"
          fullWidth
          variant="standard"
          value={zipCode}
          onChange={(e) => { setZipCode(e.target.value) }}
        />
        <TextField
          margin="dense"
          label="Latitude"
          type="text"
          fullWidth
          variant="standard"
          value={latitude}
          onChange={(e) => { setLatitude(e.target.value) }}
        />
        <TextField
          margin="dense"
          label="Longitude"
          type="text"
          fullWidth
          variant="standard"
          value={longitude}
          onChange={(e) => { setLongitude(e.target.value) }}
        />
        <div style={{height: 20}}></div>
        { error ? <h6 className={classes.errorText}>{error}</h6> : null}
      </DialogContent>
      <DialogActions>
        <LoadingButton
          className={classes.submitButton}
          disabled={!somethingHasChanged()}
          loading={isLoading}
          variant="contained"
          onClick={addPlaceButtonClick}
        >Submit</LoadingButton>
      </DialogActions>
    </Dialog>)
}
