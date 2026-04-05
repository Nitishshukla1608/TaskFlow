/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });




const functions = require("firebase-functions");
const Razorpay = require("razorpay");
const { RtcTokenBuilder, RtcRole } = require("agora-token");

// Agora credentials (use your actual App ID and App Certificate from Agora Console)
const AGORA_APP_ID = "8b4daca5c28a4b8389e5227b7b0276c5";
const AGORA_APP_CERTIFICATE = "5679c079c3c44a5fbcb50fab84278cad"; // ⚠️ Get this from Agora Console

const razorpay = new Razorpay({
  key_id: "YOUR_KEY_ID",
  key_secret: "YOUR_SECRET",
});

exports.createOrder = functions.https.onCall(async (data, context) => {
  try {
    const options = {
      amount: data.amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    return { order };
  } catch (error) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// Agora Token Generation Function
exports.generateAgoraToken = functions.https.onCall(async (data, context) => {
  const channelName = data.channelName;
  if (!channelName) {
    throw new functions.https.HttpsError("invalid-argument", "Channel name is required");
  }

  const uid = data.uid || 0; // Default to 0 for a dynamic UID
  const role = RtcRole.PUBLISHER; // Always use publisher for the video call participant
  const expirationTimeInSeconds = 3600; // Token valid for 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    );
    return { token };
  } catch (error) {
    throw new functions.https.HttpsError("internal", "Could not generate Agora token");
  }
});
