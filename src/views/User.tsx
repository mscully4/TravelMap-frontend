import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { makeStyles, Theme } from '@material-ui/core/styles';
import { MapRef } from 'react-map-gl';
import Map from "../components/Map"
import AddDestination from '../components/AddDestination';
import AddPlace from '../components/AddPlace';
import VirtualTable from '../components/Table'
import EditDestination from "../components/EditDestination";
import DeleteObject from "../components/DeleteObject";
import EditPlace from "../components/EditPlace";
import { getDestinations, getPlaces, objectKeysSnakeCasetoCamelCase } from '../utils/backend';
import { pinColors } from "../utils/colors";
import { DISTANCE_FROM_CITY, getDistanceBetweenTwoPoints } from "../utils/mapping";
import { GRANULARITIES, GRANULARITY_CUTOFF } from "../utils/granularity";
import Destination from '../types/destination'
import Place from "../types/place";

const styles = makeStyles((theme: Theme) => ({
  main: {
    display: 'grid',
    gridTemplateColumns: "1fr 1fr",
    width: "90%",
    marginBottom: 0,
    marginLeft: "5%",
    marginRight: "5%",
    height: "80%",
    boxShadow: theme.shadows[20]
  },
  addIcon: {
    marginTop: "10%",
    width: "10% !important",
    height: "10% !important"
  }
}))

interface UserProps {
  isLoggedIn: boolean,
  loggedInUser: string | null
}

function User(props: UserProps) {
  const params = useParams();
  const classes = styles();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [places, setPlaces] = useState<Record<string, Place[]>>({});
  const [addDestinationIsOpen, setAddDestinationsIsOpen] = useState(false);
  const [addPlaceDestination, setAddPlaceDestination] = useState<Destination | null>(null);
  const [addPlaceIsOpen, setAddPlaceIsOpen] = useState(false);
  const [editDestination, setEditDestination] = useState<Destination | null>(null)
  const [editDestinationIsOpen, setEditDestinationIsOpen] = useState(false);
  const [editPlace, setEditPlace] = useState<Place | null>(null);
  const [editPlaceIsOpen, setEditPlaceIsOpen] = useState(false);
  const [deleteIsOpen, setDeleteIsOpen] = useState(false);
  const [deleteObject, setDeleteObject] = useState<Destination | Place | null>(null)
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [mapRef, setMapRef] = useState<MapRef>();
  const [mapGranularity, _setMapGranularity] = useState<GRANULARITIES>(GRANULARITIES.DESTINATIONS);
  const [colorMap, setColorMap] = useState<Record<string, string>>({})
  const [renderablePlaces, setRenderablePlaces] = useState<Place[]>([]);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);

  const [height, setHeight] = useState(window.innerHeight);
  window.addEventListener('resize', () => {
    if (window.innerHeight !== height) setHeight(window.innerHeight);
  })

  const setMapGranularity = (zoom: number) => {
    if (zoom > GRANULARITY_CUTOFF) {
      _setMapGranularity(GRANULARITIES.PLACES)
    } else {
      _setMapGranularity(GRANULARITIES.DESTINATIONS)
    }
  }

  const updateRenderablePlaces = () => {
    const mapCenter = mapRef?.getCenter();
    if (!mapCenter) return;

    let closestDestination: Destination;
    let closestDestinationDistance: number = Infinity;
    destinations.forEach(obj => {
      var distance = getDistanceBetweenTwoPoints(obj.latitude, obj.longitude, mapCenter.lat, mapCenter.lng);
      if (distance < closestDestinationDistance) {
        closestDestination = obj;
        closestDestinationDistance = distance;
      }
    })


    if (closestDestinationDistance <= DISTANCE_FROM_CITY && places && closestDestination!.placeId in places) {
      setRenderablePlaces(places[closestDestination!.placeId])
    } else {
      setRenderablePlaces([])
    }
  }

  const refreshUserData = () => {
    setIsLoadingUserData(true)
    getDestinations(params.user!).then(destinations => {
      destinations.json().then(json => {
        setDestinations(json.map(obj => objectKeysSnakeCasetoCamelCase(obj.Entity)));
        setIsLoadingUserData(false);
      })
    })

    getPlaces(params.user!).then(resp => {
      resp.json().then(json => {
        const formattedEntities = json.map((obj) => objectKeysSnakeCasetoCamelCase(obj.Entity))

        const places = formattedEntities.reduce((map, obj) => {
          map[obj.destinationId] = map[obj.destinationId] ? map[obj.destinationId].concat([obj]) : [obj];
          return map
        }, {})

        setPlaces(places)
      })
    })
  }

  useEffect(() => {
    refreshUserData()
  }, [params.user])

  useEffect(() => {
    const destinationColors = destinations.reduce((map, obj) => {
      map[obj.placeId] = pinColors[Math.floor(Math.random() * pinColors.length)];
      return map;
    }, {})
    setColorMap((prevState) => ({
      ...prevState,
      ...destinationColors
    }))
  }, [destinations.length > 0])

  useEffect(() => {
    updateRenderablePlaces()
    const placeList = Object.keys(places).flatMap((key) => places[key]);
    const placeColors = placeList.reduce((map, obj) => {
      map[obj.placeId] = pinColors[Math.floor(Math.random() * pinColors.length)];
      return map;
    }, {})
    setColorMap((prevState) => ({
      ...prevState,
      ...placeColors
    }))
  }, [places])

  return (
    <div style={{ height: height }}>
      <div style={{ height: window.innerHeight / 10 }}></div>
      <div className={classes.main} >
        <Map
          destinations={destinations}
          places={places}
          renderablePlaces={renderablePlaces}
          hoverId={hoverId}
          setHoverId={setHoverId}
          setMapRef={setMapRef}
          mapGranularity={mapGranularity}
          setMapGranularity={setMapGranularity}
          updateRenderablePlaces={updateRenderablePlaces}
          colorMap={colorMap}
        />
        <VirtualTable
          destinations={destinations}
          renderablePlaces={renderablePlaces}
          isLoggedIn={props.isLoggedIn}
          isLoadingUserData={isLoadingUserData}
          allowEdits={props.isLoggedIn && props.loggedInUser === params.user}
          setAddDestinationsIsOpen={setAddDestinationsIsOpen}
          setAddPlaceIsOpen={setAddPlaceIsOpen}
          setAddPlaceDestination={setAddPlaceDestination}
          setEditDestinationIsOpen={setEditDestinationIsOpen}
          setEditDestination={setEditDestination}
          setEditPlaceIsOpen={setEditPlaceIsOpen}
          setEditPlace={setEditPlace}
          setDeleteIsOpen={setDeleteIsOpen}
          setDeleteObject={setDeleteObject}
          hoverId={hoverId}
          setHoverId={setHoverId}
          mapRef={mapRef}
          mapGranularity={mapGranularity}
        />
      </div>
      <AddDestination
        open={addDestinationIsOpen}
        setOpen={setAddDestinationsIsOpen}
        refreshUserData={refreshUserData}
      />
      <AddPlace
        open={addPlaceIsOpen}
        destination={addPlaceDestination}
        setOpen={setAddPlaceIsOpen}
        refreshUserData={refreshUserData}
      />
      <EditDestination
        open={editDestinationIsOpen}
        setOpen={setEditDestinationIsOpen}
        destination={editDestination!}
        refreshUserData={refreshUserData}
      />
      <EditPlace 
        open={editPlaceIsOpen}
        setOpen={setEditPlaceIsOpen}
        place={editPlace}
        refreshUserData={refreshUserData}
      />
      <DeleteObject
        open={deleteIsOpen}
        setOpen={setDeleteIsOpen}
        object={deleteObject}
        refreshUserData={refreshUserData}
        granularity={mapGranularity}
      />
    </div>
  )
}

export default User;