import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../AuthContext'
import tasksReducer from '../TaskContext'

export const store = configureStore({
    reducer : {
        auth:authReducer,
        tasklist:tasksReducer
    }
})
