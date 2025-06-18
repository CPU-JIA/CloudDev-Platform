import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 项目接口
export interface Project {
  id: string;
  name: string;
  description?: string;
  repositoryUrl?: string;
  status: 'active' | 'archived' | 'deleted';
  visibility: 'public' | 'private' | 'internal';
  ownerId: string;
  ownerName: string;
  members: ProjectMember[];
  tags: string[];
  language: string;
  framework?: string;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
  statistics: {
    commitsCount: number;
    contributorsCount: number;
    linesOfCode: number;
    filesCount: number;
  };
}

// 项目成员接口
export interface ProjectMember {
  userId: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  joinedAt: string;
  lastActiveAt?: string;
  permissions: string[];
}

// 任务接口
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'feature' | 'bug' | 'enhancement' | 'documentation' | 'test';
  assigneeId?: string;
  assigneeName?: string;
  reporterId: string;
  reporterName: string;
  projectId: string;
  sprintId?: string;
  labels: string[];
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Sprint接口
export interface Sprint {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  goals: string[];
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
}

// 项目状态接口
export interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  tasks: Task[];
  sprints: Sprint[];
  currentSprint: Sprint | null;
  
  // 分页信息
  pagination: {
    page: number;
    size: number;
    total: number;
  };
  
  // 筛选和排序
  filters: {
    status?: string[];
    visibility?: string[];
    language?: string[];
    owner?: string;
    search?: string;
  };
  sorting: {
    field: string;
    order: 'asc' | 'desc';
  };
  
  // 加载状态
  isLoading: boolean;
  error: string | null;
  
  // 模态框状态
  modals: {
    createProject: boolean;
    editProject: boolean;
    createTask: boolean;
    editTask: boolean;
    createSprint: boolean;
    editSprint: boolean;
    projectSettings: boolean;
    memberManagement: boolean;
  };
}

// 初始状态
const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  tasks: [],
  sprints: [],
  currentSprint: null,
  
  pagination: {
    page: 1,
    size: 10,
    total: 0,
  },
  
  filters: {},
  sorting: {
    field: 'updatedAt',
    order: 'desc',
  },
  
  isLoading: false,
  error: null,
  
  modals: {
    createProject: false,
    editProject: false,
    createTask: false,
    editTask: false,
    createSprint: false,
    editSprint: false,
    projectSettings: false,
    memberManagement: false,
  },
};

// 创建slice
const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    // 设置项目列表
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
    
    // 添加项目
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.unshift(action.payload);
      state.pagination.total += 1;
    },
    
    // 更新项目
    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
      if (state.currentProject?.id === action.payload.id) {
        state.currentProject = action.payload;
      }
    },
    
    // 删除项目
    removeProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter(p => p.id !== action.payload);
      state.pagination.total -= 1;
      if (state.currentProject?.id === action.payload) {
        state.currentProject = null;
      }
    },
    
    // 设置当前项目
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
    },
    
    // 设置任务列表
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    
    // 添加任务
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.unshift(action.payload);
    },
    
    // 更新任务
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      
      // 同步更新Sprint中的任务
      state.sprints.forEach(sprint => {
        const taskIndex = sprint.tasks.findIndex(t => t.id === action.payload.id);
        if (taskIndex !== -1) {
          sprint.tasks[taskIndex] = action.payload;
        }
      });
    },
    
    // 删除任务
    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
      
      // 同步删除Sprint中的任务
      state.sprints.forEach(sprint => {
        sprint.tasks = sprint.tasks.filter(t => t.id !== action.payload);
      });
    },
    
    // 设置Sprint列表
    setSprints: (state, action: PayloadAction<Sprint[]>) => {
      state.sprints = action.payload;
    },
    
    // 添加Sprint
    addSprint: (state, action: PayloadAction<Sprint>) => {
      state.sprints.unshift(action.payload);
    },
    
    // 更新Sprint
    updateSprint: (state, action: PayloadAction<Sprint>) => {
      const index = state.sprints.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.sprints[index] = action.payload;
      }
      if (state.currentSprint?.id === action.payload.id) {
        state.currentSprint = action.payload;
      }
    },
    
    // 删除Sprint
    removeSprint: (state, action: PayloadAction<string>) => {
      state.sprints = state.sprints.filter(s => s.id !== action.payload);
      if (state.currentSprint?.id === action.payload) {
        state.currentSprint = null;
      }
    },
    
    // 设置当前Sprint
    setCurrentSprint: (state, action: PayloadAction<Sprint | null>) => {
      state.currentSprint = action.payload;
    },
    
    // 设置分页信息
    setPagination: (state, action: PayloadAction<Partial<ProjectState['pagination']>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    // 设置筛选条件
    setFilters: (state, action: PayloadAction<Partial<ProjectState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    // 清除筛选条件
    clearFilters: (state) => {
      state.filters = {};
    },
    
    // 设置排序
    setSorting: (state, action: PayloadAction<ProjectState['sorting']>) => {
      state.sorting = action.payload;
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
    
    // 打开模态框
    openModal: (state, action: PayloadAction<keyof ProjectState['modals']>) => {
      state.modals[action.payload] = true;
    },
    
    // 关闭模态框
    closeModal: (state, action: PayloadAction<keyof ProjectState['modals']>) => {
      state.modals[action.payload] = false;
    },
    
    // 关闭所有模态框
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach(key => {
        state.modals[key as keyof ProjectState['modals']] = false;
      });
    },
    
    // 更新项目成员
    updateProjectMember: (state, action: PayloadAction<{
      projectId: string;
      member: ProjectMember;
    }>) => {
      const project = state.projects.find(p => p.id === action.payload.projectId);
      if (project) {
        const memberIndex = project.members.findIndex(m => m.userId === action.payload.member.userId);
        if (memberIndex !== -1) {
          project.members[memberIndex] = action.payload.member;
        } else {
          project.members.push(action.payload.member);
        }
      }
      
      if (state.currentProject?.id === action.payload.projectId) {
        const memberIndex = state.currentProject.members.findIndex(m => m.userId === action.payload.member.userId);
        if (memberIndex !== -1) {
          state.currentProject.members[memberIndex] = action.payload.member;
        } else {
          state.currentProject.members.push(action.payload.member);
        }
      }
    },
    
    // 移除项目成员
    removeProjectMember: (state, action: PayloadAction<{
      projectId: string;
      userId: string;
    }>) => {
      const project = state.projects.find(p => p.id === action.payload.projectId);
      if (project) {
        project.members = project.members.filter(m => m.userId !== action.payload.userId);
      }
      
      if (state.currentProject?.id === action.payload.projectId) {
        state.currentProject.members = state.currentProject.members.filter(
          m => m.userId !== action.payload.userId
        );
      }
    },
  },
});

// 导出actions
export const {
  setProjects,
  addProject,
  updateProject,
  removeProject,
  setCurrentProject,
  setTasks,
  addTask,
  updateTask,
  removeTask,
  setSprints,
  addSprint,
  updateSprint,
  removeSprint,
  setCurrentSprint,
  setPagination,
  setFilters,
  clearFilters,
  setSorting,
  setLoading,
  setError,
  clearError,
  openModal,
  closeModal,
  closeAllModals,
  updateProjectMember,
  removeProjectMember,
} = projectSlice.actions;

// 选择器
export const selectProject = (state: { project: ProjectState }) => state.project;
export const selectProjects = (state: { project: ProjectState }) => state.project.projects;
export const selectCurrentProject = (state: { project: ProjectState }) => state.project.currentProject;
export const selectTasks = (state: { project: ProjectState }) => state.project.tasks;
export const selectSprints = (state: { project: ProjectState }) => state.project.sprints;
export const selectCurrentSprint = (state: { project: ProjectState }) => state.project.currentSprint;
export const selectPagination = (state: { project: ProjectState }) => state.project.pagination;
export const selectFilters = (state: { project: ProjectState }) => state.project.filters;
export const selectSorting = (state: { project: ProjectState }) => state.project.sorting;
export const selectModals = (state: { project: ProjectState }) => state.project.modals;

// 复合选择器
export const selectFilteredProjects = (state: { project: ProjectState }) => {
  const { projects, filters } = state.project;
  
  return projects.filter(project => {
    if (filters.status && filters.status.length > 0 && !filters.status.includes(project.status)) {
      return false;
    }
    if (filters.visibility && filters.visibility.length > 0 && !filters.visibility.includes(project.visibility)) {
      return false;
    }
    if (filters.language && filters.language.length > 0 && !filters.language.includes(project.language)) {
      return false;
    }
    if (filters.owner && project.ownerId !== filters.owner) {
      return false;
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      if (!project.name.toLowerCase().includes(searchTerm) && 
          !project.description?.toLowerCase().includes(searchTerm)) {
        return false;
      }
    }
    return true;
  });
};

export const selectTasksByStatus = (status: Task['status']) => (state: { project: ProjectState }) => {
  return state.project.tasks.filter(task => task.status === status);
};

export const selectTasksByAssignee = (assigneeId: string) => (state: { project: ProjectState }) => {
  return state.project.tasks.filter(task => task.assigneeId === assigneeId);
};

// 导出reducer
export default projectSlice.reducer;