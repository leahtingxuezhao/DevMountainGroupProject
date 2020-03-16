require("dotenv").config();
const express = require("express");
const session = require("express-session");
const massive = require("massive");
const app = express();
const { SESSION_SECRET, CONNECTION_STRING, SERVER_PORT } = process.env;
const authCtrl = require("./controllers/authController");
const taskCtrl = require("./controllers/taskController");
const projectCtrl = require("./controllers/projectController");

app.use(express.json());

// server static files when hitting the server
app.use(express.static("build"));

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 }
  })
);

massive(CONNECTION_STRING).then(db => {
  app.set("db", db);
  app.listen(SERVER_PORT, () =>
    console.log(`Server is listening on port ${SERVER_PORT}`)
  );
});

//ENDPOINTS
//auth endpoints
app.post("/api/register", authCtrl.register);
app.post("/api/login", authCtrl.login);
app.post("/api/logout", authCtrl.logout);
app.post("/api/email", authCtrl.email);
app.get("/api/getAllUsers", authCtrl.getAllUsers);

//task endpoints
app.post("/api/createTask", taskCtrl.createTask);
app.delete("/api/deleteTask/:user_id", taskCtrl.deleteTask);
app.get("/api/getAllTeammates/:project_id", taskCtrl.getAllTeammates);

//personal Dashboard - get all tasks
app.get("/api/getToDoTasks/:user_id", taskCtrl.getToDoTasks);
app.get('/api/getALlTasksSingleProject/:project_id', taskCtrl.getAllTasksSingleProject);
app.get("/api/getInProgressTasks/:user_id", taskCtrl.getInProgressTasks);
app.get("/api/getReviewTasks/:user_id", taskCtrl.getReviewTasks);
app.get("/api/getDoneTasks/:user_id", taskCtrl.getDoneTasks);

// personal dashboard - update tasks status
app.put("/api/updateTaskToReview/:task_id", taskCtrl.updateTaskReview);
app.put("/api/updateTaskToDone/:task_id", taskCtrl.updateTaskDone);
app.put("/api/updateTaskToDo/:task_id", taskCtrl.updateTaskToDo);
app.put("/api/updateTaskToInProgress/:task_id", taskCtrl.updateTaskInProgress);

//project endpoints
app.get("/api/getProjects/:user_id", projectCtrl.getAllProjects);
app.post("/api/createProject", projectCtrl.createProject);
