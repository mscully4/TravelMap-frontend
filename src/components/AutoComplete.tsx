import React, { useState, useMemo } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete, { AutocompleteChangeReason, AutocompleteRenderOptionState, AutocompleteRenderInputParams } from '@material-ui/lab/Autocomplete';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Destination from '../types/destination';
import Place from '../types/place';
import _debounce from 'lodash/debounce';
import { AUTOCOMPLETE_RADIUS  } from '../utils/mapping';
import {GRANULARITIES, granularitySwitcher} from "../utils/granularity"

var debounce = require('debounce-promise')

const styles = makeStyles((theme: Theme) => ({}))


interface AutoCompleteProps {
  destinationOnChange?: (data: Destination) => void,
  placeOnChange?: (data: Place) => void,
  granularity: GRANULARITIES,
  searchRadius?: number
  destination?: Destination | null
}

export default function AutoComplete(props: AutoCompleteProps) {
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [searchValue, setSearchValue] = useState("");

  const autocomplete = new window.google.maps.places.AutocompleteService();
  const geocoder = new window.google.maps.Geocoder()

  const classes = styles();

  const getDestinationSuggestions = (input: string) => {
    const requestParameters = {
      input: input,
      types: ['(cities)'],
    }

    autocomplete.getPlacePredictions(requestParameters, (newSuggestions: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
      if (status === 'OK') {
        setSuggestions(newSuggestions!)
      }
    })
  }

  const getDestinationSuggestionsDebounced = useMemo(() => debounce(getDestinationSuggestions, 1000), [])

  const getPlaceSuggestions = (input: string) => {
    const location = new window.google.maps.LatLng(props.destination!.latitude, props.destination!.longitude);

    const requestParameters: google.maps.places.AutocompletionRequest = {
      input: input,
      types: ['establishment'],
      location: location,
      radius: AUTOCOMPLETE_RADIUS
    }

    autocomplete.getPlacePredictions(requestParameters, (newSuggestions: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
      if (status === 'OK') {
        setSuggestions(newSuggestions!);
      }
    })
  }

  const getPlaceSuggestionsDebounced = useMemo(() => _debounce(getPlaceSuggestions, 1000), [])

  const getSuggestions = granularitySwitcher(props.granularity, getDestinationSuggestionsDebounced, getPlaceSuggestionsDebounced)

  const onInputChange = (e: React.ChangeEvent<{}>, obj: string, reason: string) => {
    switch (reason.toLowerCase()) {
      // If the user has selected an autocomplete option
      case "reset":
        setSuggestions([])
        return
      // If the user has cleared the field
      case "clear":
        setSuggestions([]);
        setSearchValue("");
        return
      // If the user has input a character
      case "input":
        // update the input value
        setSearchValue(obj)

        //Only pull suggestions when the search string isn't empty and the user didn't clear the field
        if (obj !== "") {
          getSuggestions(obj)
        }
        return
    }
  }

  const onChangeDestination = (e: React.ChangeEvent<{}>, option: google.maps.places.AutocompletePrediction, reason: AutocompleteChangeReason) => {

    //This function will get run if the text box is cleared, so need to make sure a selection was actually made
    if (option) {

      //Update state to reflect the selection
      const name = option.terms[0].value
      setSearchValue(name);

      //Get additional data on the selection
      geocoder.geocode({ placeId: option.place_id }, (results, status) => {
        if (status === "OK" && results !== null) {
          const result = results[0]
          var state, countryCode, country;
          const latitude = parseFloat(result.geometry.location.lat().toFixed(4));
          const longitude = parseFloat(result.geometry.location.lng().toFixed(4));
          result.address_components.forEach((el, i) => {
            if (el.types.includes("administrative_area_level_1")) {
              state = el.long_name
            } else if (el.types.includes('country')) {
              country = el.long_name
              countryCode = el.short_name
            }
          })

          if (props.destinationOnChange) {
            props.destinationOnChange({
              name, country, latitude, longitude, countryCode, placeId: option.place_id
            })
          }
        }
      })
    }
  }


  const onChangePlace = (e: React.ChangeEvent<{}>, option: any, reason: AutocompleteChangeReason) => {
    if (option) {
      const name = option.structured_formatting.main_text

      //Update the search value
      setSearchValue(name);

      geocoder.geocode({ placeId: option.place_id }, (results, status) => {
        if (status === 'OK' && results !== null) {
          let street_number = "", street = "", county = "", city = "", state = "", zipCode = "", country = "", address = "", countryCode = "";
          results[0].address_components.forEach(el => {
            if (el.types.includes("street_number")) street_number = el.long_name;
            else if (el.types.includes("route")) street = el.long_name;
            else if (el.types.includes("sublocality")) county = el.long_name;
            else if (el.types.includes("locality")) city = el.long_name;
            else if (el.types.includes("administrative_area_level_1")) state = el.long_name;
            else if (el.types.includes("administrative_area_level_2")) county = el.long_name
            else if (el.types.includes("country")) {
              country = el.long_name;
              countryCode = el.short_name === "US" ? "US" : el.short_name;
            }
            else if (el.types.includes("postal_code")) zipCode = el.long_name;
          });
          const latitude = parseFloat(results[0].geometry.location.lat().toFixed(4));
          const longitude = parseFloat(results[0].geometry.location.lng().toFixed(4));
          const placeId = results[0].place_id

          address = street_number + " " + street
          //Send the location information back to the form, the fields will be filled with this information
          if (props.placeOnChange) {
            props.placeOnChange({
              name,
              address,
              city,
              state,
              country,
              zipCode,
              placeId,
              latitude,
              longitude,
              destinationId: props.destination!.placeId
            })
          }
        }
      })
    }
  }

  const renderOption = (option: any, state: AutocompleteRenderOptionState) => (
    <div>{granularitySwitcher(props.granularity, option.description, option.structured_formatting.main_text)}</div>
  )

  const renderInput = (params: AutocompleteRenderInputParams) => (
    <TextField
      {...params}
      autoFocus
      tabIndex={1}
      fullWidth
      margin="dense"
      label={granularitySwitcher(props.granularity, "Destination", "Place")}
      variant="standard"
      value={searchValue}
    />
  )


  return (
    <Autocomplete
      freeSolo
      options={suggestions}
      getOptionLabel={(option) => option.description}
      // @ts-ignore: The google.maps.places.AutocompletePredictions definition is stupid
      onChange={granularitySwitcher(props.granularity, onChangeDestination, onChangePlace)}
      inputValue={searchValue}
      onInputChange={onInputChange}
      // The component will automatically filter some options out if this isn't specified
      filterOptions={(options, state) => options}
      renderOption={renderOption}
      renderInput={renderInput}
    />)

}