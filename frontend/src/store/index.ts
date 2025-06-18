import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// 导入所有slice
import authSlice from './slices/authSlice';
import ideSlice from './slices/ideSlice';
import projectSlice from './slices/projectSlice';
import uiSlice from './slices/uiSlice';

// 配置store
export const store = configureStore({
  reducer: {
    auth: authSlice,
    ide: ideSlice,
    project: projectSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略这些action类型的序列化检查
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // 忽略这些字段的序列化检查
        ignoredPaths: ['register'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// 设置监听器以支持refetchOnFocus/refetchOnReconnect行为
setupListeners(store.dispatch);

// 类型定义
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 导出store默认值
export default store;