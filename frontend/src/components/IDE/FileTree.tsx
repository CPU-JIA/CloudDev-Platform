import React, { useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Tree, Dropdown, Button, Input, Modal, Form, message } from 'antd';
import type { TreeProps, TreeDataNode } from 'antd';
import {
  FileOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  SearchOutlined,
} from '@ant-design/icons';

import { selectFileTree, openFile } from '../../store/slices/ideSlice';
import type { FileNode, EditorTab } from '../../store/slices/ideSlice';

interface FileTreeProps {
  height?: string;
  className?: string;
}

/**
 * 文件树组件
 * 显示和管理项目文件结构
 */
const FileTree: React.FC<FileTreeProps> = ({ 
  height = '100%', 
  className 
}) => {
  const dispatch = useDispatch();
  const fileTree = useSelector(selectFileTree);
  
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [createType, setCreateType] = useState<'file' | 'folder'>('file');
  const [createParentPath, setCreateParentPath] = useState('');
  const [form] = Form.useForm();

  /**
   * 将FileNode转换为TreeDataNode
   */
  const convertToTreeData = useCallback((nodes: FileNode[]): TreeDataNode[] => {
    return nodes.map(node => ({
      key: node.path,
      title: (
        <div className="flex items-center justify-between group">
          <span className="flex items-center">
            {node.type === 'directory' ? (
              expandedKeys.includes(node.path) ? 
                <FolderOpenOutlined className="mr-2 text-blue-500" /> :
                <FolderOutlined className="mr-2 text-blue-500" />
            ) : (
              <FileOutlined className="mr-2 text-gray-500" />
            )}
            {node.name}
          </span>
          
          <Dropdown
            menu={{
              items: getContextMenuItems(node),
              onClick: ({ key }) => handleContextMenuClick(key, node)
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </div>
      ),
      isLeaf: node.type === 'file',
      children: node.children ? convertToTreeData(node.children) : undefined,
    }));
  }, [expandedKeys]);

  /**
   * 获取上下文菜单项
   */
  const getContextMenuItems = useCallback((node: FileNode) => {
    const items = [
      {
        key: 'open',
        label: '打开',
        icon: <FileOutlined />,
        disabled: node.type === 'directory',
      },
      { type: 'divider' as const },
      {
        key: 'newFile',
        label: '新建文件',
        icon: <PlusOutlined />,
      },
      {
        key: 'newFolder',
        label: '新建文件夹',
        icon: <FolderOutlined />,
      },
      { type: 'divider' as const },
      {
        key: 'rename',
        label: '重命名',
        icon: <EditOutlined />,
      },
      {
        key: 'delete',
        label: '删除',
        icon: <DeleteOutlined />,
        danger: true,
      },
    ];

    return items;
  }, []);

  /**
   * 处理上下文菜单点击
   */
  const handleContextMenuClick = useCallback((key: string, node: FileNode) => {
    switch (key) {
      case 'open':
        handleFileOpen(node);
        break;
      case 'newFile':
        handleCreateNew('file', node.path);
        break;
      case 'newFolder':
        handleCreateNew('folder', node.path);
        break;
      case 'rename':
        handleRename(node);
        break;
      case 'delete':
        handleDelete(node);
        break;
    }
  }, []);

  /**
   * 处理文件打开
   */
  const handleFileOpen = useCallback((node: FileNode) => {
    if (node.type === 'file') {
      const tab: EditorTab = {
        id: node.id,
        filePath: node.path,
        fileName: node.name,
        content: '', // TODO: 从服务器获取文件内容
        language: getLanguageFromExtension(node.name),
        isDirty: false,
        isActive: true,
      };
      
      dispatch(openFile(tab));
      setSelectedKeys([node.path]);
    }
  }, [dispatch]);

  /**
   * 处理树节点选择
   */
  const handleSelect = useCallback((selectedKeys: string[], info: any) => {
    if (info.node && !info.node.isLeaf) {
      return; // 不选中文件夹
    }
    
    setSelectedKeys(selectedKeys);
    
    if (selectedKeys.length > 0 && info.node) {
      // 查找对应的FileNode
      const findNode = (nodes: FileNode[], path: string): FileNode | null => {
        for (const node of nodes) {
          if (node.path === path) return node;
          if (node.children) {
            const found = findNode(node.children, path);
            if (found) return found;
          }
        }
        return null;
      };
      
      if (fileTree) {
        const node = findNode([fileTree], selectedKeys[0]);
        if (node) {
          handleFileOpen(node);
        }
      }
    }
  }, [fileTree, handleFileOpen]);

  /**
   * 处理树节点展开/收起
   */
  const handleExpand = useCallback((expandedKeys: string[]) => {
    setExpandedKeys(expandedKeys);
  }, []);

  /**
   * 处理创建新文件/文件夹
   */
  const handleCreateNew = useCallback((type: 'file' | 'folder', parentPath: string) => {
    setCreateType(type);
    setCreateParentPath(parentPath);
    setIsCreateModalVisible(true);
    form.resetFields();
  }, [form]);

  /**
   * 处理重命名
   */
  const handleRename = useCallback((node: FileNode) => {
    // TODO: 实现重命名功能
    message.info('重命名功能开发中');
  }, []);

  /**
   * 处理删除
   */
  const handleDelete = useCallback((node: FileNode) => {
    Modal.confirm({
      title: `确认删除${node.type === 'directory' ? '文件夹' : '文件'}？`,
      content: `这将永久删除 "${node.name}"${node.type === 'directory' ? ' 及其所有内容' : ''}。`,
      okType: 'danger',
      onOk: () => {
        // TODO: 实现删除功能
        message.success('删除成功');
      },
    });
  }, []);

  /**
   * 确认创建文件/文件夹
   */
  const handleCreateConfirm = useCallback(async () => {
    try {
      const values = await form.validateFields();
      const { name } = values;
      
      // TODO: 调用API创建文件/文件夹
      console.log(`Creating ${createType}: ${name} in ${createParentPath}`);
      
      message.success(`${createType === 'file' ? '文件' : '文件夹'}创建成功`);
      setIsCreateModalVisible(false);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  }, [form, createType, createParentPath]);

  /**
   * 根据文件扩展名获取语言
   */
  const getLanguageFromExtension = useCallback((fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'kt': 'kotlin',
      'scala': 'scala',
      'sh': 'shell',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
    };
    return languageMap[extension || ''] || 'plaintext';
  }, []);

  /**
   * 过滤树数据（搜索功能）
   */
  const filteredTreeData = useMemo(() => {
    if (!fileTree) return [];
    
    const filterTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.filter(node => {
        const matchesSearch = searchValue === '' || 
          node.name.toLowerCase().includes(searchValue.toLowerCase());
        
        if (node.children) {
          const filteredChildren = filterTree(node.children);
          return matchesSearch || filteredChildren.length > 0;
        }
        
        return matchesSearch;
      }).map(node => ({
        ...node,
        children: node.children ? filterTree(node.children) : undefined
      }));
    };
    
    return convertToTreeData(filterTree([fileTree]));
  }, [fileTree, searchValue, convertToTreeData]);

  /**
   * 处理搜索
   */
  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
    if (value) {
      // 展开所有匹配的节点
      const getAllKeys = (nodes: TreeDataNode[]): string[] => {
        let keys: string[] = [];
        nodes.forEach(node => {
          keys.push(node.key as string);
          if (node.children) {
            keys = keys.concat(getAllKeys(node.children));
          }
        });
        return keys;
      };
      setExpandedKeys(getAllKeys(filteredTreeData));
    }
  }, [filteredTreeData]);

  if (!fileTree) {
    return (
      <div className={`flex items-center justify-center h-full text-gray-500 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">📁</div>
          <div className="text-lg">暂无项目文件</div>
          <div className="text-sm mt-2">打开项目或创建新文件</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${className}`} style={{ height }}>
      {/* 文件树标题栏 */}
      <div className="flex items-center justify-between bg-gray-50 border-b px-3 py-2">
        <span className="text-sm font-medium">文件资源管理器</span>
        <div className="flex items-center space-x-1">
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleCreateNew('file', '')}
            title="新建文件"
          />
          <Button
            type="text"
            size="small"
            icon={<FolderOutlined />}
            onClick={() => handleCreateNew('folder', '')}
            title="新建文件夹"
          />
        </div>
      </div>

      {/* 搜索框 */}
      <div className="p-2 border-b">
        <Input
          placeholder="搜索文件..."
          prefix={<SearchOutlined />}
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
        />
      </div>

      {/* 文件树 */}
      <div className="flex-1 overflow-auto p-2">
        <Tree
          showLine
          showIcon={false}
          expandedKeys={expandedKeys}
          selectedKeys={selectedKeys}
          treeData={filteredTreeData}
          onSelect={handleSelect}
          onExpand={handleExpand}
          height={300}
        />
      </div>

      {/* 创建文件/文件夹模态框 */}
      <Modal
        title={`创建新${createType === 'file' ? '文件' : '文件夹'}`}
        open={isCreateModalVisible}
        onOk={handleCreateConfirm}
        onCancel={() => setIsCreateModalVisible(false)}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={`${createType === 'file' ? '文件' : '文件夹'}名称`}
            rules={[
              { required: true, message: '请输入名称' },
              { pattern: /^[^<>:"/\\|?*]+$/, message: '名称包含非法字符' },
            ]}
          >
            <Input 
              placeholder={`请输入${createType === 'file' ? '文件' : '文件夹'}名称`}
              autoFocus
            />
          </Form.Item>
          {createParentPath && (
            <div className="text-sm text-gray-500">
              将在 "{createParentPath}" 中创建
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default FileTree;