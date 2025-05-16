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

// In-memory data store with proper task structure
let tasks = [];

// Helper function to generate unique IDs
const generateId = () => Date.now().toString();

// Routes
app.get("/", (req, res) => {
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
});

app.post("/add", (req, res) => {
  const { title, priority } = req.body;
  if (title && title.trim().length > 0) {
    tasks.push({
      _id: generateId(),
      title: title.trim(),
      priority: priority || 'medium',
      createdAt: new Date()
    });
  }
  res.redirect("/");
});

app.get("/edit/:id", (req, res) => {
  const taskId = req.params.id;
  const task = tasks.find(t => t._id === taskId);
  if (!task) return res.redirect("/");
  
  res.render("edit", { task });
});

app.put("/edit/:id", (req, res) => {
  const taskId = req.params.id;
  const { title, priority } = req.body;
  
  const taskIndex = tasks.findIndex(t => t._id === taskId);
  if (taskIndex === -1) return res.redirect("/");
  
  if (title && title.trim().length > 0) {
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      title: title.trim(),
      priority: priority || tasks[taskIndex].priority
    };
  }
  
  res.redirect("/");
});

app.delete("/delete/:id", (req, res) => {
  const taskId = req.params.id;
  tasks = tasks.filter(task => task._id !== taskId);
  res.redirect("/");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
