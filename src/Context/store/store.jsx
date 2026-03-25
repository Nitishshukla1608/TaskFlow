import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../AuthContext'
import tasksReducer from '../TaskContext'
import chatReducer from "../ChatContext"
import planReducer from "../PlanContext"
export const store = configureStore({
    reducer : {
        auth:authReducer,
        tasklist:tasksReducer,
        chatList:chatReducer,
        plan: planReducer
    }
})
