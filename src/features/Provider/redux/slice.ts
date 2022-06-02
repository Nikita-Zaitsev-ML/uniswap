import { createSlice } from '@reduxjs/toolkit';
import { defaults } from 'lodash';

import { initialState } from './initialState';
import { getData, addLiquidity, removeLiquidity, swapIn } from './thunks';
import { selectProvider } from './selectors';

const slice = createSlice({
  name: 'Provider',
  initialState,
  reducers: {
    setFeeValue(state, { payload }) {
      state.data.fee.value = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getData.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(getData.fulfilled, (state, action) => {
        const { payload } = action;

        state.status = 'fulfilled';
        state.shouldUpdateData = false;
        state.data = defaults(payload, initialState.data);
      })
      .addCase(getData.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = action.error.message ?? '';
      })
      .addCase(addLiquidity.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(addLiquidity.fulfilled, (state) => {
        state.status = 'fulfilled';
        state.shouldUpdateData = true;
      })
      .addCase(addLiquidity.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = action.error.message ?? '';
      })
      .addCase(removeLiquidity.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(removeLiquidity.fulfilled, (state) => {
        state.status = 'fulfilled';
        state.shouldUpdateData = true;
      })
      .addCase(removeLiquidity.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = action.error.message ?? '';
      })
      .addCase(swapIn.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(swapIn.fulfilled, (state) => {
        state.status = 'fulfilled';
        state.shouldUpdateData = true;
      })
      .addCase(swapIn.rejected, (state, action) => {
        state.status = 'rejected';
        state.error = action.error.message ?? '';
      });
  },
});

const { setFeeValue } = slice.actions;

const { reducer } = slice;

export {
  reducer,
  selectProvider,
  setFeeValue,
  getData,
  addLiquidity,
  removeLiquidity,
  swapIn,
};
