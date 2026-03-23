import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../AuthContext'
import tasksReducer from '../TaskContext'
import chatReducer from "../ChatContext"
export const store = configureStore({
    reducer : {
        auth:authReducer,
        tasklist:tasksReducer,
        chatList:chatReducer
    }
})
