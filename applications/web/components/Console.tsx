import React, { FC, HTMLAttributes } from "react";
import styled from "styled-components";
import { generate } from "shortid";


const ConsoleDiv = styled.div<Props>`
  clear: left;
  min-height: 200px;
  max-height: 240px;
  padding: 20px;
  color: #f1f1f1;
  font-family: Monaco, monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: #22223B;
  overflow: auto;
  counter-reset: line-numbering;
  border-top: 1px solid #000;
  z-index: 1000;
`;

const Log = styled.div<LogProps>`
  color: white;

  .preLog{
    color: gray;
  }

  &.success{
      color: #0b9a0b;
  }

  &.failure {
      color: #ef2400;
  }
`

export interface LogProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode,
}

export interface Props extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  logs: { type: string; message: string; }[]
}

export const Console: FC<Props> = (props: Props) => {
  return (
    <ConsoleDiv {...props} >
      {props.children}
      {props.logs.map((value) => {
        return (<Log className={value.type} key={generate()} >
          <span className="preLog">$ </span>
          {value.message}
        </Log>)
      })
      }
    </ConsoleDiv>
  );
}
