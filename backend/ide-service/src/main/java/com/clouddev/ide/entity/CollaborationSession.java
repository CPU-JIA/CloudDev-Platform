package com.clouddev.ide.entity;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * 协作会话实体
 */
@Document(collection = "collaboration_sessions")
public class CollaborationSession {

    @Id
    private String id;

    @Field("workspace_id")
    private String workspaceId;

    @Field("file_id")
    private String fileId;

    @Field("participants")
    private Map<String, Participant> participants = new HashMap<>();

    @Field("active_cursors")
    private Map<String, CursorPosition> activeCursors = new HashMap<>();

    @Field("operations")
    private List<CollaborationOperation> operations = new ArrayList<>();

    @Field("status")
    private SessionStatus status = SessionStatus.ACTIVE;

    @Field("last_activity_at")
    private LocalDateTime lastActivityAt;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;

    // 构造函数
    public CollaborationSession() {
        this.lastActivityAt = LocalDateTime.now();
    }

    public CollaborationSession(String workspaceId, String fileId) {
        this.workspaceId = workspaceId;
        this.fileId = fileId;
        this.lastActivityAt = LocalDateTime.now();
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

    public String getFileId() {
        return fileId;
    }

    public void setFileId(String fileId) {
        this.fileId = fileId;
    }

    public Map<String, Participant> getParticipants() {
        return participants;
    }

    public void setParticipants(Map<String, Participant> participants) {
        this.participants = participants;
    }

    public Map<String, CursorPosition> getActiveCursors() {
        return activeCursors;
    }

    public void setActiveCursors(Map<String, CursorPosition> activeCursors) {
        this.activeCursors = activeCursors;
    }

    public List<CollaborationOperation> getOperations() {
        return operations;
    }

    public void setOperations(List<CollaborationOperation> operations) {
        this.operations = operations;
    }

    public SessionStatus getStatus() {
        return status;
    }

    public void setStatus(SessionStatus status) {
        this.status = status;
    }

    public LocalDateTime getLastActivityAt() {
        return lastActivityAt;
    }

    public void setLastActivityAt(LocalDateTime lastActivityAt) {
        this.lastActivityAt = lastActivityAt;
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
    public void addParticipant(String userId, String username, String avatar) {
        Participant participant = new Participant(userId, username, avatar);
        this.participants.put(userId, participant);
        updateActivity();
    }

    public void removeParticipant(String userId) {
        this.participants.remove(userId);
        this.activeCursors.remove(userId);
        updateActivity();
    }

    public void updateCursorPosition(String userId, int line, int column) {
        CursorPosition cursor = new CursorPosition(line, column, LocalDateTime.now());
        this.activeCursors.put(userId, cursor);
        updateActivity();
    }

    public void addOperation(CollaborationOperation operation) {
        this.operations.add(operation);
        updateActivity();
        
        // 保留最近1000个操作
        if (this.operations.size() > 1000) {
            this.operations.remove(0);
        }
    }

    public boolean isParticipant(String userId) {
        return this.participants.containsKey(userId);
    }

    public int getParticipantCount() {
        return this.participants.size();
    }

    private void updateActivity() {
        this.lastActivityAt = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CollaborationSession)) return false;
        CollaborationSession that = (CollaborationSession) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "CollaborationSession{" +
                "id='" + id + '\'' +
                ", workspaceId='" + workspaceId + '\'' +
                ", fileId='" + fileId + '\'' +
                ", participantCount=" + participants.size() +
                ", status=" + status +
                '}';
    }

    /**
     * 会话状态枚举
     */
    public enum SessionStatus {
        ACTIVE,     // 活跃
        INACTIVE,   // 非活跃
        ENDED       // 已结束
    }

    /**
     * 参与者类
     */
    public static class Participant {
        private String userId;
        private String username;
        private String avatar;
        private String color;       // 协作时的标识颜色
        private LocalDateTime joinedAt;
        private LocalDateTime lastActiveAt;
        private boolean isOnline;

        public Participant() {
            this.joinedAt = LocalDateTime.now();
            this.lastActiveAt = LocalDateTime.now();
            this.isOnline = true;
        }

        public Participant(String userId, String username, String avatar) {
            this.userId = userId;
            this.username = username;
            this.avatar = avatar;
            this.joinedAt = LocalDateTime.now();
            this.lastActiveAt = LocalDateTime.now();
            this.isOnline = true;
            this.color = generateColor(userId);
        }

        // Getters and Setters
        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getAvatar() {
            return avatar;
        }

        public void setAvatar(String avatar) {
            this.avatar = avatar;
        }

        public String getColor() {
            return color;
        }

        public void setColor(String color) {
            this.color = color;
        }

        public LocalDateTime getJoinedAt() {
            return joinedAt;
        }

        public void setJoinedAt(LocalDateTime joinedAt) {
            this.joinedAt = joinedAt;
        }

        public LocalDateTime getLastActiveAt() {
            return lastActiveAt;
        }

        public void setLastActiveAt(LocalDateTime lastActiveAt) {
            this.lastActiveAt = lastActiveAt;
        }

        public boolean isOnline() {
            return isOnline;
        }

        public void setOnline(boolean online) {
            isOnline = online;
        }

        private String generateColor(String userId) {
            // 基于用户ID生成一个固定的颜色
            String[] colors = {
                "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FECA57",
                "#FF9FF3", "#54A0FF", "#5F27CD", "#00D2D3", "#FF9F43"
            };
            int index = Math.abs(userId.hashCode()) % colors.length;
            return colors[index];
        }
    }

    /**
     * 光标位置类
     */
    public static class CursorPosition {
        private int line;
        private int column;
        private LocalDateTime timestamp;

        public CursorPosition() {
            this.timestamp = LocalDateTime.now();
        }

        public CursorPosition(int line, int column, LocalDateTime timestamp) {
            this.line = line;
            this.column = column;
            this.timestamp = timestamp;
        }

        // Getters and Setters
        public int getLine() {
            return line;
        }

        public void setLine(int line) {
            this.line = line;
        }

        public int getColumn() {
            return column;
        }

        public void setColumn(int column) {
            this.column = column;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }
    }

    /**
     * 协作操作类
     */
    public static class CollaborationOperation {
        private String operationId;
        private String type;        // insert, delete, retain
        private int position;
        private String content;
        private String userId;
        private LocalDateTime timestamp;
        private long version;

        public CollaborationOperation() {
            this.timestamp = LocalDateTime.now();
        }

        public CollaborationOperation(String type, int position, String content, String userId, long version) {
            this.operationId = java.util.UUID.randomUUID().toString();
            this.type = type;
            this.position = position;
            this.content = content;
            this.userId = userId;
            this.version = version;
            this.timestamp = LocalDateTime.now();
        }

        // Getters and Setters
        public String getOperationId() {
            return operationId;
        }

        public void setOperationId(String operationId) {
            this.operationId = operationId;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public int getPosition() {
            return position;
        }

        public void setPosition(int position) {
            this.position = position;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
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

        public long getVersion() {
            return version;
        }

        public void setVersion(long version) {
            this.version = version;
        }
    }
}