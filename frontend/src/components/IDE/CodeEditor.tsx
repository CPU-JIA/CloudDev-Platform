import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Editor, { Monaco } from '@monaco-editor/react';
import { Button, message, Spin } from 'antd';
import { SaveOutlined, UndoOutlined, RedoOutlined } from '@ant-design/icons';

import { selectEditorSettings, selectActiveTab, updateFileContent, saveFile } from '../../store/slices/ideSlice';
import { selectTheme } from '../../store/slices/uiSlice';

interface CodeEditorProps {
  height?: string;
  className?: string;
}

/**
 * 代码编辑器组件
 * 基于Monaco Editor的云端代码编辑器
 */
const CodeEditor: React.FC<CodeEditorProps> = ({ 
  height = '100%',
  className 
}) => {
  const dispatch = useDispatch();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  
  const editorSettings = useSelector(selectEditorSettings);
  const activeTab = useSelector(selectActiveTab);
  const theme = useSelector(selectTheme);
  
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  /**
   * Monaco Editor加载完成回调
   */
  const handleEditorDidMount = useCallback((editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // 配置编辑器选项
    editor.updateOptions({
      fontSize: editorSettings.fontSize,
      tabSize: editorSettings.tabSize,
      wordWrap: editorSettings.wordWrap ? 'on' : 'off',
      minimap: { enabled: editorSettings.minimap },
      lineNumbers: editorSettings.lineNumbers ? 'on' : 'off',
      folding: editorSettings.folding,
      automaticLayout: true,
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      renderLineHighlight: 'line',
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: false,
      cursorStyle: 'line',
      fontLigatures: true,
    });

    // 注册键盘快捷键
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ, () => {
      editor.trigger('keyboard', 'undo', {});
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyZ, () => {
      editor.trigger('keyboard', 'redo', {});
    });

    // 自动补全配置
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model, position) => {
        // TODO: 实现AI代码补全
        return { suggestions: [] };
      }
    });

    // 代码诊断（错误检查）
    monaco.languages.registerCodeActionProvider('javascript', {
      provideCodeActions: (model, range, context) => {
        // TODO: 实现代码修复建议
        return { actions: [], dispose: () => {} };
      }
    });

    setIsLoading(false);
  }, [editorSettings]);

  /**
   * 代码变更处理
   */
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (activeTab && value !== undefined) {
      dispatch(updateFileContent({
        tabId: activeTab.id,
        content: value
      }));
      setHasUnsavedChanges(true);
    }
  }, [activeTab, dispatch]);

  /**
   * 保存文件
   */
  const handleSave = useCallback(async () => {
    if (activeTab && hasUnsavedChanges) {
      try {
        // TODO: 调用API保存文件到服务器
        dispatch(saveFile(activeTab.id));
        setHasUnsavedChanges(false);
        message.success(`已保存 ${activeTab.fileName}`);
      } catch (error) {
        message.error('保存失败');
        console.error('Save failed:', error);
      }
    }
  }, [activeTab, hasUnsavedChanges, dispatch]);

  /**
   * 撤销操作
   */
  const handleUndo = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'undo', {});
    }
  }, []);

  /**
   * 重做操作
   */
  const handleRedo = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'redo', {});
    }
  }, []);

  /**
   * 获取编程语言
   */
  const getLanguage = useCallback((fileName: string): string => {
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
      'bash': 'shell',
      'sql': 'sql',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'less': 'less',
      'json': 'json',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'md': 'markdown',
      'dockerfile': 'dockerfile',
    };
    return languageMap[extension || ''] || 'plaintext';
  }, []);

  /**
   * 获取编辑器主题
   */
  const getEditorTheme = useCallback(() => {
    if (editorSettings.theme === 'vs-dark') return 'vs-dark';
    if (editorSettings.theme === 'hc-black') return 'hc-black';
    return 'vs';
  }, [editorSettings.theme]);

  // 监听编辑器设置变化
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        fontSize: editorSettings.fontSize,
        tabSize: editorSettings.tabSize,
        wordWrap: editorSettings.wordWrap ? 'on' : 'off',
        minimap: { enabled: editorSettings.minimap },
        lineNumbers: editorSettings.lineNumbers ? 'on' : 'off',
        folding: editorSettings.folding,
      });
    }
  }, [editorSettings]);

  // 监听主题变化
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(getEditorTheme());
    }
  }, [theme, getEditorTheme]);

  // 键盘事件监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  if (!activeTab) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-4">📝</div>
          <div className="text-lg">选择一个文件开始编辑</div>
          <div className="text-sm mt-2">或者创建一个新文件</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`} style={{ height }}>
      {/* 编辑器工具栏 */}
      <div className="flex items-center justify-between bg-gray-50 border-b px-3 py-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">{activeTab.fileName}</span>
          {hasUnsavedChanges && (
            <span className="w-2 h-2 bg-orange-400 rounded-full" title="未保存的更改" />
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            type="text"
            size="small"
            icon={<UndoOutlined />}
            onClick={handleUndo}
            title="撤销 (Ctrl+Z)"
          />
          <Button
            type="text"
            size="small"
            icon={<RedoOutlined />}
            onClick={handleRedo}
            title="重做 (Ctrl+Shift+Z)"
          />
          <Button
            type="text"
            size="small"
            icon={<SaveOutlined />}
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            title="保存 (Ctrl+S)"
          />
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="relative" style={{ height: 'calc(100% - 49px)' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <Spin size="large" tip="加载编辑器中..." />
          </div>
        )}
        
        <Editor
          height="100%"
          language={getLanguage(activeTab.fileName)}
          value={activeTab.content}
          theme={getEditorTheme()}
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
          options={{
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: 'line',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            renderLineHighlight: 'line',
            fontLigatures: true,
          }}
          loading={<Spin size="large" tip="加载中..." />}
        />
      </div>

      {/* 状态栏 */}
      <div className="flex items-center justify-between bg-gray-100 border-t px-3 py-1 text-xs text-gray-600">
        <div className="flex items-center space-x-4">
          <span>行 1, 列 1</span>
          <span>UTF-8</span>
          <span>{getLanguage(activeTab.fileName)}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>空格: {editorSettings.tabSize}</span>
          <span>字体: {editorSettings.fontSize}px</span>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;