import React, { FC, useEffect, useState } from "react";
import Head from "next/head";
import styled from "styled-components";

const Message = styled.div`
    width:600px;
    padding: 30px;
    font-size: 14px;
    font-family: roboto;
    justify-self: center;
    position: absolute;
    top: 200px;
    left: 50%;
    margin-left: -300px;
    background-color: #f2f2f2;
    border-radius: 4px;
`

export const Main: FC = () => {
  const [code, setCode] = useState("")
  const [codeState, setCodeState] = useState("")
  const [auth, setAuth] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setCode(params.get("code"))
    setCodeState(params.get("state"))
  })

  useEffect(() => {
    if (code !== "" && codeState !== "") {
      oauthGithub()
    }
  }, [code, codeState])

  /* TODO: Upload server from official account and replace the name  */
  const oauthGithub = () => {
    fetch(`https://play-oauth-server.ramantehlan.vercel.app/github?code=${code}&state=${codeState}`)
      .then(res => res.json())
      .then(data => {
        if (data.access_token !== undefined) {
          localStorage.setItem("token", data.access_token)
          setAuth(true)
        }
      })
  }

  return (
    <>
      <Message>
        {auth
          ?
          <>
            <Head>
              <title>nteract play: Github Autentication</title>
              <meta charSet="utf-8" />
              <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            </Head>

            <h3>Authentication Successful!</h3>

            <p>The authentication was successful. You can close this window now and go back to the application.</p>
          </>

          :
          <>
            <h3>Authenticating...</h3>
          </>
        }
      </Message>
    </>
  );
}

export default Main;
