The error `FirebaseError: [code=permission-denied]: Missing or insufficient permissions.` indicates a problem with your **Firebase Firestore Security Rules**.

The application, specifically in `src/Mains/AdminMain.jsx` (which is only rendered for admin users), is attempting to listen to the `tasks` collection in Firestore. The rule states that the currently logged-in user does not have permission to read the data it's requesting.

**To fix this, you need to update your Firestore Security Rules in your Firebase project console.**

1.  **Go to your Firebase project console.**
2.  Navigate to **Firestore Database**.
3.  Click on the **Rules** tab.
4.  **Replace your existing rules** with something similar to the example below. This example grants authenticated users read and write access to their own user documents and allows them to read, create, update, and delete tasks where their `uid` matches the `adminId` field in the task document.

    ```firestore
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {

        // Allow read/write to user's own document in 'users' collection
        match /users/{userId} {
          allow read, update, delete: if request.auth != null && request.auth.uid == userId;
          allow create: if request.auth != null; // Allow any authenticated user to create their own user document
        }

        // Allow read/write access to 'tasks' collection for authenticated users
        // For tasks, assume 'adminId' is the creator/owner of the task
        match /tasks/{taskId} {
          // Allow read if authenticated and the user is the admin (owner) of the task
          allow read: if request.auth != null && resource.data.adminId == request.auth.uid;

          // Allow create if authenticated and the request.auth.uid is set as adminId in the task data
          allow create: if request.auth != null && request.auth.uid == request.resource.data.adminId;

          // Allow update/delete if authenticated and the user is the admin (owner) of the task
          allow update, delete: if request.auth != null && resource.data.adminId == request.auth.uid;
        }

        // If you have other collections, you'll need rules for them too.
      }
    }
    ```

**Important Notes:**
*   This is a general example. Review these rules carefully and adjust them to fit the exact security requirements of your application.
*   After updating the rules in the Firebase console, **publish** them.
*   Once the rules are updated and published, try logging in to your application again.

This should resolve the "Missing or insufficient permissions" error and allow the dashboard to load correctly for admin users.

After this is resolved, we can proceed with implementing the `yourTotal` increment feature.