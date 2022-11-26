const express = require("express");
const app = express();
const port = 8000;
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { json } = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

// ================================

const product = require("./data/product.json");
const cetegory = require("./data/cetegory.json");

// ======== MIDDLEWARE ========
app.use(cors());
app.use(express.json());
// ======== MIDDLEWARE ========

// ======== DB CONNECTION ========

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@mobilehat.aoxq2ht.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function dbConnection() {
  client.connect((err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Database Connected !!");
    }
  });
}
dbConnection();
// ======== DB CONNECTION ========

// ======== DB COLLECTION ========
const ProductCollection = client.db("MobileHat").collection("products");
const CetagoyCollection = client.db("MobileHat").collection("cetagory");
const UserCollection = client.db("MobileHat").collection("users");
// ======== DB COLLECTION ========

// ======== JWT TOKEN ========
app.get("/jwt", async (req, res) => {
  const email = req.query.email;
  const query = { email: email };
  const user = await UserCollection.find(query);

  if (user) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7days",
    });
    return res.status(200).send({ accesToken: token });
  } else {
    res.status(401).send({ accesToken: "No token found" });
  }
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decoded) {
    console.log(err);
    if (err) {
      return res.status(403).send({ message: "forbidden access hey this " });
    }
    req.decoded = decoded;
    next();
  });
}

const verifyAdmin = async (req, res, next) => {
  const decoded = req.decoded.email;
  const users = await userCollection.findOne({ email: decoded });
  console.log(users);
  if (users?.role !== "admin") {
    return res.status(401).send({
      success: false,
      message: "Unauthorized access",
    });
  }
  next();
};

// ======== JWT TOKEN ========

// ======== ROUTES ========
app.get("/", (req, res) => {
  res.send("Hey Welcome Moile Hat");
});

// ============= User Routes =============
// ceate user

app.post("/users", async (req, res) => {
  const user = req.body;
  const result = UserCollection.insertOne(user);

  try {
    res.send({
      sucess: true,
      data: result,
      message: "Data inserted successfully",
    });
  } catch (error) {
    res.send({
      sucess: false,
      data: [],
      message: "Data not inserted",
    });
  }
});
// get user

// update user

app.get("/product", (req, res) => {
  const query = {};
  const products = product.find({});
  res.send(products);
});

app.get("cetegory/:id", (req, res) => {
  const id = req.params.id;
  const cetegorys = product.filter((c) => {
    c.category_id === id;
  });
  res.send(cetegorys);
});

// delete user

// ============= User Routes =============

// ======== ROUTES ========

app.listen(port, () => {
  console.log(`Mobile Hat Is Runnig On ${port}`);
});
