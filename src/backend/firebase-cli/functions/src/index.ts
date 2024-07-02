import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Storage } from "@google-cloud/storage";
import * as Busboy from "busboy";
import { Request, Response } from "express";
import * as https from "https";
import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import { v4 as uuidv4 } from "uuid";
const axios = require("axios");

interface CustomRequest extends Request {
  rawBody?: Buffer;
}

admin.initializeApp();
const storage = new Storage();
const bucket = storage.bucket("tidetweetmetrics-a047f.appspot.com");

exports.fireBackendUpdate = functions.https.onCall(async (data, context) => {
  // Step 1: Authentication and role verification
  if (!context.auth || context.auth.token.role !== "admin") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "The function must be called by an administrator."
    );
  }

  // Step 2: Fetch the URL from Firestore
  try {
    const ipDoc = await admin.firestore().collection("ip").doc("backend").get();
    if (!ipDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "The required document does not exist in Firestore."
      );
    }
    const backendData = ipDoc.data();
    const url = backendData ? backendData.url : null;
    if (!url) {
      throw new functions.https.HttpsError(
        "not-found",
        "URL not found in the document."
      );
    }

    // Step 3: Make the HTTP GET request to the fetched URL
    let responseData;
    try {
      const response = await axios.get(url);
      responseData = response.data;
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error data:", error.response.data);
        console.error("Error status:", error.response.status);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error", error.message);
      }
      throw new functions.https.HttpsError(
        "internal",
        `Failed to fetch data from URL: ${url}.`
      );
    }

    // Step 4: Return the fetched data or a success message
    return {
      status: "success",
      data: responseData,
      message: `Data successfully fetched from ${url}.`,
    };
  } catch (error) {
    console.error("Failed to fetch admin data:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to execute the function.",
      error
    );
  }
});

// This function checks if the file exists and deletes it
export const uploadFile = functions.https.onRequest(
  async (req: CustomRequest, res: Response) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const busboy = Busboy({ headers: req.headers });
    const tmpdir = os.tmpdir();

    let tmpFilePath = "";
    let mimeType = "";

    // 'fileName' is now predefined; adjust according to your use case
    let fileNameBase = "metrics_out";
    let fileName = fileNameBase + ".json";
    let uniqueName: string;
    busboy.on(
      "file",
      (
        fieldname: any,
        file: { pipe: (arg0: fs.WriteStream) => void },
        filename: any,
        encoding: any,
        mimetype: string
      ) => {
        // Construct temporary file path
        const uniqueFileName = `${uuidv4()}_${filename}`;
        uniqueName = uniqueFileName;
        const filepath = path.join(tmpdir, uniqueFileName);
        tmpFilePath = filepath;
        mimeType = mimetype;

        const writeStream = fs.createWriteStream(filepath);
        file.pipe(writeStream);
      }
    );

    busboy.on("finish", async () => {
      if (!tmpFilePath) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      try {
        // Delete existing file if it exists
        const file = bucket.file(fileName);
        if ((await file.exists())[0]) {
          await file.delete();
          console.log(`Deleted existing file: ${fileName}`);
        }

        // Proceed with uploading the new file
        await bucket.upload(tmpFilePath, {
          destination: fileName,
          metadata: { contentType: mimeType },
        });

        // Clean up temporary file
        await fs.promises.unlink(tmpFilePath);

        // Update Firestore as before
        const firestore = admin.firestore();
        await firestore.collection("file_versions").doc(fileNameBase).set({
          version: uniqueName,
        });

        res
          .status(200)
          .json({ message: "File uploaded and Firestore updated" });
      } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Failed to upload the file" });

        // Attempt to clean up temporary file in case of error
        try {
          await fs.promises.unlink(tmpFilePath);
        } catch (err) {
          console.error("Error deleting temporary file:", err);
        }
      }
    });

    // Ensure rawBody is piped to Busboy correctly
    if (req.rawBody) {
      busboy.end(req.rawBody);
    } else {
      req.pipe(busboy);
    }
  }
);

// Cloud Function that triggers when a Firebase user is created
exports.processSignUp = functions.auth.user().onCreate((user) => {
  // Set custom user claims on this newly created user.
  return admin
    .auth()
    .setCustomUserClaims(user.uid, { role: "unverified" })
    .then(() => {
      // Update real-time database to notify client to force refresh.
      const metadataRef = admin.database().ref("metadata/" + user.uid);
      // Set the refresh time to the current UTC timestamp.
      // This will be captured on the client to force a token refresh.
      return metadataRef.set({
        refreshTime: admin.database.ServerValue.TIMESTAMP,
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

// Delete a user and their profile document function
exports.deleteUserAndProfile = functions.https.onCall(async (data, context) => {
  // Authenticate the calling user and check if they're an admin
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const callerUid = context.auth.uid;
  try {
    const callerClaims = (await admin.auth().getUser(callerUid)).customClaims;
    if (!callerClaims || callerClaims.role !== "admin") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Required admin role."
      );
    }
  } catch (error) {
    console.error("Error fetching caller's custom claims:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to validate caller's permission."
    );
  }

  // Check if the uid of the user to delete is provided
  const uidToDelete = data.uid;
  if (!uidToDelete) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing target user UID."
    );
  }

  try {
    // Delete the Firestore document from the 'profiles' collection
    const profileRef = admin
      .firestore()
      .collection("profiles")
      .doc(uidToDelete);
    await profileRef.delete();

    // Delete the user
    await admin.auth().deleteUser(uidToDelete);

    // Return a success message
    return {
      status: "success",
      message: `User ${uidToDelete} and their profile document have been successfully deleted.`,
    };
  } catch (error) {
    console.error("Error deleting user and/or their profile:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Error deleting user and/or their profile.",
      error
    );
  }
});

exports.updateUserRole = functions.https.onCall(async (data, context) => {
  // Check for authentication and admin role using custom claims
  if (!context.auth || context.auth.token.role !== "admin") {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called by an administrator."
    );
  }

  // Check if the uid of the user to update is provided
  const uidToUpdate = data.uid;
  if (!uidToUpdate) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing target user UID."
    );
  }

  try {
    // Get current user's claims
    const user = await admin.auth().getUser(uidToUpdate);
    const currentClaims = user.customClaims || {};

    // Check if user is in an 'unverified' state
    if (currentClaims.role !== "unverified") {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Target user is not in an unverified state."
      );
    }

    // Update user's claim from 'unverified' to 'user'
    await admin
      .auth()
      .setCustomUserClaims(uidToUpdate, { ...currentClaims, role: "user" });

    // Optionally, initialize or update a Firestore document in the 'profiles' collection
    const profileRef = admin
      .firestore()
      .collection("profiles")
      .doc(uidToUpdate);
    await profileRef.set({}, { merge: true }); // Using merge: true to avoid overwriting existing data

    // Return success status
    return {
      status: "success",
      message: `User ${uidToUpdate} role updated to 'user' and profile document initialized.`,
    };
  } catch (error) {
    console.error(error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to update user role or initialize profile.",
      error
    );
  }
});

exports.getAllUsersWithRoles = functions.https.onCall(async (data, context) => {
  // Check if the request is made by an authenticated user
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  // Check if the calling user is an admin by inspecting custom claims
  const callerUid = context.auth.uid;
  try {
    const callerClaims = (await admin.auth().getUser(callerUid)).customClaims;
    if (!callerClaims || callerClaims.role !== "admin") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Required admin role."
      );
    }
  } catch (error) {
    console.error("Error fetching caller's custom claims:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to validate caller's permission."
    );
  }

  // Proceed to fetch all users
  let usersData: any[] = [];
  let nextPageToken = undefined;
  do {
    try {
      // List batch of users, 1000 at a time
      const listUsersResult: any = await admin
        .auth()
        .listUsers(1000, nextPageToken);
      listUsersResult.users.forEach((userRecord: any) => {
        const customClaims: any = userRecord.customClaims || { role: "none" };
        usersData.push({
          uid: userRecord.uid,
          email: userRecord.email,
          role: customClaims.role || "none",
        });
      });
      nextPageToken = listUsersResult.pageToken;
    } catch (error) {
      console.log("Error listing users:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error fetching user list."
      );
    }
  } while (nextPageToken);

  return usersData;
});

export const optimizeTweet = functions.https.onRequest(
  (req: Request, res: Response) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    //const url = "https://ai.dopplernet.online/optimize_tweet";

    const payload = JSON.stringify(req.body);

    const options = {
      hostname: "ai.dopplernet.online",
      path: "/optimize_tweet",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": payload.length,
      },
    };

    const externalReq = https.request(options, (externalRes) => {
      let data = "";

      externalRes.on("data", (chunk) => {
        data += chunk;
      });

      externalRes.on("end", () => {
        if (
          externalRes.statusCode &&
          externalRes.statusCode >= 200 &&
          externalRes.statusCode < 300
        ) {
          res.status(200).json(JSON.parse(data));
        } else {
          res
            .status(externalRes.statusCode || 500)
            .json({ error: "Failed to fetch optimized tweet" });
        }
      });
    });

    externalReq.on("error", (e) => {
      console.error(`Error: ${e.message}`);
      res.status(500).json({ error: "Request failed" });
    });

    externalReq.write(payload);
    externalReq.end();
  }
);
//   In your client apps, listen to the metadata location and call getIdToken(true) to force a refresh:

// firebase.database().ref('metadata/' + user.uid).on('value', (snapshot) => {
//   // Force refresh to pick up the latest custom claims changes.
//   user.getIdToken(true);
// });
