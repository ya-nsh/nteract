import React, { FC, HTMLAttributes } from "react";
import styled from "styled-components";

const MenuBox = styled.ul<Props>`
  list-style:none;
  margin: 0px;
  padding:0px;
  display: flex;
  align-items: center;
`;

export const MenuItem = styled.li<Props>`
  padding-right: 0px;
  margin-right: 0px;

`;


export interface Props extends HTMLAttributes<HTMLUListElement> {
  children?: React.ReactNode;
}

export const Menu: FC<Props> = (props: Props) => {
  return (
    <MenuBox {...props} >
      {props.children}
    </MenuBox>
  );
}
