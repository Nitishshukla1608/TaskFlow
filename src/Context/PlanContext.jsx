import { createSlice } from "@reduxjs/toolkit";

const planSlice = createSlice({
    name:"plan",
    initialState:{
        currentPlanData:{},
        isFreeTrial:false,
    },
    reducers:{
        setPlanData:(state , action) =>{
            state.currentPlanData = action.payload;
        },
        setIsFreeTrial:(state , action) => {
            state.isFreeTrial = action.payload
        }
        }
})

export const {setPlanData ,setIsFreeTrial} = planSlice.actions;
export default planSlice.reducer