import React, { FC, HTMLAttributes } from "react";
import styled from "styled-components";

const ButtonDefault = styled.button<Props>`
outline:none;
border: 1px solid transparent;
color: #fff;
background-color: #3A347E;
line-height: 28px;
height: 30px;
padding-left: 15px;
padding-right: 15px;
border-radius: 4px;
text-transform: capitalize;

${
  props => props.disabled ? "" : `&:hover{
    cursor:pointer;
  }

  &:active{
  background-color: #282357;
}
`};

&.outlined {
  background-color: #fff;
  color: #545454;

${
  props => props.disabled ? "" : `&:hover{
    border: 1px solid #FBECEC;
    color: #000;
    cursor: pointer;
  }

  &:active{
    background-color: #FBECEC;
  }

`};

}

&.transparent {
  background-color: #fff;
  color: #444343;

${
  props => props.disabled ? "" : `&:hover{
    color: #000;
  }
  `
  };

}

.icon {
  margin-right: 3px;
}

`;

export interface Props extends HTMLAttributes<HTMLButtonElement> {
  /** Value of the button */
  text?: string;
  /** Type of button */
  variant?: "outlined" | "transparent";
  /** Icon for the button */
  icon?: React.ReactNode;
  /** OnClick */
  onClick?: () => void;
  /** For disabled buttons */
  disabled?: boolean;
}

export const Button: FC<Props> = (props: Props) => {
  return (
    <ButtonDefault
      {...props}
      disabled={props.disabled}
      onClick={props.onClick}
      className={`${props.variant}`} >
      <span className="icon"> {props.icon} </span>  {props.text}
    </ButtonDefault>
  );
}

// If we want to pass on the default values
Button.defaultProps = {
  text: "Button"
}
