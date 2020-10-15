import React, { HTMLAttributes } from "react";
import styled from "styled-components";

export const Layout = styled.div<Props>`
  font-family: roboto;
  color:  #545454;
  min-height: calc(100vh);
  display: grid;
  grid-template-rows: auto 1fr;
  grid-template-columns: 260px auto;
  grid-row-gap:00px;
  grid-column-gap:0px;
  grid-template-areas:
        "side header"
        "side body"
        "side footer";
  font-size: 14px;
`;

export const Header = styled.header<Props>`
  grid-area: header;

  display: flex;
  justify-content: space-between;
  height:49px;
  line-height:50px;
  padding-left: 15px;
  padding-right: 15px;
  border-bottom: 1px solid #FBECEC;
`;

export const Footer = styled.footer<Props>`
  grid-area:footer;

  display: flex;
  font-size: 12px;
  justify-content: space-between;
  height:31px;
  line-height:30px;
  padding-left: 15px;
  padding-right: 15px;
  border-top: 1px solid #FBECEC;
`;

export const Body = styled.div<Props>`
  grid-area: body;
  padding: 0px;
  padding-right:15px;
  max-height:calc(100vh - 82px);
  overflow:auto;
`;

export const Side = styled.div<Props>`
  grid-area: side;
  background-color:#F9F9FF;
  border-right: 1px solid #FBECEC;
  padding: 10px;
  color: #000;
  height: calc(100vh);
  overflow: auto;

  .logo {
    width: 110px;
    display: block;
    margin: auto;
    margin-top: 5px;
    text-align: center;
  }
`

export interface Props extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}
