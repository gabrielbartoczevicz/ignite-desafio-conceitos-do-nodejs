const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const doesUserExists = users.find((user) => user.username === username);

  if (!doesUserExists) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }

  request.user = doesUserExists;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  let user = users.find((user) => user.username === username);

  if (user) {
    return response.status(400).json({ error: "Mensagem do erro" });
  }

  user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const toCreateTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(toCreateTodo);

  return response.status(201).json(toCreateTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id: todoId } = request.params;
  const { user } = request;
  const { title, deadline } = request.body;

  const toUpdateTodo = user.todos.find((todo) => todo.id === todoId);

  if (!toUpdateTodo) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }

  Object.assign(toUpdateTodo, { title, deadline });

  return response.status(201).json(toUpdateTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id: todoId } = request.params;
  const { user } = request;

  const toMarkTodoAsDone = user.todos.find((todo) => todo.id === todoId);

  if (!toMarkTodoAsDone) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }

  toMarkTodoAsDone.done = true;

  return response.status(201).json(toMarkTodoAsDone);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id: todoId } = request.params;
  const { user } = request;

  const toDeleteTodo = user.todos.find((todo) => todo.id === todoId);

  if (!toDeleteTodo) {
    return response.status(404).json({ error: "Mensagem do erro" });
  }

  user.todos.splice(toDeleteTodo, 1);

  return response.sendStatus(204);
});

module.exports = app;
