const { PORT = 5001 } = process.env;

const app = require("./app");
const knex = require("./db/connection");
const cors = require("cors");

const allowedOrigins = [
  "https://starter-restaurant-reservation-dylanalbios.vercel.app"
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.included(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}

app.use(cors(corsOptions));

knex.migrate
  .latest()
  .then((migrations) => {
    console.log("migrations", migrations);
    app.listen(PORT, listener);
  })
  .catch((error) => {
    console.error(error);
    knex.destroy();
  });

function listener() {
  console.log(`Listening on Port ${PORT}!`);
}
