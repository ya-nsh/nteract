import { Octokit } from "@octokit/rest";
import React, { FC, HTMLAttributes, useState, useEffect } from "react";
import { FileExplorer } from "./FileExplorer"
import styled from "styled-components";

const Heading = styled.div`
  font-size: 13px;
  margin-top: 30px;
  font-weight: 500;
  opacity: 0.7;
`

const Body = styled.div`
  font-size: 14px;
  margin-top: 10px;
  margin-left: 5px;
`

export interface Props extends HTMLAttributes<HTMLDivElement> {
  loadFile: (x: string) => void,
  loadFolder: (x: string) => Promise<string[][]>
  org: string,
  repo: string,
  gitRef: string

}

// TODO: Implement iterm.js here to connect with the termianl | This can be also done when working with jupyter server
export const FilesListing: FC<Props> = (props: Props) => {

  const [data, setData] = useState([[""]])

  useEffect(() => {
    console.log("refreshed")
    props.loadFolder("").then((newData: any) => {
      setData(newData)
    })
  }, [props.org, props.repo, props.gitRef])

  return (
    <>
      <Heading> {props.org}/{props.repo} [{props.gitRef}] </Heading>
      <Body>
        <FileExplorer data={data} folderLoading={props.loadFolder} fileLoading={props.loadFile} />
      </Body>
    </>
  );
}
