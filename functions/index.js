/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Function to send push notification when a new crush is sent
exports.sendPushNotification = functions.database
  .ref("/notificationRequests/{userId}/{notificationId}")
  .onCreate(async (snapshot, context) => {
    try {
      const notificationData = snapshot.val();
      console.log("Notification data received:", notificationData);

      if (!notificationData || !notificationData.token) {
        console.error("Invalid notification data or missing token");
        return null;
      }

      const { token, title, body, data } = notificationData;

      const message = {
        token: token,
        notification: {
          title: title || "New Crush Alert! 💘",
          body: body || "Someone has a crush on you! Check your notifications!",
        },
        data: {
          ...(data || {}),
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          screen: "/notification"
        },
        android: {
          notification: {
            icon: "@mipmap/ic_launcher",
            color: "#7C3AED", // violet-600
            clickAction: "FLUTTER_NOTIFICATION_CLICK"
          }
        },
        webpush: {
          fcmOptions: {
            link: "/notification"
          },
          notification: {
            icon: "/logo192.png",
            badge: "/logo192.png",
            vibrate: [200, 100, 200],
            actions: [
              {
                action: "view",
                title: "View Notifications"
              }
            ]
          }
        },
        apns: {
          payload: {
            aps: {
              "mutable-content": 1,
              sound: "default"
            }
          },
          fcmOptions: {
            image: "/logo192.png"
          }
        }
      };

      console.log("Attempting to send notification with message:", message);

      try {
        const response = await admin.messaging().send(message);
        console.log("Successfully sent notification:", response);
      } catch (sendError) {
        console.error("Error sending notification:", sendError);
        if (sendError.code === "messaging/invalid-registration-token" ||
            sendError.code === "messaging/registration-token-not-registered") {
          // Remove invalid token
          const userRef = admin.database().ref(`users/${context.params.userId}/notificationToken`);
          await userRef.remove();
          console.log("Removed invalid token for user:", context.params.userId);
        }
        throw sendError;
      }

      // Delete the request after processing
      await admin.database().ref(snapshot.ref).remove();
      console.log("Notification request cleaned up successfully");

      return null;
    } catch (error) {
      console.error("Function error:", error);
      return null;
    }
  });
