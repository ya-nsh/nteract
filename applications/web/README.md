<p align="center">
<img src="https://avatars0.githubusercontent.com/u/12401040?s=200&v=4" width="80">
<h1 align="center">@nteract/web</h1>
</p>

@nteract/web is a NextJS-based web application that provides a nteract based interactive playground for users to connect to kernels hosted on [MyBinder](https://mybinder.org/) and run code samples against it.

This web application is a great way to test changes on the nteract core SDK without requiring a Jupyter setup on the dev machine. It is also useful for students learning about data science. Researchers can use it to share their work quickly with minimum efforts.

> WARNING: This application is in pre-alpha.

## Index

-   [Development](#development)
    -   [Pre-Requisites](#pre-requisites)
    -   [Developmen Environment](#development-environment)
-   [URL Format](#url-format)
-   [Github Auth](#github-auth)
-   [Community](#community)
    -   [Contribution](#contribution)
-   [License](#license)

## Development

If you want to contribute to this project, read the information given below.

### Pre-Requisites

You should be familiar with following to get started.

-   HTML/CSS
-   Javascript
-   Familiarity with CLI

pre-requisites the system needs to develop this project.

-   NPM or Yarn
-   Node

### Development Environment

To setup the development.

1.  Clone the nteract monorepo.
2.  Install the dependencies `yarn install` and run the build command `yarn build` in the root of the repository.
3.  Go to the `application/web` and install `yarn install` the dependencies.
4.  Run `yarn dev` to start the server.


    $ git clone https://github.com/nteract/nteract
    $ cd nteract
    $ yarn install

    $ cd ./applications/web
    $ yarn install
    $ yarn dev

This will start the development server on port `3000`.

## URL Format

    localhost:3000/p?=VCS=${1}&org=${2}&repo=${3}&ref=${4}&file=${5}

## Github Authentication

The program/page to handle Github auth is at `@nteract/web/pages/auth/`. It is powered by the [play-oauth-server](https://github.com/nteract/play-oauth-server/). It currently supports only `Github` but support for more VCS can be added in future.

## File Structure

File/Folder Name | Description
-----------------|------------
components/      | This folder holds all the components used by the application.
pages/           | This folder holds all the endpoints or pages. To create a new endpoint, create a folder with the endpoint name. `/p` and `/auth` are currently the endpoints used.
redux/           | The redux store
util/            | This holds all the internal utility files used in the application.


## Community

### Contribution

 Your contributions are always welcome and appreciated. Following are the things you can do to contribute to this project.

1.  **Report a bug** <br>
    If you think you have encountered a bug, and I should know about it, feel free to report it [here](https://github.com/nteract/nteract/issues/new) and I will take care of it.

2.  **Request a feature** <br>
    You can also request for a feature [here](https://github.com/nteract/nteract/issues/new), and if it will viable, it will be picked for development.

3.  **Create a pull request** <br>
    It can't get better then this, your pull request will be appreciated by the community. You can get started by picking up any open issues from [here](https://github.com/nteract/nteract/issues) and make a pull request.

    > If you are new to open-source, make sure to check read more about it [here](https://www.digitalocean.com/community/tutorial_series/an-introduction-to-open-source) and learn more about creating a pull request [here](https://www.digitalocean.com/community/tutorials/how-to-create-a-pull-request-on-github).


## License

[BSD-3-Clause](https://choosealicense.com/licenses/bsd-3-clause/)
