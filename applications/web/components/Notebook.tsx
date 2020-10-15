import {
  createContentRef,
} from "@nteract/core";
import {
  Cell,
  Input,
  Prompt,
  Source,
  Outputs
} from "@nteract/presentational-components";
import NotebookApp from "@nteract/notebook-app-component";
import { useEffect } from "react"
import React, { FC, HTMLAttributes } from "react";
import styled from "styled-components";

export interface Props extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const contentRef = createContentRef()

// TODO: Implement iterm.js here to connect with the termianl | This can be also done when working with jupyter server
const Notebook: FC<Props> = (props: Props) => {
  useEffect(() => {
    console.log("test")
    console.log(navigator)
  }, [])
  return (
    <>
      <NotebookApp contentRef={contentRef} />
    </>
  );
}

export default Notebook
