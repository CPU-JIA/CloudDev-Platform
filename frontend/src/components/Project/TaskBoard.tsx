import React, { useState, useCallback } from 'react';
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Avatar,
  Tag,
  Typography,
  Space,
  Dropdown,
  Progress,
  List,
  Tooltip,
  message,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  UserOutlined,
  CalendarOutlined,
  FlagOutlined,
  MessageOutlined,
  PaperClipOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const { TextArea } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'high' | 'medium' | 'low';
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  reporter: {
    id: string;
    name: string;
    avatar?: string;
  };
  labels: string[];
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  attachments: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
}

interface TaskColumn {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  limit?: number;
}

interface TaskBoardProps {
  projectId: string;
}

/**
 * 任务看板组件
 * 支持拖拽的敏捷开发任务管理
 */
const TaskBoard: React.FC<TaskBoardProps> = ({ projectId }) => {
  const [form] = Form.useForm();
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailVisible, setIsTaskDetailVisible] = useState(false);

  // 模拟数据
  const [columns, setColumns] = useState<TaskColumn[]>([
    {
      id: 'todo',
      title: '待办事项',
      color: '#d9d9d9',
      tasks: [
        {
          id: 'task-1',
          title: '设计用户注册流程',
          description: '设计完整的用户注册和验证流程，包括邮箱验证和手机验证',
          status: 'todo',
          priority: 'high',
          assignee: {
            id: '1',
            name: 'Alice Chen',
            avatar: 'https://via.placeholder.com/32/FF6B6B/ffffff?text=AC',
          },
          reporter: {
            id: '2',
            name: 'John Doe',
            avatar: 'https://via.placeholder.com/32/4ECDC4/ffffff?text=JD',
          },
          labels: ['UI/UX', 'Frontend'],
          dueDate: '2024-01-25',
          estimatedHours: 8,
          attachments: 2,
          comments: 3,
          createdAt: '2024-01-15',
          updatedAt: '2024-01-16',
        },
        {
          id: 'task-2',
          title: '实现文件上传功能',
          description: '支持多文件上传，包括进度显示和错误处理',
          status: 'todo',
          priority: 'medium',
          assignee: {
            id: '2',
            name: 'Bob Wilson',
            avatar: 'https://via.placeholder.com/32/45B7D1/ffffff?text=BW',
          },
          reporter: {
            id: '1',
            name: 'Jane Smith',
            avatar: 'https://via.placeholder.com/32/96CEB4/ffffff?text=JS',
          },
          labels: ['Backend', 'API'],
          dueDate: '2024-01-30',
          estimatedHours: 12,
          attachments: 0,
          comments: 1,
          createdAt: '2024-01-14',
          updatedAt: '2024-01-16',
        },
      ],
    },
    {
      id: 'in_progress',
      title: '进行中',
      color: '#1890ff',
      tasks: [
        {
          id: 'task-3',
          title: '优化数据库查询性能',
          description: '分析慢查询并进行索引优化',
          status: 'in_progress',
          priority: 'high',
          assignee: {
            id: '3',
            name: 'Charlie Davis',
            avatar: 'https://via.placeholder.com/32/FECA57/ffffff?text=CD',
          },
          reporter: {
            id: '1',
            name: 'Jane Smith',
            avatar: 'https://via.placeholder.com/32/96CEB4/ffffff?text=JS',
          },
          labels: ['Backend', 'Performance'],
          dueDate: '2024-01-22',
          estimatedHours: 16,
          actualHours: 8,
          attachments: 1,
          comments: 5,
          createdAt: '2024-01-10',
          updatedAt: '2024-01-16',
        },
      ],
      limit: 3,
    },
    {
      id: 'review',
      title: '代码审查',
      color: '#faad14',
      tasks: [
        {
          id: 'task-4',
          title: '用户权限管理模块',
          description: '实现基于角色的访问控制(RBAC)',
          status: 'review',
          priority: 'high',
          assignee: {
            id: '4',
            name: 'Diana Lee',
            avatar: 'https://via.placeholder.com/32/FF9FF3/ffffff?text=DL',
          },
          reporter: {
            id: '2',
            name: 'John Doe',
            avatar: 'https://via.placeholder.com/32/4ECDC4/ffffff?text=JD',
          },
          labels: ['Backend', 'Security'],
          dueDate: '2024-01-20',
          estimatedHours: 20,
          actualHours: 18,
          attachments: 3,
          comments: 8,
          createdAt: '2024-01-08',
          updatedAt: '2024-01-16',
        },
      ],
      limit: 2,
    },
    {
      id: 'done',
      title: '已完成',
      color: '#52c41a',
      tasks: [
        {
          id: 'task-5',
          title: '搭建CI/CD流水线',
          description: '配置自动化构建、测试和部署流程',
          status: 'done',
          priority: 'medium',
          assignee: {
            id: '5',
            name: 'Eve Foster',
            avatar: 'https://via.placeholder.com/32/54A0FF/ffffff?text=EF',
          },
          reporter: {
            id: '1',
            name: 'Jane Smith',
            avatar: 'https://via.placeholder.com/32/96CEB4/ffffff?text=JS',
          },
          labels: ['DevOps', 'Infrastructure'],
          dueDate: '2024-01-15',
          estimatedHours: 24,
          actualHours: 22,
          attachments: 4,
          comments: 12,
          createdAt: '2024-01-05',
          updatedAt: '2024-01-15',
        },
        {
          id: 'task-6',
          title: 'API文档编写',
          description: '编写完整的RESTful API文档',
          status: 'done',
          priority: 'low',
          assignee: {
            id: '6',
            name: 'Frank Miller',
            avatar: 'https://via.placeholder.com/32/5F27CD/ffffff?text=FM',
          },
          reporter: {
            id: '3',
            name: 'Charlie Davis',
            avatar: 'https://via.placeholder.com/32/FECA57/ffffff?text=CD',
          },
          labels: ['Documentation'],
          dueDate: '2024-01-12',
          estimatedHours: 6,
          actualHours: 5,
          attachments: 1,
          comments: 2,
          createdAt: '2024-01-08',
          updatedAt: '2024-01-12',
        },
      ],
    },
  ]);

  /**
   * 获取优先级颜色
   */
  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  }, []);

  /**
   * 处理拖拽结束
   */
  const handleDragEnd = useCallback((result: any) => {
    const { destination, source, draggableId } = result;

    // 没有有效的拖拽目标
    if (!destination) {
      return;
    }

    // 拖拽到相同位置
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const newColumns = [...columns];
    const sourceColumn = newColumns.find(col => col.id === source.droppableId);
    const destColumn = newColumns.find(col => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) {
      return;
    }

    // 检查目标列的限制
    if (destColumn.limit && destination.droppableId !== source.droppableId && 
        destColumn.tasks.length >= destColumn.limit) {
      message.warning(`${destColumn.title}列最多只能容纳${destColumn.limit}个任务`);
      return;
    }

    // 移动任务
    const task = sourceColumn.tasks.find(t => t.id === draggableId);
    if (!task) {
      return;
    }

    // 从源列移除
    sourceColumn.tasks = sourceColumn.tasks.filter(t => t.id !== draggableId);

    // 更新任务状态
    task.status = destination.droppableId as any;

    // 添加到目标列
    destColumn.tasks.splice(destination.index, 0, task);

    setColumns(newColumns);
    message.success('任务状态已更新');
  }, [columns]);

  /**
   * 创建任务
   */
  const handleCreateTask = useCallback(async () => {
    try {
      const values = await form.validateFields();
      
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: values.title,
        description: values.description,
        status: values.status || 'todo',
        priority: values.priority,
        assignee: values.assignee ? {
          id: values.assignee,
          name: 'New User',
        } : undefined,
        reporter: {
          id: 'current-user',
          name: 'Current User',
        },
        labels: values.labels || [],
        dueDate: values.dueDate?.format('YYYY-MM-DD'),
        estimatedHours: values.estimatedHours,
        attachments: 0,
        comments: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newColumns = [...columns];
      const targetColumn = newColumns.find(col => col.id === newTask.status);
      if (targetColumn) {
        targetColumn.tasks.unshift(newTask);
        setColumns(newColumns);
      }

      setIsTaskModalVisible(false);
      form.resetFields();
      message.success('任务创建成功');
    } catch (error) {
      console.error('任务创建失败:', error);
    }
  }, [columns, form]);

  /**
   * 编辑任务
   */
  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    form.setFieldsValue({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee?.id,
      labels: task.labels,
      estimatedHours: task.estimatedHours,
    });
    setIsTaskModalVisible(true);
  }, [form]);

  /**
   * 删除任务
   */
  const handleDeleteTask = useCallback((taskId: string) => {
    Modal.confirm({
      title: '确认删除任务？',
      content: '删除后无法恢复，确定要删除这个任务吗？',
      onOk: () => {
        const newColumns = columns.map(column => ({
          ...column,
          tasks: column.tasks.filter(task => task.id !== taskId),
        }));
        setColumns(newColumns);
        message.success('任务已删除');
      },
    });
  }, [columns]);

  /**
   * 查看任务详情
   */
  const handleViewTask = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailVisible(true);
  }, []);

  /**
   * 获取任务菜单
   */
  const getTaskMenu = useCallback((task: Task) => ({
    items: [
      {
        key: 'view',
        label: '查看详情',
        icon: <EyeOutlined />,
      },
      {
        key: 'edit',
        label: '编辑',
        icon: <EditOutlined />,
      },
      { type: 'divider' as const },
      {
        key: 'delete',
        label: '删除',
        icon: <DeleteOutlined />,
        danger: true,
      },
    ],
    onClick: ({ key }: { key: string }) => {
      switch (key) {
        case 'view':
          handleViewTask(task);
          break;
        case 'edit':
          handleEditTask(task);
          break;
        case 'delete':
          handleDeleteTask(task.id);
          break;
      }
    },
  }), [handleViewTask, handleEditTask, handleDeleteTask]);

  /**
   * 渲染任务卡片
   */
  const renderTaskCard = useCallback((task: Task, index: number) => (
    <Draggable key={task.id} draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-3 ${snapshot.isDragging ? 'opacity-75' : ''}`}
        >
          <Card 
            size="small" 
            className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            bodyStyle={{ padding: '12px' }}
          >
            <div className="space-y-2">
              {/* 任务标题和菜单 */}
              <div className="flex items-start justify-between">
                <Text strong className="text-sm line-clamp-2 flex-1">
                  {task.title}
                </Text>
                <Dropdown menu={getTaskMenu(task)} trigger={['click']}>
                  <Button 
                    type="text" 
                    size="small" 
                    icon={<MoreOutlined />}
                    className="ml-2 opacity-0 group-hover:opacity-100"
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>
              </div>

              {/* 任务描述 */}
              {task.description && (
                <Text type="secondary" className="text-xs line-clamp-2">
                  {task.description}
                </Text>
              )}

              {/* 标签 */}
              {task.labels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {task.labels.map(label => (
                    <Tag key={label} size="small" className="text-xs">
                      {label}
                    </Tag>
                  ))}
                </div>
              )}

              {/* 底部信息 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Tag color={getPriorityColor(task.priority)} size="small">
                    <FlagOutlined className="mr-1" />
                    {task.priority}
                  </Tag>
                  
                  {task.estimatedHours && (
                    <Tooltip title={`预估 ${task.estimatedHours}h${task.actualHours ? ` / 实际 ${task.actualHours}h` : ''}`}>
                      <Text type="secondary" className="text-xs">
                        {task.actualHours ? `${task.actualHours}/${task.estimatedHours}h` : `${task.estimatedHours}h`}
                      </Text>
                    </Tooltip>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  {task.attachments > 0 && (
                    <Badge count={task.attachments} size="small">
                      <PaperClipOutlined className="text-gray-400" />
                    </Badge>
                  )}
                  
                  {task.comments > 0 && (
                    <Badge count={task.comments} size="small">
                      <MessageOutlined className="text-gray-400" />
                    </Badge>
                  )}

                  {task.assignee && (
                    <Tooltip title={task.assignee.name}>
                      <Avatar 
                        size={20} 
                        src={task.assignee.avatar}
                        icon={<UserOutlined />}
                      />
                    </Tooltip>
                  )}
                </div>
              </div>

              {/* 截止日期 */}
              {task.dueDate && (
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 text-gray-500">
                    <CalendarOutlined />
                    <span>{task.dueDate}</span>
                  </div>
                  
                  {task.actualHours && task.estimatedHours && (
                    <Progress 
                      percent={Math.round((task.actualHours / task.estimatedHours) * 100)}
                      size="small"
                      showInfo={false}
                      className="flex-1 ml-2"
                    />
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </Draggable>
  ), [getPriorityColor, getTaskMenu]);

  /**
   * 渲染列
   */
  const renderColumn = useCallback((column: TaskColumn) => (
    <div key={column.id} className="flex-1 min-w-80 mx-2">
      <Card 
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              <span>{column.title}</span>
              <Badge count={column.tasks.length} />
              {column.limit && (
                <Text type="secondary" className="text-xs">
                  (最多{column.limit}个)
                </Text>
              )}
            </div>
          </div>
        }
        size="small"
        className="h-full"
        bodyStyle={{ padding: '8px', height: 'calc(100vh - 200px)', overflowY: 'auto' }}
      >
        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-full ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
            >
              {column.tasks.map((task, index) => renderTaskCard(task, index))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </Card>
    </div>
  ), [renderTaskCard]);

  return (
    <div className="space-y-4">
      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <Title level={4} className="mb-0">任务看板</Title>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTask(null);
              form.resetFields();
              setIsTaskModalVisible(true);
            }}
          >
            创建任务
          </Button>
        </Space>
      </div>

      {/* 看板主体 */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {columns.map(renderColumn)}
        </div>
      </DragDropContext>

      {/* 创建/编辑任务模态框 */}
      <Modal
        title={editingTask ? '编辑任务' : '创建任务'}
        open={isTaskModalVisible}
        onOk={handleCreateTask}
        onCancel={() => setIsTaskModalVisible(false)}
        okText={editingTask ? '保存' : '创建'}
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="任务标题"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="请输入任务标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="任务描述"
          >
            <TextArea rows={3} placeholder="请输入任务描述" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select placeholder="选择状态">
                <Option value="todo">待办事项</Option>
                <Option value="in_progress">进行中</Option>
                <Option value="review">代码审查</Option>
                <Option value="done">已完成</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="priority"
              label="优先级"
              rules={[{ required: true, message: '请选择优先级' }]}
            >
              <Select placeholder="选择优先级">
                <Option value="high">高</Option>
                <Option value="medium">中</Option>
                <Option value="low">低</Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="assignee"
              label="负责人"
            >
              <Select placeholder="选择负责人" allowClear>
                <Option value="1">Alice Chen</Option>
                <Option value="2">Bob Wilson</Option>
                <Option value="3">Charlie Davis</Option>
                <Option value="4">Diana Lee</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="estimatedHours"
              label="预估工时(小时)"
            >
              <Input type="number" placeholder="预估工时" />
            </Form.Item>
          </div>

          <Form.Item
            name="labels"
            label="标签"
          >
            <Select mode="tags" placeholder="添加标签">
              <Option value="Frontend">Frontend</Option>
              <Option value="Backend">Backend</Option>
              <Option value="UI/UX">UI/UX</Option>
              <Option value="API">API</Option>
              <Option value="Bug">Bug</Option>
              <Option value="Feature">Feature</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="截止日期"
          >
            <DatePicker className="w-full" placeholder="选择截止日期" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 任务详情模态框 */}
      <Modal
        title="任务详情"
        open={isTaskDetailVisible}
        onCancel={() => setIsTaskDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsTaskDetailVisible(false)}>
            关闭
          </Button>,
          <Button key="edit" type="primary" onClick={() => {
            if (selectedTask) {
              setIsTaskDetailVisible(false);
              handleEditTask(selectedTask);
            }
          }}>
            编辑
          </Button>,
        ]}
        width={800}
      >
        {selectedTask && (
          <div className="space-y-4">
            <div>
              <Title level={4}>{selectedTask.title}</Title>
              <Text type="secondary">{selectedTask.description}</Text>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text strong>状态: </Text>
                <Tag color={selectedTask.status === 'done' ? 'green' : 'blue'}>
                  {selectedTask.status}
                </Tag>
              </div>
              <div>
                <Text strong>优先级: </Text>
                <Tag color={getPriorityColor(selectedTask.priority)}>
                  {selectedTask.priority}
                </Tag>
              </div>
            </div>

            {selectedTask.assignee && (
              <div className="flex items-center space-x-2">
                <Text strong>负责人: </Text>
                <Avatar 
                  size={24} 
                  src={selectedTask.assignee.avatar}
                  icon={<UserOutlined />}
                />
                <span>{selectedTask.assignee.name}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Text strong>标签: </Text>
              {selectedTask.labels.map(label => (
                <Tag key={label}>{label}</Tag>
              ))}
            </div>

            {selectedTask.estimatedHours && (
              <div>
                <Text strong>工时: </Text>
                <span>
                  预估 {selectedTask.estimatedHours}h
                  {selectedTask.actualHours && ` / 实际 ${selectedTask.actualHours}h`}
                </span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TaskBoard;