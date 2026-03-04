import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Async thunks
export const generateRoadmap = createAsyncThunk(
  'career/generateRoadmap',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/career/roadmap`, data, { headers: getAuthHeaders() });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate roadmap');
    }
  }
);

export const getLearningResources = createAsyncThunk(
  'career/getLearningResources',
  async (skillName, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/career/resources/${skillName}`, { headers: getAuthHeaders() });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch resources');
    }
  }
);

// GET all roadmaps (READ ALL)
export const getAllRoadmaps = createAsyncThunk(
  'career/getAllRoadmaps',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/career/roadmaps`, { headers: getAuthHeaders() });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch roadmaps');
    }
  }
);

// GET single roadmap by ID (READ)
export const getRoadmapById = createAsyncThunk(
  'career/getRoadmapById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/career/roadmap/${id}`, { headers: getAuthHeaders() });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch roadmap');
    }
  }
);

// UPDATE roadmap
export const updateRoadmap = createAsyncThunk(
  'career/updateRoadmap',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/career/roadmap/${id}`, data, { headers: getAuthHeaders() });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update roadmap');
    }
  }
);

// DELETE roadmap
export const deleteRoadmap = createAsyncThunk(
  'career/deleteRoadmap',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/career/roadmap/${id}`, { headers: getAuthHeaders() });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete roadmap');
    }
  }
);

const careerSlice = createSlice({
  name: 'career',
  initialState: {
    roadmap: null,
    roadmaps: [],
    resources: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearRoadmap: (state) => {
      state.roadmap = null;
      state.error = null;
    },
    clearResources: (state) => {
      state.resources = null;
    },
    setRoadmap: (state, action) => {
      state.roadmap = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Generate Roadmap
      .addCase(generateRoadmap.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateRoadmap.fulfilled, (state, action) => {
        state.loading = false;
        state.roadmap = action.payload;
      })
      .addCase(generateRoadmap.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Learning Resources
      .addCase(getLearningResources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLearningResources.fulfilled, (state, action) => {
        state.loading = false;
        state.resources = action.payload;
      })
      .addCase(getLearningResources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get All Roadmaps
      .addCase(getAllRoadmaps.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllRoadmaps.fulfilled, (state, action) => {
        state.loading = false;
        state.roadmaps = action.payload;
      })
      .addCase(getAllRoadmaps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Roadmap By ID
      .addCase(getRoadmapById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRoadmapById.fulfilled, (state, action) => {
        state.loading = false;
        state.roadmap = action.payload;
      })
      .addCase(getRoadmapById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Roadmap
      .addCase(updateRoadmap.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRoadmap.fulfilled, (state, action) => {
        state.loading = false;
        state.roadmap = action.payload;
        // Update in roadmaps list if exists
        const index = state.roadmaps.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.roadmaps[index] = action.payload;
        }
      })
      .addCase(updateRoadmap.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Roadmap
      .addCase(deleteRoadmap.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRoadmap.fulfilled, (state, action) => {
        state.loading = false;
        state.roadmaps = state.roadmaps.filter(r => r._id !== action.payload.id);
        if (state.roadmap?._id === action.payload.id) {
          state.roadmap = null;
        }
      })
      .addCase(deleteRoadmap.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearRoadmap, clearResources, setRoadmap } = careerSlice.actions;
export default careerSlice.reducer;
