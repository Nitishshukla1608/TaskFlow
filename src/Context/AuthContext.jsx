import { createSlice } from "@reduxjs/toolkit";


/* =========================
   AUTH AND TASK SLICE
========================= */

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user:null, // 🔐 auth user
    tasks:[], // ✅ FIX: tasks should be an array
    members:[],
    organizations:[]
  },
  reducers: {
    /* ---------- USER ---------- */
    setUser: (state, action) => {
      state.user = action.payload;
    },

    logout: (state) => {a
      state.user = null;
      state.tasks = []; // ✅ clear tasks on logout
    },

    /* ---------- TASKS ---------- */
    setTasks: (state, action) => {
      state.tasks = action.payload; // 🔥 realtime task updates
    },

     /* ...........Members ............  */
     setMembers:(state , action) =>{
      state.members=action.payload
     },

      /* ...........Organization ............  */
      setOrganizations: (state, action) => {
        // FIX: Use 'organizations' to match your initialState
        state.organizations = action.payload; 
      },

  },
});

export const { setUser, logout, setTasks ,setMembers,setOrganizations } = authSlice.actions;
export default authSlice.reducer;
