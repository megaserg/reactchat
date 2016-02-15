Reactchat
=============
Reactive, realtime multiuser chat.

Built with [React](https://facebook.github.io/react/), [Go](https://golang.org/), and [RethinkDB](http://rethinkdb.com/).

How to start your own instance
------------------------------

- Install and start RethinkDB (port 28015):
      $ rethinkdb

- Go to http://127.0.0.1:8080/#dataexplorer and paste the content of `db_initialize.reql` to initialize the database.

- Start the backend (port 4000):
      $ go run *.go
- Install Node dependencies:
      $ npm install
- Start the frontend with live update (port 4001):
      $ webpack-dev-server --port 4001
- Alternatively, build the JS bundle (`assets/bundle.js`):
      $ webpack

- Go to http://localhost:4001/

Acknowledgements
----------------

Developed during the course [Learn How to Develop Realtime Web Apps](http://courses.knowthen.com/courses/learn-how-to-develop-realtime-web-apps/).

License
-------
MIT

TODO
----
- Messages are not always ordered by time
- Users are not always ordered by name
- Server goes crazy if you stop DB midway
- TTL for users being online
