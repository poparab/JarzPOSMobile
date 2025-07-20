import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Task {
  id: string;
  title: string;
  column: string;
}

interface KanbanState {
  tasks: Task[];
}

const initialState: KanbanState = {
  tasks: [],
};

const kanbanSlice = createSlice({
  name: 'kanban',
  initialState,
  reducers: {
    addTask(state, action: PayloadAction<Task>) {
      state.tasks.push(action.payload);
    },
    moveTask(state, action: PayloadAction<{ id: string; column: string }>) {
      const task = state.tasks.find((t) => t.id === action.payload.id);
      if (task) task.column = action.payload.column;
    },
  },
});

export const { addTask, moveTask } = kanbanSlice.actions;
export default kanbanSlice.reducer;
