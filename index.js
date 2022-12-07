const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const app = express();

const tourRouter = require("./route/tourRoutes");
const userRouter = require("./route/userRoutes");

dotenv.config({ path: "./config.env" });
const port = process.env.PORT;

const Db = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(
    "mongodb+srv://hamza:hamza@cluster0.bgrl2ru.mongodb.net/nature?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  )
  .then((con) => {
    console.log("DB connected Successfuly!");
  })
  .catch((err) => {
    console.log("not connected");
  });

app.use(express.json());
// 3) ROUTES

app.use("/api/tour", tourRouter);

app.use("/api/user", userRouter);
app.all("*", (req, res, next) => {
  //   res.status(404).json({
  //     status: "fail",
  //     message: `cant find ${req.originalUrl}`,
  //   });
  const err = new Error(`cant find ${req.originalUrl}`);
  err.status = "fail";
  err.statusCode = 404;
  next(err);
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

app.listen(port, () => {
  if ((process.env.PORT = 3005)) {
    console.log(`app is running on ${port} `);
    console.log(process.env.PORT);
  } else {
    console.log(`app is running on ${PORT}`);
  }
});
