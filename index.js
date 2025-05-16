import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import methodOverride from "method-override";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// In-memory data store
let tasks = [];

// Routes
app.get("/", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.render("index", {
      tasks,
      getPriorityBadgeColor: (priority) => {
        const colors = {
          low: "info",
          medium: "primary",
          high: "warning",
          urgent: "danger",
        };
        return colors[priority] || "secondary";
      },
    });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).render("error", { message: "Failed to load tasks" });
  }
});

app.post("/add", (req, res) => {
  const newTask = req.body.task;
  if (newTask && newTask.trim().length > 0) {
    tasks.push(newTask.trim());
  }

  res.redirect("/");
});

app.get("/edit/:id", (req, res) => {
  const taskId = req.params.id;
  const task = tasks[taskId];
  res.render("edit", { taskId, task });
});

app.put("/edit/:id", (req, res) => {
  const taskId = req.params.id;
  if (req.body.task && req.body.task.trim().length > 0) {
    tasks[taskId] = req.body.task.trim();
  }
  res.redirect("/");
});

app.delete("/delete/:id", (req, res) => {
  const taskId = req.params.id;
  tasks.splice(taskId, 1);
  res.redirect("/");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
