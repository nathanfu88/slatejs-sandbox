This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

To run, clone this repository and install modules:
```
npm install
```

Modify the Sockets IO server port and URL if needed in server.js and App.js respectively.

Then start the socket server (make sure directory is root of this repository):
```
node server
```

Start app:
```
npm start
```

Clients will be able to connect on localhost:3000

This is a proof-of-concept for working with Slate operation object types and Automerge for CRDT capabilities. Synchronization is not perfect yet due to the way I am handling Automerge. However if you start two clients and starting modifying one, the changes should reflect in the other.

Starting a client when there have been changes in the editor (starting a client from "offline status") will result in unexpected behavior. Again, this is a result of the way I handle Automerge.