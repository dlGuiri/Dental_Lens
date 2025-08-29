const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://darwinlouis4:NByqAr3P96FbUci7@dental0.ouxeywm.mongodb.net/?retryWrites=true&w=majority&appName=Dental0&tls=true"; // from MongoDB Atlas
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db("test");
    const users = db.collection("users");

    const result = await users.updateMany(
      { role: { $exists: false } },
      { $set: { role: "patient" } }
    );

    console.log(`Updated ${result.modifiedCount} documents`);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
