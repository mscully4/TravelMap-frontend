import React, { ForwardedRef, PropsWithChildren } from 'react';
import { Slide } from "@material-ui/core";
import { TransitionProps } from '@material-ui/core/transitions';

export const Transition = React.forwardRef<unknown, TransitionProps>((props: PropsWithChildren<any>, ref: ForwardedRef<unknown>) => {
  return (<Slide direction={"up"} ref={ref} {...props} />)
});
