import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const serviceAccount = require("../firebase-admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const verifyToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) {
      return res.status(401).json({
        message: "No token"
      });
    }

    const token = header.split("Bearer ")[1];

    const decoded =
      await admin.auth().verifyIdToken(token);

    req.user = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid token"
    });
  }
};

export default verifyToken;