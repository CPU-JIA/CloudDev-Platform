package com.clouddev.ide.service;

import com.clouddev.ide.entity.CodeFile;
import com.clouddev.ide.exception.FileNotFoundException;
import com.clouddev.ide.exception.WorkspacePermissionException;
import com.clouddev.ide.repository.CodeFileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.nio.file.Paths;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 代码文件服务类
 */
@Service
public class CodeFileService {

    private static final Logger logger = LoggerFactory.getLogger(CodeFileService.class);

    @Autowired
    private CodeFileRepository codeFileRepository;

    @Autowired
    private WorkspaceService workspaceService;

    @Autowired
    private CollaborationService collaborationService;

    /**
     * 创建文件
     */
    public CodeFile createFile(String workspaceId, String path, String name, String content, String userId) {
        logger.info("Creating file: {} in workspace: {}", path, workspaceId);

        // 检查工作空间权限
        workspaceService.getWorkspace(workspaceId, userId);

        // 检查文件是否已存在
        Optional<CodeFile> existingFile = codeFileRepository.findByWorkspaceIdAndPath(workspaceId, path);
        if (existingFile.isPresent()) {
            throw new RuntimeException("文件已存在: " + path);
        }

        CodeFile codeFile = new CodeFile(workspaceId, path, name, content);
        codeFile.setLastModifiedBy(userId);
        codeFile.setChecksum(calculateChecksum(content));

        // 检测MIME类型
        codeFile.setMimeType(detectMimeType(name));

        CodeFile savedFile = codeFileRepository.save(codeFile);
        logger.info("File created successfully: {}", savedFile.getId());

        return savedFile;
    }

    /**
     * 获取文件内容
     */
    public CodeFile getFile(String fileId, String userId) {
        CodeFile file = codeFileRepository.findById(fileId)
                .orElseThrow(() -> new FileNotFoundException("文件不存在: " + fileId));

        // 检查工作空间权限
        workspaceService.getWorkspace(file.getWorkspaceId(), userId);

        return file;
    }

    /**
     * 根据路径获取文件
     */
    public CodeFile getFileByPath(String workspaceId, String path, String userId) {
        // 检查工作空间权限
        workspaceService.getWorkspace(workspaceId, userId);

        return codeFileRepository.findByWorkspaceIdAndPath(workspaceId, path)
                .orElseThrow(() -> new FileNotFoundException("文件不存在: " + path));
    }

    /**
     * 更新文件内容
     */
    public CodeFile updateFile(String fileId, String content, String userId) {
        logger.info("Updating file: {} by user: {}", fileId, userId);

        CodeFile file = getFile(fileId, userId);

        // 检查文件是否为只读
        if (file.isReadonly()) {
            throw new WorkspacePermissionException("文件为只读，无法修改");
        }

        // 保存编辑操作到历史
        CodeFile.EditOperation editOperation = new CodeFile.EditOperation(
            "update", 0, 0, 0, 0, file.getContent(), content, userId
        );
        file.addEditOperation(editOperation);

        // 更新文件内容
        file.setContent(content);
        file.setLastModifiedBy(userId);
        file.setChecksum(calculateChecksum(content));

        CodeFile savedFile = codeFileRepository.save(file);

        // 通知协作者
        collaborationService.notifyFileUpdate(fileId, userId, editOperation);

        logger.info("File updated successfully: {}", fileId);
        return savedFile;
    }

    /**
     * 删除文件
     */
    public void deleteFile(String fileId, String userId) {
        logger.info("Deleting file: {} by user: {}", fileId, userId);

        CodeFile file = getFile(fileId, userId);

        // 检查文件是否为只读
        if (file.isReadonly()) {
            throw new WorkspacePermissionException("文件为只读，无法删除");
        }

        codeFileRepository.deleteById(fileId);

        // 通知协作者
        collaborationService.notifyFileDelete(fileId, userId);

        logger.info("File deleted successfully: {}", fileId);
    }

    /**
     * 重命名文件
     */
    public CodeFile renameFile(String fileId, String newName, String newPath, String userId) {
        logger.info("Renaming file: {} to: {} by user: {}", fileId, newName, userId);

        CodeFile file = getFile(fileId, userId);

        // 检查新路径是否已存在
        Optional<CodeFile> existingFile = codeFileRepository.findByWorkspaceIdAndPath(
                file.getWorkspaceId(), newPath);
        if (existingFile.isPresent() && !existingFile.get().getId().equals(fileId)) {
            throw new RuntimeException("目标路径已存在文件: " + newPath);
        }

        file.setName(newName);
        file.setPath(newPath);
        file.setLastModifiedBy(userId);
        file.setLanguage(file.detectLanguageFromExtension(newName));
        file.setMimeType(detectMimeType(newName));

        CodeFile savedFile = codeFileRepository.save(file);
        logger.info("File renamed successfully: {}", fileId);

        return savedFile;
    }

    /**
     * 复制文件
     */
    public CodeFile copyFile(String fileId, String newPath, String newName, String userId) {
        logger.info("Copying file: {} to: {} by user: {}", fileId, newPath, userId);

        CodeFile originalFile = getFile(fileId, userId);

        // 检查目标路径是否已存在
        Optional<CodeFile> existingFile = codeFileRepository.findByWorkspaceIdAndPath(
                originalFile.getWorkspaceId(), newPath);
        if (existingFile.isPresent()) {
            throw new RuntimeException("目标路径已存在文件: " + newPath);
        }

        CodeFile newFile = new CodeFile(originalFile.getWorkspaceId(), newPath, newName, originalFile.getContent());
        newFile.setLanguage(originalFile.getLanguage());
        newFile.setMimeType(originalFile.getMimeType());
        newFile.setLastModifiedBy(userId);
        newFile.setChecksum(originalFile.getChecksum());

        CodeFile savedFile = codeFileRepository.save(newFile);
        logger.info("File copied successfully: {}", savedFile.getId());

        return savedFile;
    }

    /**
     * 获取工作空间的文件列表
     */
    public List<CodeFile> getWorkspaceFiles(String workspaceId, String userId) {
        // 检查工作空间权限
        workspaceService.getWorkspace(workspaceId, userId);

        return codeFileRepository.findByWorkspaceId(workspaceId);
    }

    /**
     * 分页获取工作空间的文件列表
     */
    public Page<CodeFile> getWorkspaceFiles(String workspaceId, String userId, Pageable pageable) {
        // 检查工作空间权限
        workspaceService.getWorkspace(workspaceId, userId);

        return codeFileRepository.findByWorkspaceId(workspaceId, pageable);
    }

    /**
     * 获取目录下的文件
     */
    public List<CodeFile> getDirectoryFiles(String workspaceId, String directoryPath, String userId) {
        // 检查工作空间权限
        workspaceService.getWorkspace(workspaceId, userId);

        String pathPrefix = directoryPath.endsWith("/") ? directoryPath : directoryPath + "/";
        return codeFileRepository.findByWorkspaceIdAndPathStartingWith(workspaceId, pathPrefix);
    }

    /**
     * 搜索文件内容
     */
    public List<CodeFile> searchFileContent(String workspaceId, String searchText, String userId) {
        // 检查工作空间权限
        workspaceService.getWorkspace(workspaceId, userId);

        return codeFileRepository.searchFileContent(workspaceId, searchText);
    }

    /**
     * 搜索文件名
     */
    public List<CodeFile> searchFileName(String workspaceId, String fileName, String userId) {
        // 检查工作空间权限
        workspaceService.getWorkspace(workspaceId, userId);

        return codeFileRepository.searchFileName(workspaceId, fileName);
    }

    /**
     * 获取最近修改的文件
     */
    public List<CodeFile> getRecentFiles(String workspaceId, String userId, int limit) {
        // 检查工作空间权限
        workspaceService.getWorkspace(workspaceId, userId);

        List<CodeFile> files = codeFileRepository.findByWorkspaceIdOrderByUpdatedAtDesc(workspaceId);
        return files.subList(0, Math.min(limit, files.size()));
    }

    /**
     * 获取用户修改的文件
     */
    public List<CodeFile> getUserModifiedFiles(String workspaceId, String userId) {
        // 检查工作空间权限
        workspaceService.getWorkspace(workspaceId, userId);

        return codeFileRepository.findByWorkspaceIdAndLastModifiedBy(workspaceId, userId);
    }

    /**
     * 添加协作者到文件
     */
    public CodeFile addCollaborator(String fileId, String collaboratorId, String userId) {
        CodeFile file = getFile(fileId, userId);
        file.addCollaborator(collaboratorId);
        return codeFileRepository.save(file);
    }

    /**
     * 移除文件协作者
     */
    public CodeFile removeCollaborator(String fileId, String collaboratorId, String userId) {
        CodeFile file = getFile(fileId, userId);
        file.removeCollaborator(collaboratorId);
        return codeFileRepository.save(file);
    }

    /**
     * 获取文件统计信息
     */
    public FileStatistics getFileStatistics(String workspaceId, String userId) {
        // 检查工作空间权限
        workspaceService.getWorkspace(workspaceId, userId);

        long totalFiles = codeFileRepository.countByWorkspaceId(workspaceId);
        List<CodeFile> allFiles = codeFileRepository.findByWorkspaceId(workspaceId);

        long totalSize = allFiles.stream().mapToLong(CodeFile::getSize).sum();
        
        FileStatistics stats = new FileStatistics();
        stats.setTotalFiles(totalFiles);
        stats.setTotalSize(totalSize);
        stats.setLanguageDistribution(calculateLanguageDistribution(allFiles));

        return stats;
    }

    /**
     * 删除工作空间的所有文件
     */
    public void deleteAllFiles(String workspaceId) {
        logger.info("Deleting all files in workspace: {}", workspaceId);
        codeFileRepository.deleteByWorkspaceId(workspaceId);
    }

    /**
     * 计算文件校验和
     */
    private String calculateChecksum(String content) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hashBytes = md.digest(content.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            logger.error("Failed to calculate checksum", e);
            return null;
        }
    }

    /**
     * 检测MIME类型
     */
    private String detectMimeType(String fileName) {
        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        switch (extension) {
            case "java": return "text/x-java-source";
            case "js": case "mjs": return "application/javascript";
            case "ts": return "application/typescript";
            case "py": return "text/x-python";
            case "html": return "text/html";
            case "css": return "text/css";
            case "json": return "application/json";
            case "xml": return "application/xml";
            case "md": return "text/markdown";
            case "txt": return "text/plain";
            default: return "text/plain";
        }
    }

    /**
     * 计算语言分布
     */
    private java.util.Map<String, Long> calculateLanguageDistribution(List<CodeFile> files) {
        return files.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        CodeFile::getLanguage,
                        java.util.stream.Collectors.counting()
                ));
    }

    /**
     * 文件统计信息类
     */
    public static class FileStatistics {
        private long totalFiles;
        private long totalSize;
        private java.util.Map<String, Long> languageDistribution;

        // Getters and Setters
        public long getTotalFiles() {
            return totalFiles;
        }

        public void setTotalFiles(long totalFiles) {
            this.totalFiles = totalFiles;
        }

        public long getTotalSize() {
            return totalSize;
        }

        public void setTotalSize(long totalSize) {
            this.totalSize = totalSize;
        }

        public java.util.Map<String, Long> getLanguageDistribution() {
            return languageDistribution;
        }

        public void setLanguageDistribution(java.util.Map<String, Long> languageDistribution) {
            this.languageDistribution = languageDistribution;
        }
    }
}