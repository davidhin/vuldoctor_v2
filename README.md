# VulDoctor

As modern software complexity increases, open-source dependencies are increasingly relied upon to efficiently incorporate functionality into these systems. Even if the software is securely designed, vulnerabilities in these third-party dependencies can lead to security breaches. VulDoctor is a web application utilizing machine learning and AI that allows users to dynamically track security vulnerabilities in their code repositories and receive updates on the newest vulnerabilities in the software component.

A sample of the application can be found [here](https://vuldoctor2.herokuapp.com). However, all functionality may not be present.

## Running locally

Note: This software is primarily experimental, and hence requires some setup.

1. Install NVM `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash`
2. Install Node `nvm install node`
3. Run `npm install` in root directory
4. Run `npm install` in `./server`
5. Copy `.env` into the root directory (see example of .env file below)
6. Add `"proxy": "http://localhost:5000"` to the end of `package.json` in the root directory.
7. Run `npm start` in one terminal to start the server.
8. Run `npm run start-client` in another terminal to start the client.

## `.env` file

The .env file should be placed in the root directory. It contains the private keys to the services used. An example is displayed below, with obfuscation of keys, to show how the keys are referred to in the source code. Ripgrep may prove to be useful in the reverse engineering process.

```bash
# Obtain from Firebase account
REACT_APP_FIREBASE_APIKEY="***"
FIREBASE_PRIVATE_KEY_ID=="***"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----***-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="***@***.iam.gserviceaccount.com"
FIREBASE_CLIENT_ID="***"
FIREBASE_X509="https://www.googleapis.com/robot/v1/metadata/x509/***.iam.gserviceaccount.com"

# Obtain from MongoDB Atlas
MONGODB_TOKEN="mongodb+srv://davidhin:=***.mongodb.net/main?retryWrites=true&w=majority"
MONGODB_PASSWORD="***"

# Obtain from Google Cloud Services
SOLID_MANTRA_PRIVATE_KEY_ID="***"
SOLID_MANTRA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----***=\n-----END PRIVATE KEY-----\n"

# Set path after following instruction in mircroservices/dep_check/db
VDB_HOME=/***/***/***/vuldoctor/microservices/dep_check/db
```


## Architecture

VulDoctor is built using a React frontend and Express.js backend. Further stack details can be found [here](https://stackshare.io/davidhin/vuldoctor2). The overall architecture is described below:

![vd](https://i.imgur.com/vTeEt2Y.png)
