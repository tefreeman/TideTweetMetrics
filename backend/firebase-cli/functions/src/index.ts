import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();


// Cloud Function that triggers when a Firebase user is created
exports.processSignUp = functions.auth.user().onCreate((user) => {
    
    // Set custom user claims on this newly created user.
    return admin.auth().setCustomUserClaims(user.uid, {role: 'unverified'})
    .then(() => {
        // Update real-time database to notify client to force refresh.
        const metadataRef = admin.database().ref('metadata/' + user.uid);
        // Set the refresh time to the current UTC timestamp.
        // This will be captured on the client to force a token refresh.
        return metadataRef.set({refreshTime: admin.database.ServerValue.TIMESTAMP});
      })
    .catch(error => {
        console.log(error);
    });
  });

  // Delete a user and their profile document function
exports.deleteUserAndProfile = functions.https.onCall(async (data, context) => {
  // Authenticate the calling user and check if they're an admin
  if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const callerUid = context.auth.uid;
  try {
      const callerClaims = (await admin.auth().getUser(callerUid)).customClaims;
      if (!callerClaims || callerClaims.role !== 'admin') {
          throw new functions.https.HttpsError('permission-denied', 'Required admin role.');
      }
  } catch (error) {
      console.error("Error fetching caller's custom claims:", error);
      throw new functions.https.HttpsError('internal', 'Unable to validate caller\'s permission.');
  }

  // Check if the uid of the user to delete is provided
  const uidToDelete = data.uid;
  if (!uidToDelete) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing target user UID.');
  }

  try {
      // Delete the Firestore document from the 'profiles' collection
      const profileRef = admin.firestore().collection('profiles').doc(uidToDelete);
      await profileRef.delete();

      // Delete the user
      await admin.auth().deleteUser(uidToDelete);

      // Return a success message
      return { status: 'success', message: `User ${uidToDelete} and their profile document have been successfully deleted.` };
  } catch (error) {
      console.error('Error deleting user and/or their profile:', error);
      throw new functions.https.HttpsError('internal', 'Error deleting user and/or their profile.', error);
  }
});


exports.updateUserRole = functions.https.onCall(async (data, context) => {
    // Check for authentication and admin role using custom claims
    if (!context.auth || context.auth.token.role !== 'admin') {
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called by an administrator.');
    }

    // Check if the uid of the user to update is provided
    const uidToUpdate = data.uid;
    if (!uidToUpdate) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing target user UID.');
    }

    try {
        // Get current user's claims
        const user = await admin.auth().getUser(uidToUpdate);
        const currentClaims = user.customClaims || {};

        // Check if user is in an 'unverified' state
        if (currentClaims.role !== 'unverified') {
            throw new functions.https.HttpsError('failed-precondition', 'Target user is not in an unverified state.');
        }

        // Update user's claim from 'unverified' to 'user'
        await admin.auth().setCustomUserClaims(uidToUpdate, { ...currentClaims, role: 'user' });

        // Optionally, initialize or update a Firestore document in the 'profiles' collection
        const profileRef = admin.firestore().collection('profiles').doc(uidToUpdate);
        await profileRef.set({}, { merge: true }); // Using merge: true to avoid overwriting existing data

        // Return success status
        return { status: 'success', message: `User ${uidToUpdate} role updated to 'user' and profile document initialized.` };
    } catch (error) {
        console.error(error);
        throw new functions.https.HttpsError('internal', 'Unable to update user role or initialize profile.', error);
    }
});

  
  
  exports.getAllUsersWithRoles = functions.https.onCall(async (data, context) => {
      // Check if the request is made by an authenticated user
      if (!context.auth) {
          throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
      }
  
      // Check if the calling user is an admin by inspecting custom claims
      const callerUid = context.auth.uid;
      try {
          const callerClaims = (await admin.auth().getUser(callerUid)).customClaims;
          if (!callerClaims || callerClaims.role !== 'admin') {
              throw new functions.https.HttpsError('permission-denied', 'Required admin role.');
          }
      } catch (error) {
          console.error("Error fetching caller's custom claims:", error);
          throw new functions.https.HttpsError('internal', 'Unable to validate caller\'s permission.');
      }
  
      // Proceed to fetch all users
      let usersData: any[] = [];
      let nextPageToken = undefined;
      do {
          try {
              // List batch of users, 1000 at a time
              const listUsersResult: any = await admin.auth().listUsers(1000, nextPageToken);
              listUsersResult.users.forEach((userRecord: any) => {
                  const customClaims: any = userRecord.customClaims || { role: 'none' };
                  usersData.push({
                      uid: userRecord.uid,
                      email: userRecord.email,
                      role: customClaims.role || 'none',
                  });
              });
              nextPageToken = listUsersResult.pageToken;
          } catch (error) {
              console.log('Error listing users:', error);
              throw new functions.https.HttpsError('internal', 'Error fetching user list.');
          }
      } while (nextPageToken);
  
      return usersData;
  });
  

//   In your client apps, listen to the metadata location and call getIdToken(true) to force a refresh:

// firebase.database().ref('metadata/' + user.uid).on('value', (snapshot) => {
//   // Force refresh to pick up the latest custom claims changes.
//   user.getIdToken(true);
// });