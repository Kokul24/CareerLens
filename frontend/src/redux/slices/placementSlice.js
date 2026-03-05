import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = '/api/placement';

// ─── Async thunks ───

export const createPlacementPrediction = createAsyncThunk(
  'placement/predict',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API}/predict`, formData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Prediction failed');
    }
  }
);

export const getPlacementPredictions = createAsyncThunk(
  'placement/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API}/predictions`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch predictions');
    }
  }
);

export const getPlacementPredictionById = createAsyncThunk(
  'placement/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API}/prediction/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch prediction');
    }
  }
);

export const updatePlacementPrediction = createAsyncThunk(
  'placement/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API}/prediction/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update prediction');
    }
  }
);

export const deletePlacementPrediction = createAsyncThunk(
  'placement/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API}/prediction/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete prediction');
    }
  }
);

export const searchPlacementPredictions = createAsyncThunk(
  'placement/search',
  async (params, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams(params).toString();
      const response = await axios.get(`${API}/search?${query}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

const placementSlice = createSlice({
  name: 'placement',
  initialState: {
    prediction: null,
    history: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearPrediction: (state) => {
      state.prediction = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Prediction
      .addCase(createPlacementPrediction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPlacementPrediction.fulfilled, (state, action) => {
        state.loading = false;
        state.prediction = action.payload;
      })
      .addCase(createPlacementPrediction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get All
      .addCase(getPlacementPredictions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPlacementPredictions.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(getPlacementPredictions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get By ID
      .addCase(getPlacementPredictionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPlacementPredictionById.fulfilled, (state, action) => {
        state.loading = false;
        state.prediction = action.payload;
      })
      .addCase(getPlacementPredictionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updatePlacementPrediction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePlacementPrediction.fulfilled, (state, action) => {
        state.loading = false;
        state.prediction = action.payload;
        const idx = state.history.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.history[idx] = action.payload;
      })
      .addCase(updatePlacementPrediction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deletePlacementPrediction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePlacementPrediction.fulfilled, (state, action) => {
        state.loading = false;
        state.history = state.history.filter((p) => p._id !== action.payload);
        if (state.prediction?._id === action.payload) state.prediction = null;
      })
      .addCase(deletePlacementPrediction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search
      .addCase(searchPlacementPredictions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPlacementPredictions.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(searchPlacementPredictions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPrediction, clearError } = placementSlice.actions;
export default placementSlice.reducer;
