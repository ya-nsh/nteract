import React, { FC, HTMLAttributes, useState, useEffect } from "react";
import { WithRouterProps } from "next/dist/client/with-router";
import { withRouter, useRouter, NextRouter } from "next/router";
import { connect } from "react-redux";
import { Octokit } from "@octokit/rest";
import { formatDistanceToNow } from "date-fns";
import { AppState } from "@nteract/core"
import dynamic from "next/dynamic";
import Immutable from "immutable";
// nteract
import { contentByRef } from "@nteract/selectors";
import { ContentRecord } from "@nteract/types";
import { Host } from "@mybinder/host-cache";
import { toJS, stringifyNotebook } from "@nteract/commutable";
const CodeMirrorEditor = dynamic(() => import('@nteract/editor'), { ssr: false });

// User defined
import { Menu, MenuItem } from '../../components/Menu'
import { Button } from '../../components/Button'
import { Console } from '../../components/Console'
import { Notification } from '../../components/Notification'
import { BinderMenu } from '../../components/BinderMenu'
import { Avatar } from '../../components/Avatar'
import { Input } from '../../components/Input'
import { Dialog, Shadow, DialogRow, DialogFooter } from '../../components/Dialog';
import { FilesListing } from "../../components/FilesListing"
import { Layout, Header, Body, Side, Footer } from "../../components/Layout"
import { H3, P } from "../../components/Basic"
import NextHead from "../../components/Header";
import { getLanguage, useInput, useCheckInput } from "../../util/helpers"
import { uploadToRepo, checkFork, getContent } from "../../util/github"
import { runIcon, saveIcon, menuIcon, githubIcon, consoleIcon, pythonIcon, serverIcon, commitIcon } from "../../util/icons"
const Binder = dynamic(() => import("../../components/Binder"), {
  ssr: false
});

const BINDER_URL = "https://mybinder.org";

export interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  router: NextRouter
}

export interface StateProps {
  contents: Immutable.Map<string, ContentRecord>
}

type Props = ComponentProps & StateProps;

/**************************
 Main Component
**************************/
export const Main: FC<WithRouterProps> = (props: Props) => {
  const router = useRouter()
  // Toggle Values
  const [showBinderMenu, setShowBinderMenu] = useState(false)
  const [showConsole, setShowConsole] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  // Git API Values
  const [filePath, setFilepath] = useState(router.query.file as string)
  const [fileContent, setFileContent] = useState("")
  const [fileType, setFileType] = useState("")
  const [provider, setProvider] = useState(router.query.vcs as string)
  const [org, setOrg] = useState(router.query.org as string)
  const [repo, setRepo] = useState(router.query.repo as string)
  const [gitRef, setGitRef] = useState(router.query.ref as string)
  // File info
  const [lang, setLang] = useState("markdown")
  // Commit Values
  const commitMessage = useInput("Auto commit from nteract web")
  // This should be a boolean value but as a string
  const stripOutput = useCheckInput(false)
  const [fileBuffer, setFileBuffer] = useState({})
  const [savedTime, setSavedTime] = useState(new Date())

  // Console
  const [consoleLog, setConsoleLog] = useState([])
  const [notificationLog, setNotificationLog] = useState([])
  // Server
  const [serverStatus, setServerStatus] = useState("Launching...")
  const [host, setHost] = useState()

  // Login Values
  const [loggedIn, setLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [userImage, setUserImage] = useState("")
  const [userLink, setUserLink] = useState("")


  /***************************************
    Notification and Console functions
  ****************************************/
  // Function to add logs to notification
  const addToNotification = (log) => {
    let newNotificationLog = [...notificationLog]
    newNotificationLog.push(log)
    setNotificationLog(newNotificationLog)
  }

  // Function to add logs to console
  const addToConsole = (log) => {
    let newConsoleLog = [...consoleLog]
    newConsoleLog.push(log)
    setConsoleLog(newConsoleLog)
  }

  // Function to add logs to both notification and console
  const addLog = (log) => {
    addToConsole(log)
    addToNotification(log)
  }

  /******************
    Effect Hooks
   *****************/

  useEffect(() => {
    // To check if Github token exist, if yes, get user details
    // Check if username is empty because we need to
    // get username only if it's not defined.
    if (localStorage.getItem("token") != undefined && username === "") {
        getGithubUserDetails()
    }
  }, [username])

  // To update file when filePath is updated
  // Also makes sure that filepath is not undefined
  // If it is undefined or empty, don't load the file
  // and set filePath to empty and not undefined
  useEffect(() => {
    if (router.query.file != undefined && filePath != "") {
      loadFile(filePath)
    } else {
      setFilepath("")
    }
  }, [filePath])

  // Remove notification after 3 seconds
  // We are removing the first element only, because
  // all the previous notifications has already
  // been removed by now
  useEffect(() => {
    const timer = setTimeout(() => {
      let newNotificationLog = [...notificationLog]
      newNotificationLog.shift()
      setNotificationLog(newNotificationLog)
    }, 3000);
    return () => clearTimeout(timer)
  }, [notificationLog])

  // When use update the binder menu, we also need to update the route and url
  useEffect(() => {
    router.push(`/p?vcs=${provider}&org=${org}&repo=${repo}&ref=${gitRef}&file=${filePath}`, undefined, { shallow: true })

  }, [provider, org, repo, gitRef, filePath])

  /*************************************************
    Other functions
  ************************************************/
  function addBuffer(e, filePath) {
    const newFileBuffer = fileBuffer
    newFileBuffer[filePath] = e
    setFileBuffer(newFileBuffer)
  }

  function toggle(value, setFunction) {
    setFunction(!value)
  }

  function run() {
    console.log("run binder here")
  }

  function showSave() {
    toggle(showSaveDialog, setShowSaveDialog)
  }



  // To save/upload data to github
  const onSave = async (event) => {
    event.preventDefault()

    props.contents.map(x => {
      const content = stringifyNotebook(x.model.get("notebook", undefined))
      addBuffer(content, x.filepath)
    }
    )

    // Step 1: Check if buffer is empty
    if (Object.keys(fileBuffer).length == 0) {
      addLog({
        type: "failure",
        message: "Can't save changes, no file updated"
      })
      return
    }

    // Step 2: Get authentication of user
    const auth = localStorage.getItem("token")
    const octo = new Octokit({
      auth
    })

    // Step 3: Find fork or handle in case it doesn't exist.
    await checkFork(octo, org, repo, gitRef, username).then(() => {
      // Step 4: Since user is working on the fork or is owner of the repo
      setOrg(username)
      // Step 5: Upload to the repo from buffer
      try {
        uploadToRepo(octo, username, repo, gitRef, fileBuffer, commitMessage.value).then(() => {
          // Step 6: Empty the buffer
          setFileBuffer({})
          addLog({
            type: "success",
            message: "Successfully saved!"
          })

          // Update time of save
          setSavedTime(new Date())
        })
      } catch (err) {
        addLog({
          type: "failure",
          message: "Error while saving changes."
        })

      }
    }).catch((e) => {
      addLog({
        type: "failure",
        message: "Github repository not found."
      })
    })

  }



  // Folder Exploring Function
  async function getFiles(path: string) {
    const octokit = new Octokit()
    let fileList: string[][] = []
    await getContent(octokit, org, repo, gitRef, path).then((res) => {
      res.data.map((item: any) => {
        fileList.push([item.name, item.path, item.type])
      })
    }, (e: Error) => {
      fileList = [[""]]
      addLog({
        type: "failure",
        message: "Github repository not found."
      })

    })
    return fileList

  }

  function loadFile(fileName) {
    let extension = fileName.split('.').pop()
    setFilepath(fileName)
    setFileType(extension)
    setLang(getLanguage(extension))

    if (extension != "ipynb") {
      if (fileName in fileBuffer) {
        setFileContent(fileBuffer[fileName])
      } else {
        const octokit = new Octokit()
        getContent(octokit, org, repo, gitRef, fileName).then(({ data }) => {
          setFileContent(atob(data["content"]))
        })
      }
    }

  }

  function updateVCSInfo(event, previousProvider, previousOrg, previousRepo, previousGitRef) {
    event.preventDefault()

    if (provider != previousProvider || org != previousOrg || repo != previousRepo || gitRef != previousGitRef ) {
      setProvider(previousProvider)
      setOrg(previousOrg)
      setRepo(previousRepo)
      setGitRef(previousGitRef )
      setFilepath("")
      // To empty buffer when repo is updated
      setFileBuffer({})

      addToNotification({
        type: "success",
        message: `Repo updated.`
      })

      addToConsole({
        type: "success",
        message: `Repo updated: VCS=${provider} Owner=${org} repo=${repo} ref=${gitRef} file=${filePath}`
      })
    }

  }

  function OAuthGithub() {
    if (localStorage.getItem("token") == undefined) {
      window.open('https://github.com/login/oauth/authorize?client_id=83370967af4ee7984ea7&scope=repo,read:user&state=23DF32sdGc12e', '_blank');
      window.addEventListener('storage', getGithubUserDetails)
    }
  }

  function getGithubUserDetails() {
    const token = localStorage.getItem("token")
    fetch("https://api.github.com/user", {
      method: "GET",
      headers: new Headers({
        "Authorization": "token " + token
      })

    })
      .then((res) => res.json())
      .then((data) => {
        if (data["login"] !== undefined) {
          setLoggedIn(true)
          setUsername(data["login"])
          setUserLink(data["html_url"])
          setUserImage(data["avatar_url"])

          addToConsole({
            type: "success",
            message: `Successfully logged into Github as @${data["login"]}`
          })

        } else {
          localStorage.removeItem("token")
          setLoggedIn(false)
          addLog({
            type: "failure",
            message: `Github token expired. User logged out.`
          })

        }
      })
    window.removeEventListener("storage", getGithubUserDetails)
  }

  const addBinder = (ht) => {
    if (ht != host) {
      setServerStatus("Connected")
      setHost(ht)
      addToNotification({
        type: "success",
        message: `Successfully connected to MyBinder`
      })

      addToConsole({
        type: "success",
        message: `Successfully connected to MyBiner. \n\tServer running at ${ht.endpoint}?token=${ht.token}`
      })

    }

    return ""
  }

  const getNotebook = async (fileName) => {
    const octokit = new Octokit()
    const data = await getContent(octokit, org, repo, gitRef, fileName)
    return data
  }

  const dialogInputStyle = { width: "98%" }

  const generalEditor = (<CodeMirrorEditor
    editorFocused
    completion
    autofocus
    codeMirror={{
      lineNumbers: true,
      extraKeys: {
        "Ctrl-Space": "autocomplete",
        "Ctrl-Enter": () => { },
        "Cmd-Enter": () => { }
      },
      cursorBlinkRate: 0,
      mode: lang
    }}
    preserveScrollPosition
    editorType="codemirror"
    onFocusChange={() => { }}
    focusAbove={() => { }}
    focusBelow={() => { }}
    kernelStatus={"not connected"}
    value={fileContent}
    onChange={(e) => {
      addBuffer(e, filePath)
      setFileContent(e);
    }}
  />)

  const binderEditor = (
    <>
      <Binder getContent={getNotebook} filepath={filePath} host={host} />
    </>
  )

  const editor = lang == "ipynb" ? binderEditor : generalEditor;

  return (
    <Layout>
      <Host repo={`${org}/${repo}`} gitRef={gitRef} binderURL={BINDER_URL}>
        <Host.Consumer>
          {host =>
            host ? (
              <>
                {addBinder(host)}
              </>
            ) : null
          }
        </Host.Consumer>
      </Host>

      <NextHead />
      {
        showBinderMenu &&

        <BinderMenu
          provider={provider}
          org={org}
          repo={repo}
          gitRef={gitRef}
          updateVCSInfo={updateVCSInfo}
          style={{
            height: "150px",
            position: "absolute",
            marginTop: "49px",
            width: "calc(100% - 260px)",
            right: "0px",
            borderBottom: "1px solid #FBECEC",
          }}
        />
      }

      <Notification notifications={notificationLog} />

      {
        showConsole && <Console style={{
          position: "absolute",
          bottom: "30px",
          right: "0px",
          width: "calc(100% - 260px)"
        }} logs={consoleLog} />
      }


      {showSaveDialog &&
        <>
          <Shadow onClick={() => toggle(showSaveDialog, setShowSaveDialog)} />
          <Dialog >
            <form onSubmit={(e) => onSave(e)} >
              You are about to commit to <b>{username}/{repo}[{gitRef}]</b> as <b>@{username}</b>.
              <br /><br />
              If this repo doesn&apos;t already exist, it will automatically be created/forked. Enter your commit message here.
             <DialogRow>
                <Input id="commit_message" variant="textarea" label="Commit Message" {...commitMessage} autoFocus style={dialogInputStyle} />
              </DialogRow>
              {false &&
                <DialogRow>
                  <Input id="strip_output" variant="checkbox" label="Strip the notebook output?" checked={stripOutput.value} onChange={stripOutput.onChange} style={dialogInputStyle} />
                </DialogRow>
              }
              <DialogFooter>
                <Button id="commit_button" text="Commit" icon={commitIcon} />
              </DialogFooter>
            </form>
          </Dialog>
        </>
      }

      <Header>
        <Menu>
          <MenuItem>
            <Button text="Run" variant="outlined" icon={runIcon} onClick={() => run()} />
          </MenuItem>
          {loggedIn &&
            <MenuItem>
              <Button text="Save" variant="outlined" icon={saveIcon} onClick={() => showSave()} />
            </MenuItem>
          }

          <MenuItem>
            <Button text="Menu" variant="outlined" icon={menuIcon} onClick={() => toggle(showBinderMenu, setShowBinderMenu)} />
          </MenuItem>

        </Menu>
        <Menu>
          <MenuItem >
            {loggedIn
              ? <Avatar userImage={userImage} username={username} userLink={userLink} />
              : <Button onClick={() => OAuthGithub()} text="Connect to Github" icon={githubIcon} />
            }
          </MenuItem>
        </Menu>
      </Header>
      <Side>
        <img
          src="https://media.githubusercontent.com/media/nteract/logos/master/nteract_logo_cube_book/exports/images/png/nteract_logo_wide_clear_space_purple.png"
          alt="nteract logo"
          className="logo"
        />
        <FilesListing
          loadFile={loadFile}
          loadFolder={getFiles}
          org={org}
          repo={repo}
          gitRef={gitRef}
        />
      </Side>
      <Body>


        {filePath && editor}

        {
          !filePath &&

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "180px" }}>

            <H3>Welcome to nteract web</H3>
            <P>
              nteract web is an awesome environment for you to reproduce a notebook project quickly and edit a notebook without installing additional software. It takes just a few seconds to get started.

              <ol>
                <li>Click on the menu above, and provide the path to the repository you want to reproduce. </li>
                <li>Use file explorer to open, run and edit files. </li>
                <li>Connect to GitHub to save back your changes. </li>
                <li>Share the above link to your network so they can reproduce your notebook. </li>
              </ol>
              Made with love by nteract contributors.
                      </P>

          </div>

        }
      </Body>

      <Footer>

        <Menu>
          <MenuItem>
            <Button text="Console" icon={consoleIcon} variant="transparent" onClick={() => toggle(showConsole, setShowConsole)} />
          </MenuItem>
          <MenuItem>
            <Button text="Python 3" icon={pythonIcon} variant="transparent" disabled />
          </MenuItem>
          <MenuItem>
            <Button text={serverStatus} icon={serverIcon} variant="transparent" disabled />
          </MenuItem>
        </Menu>
        <Menu>
          <MenuItem>
            {formatDistanceToNow(savedTime)}
          </MenuItem>
        </Menu>
      </Footer>
    </Layout>
  );
}


const makeMapStateToProps = (
  initialState: AppState
) => {
  const mapStateToProps = (state: AppState): StateProps => {
    return {
      contents: contentByRef(state)
    }
  }

  return mapStateToProps
};


export default connect(makeMapStateToProps, null)(withRouter(Main))
