import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Hello world" });
});

app.listen(3000, (err) => {
  if (err) {
    console.error(err);
  }
  console.log("server starting on port 3000");
});
