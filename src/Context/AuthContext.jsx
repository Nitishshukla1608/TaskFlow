import { createSlice } from "@reduxjs/toolkit";

const getUserFromLocalStorage = () => {
    try {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error("Error reading user from localStorage:", error);
        return null;
    }
};
const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: getUserFromLocalStorage(), // Initialize user from localStorage
    },
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            try {
                localStorage.setItem("user", JSON.stringify(action.payload)); // Save user to localStorage
            } catch (error) {
                console.error("Error saving user to localStorage:", error);
            }
        },
        logout: (state) => {
            state.user = null; // Clear user from Redux state
            try {
                localStorage.removeItem("user"); // Clear user from localStorage
            } catch (error) {
                console.error("Error removing user from localStorage:", error);
            }
        },
    },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;