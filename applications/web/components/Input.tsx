import React, { FC, HTMLAttributes } from "react";
import styled from "styled-components";

const Box = styled.div<Props>`
 color:  #545454;
 font-family: roboto;
 font-size: 13px;
 line-height: 20px;
 padding-top: 25px;
 display: flex;
 align-items: flex-start;


.input, .select, .textarea {
  height: 32px;
  min-width: 80px;
  background-color: #fff;
  border: 1px solid #EBD8D8;
  border-radius: 2px;
  padding-left: 5px;
}

.textarea{
  padding-top: 5px;
  min-height: 80px;
  resize: none;
}

.checkbox{
  margin-left: 0px;
  margin-right: 8px;
  width: 15px;
}

`;

const Label = styled.label<CommonProps>`
  position: absolute;
  margin-top: -27px;

  &.checkbox-label{
  margin-top: 0px;
  margin-left: 22px;
}

`

export interface CommonProps {
  children?: React.ReactNode | string;
}

export interface Props extends HTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  children?: React.ReactNode | string;
  variant?: "select" | "input" | "textarea" | "checkbox";
  label?: string;
  value?: string;
  checked?: boolean;
  autoFocus?: boolean;
}

export const Input: FC<Props> = (props: Props) => {
  let style = {}
  let input = (
    <input id={props.id} className={`input ${props.className}`} autoFocus={props.autoFocus} type="input" {...props} />
  )

  if (props.variant === "select") {
    input = (<select id={props.id} {...props} className={`select ${props.className}`} style={{ height: "34px", width: "120px" }} >
      {props.children}
    </select>)
  } else if (props.variant === "textarea") {
    input = (<textarea id={props.id} {...props} className={`textarea ${props.className}`} value={props.value} />)
  } else if (props.variant === "checkbox") {
    input = (<> <input type="checkbox" className={`checkbox ${props.className}`} checked={props.checked} onChange={props.onChange} /> <Label className="checkbox-label" htmlFor={props.id}> {props.label} </Label> </>)
    style = { padding: "0px" }
  }


  return (
    <Box style={style} >
      {input}
    </Box>
  );
}

Input.defaultProps = {
  id: "name",
  variant: "input",
  label: "label",
  value: "",
  checked: false
}
