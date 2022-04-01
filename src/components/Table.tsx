import { memo, useState, useRef } from 'react';
import { Column, Table } from 'react-virtualized';
import 'react-virtualized/styles.css';
import clsx from 'clsx';
import ReactCountryFlag from "react-country-flag"
import { makeStyles, Theme } from '@material-ui/core/styles';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import { MapRef } from 'react-map-gl';
import DropDown from './DropDown';
import { lightTheme } from "../utils/colors"
import { granularitySwitcher, GRANULARITIES } from '../utils/granularity';
import Destination from '../types/destination';
import Place from '../types/place';

const styles = makeStyles((theme: Theme) => ({
  container: {
    backgroundColor: lightTheme.palette.background.paper,
    width: '100%',
    overflow: "hidden"
  },
  table: {
    width: '100%'
  },
  tableRow: {
    cursor: 'pointer',
    '&:focus': {
      outline: "none"
    },
  },
  headerRow: {
    fontWeight: 700,
  },
  tableHeader: {
    margin: "0 !important"
  },
  rowA: {
    backgroundColor: lightTheme.palette.grey[100]
  },
  rowB: {
    backgroundColor: lightTheme.palette.grey[200]
  },
  rowHover: {
    backgroundColor: lightTheme.palette.secondary[300],
  },
  cell: {
    display: "grid",
    gridTemplateRows: '100%',
    gridTemplateColumns: '3fr 1fr',
    height: '100%',
    alignItems: 'center'
  },
  cellText: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: lightTheme.palette.text.primary,
    whiteSpace: 'normal',
    wordWrap: 'break-word'
  },
  columnHeader: {
    textAlign: "center",
    color: lightTheme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary[900],
    position: 'relative'
  },
  column: {
    width: '100%',
    height: '100%'
  },
  grid: {
    width: "100% !important",
    // The default scrollbar should be overridden at some point, here is
    // how to hide it
    // "& div": {
    //   maxWidth: "unset !important"
    // },
    // "&::-webkit-scrollbar": {
    //   display: "none"
    // },
  },
  addPlaceIcon: {
    position: "absolute",
    fill: lightTheme.palette.primary.main,
    stroke: lightTheme.palette.primary.main,
    top: "5%",
    height: "15% !important"
  },
  addDestinationIcon: {
    position: "absolute",
    right: "1%",
    fill: lightTheme.palette.text.primary,
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer"
  },
  spinnerBox: {
    marginTop: "50%"
  },
  spinner: {
    margin: "auto",
    display: "block"
  },
  noRows: {
    textAlign: "center",
  }
}))

interface VirtualTableProps {
  destinations: Destination[],
  renderablePlaces: Place[],
  setAddPlaceDestination: (value: Destination) => void,
  setAddPlaceIsOpen: (value: boolean) => void,
  setEditDestinationIsOpen: (value: boolean) => void,
  setEditDestination: (destination: Destination) => void,
  setEditPlaceIsOpen: (value: boolean) => void,
  setEditPlace: (place: Place) => void,
  setHoverId: (value: string | null) => void,
  setDeleteIsOpen: (value: boolean) => void,
  setDeleteObject: (value: Destination | Place) => void,
  hoverId: string | null,
  mapGranularity: GRANULARITIES,
  mapRef: MapRef | undefined
  setAddDestinationsIsOpen: (valie: boolean) => void,
  isLoggedIn: boolean,
  isLoadingUserData: boolean,
  allowEdits: boolean
}

function VirtualTable(props: VirtualTableProps) {
  const classes = styles();

  const [allowMouseOver, setAllowMouseOver] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const width = containerRef.current ? containerRef.current.offsetWidth : 0;
  const height = containerRef.current ? containerRef.current.offsetHeight : 0;

  const headerHeight = height / 20;
  const rowHeight = 150;

  const getRowClassName = (index, obj) => {
    return clsx({ [classes.tableRow]: index !== -1 },
      { [classes.rowHover]: (obj ? obj.placeId : -1) === props.hoverId },
      { [classes.rowB]: index % 2 === 0 },
      { [classes.rowA]: index % 2 === 1 },
    )
  }

  const isScrollbarVisible = () => {
    if (containerRef.current) {
      const grid = containerRef.current.getElementsByClassName("ReactVirtualized__Grid");
      if (grid.length > 0) return grid[0].scrollHeight > grid[0].clientHeight;
    }
    return false;
  }

  const cellRendererDestination = (data: Destination) => {
    return (
      <div className={clsx(classes.cell)}>
        <p className={clsx(classes.cellText)}>
          {data.name}, <br />   {data.country} <br />
        </p>

        <ReactCountryFlag
          countryCode={data.countryCode}
          svg
          style={{
            height: "40%",
            width: 'auto',
            margin: 'auto',
            position: "absolute",
            right: "10%"
          }}
        />

        {props.isLoggedIn ?
          <AddIcon
            classes={{
              root: classes.addPlaceIcon
            }}
            onClick={() => {
              props.setAddPlaceDestination(data);
              props.setAddPlaceIsOpen(true);
            }}
            style={{
              right: isScrollbarVisible() ? 15 : "1%"
            }}
          /> : null}

        {props.allowEdits ?
          <DropDown
            setEditIsOpen={props.setEditDestinationIsOpen}
            setEditObject={props.setEditDestination}
            setDeleteIsOpen={props.setDeleteIsOpen}
            setDeleteObject={props.setDeleteObject}
            data={data}
          /> : null}
      </div>
    )
  }

  const cellRendererPlace = (data) => {
    return (
      <div className={clsx(classes.cell)}>
        <p className={clsx(classes.cellText)}>
          {data.name}, <br />   {data.country} <br />
        </p>
        <div></div>
        {props.allowEdits ?
          <DropDown
            setEditIsOpen={props.setEditPlaceIsOpen}
            setEditObject={props.setEditPlace}
            setDeleteIsOpen={props.setDeleteIsOpen}
            setDeleteObject={props.setDeleteObject}
            data={data}
          /> : null}
      </div>)
  }

  const cellRenderer = granularitySwitcher(props.mapGranularity, cellRendererDestination, cellRendererPlace);

  const headerRendererDestination = () => {
    return (
      <div style={{ height: headerHeight, lineHeight: `${headerHeight}px` }} className={classes.columnHeader}>
        {"Destinations"}
        {props.allowEdits ? <AddIcon
          className={classes.addDestinationIcon}
          onClick={() => props.setAddDestinationsIsOpen(true)}
        /> : null}
      </div>
    )
  }

  const headerRendererPlace = () => {
    return (
      <div style={{ width: width, lineHeight: `${headerHeight}px` }} className={classes.columnHeader}>{"Places"}</div>
    )
  }

  const headerRenderer = granularitySwitcher(props.mapGranularity, headerRendererDestination, headerRendererPlace);

  const headerRowRenderer = ({ columns, style }) => {
    return (<div
      className={classes.headerRow}
      style={style}
    >
      {columns}
    </div>
    )
  }

  const destinationRowClick = ({ event, index, rowData }) => {
    // Elements within the row will have ignoreHover class to denote prevent default behavior
    if (event.target.classList.contains("ignoreHover")) return;
    // If an SVG within the row is clicked do nothing
    if (event.target.tagName === "path" || event.target.tagName === "svg") return;

    setAllowMouseOver(false)
    // TODO: check if the map is already centered on this destination first
    props.mapRef?.setCenter([rowData.longitude, rowData.latitude])
    props.mapRef?.zoomTo(12)

    //Temporarily disable the mouse over functionality to avoid a mouse over action right after a click event
    setTimeout(() => {
      setAllowMouseOver(true)
    }, 300)
  }

  const placeRowClick = ({ event, index, rowData }) => {
    // Elements within the row will have ignoreHover class to denote prevent default behavior
    if (event.target.classList.contains("ignoreHover")) return;
    // If an SVG within the row is clicked do nothing
    if (event.target.tagName === "path" || event.target.tagName === "svg") return;
  }

  const rowClick = granularitySwitcher(props.mapGranularity, destinationRowClick, placeRowClick);

  const noRowsRenderer = () => {
    if (props.isLoadingUserData) {
      return (
        <Box className={classes.spinnerBox}>
          <CircularProgress
            color="primary"
            className={classes.spinner}
            size={"20%"}
            sx={{ display: "block" }}
          />
        </Box>
      )
    } else {
      return (
        <div className={classes.noRows} style={{ lineHeight: `${height / 2}px` }}>
          Nothing to see here yet :(
        </div>)
    }
  }

  const rows = granularitySwitcher(props.mapGranularity, props.destinations, props.renderablePlaces);
  return (
    <div className={classes.container} ref={containerRef}>

      <Table
        width={containerRef.current ? containerRef.current.offsetWidth : 0}
        className={classes.table}
        gridClassName={classes.grid}
        height={containerRef.current ? containerRef.current.offsetHeight : 0}
        headerHeight={headerHeight}
        headerClassName={classes.tableHeader}
        headerRowRenderer={headerRowRenderer}
        rowHeight={rowHeight}
        rowCount={rows.length}
        rowGetter={({ index }) => rows[index]}
        rowClassName={({ index }) => getRowClassName(index, rows[index])}
        rowStyle={{ 'width': '100%' }}
        onRowMouseOver={({ event, index, rowData }) => {

          if (!allowMouseOver) return;
          if (event.target.classList.contains('ignoreHover')) return;

          // Only move to the new row if mouseOver is allowed
          props.setHoverId(rowData.placeId)
          if (props.mapRef) {
            props.mapRef.flyTo({
              center: [rowData.longitude, rowData.latitude]
            })
          }
        }}
        onRowMouseOut={() => props.setHoverId(null)}
        onRowClick={rowClick}
        noRowsRenderer={noRowsRenderer}
      >
        <Column
          label={granularitySwitcher(props.mapGranularity, "Destination", "Place")}
          dataKey={granularitySwitcher(props.mapGranularity, GRANULARITIES.DESTINATIONS, GRANULARITIES.PLACES)}
          width={containerRef.current ? containerRef.current.offsetWidth : 0}
          className={classes.column}
          headerRenderer={headerRenderer}
          cellRenderer={(data) => cellRenderer(data.cellData)}
          cellDataGetter={({ dataKey, rowData }) => rowData}
        />
      </Table>
    </div>
  )
}

export default memo(VirtualTable);
