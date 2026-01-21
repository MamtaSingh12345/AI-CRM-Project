// features/interaction/interactionSlice.js
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import axios from 'axios';

// Initial state
const initialState = {
  chatNotes: '',
  formData: {
    patientId: '',
    interactionType: 'consultation',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    symptoms: '',
    diagnosis: '',
    prescription: '',
    followUpDate: '',
  },
  isSubmitting: false,
  chatAiResponse: null,
  formAiResponse: null,
  chatHistory: [],
  errors: {},
  lastUpdated: null,
  submitStatus: 'idle',
};

// Async thunks (keep as before)
export const submitChat = createAsyncThunk(
  'interaction/submitChat',
  async (chatNotes, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/log-interaction',
        { mode: 'chat', notes: chatNotes },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      const mockAiResponse = {
        id: Date.now() + 1,
        summary: `AI Summary: Consultation involved discussion about ${chatNotes.split(' ').slice(0, 5).join(' ')}...`,
        insights: [
          'Suggested follow-up in 2 weeks',
          'Potential drug interactions identified',
          'Patient history matches similar cases',
        ],
        nextSteps: [
          'Schedule follow-up appointment',
          'Order lab tests as recommended',
          'Update patient medication list',
        ],
        confidence: 94,
      };
      
      return { chatNotes, aiResponse: mockAiResponse, backendResponse: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to process chat');
    }
  }
);

export const submitForm = createAsyncThunk(
  'interaction/submitForm',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        'http://localhost:8000/log-interaction',
        { mode: 'form', ...formData },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      const mockAiResponse = {
        id: Date.now(),
        summary: `AI Analysis: ${formData.interactionType} recorded for patient ${formData.patientId}`,
        insights: [
          'Suggested follow-up in 2 weeks',
          'Potential drug interactions identified',
          'Patient history matches similar cases',
        ],
        nextSteps: [
          'Schedule follow-up appointment',
          'Order lab tests as recommended',
          'Update patient medication list',
        ],
        confidence: 94,
      };
      
      return { formData, aiResponse: mockAiResponse, backendResponse: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Failed to log interaction');
    }
  }
);

// Create slice
const interactionSlice = createSlice({
  name: 'interaction',
  initialState,
  reducers: {
    setChatNotes: (state, action) => {
      state.chatNotes = action.payload;
      if (state.errors.chatNotes) delete state.errors.chatNotes;
    },
    
    setFormData: (state, action) => {
      const { name, value } = action.payload;
      state.formData[name] = value;
      if (state.errors[name]) delete state.errors[name];
    },
    
    resetFormData: (state) => {
      state.formData = initialState.formData;
      delete state.errors.patientId;
      delete state.errors.duration;
      delete state.errors.formSubmit;
    },
    
    clearChat: (state) => {
      state.chatNotes = '';
      delete state.errors.chatNotes;
      delete state.errors.chatSubmit;
    },
    
    clearChatHistory: (state) => {
      state.chatHistory = [];
    },
    
    clearError: (state, action) => {
      delete state.errors[action.payload];
    },
    
    clearAllErrors: (state) => {
      state.errors = {};
    },
    
    clearAiResponses: (state) => {
      state.chatAiResponse = null;
      state.formAiResponse = null;
    },
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(submitChat.pending, (state) => {
        state.isSubmitting = true;
        state.submitStatus = 'loading';
        delete state.errors.chatSubmit;
      })
      .addCase(submitChat.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.submitStatus = 'succeeded';
        state.chatAiResponse = action.payload.aiResponse;
        
        const userMessage = {
          id: Date.now(),
          type: 'user',
          content: action.payload.chatNotes,
          timestamp: new Date().toLocaleTimeString(),
        };
        
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: action.payload.aiResponse.summary,
          insights: action.payload.aiResponse.insights,
          timestamp: new Date().toLocaleTimeString(),
        };
        
        state.chatHistory.push(userMessage, aiMessage);
        state.chatNotes = '';
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(submitChat.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitStatus = 'failed';
        state.errors.chatSubmit = action.payload || 'Failed to process chat';
      })
      
      .addCase(submitForm.pending, (state) => {
        state.isSubmitting = true;
        state.submitStatus = 'loading';
        delete state.errors.formSubmit;
      })
      .addCase(submitForm.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.submitStatus = 'succeeded';
        state.formAiResponse = action.payload.aiResponse;
        state.formData = initialState.formData;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(submitForm.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitStatus = 'failed';
        state.errors.formSubmit = action.payload || 'Failed to log interaction';
      });
  },
});

// Export actions
export const {
  setChatNotes,
  setFormData,
  resetFormData,
  clearChat,
  clearChatHistory,
  clearError,
  clearAllErrors,
  clearAiResponses,
} = interactionSlice.actions;

// Base selectors
const selectInteractionState = (state) => state.interaction;

export const selectChatNotes = createSelector(
  [selectInteractionState],
  (interaction) => interaction.chatNotes
);

export const selectFormData = createSelector(
  [selectInteractionState],
  (interaction) => interaction.formData
);

export const selectIsSubmitting = createSelector(
  [selectInteractionState],
  (interaction) => interaction.isSubmitting
);

export const selectChatAiResponse = createSelector(
  [selectInteractionState],
  (interaction) => interaction.chatAiResponse
);

export const selectFormAiResponse = createSelector(
  [selectInteractionState],
  (interaction) => interaction.formAiResponse
);

export const selectChatHistory = createSelector(
  [selectInteractionState],
  (interaction) => interaction.chatHistory
);

export const selectErrors = createSelector(
  [selectInteractionState],
  (interaction) => interaction.errors
);

export const selectSubmitStatus = createSelector(
  [selectInteractionState],
  (interaction) => interaction.submitStatus
);

// Memoized validation selectors
export const selectFormValidation = createSelector(
  [selectFormData],
  (formData) => {
    const errors = {};
    if (!formData.patientId?.trim()) errors.patientId = 'Patient ID is required';
    if (!formData.duration?.trim()) errors.duration = 'Duration is required';
    return errors;
  }
);

export const selectChatValidation = createSelector(
  [selectChatNotes],
  (chatNotes) => {
    const errors = {};
    if (!chatNotes?.trim()) errors.chatNotes = 'Please enter chat notes';
    return errors;
  }
);

// Combined selectors for common use cases
export const selectHasFormErrors = createSelector(
  [selectFormValidation],
  (errors) => Object.keys(errors).length > 0
);

export const selectHasChatErrors = createSelector(
  [selectChatValidation],
  (errors) => Object.keys(errors).length > 0
);

export default interactionSlice.reducer;