const express = require("express");
const app = express();
const port = 8000;
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { json } = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

// ================================

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
const CetagoyCollection = client.db("MobileHat").collection("category");
const UserCollection = client.db("MobileHat").collection("users");
const BookingCollection = client.db("MobileHat").collection("bookings");
const AdvatiseCollection = client.db("MobileHat").collection("advatise");
const WishlistCollection = client.db("MobileHat").collection("wishlist");

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
  const users = await UserCollection.findOne({ email: decoded });
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

// ceate user ============

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
// get users =============
app.get("/users", async (req, res) => {
  const query = {};
  const cursor = UserCollection.find(query);
  const result = await cursor.toArray();
  try {
    res.send({
      sucess: true,
      data: result,
      message: "Data found successfully",
    });
  } catch (error) {
    res.send({
      sucess: false,
      data: [],
      message: "Data not found",
    });
  }
});

// delete user ============

app.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const result = await UserCollection.deleteOne(query);
  try {
    res.send({
      sucess: true,
      data: result,
      message: "Data deleted successfully",
    });
  } catch (error) {
    res.send({
      sucess: false,
      data: [],
      message: "Data not deleted",
    });
  }
});

// get buyer from users =============
app.get("/users/buyer/", async (req, res) => {
  const query = { role: "buyer" };
  const cursor = UserCollection.find(query);
  const result = await cursor.toArray();
  try {
    res.send({
      sucess: true,
      data: result,
      message: "Data found successfully",
    });
  } catch (error) {
    res.send({
      sucess: false,
      data: [],
      message: "Data not found",
    });
  }
});

app.delete("/users/buyer/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const result = await UserCollection.deleteOne(query);
  try {
    res.send({
      sucess: true,
      data: result,
      message: "Data deleted successfully",
    });
  } catch (error) {
    res.send({
      sucess: false,
      data: [],
      message: "Data not deleted",
    });
  }
});

// get seller from users =============

app.get("/users/seller/", async (req, res) => {
  const query = { role: "seller" };
  const cursor = UserCollection.find(query);
  const result = await cursor.toArray();
  try {
    res.send({
      sucess: true,
      data: result,
      message: "Data found successfully",
    });
  } catch (error) {
    res.send({
      sucess: false,
      data: [],
      message: "Data not found",
    });
  }
});

// get my buyer from users =============

app.get("/users/mybuyer/", async (req, res) => {
  const decoded = req.decoded.email;
  const query = { role: "buyer", email: decoded };
  const cursor = UserCollection.find(query);
  const result = await cursor.toArray();
  try {
    res.send({
      sucess: true,
      data: result,
      message: "Data found successfully",
    });
  } catch (error) {
    res.send({
      sucess: false,
      data: [],
      message: "Data not found",
    });
  }
});

app.delete("/users/seller/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const result = await UserCollection.deleteOne(query);
  try {
    res.send({
      sucess: true,
      data: result,
      message: "Data deleted successfully",
    });
  } catch (error) {
    res.send({
      sucess: false,
      data: [],
      message: "Data not deleted",
    });
  }
});

// Make admin ====================================
app.get("/users/admin/:email", verifyJWT, verifyAdmin, async (req, res) => {
  const email = req.params.email;
  const query = { email };
  const user = await UserCollection.findOne(query);
  res.send({ isAdmin: user?.role === "admin" });
});

app.put("/users/admin/:id", async (req, res) => {
  const id = req.params.id;
  const filters = { _id: ObjectId(id) };
  const options = { upsert: true };
  const updateDoc = {
    $set: {
      role: "admin",
    },
  };
  const result = await UserCollection.updateOne(filters, updateDoc, options);
  res.send(result);
});

// make seller =====================================

app.get("/users/sellers/:email", verifyJWT, async (req, res) => {
  const email = req.params.email;
  const query = { email };
  const user = await UserCollection.findOne(query);
  res.send({ isSeller: user?.role === "seller" });
});

// make buyer =====================================

app.get("/users/buyers/:email", verifyJWT, async (req, res) => {
  const email = req.params.email;
  const query = { email };
  const user = await UserCollection.findOne(query);
  res.send({ isBuyer: user?.role === "buyer" });
});

// update user

// ===== Product Routes =====

// reported product =============

app.patch("/products/report/:id", verifyAdmin, async (req, res) => {
  const id = req.params.id;
  const filters = { _id: ObjectId(id) };
  const options = { upsert: true };
  const updateDoc = {
    $set: {
      reported: true,
    },
  };
  const result = await ProductCollection.updateOne(filters, updateDoc, options);
  res.send(result);
});

// get my product =============

app.get("/products/myproduct/", async (req, res) => {
  const decoded = req.decoded.email;
  const query = { email: decoded };
  const cursor = ProductCollection.find(query);
  const result = await cursor.toArray();
  try {
    res.send({
      sucess: true,
      data: result,
      message: "Data found successfully",
    });
  } catch (error) {
    res.send({
      sucess: false,
      data: [],
      message: "Data not found",
    });
  }
});

// get reported product =============
app.get("/products/report/", verifyJWT, async (req, res) => {
  const query = { reported: true };
  const cursor = ProductCollection.find(query);
  const result = await cursor.toArray();
  try {
    res.send({
      sucess: true,
      data: result,
      message: "Data found successfully",
    });
  } catch (error) {
    res.send({
      sucess: false,
      data: [],
      message: "Data not found",
    });
  }
});

// delete reported product =============

app.delete("/products/report/:id", verifyJWT, async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const result = await ProductCollection.deleteOne(query);
  try {
    res.send({
      sucess: true,
      data: result,
      message: "Data deleted successfully",
    });
  } catch (error) {
    res.send({
      sucess: false,
      data: [],
      message: "Data not deleted",
    });
  }
});

app.post("/products", async (req, res) => {
  const product = req.body;
  const result = ProductCollection.insertOne(product);
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

app.get("/productsGet", async (req, res) => {});

app.get("/myproducts", async (req, res) => {
  const email = req.query.email;
  console.log(email);
  const query = { seller_email: email };
  const result = await ProductCollection.find(query).toArray();
  res.send(result);
});

app.delete("/myproducts/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const result = await ProductCollection.deleteOne(query);

  try {
    res.send({
      sucess: true,
      data: result,
      message: "Data deleted successfully",
    });
  } catch (error) {
    res.send({
      sucess: false,
      data: [],
      message: "Data not deleted",
    });
  }
});

app.get("/products", async (req, res) => {
  const query = {};
  const cursor = ProductCollection.find(query);
  const products = await cursor.toArray();
  res.send(products);
});

app.get("/products/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: ObjectId(id) };
  const product = await ProductCollection.findOne(query);
  res.send(product);
});

app.get("/category", async (req, res) => {
  const query = {};
  const cursor = CetagoyCollection.find(query);
  const cetegory = await cursor.toArray();
  res.send(cetegory);
});

app.get("/category/:categoryName", async (req, res) => {
  const categoryName = req.params.categoryName;
  console.log(categoryName);
  const filters = { categoryName };
  console.log(filters);
  const cetagorys = await ProductCollection.find(filters).toArray();
  res.send(cetagorys);
});

// ===== Product Routes =====

// ========== Booking Routes ==========

app.post("/bookings", async (req, res) => {
  const booking = req.body;
  const query = {
    email: booking.email,
  };
  try {
    const result = await BookingCollection.insertOne(booking);
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

app.get("/bookings", async (req, res) => {
  let query = {};
  if (req.query.email) {
    query = { email: req.query.email };
  }
  const cursor = BookingCollection.find(query);
  const bookings = await cursor.toArray();
  res.send(bookings);
});

// ========== Booking Routes ==========

// wishlist routes

app.post("/wishlist", async (req, res) => {
  const wishlist = req.body;
  try {
    const result = await WishlistCollection.insertOne(wishlist);
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

app.get("/wishlist", async (req, res) => {
  let query = {};
  if (req.query.email) {
    query = { email: req.query.email };
  }
  const cursor = WishlistCollection.find(query);
  const wishlist = await cursor.toArray();
  res.send(wishlist);
});

// wishlist routes

// ============= Advatise Route =============
app.post("/advatise", async (req, res) => {
  const advatise = req.body;
  try {
    const result = await AdvatiseCollection.insertOne(advatise);
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

app.get("/advatise", async (req, res) => {
  const query = {};

  const cursor = AdvatiseCollection.find(query);
  const advatise = await cursor.toArray();
  res.send(advatise);
});

// ============= Advatise Route =============

// delete user

// ============= User Routes =============

// ======== ROUTES ========

app.listen(port, () => {
  console.log(`Mobile Hat Is Runnig On ${port}`);
});
