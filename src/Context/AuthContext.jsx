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
    organizations:[],
    organization:{},
  },
  reducers: {
    /* ---------- USER ---------- */
    setUser: (state, action) => {
      state.user = action.payload;
    },

    logout: (state) => {
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
    
      setOrganization:(state , action) =>{
        state.organization
         = action.payload
      }
  },
});

export const { setUser, logout, setTasks ,setMembers,setOrganizations ,setOrganization } = authSlice.actions;
export default authSlice.reducer;
