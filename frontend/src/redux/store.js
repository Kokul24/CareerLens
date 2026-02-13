import { configureStore } from '@reduxjs/toolkit';
import careerReducer from './slices/careerSlice';
import resumeReducer from './slices/resumeSlice';
import authReducer from './slices/authSlice';

const store = configureStore({
  reducer: {
    career: careerReducer,
    resume: resumeReducer,
    auth: authReducer,
  },
});

export default store;
