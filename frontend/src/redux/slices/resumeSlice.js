import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const analyzeResume = createAsyncThunk(
  'resume/analyzeResume',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/resume/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to analyze resume');
    }
  }
);

export const getResumeHistory = createAsyncThunk(
  'resume/getHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/resume/history');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
    }
  }
);

// GET single resume by ID (READ)
export const getResumeById = createAsyncThunk(
  'resume/getResumeById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/resume/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch resume');
    }
  }
);

// UPDATE resume analysis
export const updateResume = createAsyncThunk(
  'resume/updateResume',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/resume/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update resume');
    }
  }
);

// DELETE resume analysis
export const deleteResume = createAsyncThunk(
  'resume/deleteResume',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/resume/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete resume');
    }
  }
);

const resumeSlice = createSlice({
  name: 'resume',
  initialState: {
    analysis: null,
    history: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearAnalysis: (state) => {
      state.analysis = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Analyze Resume
      .addCase(analyzeResume.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeResume.fulfilled, (state, action) => {
        state.loading = false;
        state.analysis = action.payload;
      })
      .addCase(analyzeResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get History
      .addCase(getResumeHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getResumeHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(getResumeHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Resume By ID
      .addCase(getResumeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getResumeById.fulfilled, (state, action) => {
        state.loading = false;
        state.analysis = action.payload;
      })
      .addCase(getResumeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Resume
      .addCase(updateResume.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateResume.fulfilled, (state, action) => {
        state.loading = false;
        state.analysis = action.payload;
        // Update in history if exists
        const index = state.history.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.history[index] = action.payload;
        }
      })
      .addCase(updateResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Resume
      .addCase(deleteResume.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteResume.fulfilled, (state, action) => {
        state.loading = false;
        state.history = state.history.filter(r => r._id !== action.payload.id);
        if (state.analysis?._id === action.payload.id) {
          state.analysis = null;
        }
      })
      .addCase(deleteResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAnalysis } = resumeSlice.actions;
export default resumeSlice.reducer;
