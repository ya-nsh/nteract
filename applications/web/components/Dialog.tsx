import React, { FC, HTMLAttributes, MutableRefObject } from "react";
import styled from "styled-components";

export const Shadow = styled.div<Props>`
  color:  #545454;
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0%;
  left: 0%;
  z-index: 1001;
  background-color: rgba(0,0,0,0.5);
  width: 100%;
  height: calc(100vh);
`

const DialogBox = styled.div<Props>`
  position: fixed;
  top: 200px;
  left: 50%;
  margin-left: -200px;
  z-index:1002;
  width: 400px;
  padding: 20px;
  font-family: Roboto, monospace;
  font-size: 12px;
  background-color: #fff;
  border-radius: 4px;
`;

export const DialogRow = styled.div<Props>`
  margin-bottom: 10px;
`;

export const DialogFooter = styled.div<Props>`
  min-height: 50px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
`;




export interface Props extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  ref?: MutableRefObject<any>;
}

export const Dialog: FC<Props> = (props: Props) => {
  return (
    <DialogBox >
      {props.children}
    </DialogBox>
  );
}
