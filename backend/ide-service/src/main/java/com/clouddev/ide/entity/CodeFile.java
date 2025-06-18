package com.clouddev.ide.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * 代码文件实体
 */
@Document(collection = "code_files")
public class CodeFile {

    @Id
    private String id;

    @Field("workspace_id")
    private String workspaceId;

    @Field("path")
    private String path;

    @Field("name")
    private String name;

    @Field("content")
    private String content;

    @Field("language")
    private String language;

    @Field("encoding")
    private String encoding = "UTF-8";

    @Field("size")
    private long size;

    @Field("mime_type")
    private String mimeType;

    @Field("is_binary")
    private boolean isBinary = false;

    @Field("is_readonly")
    private boolean isReadonly = false;

    @Field("checksum")
    private String checksum;

    @Field("version")
    private long version = 1L;

    @Field("last_modified_by")
    private String lastModifiedBy;

    @Field("collaborators")
    private List<String> collaborators = new ArrayList<>();

    @Field("edit_history")
    private List<EditOperation> editHistory = new ArrayList<>();

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;

    // 构造函数
    public CodeFile() {}

    public CodeFile(String workspaceId, String path, String name, String content) {
        this.workspaceId = workspaceId;
        this.path = path;
        this.name = name;
        this.content = content;
        this.size = content != null ? content.getBytes().length : 0;
        this.language = detectLanguageFromExtension(name);
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getWorkspaceId() {
        return workspaceId;
    }

    public void setWorkspaceId(String workspaceId) {
        this.workspaceId = workspaceId;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
        this.size = content != null ? content.getBytes().length : 0;
        this.version++;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getEncoding() {
        return encoding;
    }

    public void setEncoding(String encoding) {
        this.encoding = encoding;
    }

    public long getSize() {
        return size;
    }

    public void setSize(long size) {
        this.size = size;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public boolean isBinary() {
        return isBinary;
    }

    public void setBinary(boolean binary) {
        isBinary = binary;
    }

    public boolean isReadonly() {
        return isReadonly;
    }

    public void setReadonly(boolean readonly) {
        isReadonly = readonly;
    }

    public String getChecksum() {
        return checksum;
    }

    public void setChecksum(String checksum) {
        this.checksum = checksum;
    }

    public long getVersion() {
        return version;
    }

    public void setVersion(long version) {
        this.version = version;
    }

    public String getLastModifiedBy() {
        return lastModifiedBy;
    }

    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

    public List<String> getCollaborators() {
        return collaborators;
    }

    public void setCollaborators(List<String> collaborators) {
        this.collaborators = collaborators;
    }

    public List<EditOperation> getEditHistory() {
        return editHistory;
    }

    public void setEditHistory(List<EditOperation> editHistory) {
        this.editHistory = editHistory;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // 工具方法
    public void addEditOperation(EditOperation operation) {
        this.editHistory.add(operation);
        // 保留最近100个操作历史
        if (this.editHistory.size() > 100) {
            this.editHistory.remove(0);
        }
    }

    public void addCollaborator(String userId) {
        if (!this.collaborators.contains(userId)) {
            this.collaborators.add(userId);
        }
    }

    public void removeCollaborator(String userId) {
        this.collaborators.remove(userId);
    }

    public String getFileExtension() {
        int lastDotIndex = name.lastIndexOf('.');
        return lastDotIndex > 0 ? name.substring(lastDotIndex + 1) : "";
    }

    private String detectLanguageFromExtension(String fileName) {
        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        switch (extension) {
            case "java": return "java";
            case "js": case "mjs": return "javascript";
            case "ts": return "typescript";
            case "py": return "python";
            case "go": return "go";
            case "rs": return "rust";
            case "cpp": case "cc": case "cxx": return "cpp";
            case "c": return "c";
            case "cs": return "csharp";
            case "php": return "php";
            case "rb": return "ruby";
            case "swift": return "swift";
            case "kt": return "kotlin";
            case "scala": return "scala";
            case "html": return "html";
            case "css": return "css";
            case "scss": case "sass": return "scss";
            case "json": return "json";
            case "xml": return "xml";
            case "yaml": case "yml": return "yaml";
            case "md": return "markdown";
            case "sql": return "sql";
            case "sh": case "bash": return "shell";
            case "dockerfile": return "dockerfile";
            default: return "text";
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CodeFile)) return false;
        CodeFile codeFile = (CodeFile) o;
        return Objects.equals(id, codeFile.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "CodeFile{" +
                "id='" + id + '\'' +
                ", workspaceId='" + workspaceId + '\'' +
                ", path='" + path + '\'' +
                ", name='" + name + '\'' +
                ", language='" + language + '\'' +
                ", size=" + size +
                ", version=" + version +
                '}';
    }

    /**
     * 编辑操作类
     */
    public static class EditOperation {
        private String operationType;  // insert, delete, replace
        private int startLine;
        private int startColumn;
        private int endLine;
        private int endColumn;
        private String oldContent;
        private String newContent;
        private String userId;
        private LocalDateTime timestamp;

        public EditOperation() {
            this.timestamp = LocalDateTime.now();
        }

        public EditOperation(String operationType, int startLine, int startColumn, 
                           int endLine, int endColumn, String oldContent, String newContent, String userId) {
            this.operationType = operationType;
            this.startLine = startLine;
            this.startColumn = startColumn;
            this.endLine = endLine;
            this.endColumn = endColumn;
            this.oldContent = oldContent;
            this.newContent = newContent;
            this.userId = userId;
            this.timestamp = LocalDateTime.now();
        }

        // Getters and Setters
        public String getOperationType() {
            return operationType;
        }

        public void setOperationType(String operationType) {
            this.operationType = operationType;
        }

        public int getStartLine() {
            return startLine;
        }

        public void setStartLine(int startLine) {
            this.startLine = startLine;
        }

        public int getStartColumn() {
            return startColumn;
        }

        public void setStartColumn(int startColumn) {
            this.startColumn = startColumn;
        }

        public int getEndLine() {
            return endLine;
        }

        public void setEndLine(int endLine) {
            this.endLine = endLine;
        }

        public int getEndColumn() {
            return endColumn;
        }

        public void setEndColumn(int endColumn) {
            this.endColumn = endColumn;
        }

        public String getOldContent() {
            return oldContent;
        }

        public void setOldContent(String oldContent) {
            this.oldContent = oldContent;
        }

        public String getNewContent() {
            return newContent;
        }

        public void setNewContent(String newContent) {
            this.newContent = newContent;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }
    }
}