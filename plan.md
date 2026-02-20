// I have re-read `src/Components/Pages/Login.jsx`.
//
// It seems I *already* made the change to use `getUserData` in `Login.jsx` in a previous turn!
// ```javascript
// import { loginUser, getUserData } from "../../Services/authService"; // Already imports getUserData
// // ...
// const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//   
//     try {
//       const user = await loginUser(email, password);
//       const userData = await getUserData(user.uid); // Uses getUserData
//       // ...
//       dispatch(setUser({
//         uid: user.uid,
//         email: user.email,
//         name: userData.name || user.name || "", // uses userData.name
//         role: userData.role, // uses userData.role
//         yourTotal:userData.yourTotal // uses userData.yourTotal
//       }));
//       // ...
//       if (userData.role === "admin") navigate("/admin"); // Uses userData.role
//       else navigate("/employee");
//     } catch (err) {
//       setError(err.message);
//     }
//   };
// ```
// This is good. It means `Login.jsx` is correctly fetching the full `userData` from Firestore, including `name`, `role`, and `yourTotal`, and dispatching it to the Redux store.
//
// So, the issue of "Unknown user role" might *not* be originating from `Login.jsx` not providing the role, but rather from how `DashboardWrapper` is handling the `user` object *after* it's been set in Redux and localStorage.
//
// This brings me back to the urgent need for the console output from `DashboardWrapper.jsx`.
//
// **Summary of current situation:**
// *   `Login.jsx` is updated to correctly fetch and dispatch `userData` (including `role` and `yourTotal`).
// *   `authService.jsx` is well-defined. `getUserRole` is no longer needed/used.
// *   `App.jsx` handles initial redirects to `/login` if unauthenticated.
// *   Header components are updated to show user's name with "'s".
// *   `DashboardWrapper.jsx` has `console.log("DashboardWrapper - user:", user);` to help debug the "Unknown user role" issue.
//
// **Next step:** The immediate priority is to get the console output from `DashboardWrapper.jsx` to understand the state of the `user` object when the "Unknown user role" message appears.