# Todo API

Built with Node/Express and mongoDB

### [See it here](https://safe-beyond-71538.herokuapp.com/)

## Open Endpoints
* POST /users(Takes email and password)
* POST /users/login(Takes email and password)

## Protected Endpoints
(Require x-auth header token, returned on login/signup)

* GET /todos (Gives all todos)
* POST /todos (Takes text for new todo)
* GET /todos/:id (Get one todo by ID)
* PATCH /todos/:id (Edit a todo, takes text, and completed)
* DELETE /todos/:id (delete a todo)
* GET /users/me (returns you)
* DELETE /users/me/token (Logs you out)