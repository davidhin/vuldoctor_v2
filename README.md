# VulDoctor

As modern software complexity increases, open-source dependencies are increasingly relied upon to efficiently incorporate functionality into these systems. Even if the software is securely designed, vulnerabilities in these third-party dependencies can lead to security breaches. VulDoctor is a web application utilizing machine learning and AI that allows users to dynamically track security vulnerabilities in their code repositories and receive updates on the newest vulnerabilities in the software component.

## Running locally

Note: This software is primarily experimental, and hence requires some setup.

1. Install NVM `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash`
2. Install Node `nvm install node`
3. Run `npm install` in root directory
4. Run `npm install` in `./server`
5. Copy `.env` into the root directory
6. Add `"proxy": "http://localhost:5000"` to the end of `package.json` in the root directory.
7. Run `npm start` in one terminal to start the server.
8. Run `npm run start-client` in another terminal to start the client.

## Architecture

VulDoctor is built using a React frontend and Express.js backend. Further stack details can be found [here](https://stackshare.io/davidhin/vuldoctor2). The overall architecture is described below:

![vd](https://i.imgur.com/vTeEt2Y.png)
