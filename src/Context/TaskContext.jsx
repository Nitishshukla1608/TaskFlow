import {createSlice} from "@reduxjs/toolkit"

const taskSlice = createSlice({
    name:taskList,
    initialState:{
        Task:{}
    },
    reducer:{
        setTask(state , action){
            state.Task = action.payload
        }
    }
})
export const {setTask} = taskSlice.actions
export default taskSlice.reducer
