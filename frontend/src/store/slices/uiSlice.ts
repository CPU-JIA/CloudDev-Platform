import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 主题类型
export type Theme = 'light' | 'dark' | 'auto';

// 语言类型
export type Language = 'zh-CN' | 'en-US' | 'ja-JP';

// 布局模式
export type LayoutMode = 'full' | 'compact' | 'minimal';

// 通知类型
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
  read: boolean;
  actions?: Array<{
    label: string;
    action: string;
    type?: 'primary' | 'default' | 'danger';
  }>;
}

// 面包屑项
export interface BreadcrumbItem {
  key: string;
  title: string;
  path?: string;
  icon?: string;
}

// UI状态接口
export interface UIState {
  // 主题和外观
  theme: Theme;
  language: Language;
  layoutMode: LayoutMode;
  
  // 导航和面包屑
  breadcrumbs: BreadcrumbItem[];
  
  // 加载状态
  globalLoading: boolean;
  loadingTasks: string[];
  
  // 通知系统
  notifications: Notification[];
  notificationCount: number;
  
  // 模态框和抽屉
  modals: {
    settings: boolean;
    about: boolean;
    shortcuts: boolean;
    feedback: boolean;
  };
  
  drawers: {
    notifications: boolean;
    help: boolean;
    search: boolean;
  };
  
  // 侧边栏状态
  sidebarCollapsed: boolean;
  sidebarVisible: boolean;
  
  // 页面状态
  pageTitle: string;
  pageSubtitle?: string;
  
  // 搜索状态
  searchVisible: boolean;
  searchQuery: string;
  searchResults: any[];
  
  // 用户偏好设置
  preferences: {
    autoSave: boolean;
    autoSaveInterval: number;
    showLineNumbers: boolean;
    showMinimap: boolean;
    fontSize: number;
    tabSize: number;
    wordWrap: boolean;
    showWhitespace: boolean;
    showIndentGuides: boolean;
    notifications: {
      email: boolean;
      push: boolean;
      sound: boolean;
    };
    shortcuts: Record<string, string>;
  };
  
  // 响应式断点
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // 性能监控
  performance: {
    pageLoadTime: number;
    apiResponseTimes: Record<string, number>;
    memoryUsage?: number;
  };
}

// 初始状态
const initialState: UIState = {
  theme: (localStorage.getItem('theme') as Theme) || 'auto',
  language: (localStorage.getItem('language') as Language) || 'zh-CN',
  layoutMode: (localStorage.getItem('layoutMode') as LayoutMode) || 'full',
  
  breadcrumbs: [],
  
  globalLoading: false,
  loadingTasks: [],
  
  notifications: [],
  notificationCount: 0,
  
  modals: {
    settings: false,
    about: false,
    shortcuts: false,
    feedback: false,
  },
  
  drawers: {
    notifications: false,
    help: false,
    search: false,
  },
  
  sidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
  sidebarVisible: true,
  
  pageTitle: 'CloudDev Platform',
  pageSubtitle: undefined,
  
  searchVisible: false,
  searchQuery: '',
  searchResults: [],
  
  preferences: {
    autoSave: JSON.parse(localStorage.getItem('autoSave') || 'true'),
    autoSaveInterval: parseInt(localStorage.getItem('autoSaveInterval') || '30'),
    showLineNumbers: JSON.parse(localStorage.getItem('showLineNumbers') || 'true'),
    showMinimap: JSON.parse(localStorage.getItem('showMinimap') || 'true'),
    fontSize: parseInt(localStorage.getItem('fontSize') || '14'),
    tabSize: parseInt(localStorage.getItem('tabSize') || '2'),
    wordWrap: JSON.parse(localStorage.getItem('wordWrap') || 'true'),
    showWhitespace: JSON.parse(localStorage.getItem('showWhitespace') || 'false'),
    showIndentGuides: JSON.parse(localStorage.getItem('showIndentGuides') || 'true'),
    notifications: {
      email: JSON.parse(localStorage.getItem('emailNotifications') || 'true'),
      push: JSON.parse(localStorage.getItem('pushNotifications') || 'true'),
      sound: JSON.parse(localStorage.getItem('soundNotifications') || 'false'),
    },
    shortcuts: JSON.parse(localStorage.getItem('shortcuts') || '{}'),
  },
  
  breakpoint: 'lg',
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  
  performance: {
    pageLoadTime: 0,
    apiResponseTimes: {},
  },
};

// 创建slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // 主题设置
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    
    // 语言设置
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
      localStorage.setItem('language', action.payload);
    },
    
    // 布局模式设置
    setLayoutMode: (state, action: PayloadAction<LayoutMode>) => {
      state.layoutMode = action.payload;
      localStorage.setItem('layoutMode', action.payload);
    },
    
    // 设置面包屑
    setBreadcrumbs: (state, action: PayloadAction<BreadcrumbItem[]>) => {
      state.breadcrumbs = action.payload;
    },
    
    // 添加面包屑项
    addBreadcrumb: (state, action: PayloadAction<BreadcrumbItem>) => {
      const exists = state.breadcrumbs.find(item => item.key === action.payload.key);
      if (!exists) {
        state.breadcrumbs.push(action.payload);
      }
    },
    
    // 移除面包屑项
    removeBreadcrumb: (state, action: PayloadAction<string>) => {
      state.breadcrumbs = state.breadcrumbs.filter(item => item.key !== action.payload);
    },
    
    // 全局加载状态
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    
    // 添加加载任务
    addLoadingTask: (state, action: PayloadAction<string>) => {
      if (!state.loadingTasks.includes(action.payload)) {
        state.loadingTasks.push(action.payload);
      }
    },
    
    // 移除加载任务
    removeLoadingTask: (state, action: PayloadAction<string>) => {
      state.loadingTasks = state.loadingTasks.filter(task => task !== action.payload);
    },
    
    // 清除所有加载任务
    clearLoadingTasks: (state) => {
      state.loadingTasks = [];
    },
    
    // 添加通知
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        read: false,
      };
      state.notifications.unshift(notification);
      state.notificationCount = state.notifications.filter(n => !n.read).length;
    },
    
    // 标记通知为已读
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.notificationCount = state.notifications.filter(n => !n.read).length;
      }
    },
    
    // 标记所有通知为已读
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.notificationCount = 0;
    },
    
    // 删除通知
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
      state.notificationCount = state.notifications.filter(n => !n.read).length;
    },
    
    // 清除所有通知
    clearNotifications: (state) => {
      state.notifications = [];
      state.notificationCount = 0;
    },
    
    // 打开模态框
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true;
    },
    
    // 关闭模态框
    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false;
    },
    
    // 关闭所有模态框
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key as keyof UIState['modals']] = false;
      });
    },
    
    // 打开抽屉
    openDrawer: (state, action: PayloadAction<keyof UIState['drawers']>) => {
      state.drawers[action.payload] = true;
    },
    
    // 关闭抽屉
    closeDrawer: (state, action: PayloadAction<keyof UIState['drawers']>) => {
      state.drawers[action.payload] = false;
    },
    
    // 关闭所有抽屉
    closeAllDrawers: (state) => {
      Object.keys(state.drawers).forEach(key => {
        state.drawers[key as keyof UIState['drawers']] = false;
      });
    },
    
    // 切换侧边栏
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      localStorage.setItem('sidebarCollapsed', state.sidebarCollapsed.toString());
    },
    
    // 设置侧边栏状态
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
      localStorage.setItem('sidebarCollapsed', action.payload.toString());
    },
    
    // 设置侧边栏可见性
    setSidebarVisible: (state, action: PayloadAction<boolean>) => {
      state.sidebarVisible = action.payload;
    },
    
    // 设置页面标题
    setPageTitle: (state, action: PayloadAction<string>) => {
      state.pageTitle = action.payload;
      document.title = action.payload;
    },
    
    // 设置页面副标题
    setPageSubtitle: (state, action: PayloadAction<string | undefined>) => {
      state.pageSubtitle = action.payload;
    },
    
    // 设置搜索可见性
    setSearchVisible: (state, action: PayloadAction<boolean>) => {
      state.searchVisible = action.payload;
      if (!action.payload) {
        state.searchQuery = '';
        state.searchResults = [];
      }
    },
    
    // 设置搜索查询
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    // 设置搜索结果
    setSearchResults: (state, action: PayloadAction<any[]>) => {
      state.searchResults = action.payload;
    },
    
    // 更新用户偏好设置
    updatePreferences: (state, action: PayloadAction<Partial<UIState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
      
      // 同步到localStorage
      Object.entries(action.payload).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          localStorage.setItem(key, JSON.stringify(value));
        } else {
          localStorage.setItem(key, String(value));
        }
      });
    },
    
    // 设置响应式断点
    setBreakpoint: (state, action: PayloadAction<UIState['breakpoint']>) => {
      state.breakpoint = action.payload;
      state.isMobile = ['xs', 'sm'].includes(action.payload);
      state.isTablet = action.payload === 'md';
      state.isDesktop = ['lg', 'xl', 'xxl'].includes(action.payload);
    },
    
    // 更新性能数据
    updatePerformance: (state, action: PayloadAction<Partial<UIState['performance']>>) => {
      state.performance = { ...state.performance, ...action.payload };
    },
    
    // 记录API响应时间
    recordAPIResponseTime: (state, action: PayloadAction<{ endpoint: string; time: number }>) => {
      state.performance.apiResponseTimes[action.payload.endpoint] = action.payload.time;
    },
  },
});

// 导出actions
export const {
  setTheme,
  setLanguage,
  setLayoutMode,
  setBreadcrumbs,
  addBreadcrumb,
  removeBreadcrumb,
  setGlobalLoading,
  addLoadingTask,
  removeLoadingTask,
  clearLoadingTasks,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearNotifications,
  openModal,
  closeModal,
  closeAllModals,
  openDrawer,
  closeDrawer,
  closeAllDrawers,
  toggleSidebar,
  setSidebarCollapsed,
  setSidebarVisible,
  setPageTitle,
  setPageSubtitle,
  setSearchVisible,
  setSearchQuery,
  setSearchResults,
  updatePreferences,
  setBreakpoint,
  updatePerformance,
  recordAPIResponseTime,
} = uiSlice.actions;

// 选择器
export const selectUI = (state: { ui: UIState }) => state.ui;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectLanguage = (state: { ui: UIState }) => state.ui.language;
export const selectLayoutMode = (state: { ui: UIState }) => state.ui.layoutMode;
export const selectBreadcrumbs = (state: { ui: UIState }) => state.ui.breadcrumbs;
export const selectGlobalLoading = (state: { ui: UIState }) => state.ui.globalLoading;
export const selectLoadingTasks = (state: { ui: UIState }) => state.ui.loadingTasks;
export const selectNotifications = (state: { ui: UIState }) => state.ui.notifications;
export const selectNotificationCount = (state: { ui: UIState }) => state.ui.notificationCount;
export const selectModals = (state: { ui: UIState }) => state.ui.modals;
export const selectDrawers = (state: { ui: UIState }) => state.ui.drawers;
export const selectSidebarCollapsed = (state: { ui: UIState }) => state.ui.sidebarCollapsed;
export const selectSidebarVisible = (state: { ui: UIState }) => state.ui.sidebarVisible;
export const selectPageTitle = (state: { ui: UIState }) => state.ui.pageTitle;
export const selectPageSubtitle = (state: { ui: UIState }) => state.ui.pageSubtitle;
export const selectPreferences = (state: { ui: UIState }) => state.ui.preferences;
export const selectBreakpoint = (state: { ui: UIState }) => state.ui.breakpoint;
export const selectIsMobile = (state: { ui: UIState }) => state.ui.isMobile;
export const selectIsTablet = (state: { ui: UIState }) => state.ui.isTablet;
export const selectIsDesktop = (state: { ui: UIState }) => state.ui.isDesktop;
export const selectPerformance = (state: { ui: UIState }) => state.ui.performance;

// 复合选择器
export const selectUnreadNotifications = (state: { ui: UIState }) => {
  return state.ui.notifications.filter(notification => !notification.read);
};

export const selectIsLoading = (taskName?: string) => (state: { ui: UIState }) => {
  if (taskName) {
    return state.ui.loadingTasks.includes(taskName);
  }
  return state.ui.globalLoading || state.ui.loadingTasks.length > 0;
};

// 导出reducer
export default uiSlice.reducer;