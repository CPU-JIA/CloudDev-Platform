import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  List,
  Avatar,
  Button,
  Input,
  Badge,
  Typography,
  Tag,
  Tooltip,
  Space,
  Popover,
  Switch,
  message,
  Timeline,
  Comment,
} from 'antd';
import {
  UserOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  MessageOutlined,
  ShareAltOutlined,
  EyeOutlined,
  EditOutlined,
  SettingOutlined,
  SendOutlined,
  PhoneOutlined,
  TeamOutlined,
} from '@ant-design/icons';

import { selectCollaborators, updateCollaboratorCursor } from '../../store/slices/ideSlice';
import { selectUser } from '../../store/slices/authSlice';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface CollaborationMessage {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  message: string;
  timestamp: string;
  type: 'message' | 'system' | 'code_share';
  fileName?: string;
  lineNumber?: number;
}

interface ActiveUser {
  userId: string;
  username: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy';
  activity: 'editing' | 'viewing' | 'debugging' | 'idle';
  currentFile?: string;
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
  joinedAt: string;
  lastActiveAt: string;
}

/**
 * 协作面板组件
 * 提供实时协作功能
 */
const CollaborationPanel: React.FC = () => {
  const dispatch = useDispatch();
  const collaborators = useSelector(selectCollaborators);
  const currentUser = useSelector(selectUser);
  
  const [messages, setMessages] = useState<CollaborationMessage[]>([
    {
      id: '1',
      userId: '2',
      username: 'Jane Smith',
      message: '大家好！我刚加入这个协作会话。',
      timestamp: '14:30',
      type: 'message',
    },
    {
      id: '2',
      userId: 'system',
      username: 'System',
      message: 'Bob Wilson 加入了协作会话',
      timestamp: '14:32',
      type: 'system',
    },
    {
      id: '3',
      userId: '3',
      username: 'Bob Wilson',
      message: '我在 Header.tsx 的第45行发现了一个问题',
      timestamp: '14:35',
      type: 'code_share',
      fileName: 'Header.tsx',
      lineNumber: 45,
    },
  ]);
  
  const [activeUsers] = useState<ActiveUser[]>([
    {
      userId: '1',
      username: 'John Doe',
      status: 'online',
      activity: 'editing',
      currentFile: 'src/components/App.tsx',
      cursor: { line: 25, column: 12 },
      joinedAt: '14:00',
      lastActiveAt: '14:40',
    },
    {
      userId: '2',
      username: 'Jane Smith',
      avatar: 'https://via.placeholder.com/32/4CAF50/ffffff?text=JS',
      status: 'online',
      activity: 'viewing',
      currentFile: 'src/components/Header.tsx',
      cursor: { line: 45, column: 8 },
      joinedAt: '14:30',
      lastActiveAt: '14:39',
    },
    {
      userId: '3',
      username: 'Bob Wilson',
      avatar: 'https://via.placeholder.com/32/FF9800/ffffff?text=BW',
      status: 'away',
      activity: 'idle',
      joinedAt: '14:32',
      lastActiveAt: '14:35',
    },
  ]);
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [isVoiceChatEnabled, setIsVoiceChatEnabled] = useState(false);
  const [isVideoChatEnabled, setIsVideoChatEnabled] = useState(false);
  const [isScreenShareEnabled, setIsScreenShareEnabled] = useState(false);

  /**
   * 获取用户状态颜色
   */
  const getStatusColor = useCallback((status: ActiveUser['status']) => {
    switch (status) {
      case 'online': return '#52c41a';
      case 'away': return '#faad14';
      case 'busy': return '#ff4d4f';
      default: return '#d9d9d9';
    }
  }, []);

  /**
   * 获取活动状态文本
   */
  const getActivityText = useCallback((activity: ActiveUser['activity']) => {
    switch (activity) {
      case 'editing': return '正在编辑';
      case 'viewing': return '正在查看';
      case 'debugging': return '正在调试';
      case 'idle': return '空闲';
      default: return '未知';
    }
  }, []);

  /**
   * 获取活动图标
   */
  const getActivityIcon = useCallback((activity: ActiveUser['activity']) => {
    switch (activity) {
      case 'editing': return <EditOutlined className="text-blue-500" />;
      case 'viewing': return <EyeOutlined className="text-green-500" />;
      case 'debugging': return <SettingOutlined className="text-orange-500" />;
      case 'idle': return <UserOutlined className="text-gray-400" />;
      default: return <UserOutlined className="text-gray-400" />;
    }
  }, []);

  /**
   * 发送消息
   */
  const handleSendMessage = useCallback(() => {
    if (!currentMessage.trim()) return;
    
    const newMessage: CollaborationMessage = {
      id: Date.now().toString(),
      userId: currentUser?.id || 'current',
      username: currentUser?.username || 'You',
      avatar: currentUser?.avatar,
      message: currentMessage,
      timestamp: new Date().toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      type: 'message',
    };
    
    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
    
    // TODO: 通过WebSocket发送消息到其他协作者
  }, [currentMessage, currentUser]);

  /**
   * 分享代码位置
   */
  const handleShareCodeLocation = useCallback((fileName: string, lineNumber: number) => {
    const shareMessage: CollaborationMessage = {
      id: Date.now().toString(),
      userId: currentUser?.id || 'current',
      username: currentUser?.username || 'You',
      avatar: currentUser?.avatar,
      message: `查看这里的代码`,
      timestamp: new Date().toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      type: 'code_share',
      fileName,
      lineNumber,
    };
    
    setMessages(prev => [...prev, shareMessage]);
    
    // TODO: 高亮指定的代码位置
  }, [currentUser]);

  /**
   * 切换语音聊天
   */
  const handleToggleVoiceChat = useCallback(() => {
    setIsVoiceChatEnabled(prev => {
      const newState = !prev;
      if (newState) {
        message.success('语音聊天已开启');
      } else {
        message.info('语音聊天已关闭');
      }
      return newState;
    });
  }, []);

  /**
   * 切换视频聊天
   */
  const handleToggleVideoChat = useCallback(() => {
    setIsVideoChatEnabled(prev => {
      const newState = !prev;
      if (newState) {
        message.success('视频聊天已开启');
      } else {
        message.info('视频聊天已关闭');
      }
      return newState;
    });
  }, []);

  /**
   * 切换屏幕共享
   */
  const handleToggleScreenShare = useCallback(() => {
    setIsScreenShareEnabled(prev => {
      const newState = !prev;
      if (newState) {
        message.success('屏幕共享已开启');
      } else {
        message.info('屏幕共享已关闭');
      }
      return newState;
    });
  }, []);

  /**
   * 邀请用户
   */
  const handleInviteUser = useCallback(() => {
    // TODO: 实现用户邀请功能
    message.info('邀请功能开发中');
  }, []);

  /**
   * 跳转到用户的当前位置
   */
  const handleFollowUser = useCallback((user: ActiveUser) => {
    if (user.currentFile && user.cursor) {
      message.info(`正在跳转到 ${user.username} 的位置`);
      // TODO: 跳转到用户的当前文件和光标位置
    }
  }, []);

  /**
   * 渲染用户列表
   */
  const renderUserList = () => (
    <Card 
      size="small" 
      title={
        <div className="flex items-center justify-between">
          <span>在线用户 ({activeUsers.length})</span>
          <Button 
            type="text" 
            size="small" 
            icon={<TeamOutlined />}
            onClick={handleInviteUser}
          >
            邀请
          </Button>
        </div>
      }
    >
      <List
        size="small"
        dataSource={activeUsers}
        renderItem={(user) => (
          <List.Item className="border-0 py-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <Badge 
                  dot 
                  color={getStatusColor(user.status)}
                  offset={[-4, 4]}
                >
                  <Avatar 
                    size={32}
                    src={user.avatar} 
                    icon={<UserOutlined />}
                  />
                </Badge>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {user.username}
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    {getActivityIcon(user.activity)}
                    <span>{getActivityText(user.activity)}</span>
                  </div>
                  {user.currentFile && (
                    <div className="text-xs text-gray-400 truncate">
                      {user.currentFile}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <Tooltip title="跟随此用户">
                  <Button
                    type="text"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleFollowUser(user)}
                    disabled={user.activity === 'idle'}
                  />
                </Tooltip>
              </div>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );

  /**
   * 渲染聊天区域
   */
  const renderChatArea = () => (
    <Card 
      size="small" 
      title="团队聊天"
      className="flex-1 flex flex-col"
      bodyStyle={{ padding: 0, display: 'flex', flexDirection: 'column', height: '300px' }}
    >
      {/* 消息列表 */}
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start space-x-2">
            {msg.type !== 'system' && (
              <Avatar 
                size={24}
                src={msg.avatar} 
                icon={<UserOutlined />}
              />
            )}
            
            <div className="flex-1 min-w-0">
              {msg.type === 'system' ? (
                <div className="text-center text-sm text-gray-500 py-1">
                  {msg.message}
                </div>
              ) : (
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium">{msg.username}</span>
                    <span className="text-xs text-gray-400">{msg.timestamp}</span>
                  </div>
                  
                  <div className="text-sm">
                    {msg.type === 'code_share' ? (
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <div className="flex items-center space-x-1 text-blue-600 mb-1">
                          <ShareAltOutlined />
                          <span className="text-xs">代码分享</span>
                        </div>
                        <div>{msg.message}</div>
                        {msg.fileName && msg.lineNumber && (
                          <div className="text-xs text-blue-500 mt-1">
                            {msg.fileName}:{msg.lineNumber}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded p-2">
                        {msg.message}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* 消息输入 */}
      <div className="border-t p-3">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="输入消息..."
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onPressEnter={handleSendMessage}
            suffix={
              <Button
                type="text"
                size="small"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                disabled={!currentMessage.trim()}
              />
            }
          />
        </div>
      </div>
    </Card>
  );

  /**
   * 渲染通信控制
   */
  const renderCommunicationControls = () => (
    <Card size="small" title="通信">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AudioOutlined className={isVoiceChatEnabled ? 'text-green-500' : 'text-gray-400'} />
            <span className="text-sm">语音聊天</span>
          </div>
          <Switch
            size="small"
            checked={isVoiceChatEnabled}
            onChange={handleToggleVoiceChat}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <VideoCameraOutlined className={isVideoChatEnabled ? 'text-green-500' : 'text-gray-400'} />
            <span className="text-sm">视频聊天</span>
          </div>
          <Switch
            size="small"
            checked={isVideoChatEnabled}
            onChange={handleToggleVideoChat}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShareAltOutlined className={isScreenShareEnabled ? 'text-green-500' : 'text-gray-400'} />
            <span className="text-sm">屏幕共享</span>
          </div>
          <Switch
            size="small"
            checked={isScreenShareEnabled}
            onChange={handleToggleScreenShare}
          />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="h-full flex flex-col space-y-4 p-4">
      {/* 在线用户 */}
      {renderUserList()}
      
      {/* 通信控制 */}
      {renderCommunicationControls()}
      
      {/* 聊天区域 */}
      {renderChatArea()}
    </div>
  );
};

export default CollaborationPanel;