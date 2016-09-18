# This example is customized for self using

Based on example code of this following

# Socket.IO Chat

A simple chat demo for socket.io

## How to use

You should config a MongoDB in local first,
or please delete something like 
MongoClient in the code.

```
$ npm install
$ node .
```

And point your browser to `http://localhost:3000`. Optionally, specify
a port by supplying the `PORT` env variable.

## Features

- Multiple users can join a chat room by each entering a unique username
on website load.
- Users can type chat messages to the chat room.
- A notification is sent to all users when a user joins or leaves
the chatroom.
- Connected to MongoDB server, is able to save the chat log in Server Database.
- Underconstructing banlist
