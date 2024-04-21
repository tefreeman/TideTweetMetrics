const admin = require('firebase-admin');

const serviceAccount = require('D:/tidetweetmetrics-a047f-f751b98212fd.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setUserRole(uid, role) {
  // Set custom user claims
  try {
    await admin.auth().setCustomUserClaims(uid, { role: role });
    console.log(`Successfully set role for user: ${uid}`);
  } catch (error) {
    console.error('Error setting custom claims:', error);
  }
}

// Replace with your users' UIDs and desired roles
const usersWithRoles = [
  { uid: "bGI4zRBtGPTXHVxHBH3hI9PAyc82", role: "admin" },
  { uid: "IlMYNvhBKdOnNDkOCcvfpypFXuL2", role: "user" },
  { uid: "vB4n7v7Bl3eA5b5kWaQ3CPjCEJ03", role: "user" },
  { uid: "kftrW3kmgqWygx3g2s1J3lfOM9l2", role: "user" },
  { uid: "0jXTl0BksafZoFSyCqPPU6DiOw63", role: "user" },
  { uid: "zn0urECRBBZxBOmIn9Dr0YpHuzf1", role: "user" },
  { uid: "U2wsrmd035brbDe4JKXlcjjGjK23", role: "user" },

];

async function main() {
  for (const user of usersWithRoles) {
    await setUserRole(user.uid, user.role);
  }
}

main().catch(console.error);