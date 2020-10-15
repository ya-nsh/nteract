import React, { HTMLAttributes } from "react";
import styled from "styled-components";

export const H3 = styled.h3<Props>`
  font-size: 25px;
`

export const P = styled.p<Props>`
  font-size: 16px;
  width: 700px;
  line-height: 24px;

  a {
      text-decoration: none;
  }
`

export const Box = styled.div<Props>`
  display: flex;
  align-items: center;
  flex-direction: column;
`

export const Logo = styled.img<Props>`
  width: 220px;
  margin-top:120px;
`

export interface Props extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}
