import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 文件接口
export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: string;
  children?: FileNode[];
  isExpanded?: boolean;
}

// 编辑器标签页接口
export interface EditorTab {
  id: string;
  filePath: string;
  fileName: string;
  content: string;
  language: string;
  isDirty: boolean;
  isActive: boolean;
}

// 工作空间接口
export interface Workspace {
  id: string;
  name: string;
  projectId: string;
  status: 'active' | 'inactive' | 'creating' | 'deleting';
  environment: {
    type: string;
    image: string;
    cpu: string;
    memory: string;
  };
  createdAt: string;
  updatedAt: string;
}

// IDE状态接口
export interface IDEState {
  workspace: Workspace | null;
  fileTree: FileNode | null;
  openTabs: EditorTab[];
  activeTabId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // 终端相关
  terminals: Array<{
    id: string;
    title: string;
    isActive: boolean;
  }>;
  activeTerminalId: string | null;
  
  // 侧边栏状态
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  
  // 编辑器设置
  editorSettings: {
    theme: 'vs-dark' | 'vs-light' | 'hc-black';
    fontSize: number;
    tabSize: number;
    wordWrap: boolean;
    minimap: boolean;
    lineNumbers: boolean;
    folding: boolean;
  };
  
  // 协作相关
  collaborators: Array<{
    userId: string;
    username: string;
    avatar?: string;
    cursor?: {
      line: number;
      column: number;
    };
    selection?: {
      startLine: number;
      startColumn: number;
      endLine: number;
      endColumn: number;
    };
  }>;
}

// 初始状态
const initialState: IDEState = {
  workspace: null,
  fileTree: null,
  openTabs: [],
  activeTabId: null,
  isLoading: false,
  error: null,
  
  terminals: [],
  activeTerminalId: null,
  
  sidebarCollapsed: false,
  sidebarWidth: 280,
  
  editorSettings: {
    theme: 'vs-dark',
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    minimap: true,
    lineNumbers: true,
    folding: true,
  },
  
  collaborators: [],
};

// 创建slice
const ideSlice = createSlice({
  name: 'ide',
  initialState,
  reducers: {
    // 设置工作空间
    setWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.workspace = action.payload;
    },
    
    // 设置文件树
    setFileTree: (state, action: PayloadAction<FileNode>) => {
      state.fileTree = action.payload;
    },
    
    // 打开文件
    openFile: (state, action: PayloadAction<EditorTab>) => {
      const existingTab = state.openTabs.find(tab => tab.filePath === action.payload.filePath);
      if (existingTab) {
        // 激活现有标签页
        state.openTabs.forEach(tab => {
          tab.isActive = tab.id === existingTab.id;
        });
        state.activeTabId = existingTab.id;
      } else {
        // 创建新标签页
        state.openTabs.forEach(tab => {
          tab.isActive = false;
        });
        state.openTabs.push({ ...action.payload, isActive: true });
        state.activeTabId = action.payload.id;
      }
    },
    
    // 关闭文件
    closeFile: (state, action: PayloadAction<string>) => {
      const tabIndex = state.openTabs.findIndex(tab => tab.id === action.payload);
      if (tabIndex !== -1) {
        const closingTab = state.openTabs[tabIndex];
        state.openTabs.splice(tabIndex, 1);
        
        // 如果关闭的是活跃标签页，激活相邻的标签页
        if (closingTab.isActive && state.openTabs.length > 0) {
          const newActiveIndex = Math.min(tabIndex, state.openTabs.length - 1);
          state.openTabs[newActiveIndex].isActive = true;
          state.activeTabId = state.openTabs[newActiveIndex].id;
        } else if (state.openTabs.length === 0) {
          state.activeTabId = null;
        }
      }
    },
    
    // 切换标签页
    switchTab: (state, action: PayloadAction<string>) => {
      state.openTabs.forEach(tab => {
        tab.isActive = tab.id === action.payload;
      });
      state.activeTabId = action.payload;
    },
    
    // 更新文件内容
    updateFileContent: (state, action: PayloadAction<{ tabId: string; content: string }>) => {
      const tab = state.openTabs.find(tab => tab.id === action.payload.tabId);
      if (tab) {
        tab.content = action.payload.content;
        tab.isDirty = true;
      }
    },
    
    // 保存文件
    saveFile: (state, action: PayloadAction<string>) => {
      const tab = state.openTabs.find(tab => tab.id === action.payload);
      if (tab) {
        tab.isDirty = false;
      }
    },
    
    // 创建终端
    createTerminal: (state, action: PayloadAction<{ id: string; title: string }>) => {
      state.terminals.forEach(terminal => {
        terminal.isActive = false;
      });
      state.terminals.push({ ...action.payload, isActive: true });
      state.activeTerminalId = action.payload.id;
    },
    
    // 关闭终端
    closeTerminal: (state, action: PayloadAction<string>) => {
      const terminalIndex = state.terminals.findIndex(terminal => terminal.id === action.payload);
      if (terminalIndex !== -1) {
        const closingTerminal = state.terminals[terminalIndex];
        state.terminals.splice(terminalIndex, 1);
        
        if (closingTerminal.isActive && state.terminals.length > 0) {
          const newActiveIndex = Math.min(terminalIndex, state.terminals.length - 1);
          state.terminals[newActiveIndex].isActive = true;
          state.activeTerminalId = state.terminals[newActiveIndex].id;
        } else if (state.terminals.length === 0) {
          state.activeTerminalId = null;
        }
      }
    },
    
    // 切换终端
    switchTerminal: (state, action: PayloadAction<string>) => {
      state.terminals.forEach(terminal => {
        terminal.isActive = terminal.id === action.payload;
      });
      state.activeTerminalId = action.payload;
    },
    
    // 切换侧边栏
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    
    // 设置侧边栏宽度
    setSidebarWidth: (state, action: PayloadAction<number>) => {
      state.sidebarWidth = action.payload;
    },
    
    // 更新编辑器设置
    updateEditorSettings: (state, action: PayloadAction<Partial<IDEState['editorSettings']>>) => {
      state.editorSettings = { ...state.editorSettings, ...action.payload };
    },
    
    // 更新协作者
    updateCollaborators: (state, action: PayloadAction<IDEState['collaborators']>) => {
      state.collaborators = action.payload;
    },
    
    // 更新协作者光标位置
    updateCollaboratorCursor: (state, action: PayloadAction<{
      userId: string;
      cursor: { line: number; column: number };
    }>) => {
      const collaborator = state.collaborators.find(c => c.userId === action.payload.userId);
      if (collaborator) {
        collaborator.cursor = action.payload.cursor;
      }
    },
    
    // 设置加载状态
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    // 设置错误
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
  },
});

// 导出actions
export const {
  setWorkspace,
  setFileTree,
  openFile,
  closeFile,
  switchTab,
  updateFileContent,
  saveFile,
  createTerminal,
  closeTerminal,
  switchTerminal,
  toggleSidebar,
  setSidebarWidth,
  updateEditorSettings,
  updateCollaborators,
  updateCollaboratorCursor,
  setLoading,
  setError,
  clearError,
} = ideSlice.actions;

// 选择器
export const selectIDE = (state: { ide: IDEState }) => state.ide;
export const selectWorkspace = (state: { ide: IDEState }) => state.ide.workspace;
export const selectFileTree = (state: { ide: IDEState }) => state.ide.fileTree;
export const selectOpenTabs = (state: { ide: IDEState }) => state.ide.openTabs;
export const selectActiveTab = (state: { ide: IDEState }) => 
  state.ide.openTabs.find(tab => tab.isActive);
export const selectTerminals = (state: { ide: IDEState }) => state.ide.terminals;
export const selectActiveTerminal = (state: { ide: IDEState }) => 
  state.ide.terminals.find(terminal => terminal.isActive);
export const selectEditorSettings = (state: { ide: IDEState }) => state.ide.editorSettings;
export const selectCollaborators = (state: { ide: IDEState }) => state.ide.collaborators;

// 导出reducer
export default ideSlice.reducer;