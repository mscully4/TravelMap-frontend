import { useState, MouseEvent } from 'react';
import clsx from 'clsx';
import { makeStyles, Theme } from '@material-ui/core/styles';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Place from '../types/place';
import Destination from '../types/destination';

const styles = makeStyles((theme: Theme) => ({
  dropdown: {
    position: "absolute",
    width: 100,
    backgroundColor: "white",
    top: 50,
    left: 10,
    borderRadius: 5,
    boxShadow: theme.shadows[10],
  },
  openDropdownIcon: {
    position: "absolute",
    left: theme.spacing(1),
    top: theme.spacing(0),
  },
  listItem: {
    width: "95%",
    cursor: "pointer",
    height: 40,
    lineHeight: "40px",
    paddingLeft: "5%",
    "&:hover": {
      backgroundColor: theme.palette.grey[200]
    },
    borderRadius: 5
  }
}))

interface DropDownProps {
  setEditIsOpen: (value: boolean) => void,
  setEditObject: (object: any) => void, // object will be type Destination or Place
  setDeleteIsOpen: (value: boolean) => void,
  setDeleteObject: (object: any) => void, // object will be type Destination or Place
  data: Destination | Place, 
}

export default function DropDown(props: DropDownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | SVGElement>(null);
  
  const classes = styles()

  const handleOpen = (event: MouseEvent<SVGElement | SVGPathElement>) => { 
    setIsOpen(true);
    const target = event.target as SVGElement;
    
    // Set the SVG as the anchor element
    if (target.tagName.toLowerCase() === "path") {
      // Typescript refuses to convert straight from HTMLElement to SVGElement
      const htmlToSvgTmp = target.parentElement as unknown;
      setAnchorEl(htmlToSvgTmp as SVGElement);
    } else {
      setAnchorEl(target);
    }
  }

  const handleClose = () => {
    setIsOpen(false);
    setAnchorEl(null);
  }

  const onEditClick = () => {
    props.setEditObject(props.data);
    props.setEditIsOpen(true);
    setIsOpen(false);
  }

  const onDeleteClick = () => {
    props.setDeleteObject(props.data)
    props.setDeleteIsOpen(true);
    setIsOpen(false);
  }

  const onClick = isOpen ? handleClose : handleOpen;
  const top = anchorEl ? anchorEl.getBoundingClientRect().height : 50;

  return (
    <div>
      <MoreHorizIcon
        classes={{
          root: classes.openDropdownIcon
        }}
        onClick={onClick}
      />
      <div
        className={clsx(classes.dropdown, "ignoreHover")}
        style={{
          top: top,
          display: isOpen ? "block" : "none",
        }}
      >
        <div className={clsx(classes.listItem, "ignoreHover")} onClick={onEditClick}>Edit</div>
        <div className={clsx(classes.listItem, "ignoreHover")} onClick={onDeleteClick}>Delete</div>
      </div>
    </div>
  )
}
