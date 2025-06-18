package com.clouddev.ide.service;

import com.clouddev.ide.entity.CodeFile;
import com.clouddev.ide.entity.CollaborationSession;
import com.clouddev.ide.repository.CollaborationSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 协作服务类
 */
@Service
public class CollaborationService {

    private static final Logger logger = LoggerFactory.getLogger(CollaborationService.class);

    @Autowired
    private CollaborationSessionRepository collaborationSessionRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * 加入协作会话
     */
    public CollaborationSession joinSession(String workspaceId, String fileId, String userId, String username, String avatar) {
        logger.info("User {} joining collaboration session for file: {}", userId, fileId);

        Optional<CollaborationSession> existingSession = collaborationSessionRepository.findByFileId(fileId);
        
        CollaborationSession session;
        if (existingSession.isPresent()) {
            session = existingSession.get();
        } else {
            session = new CollaborationSession(workspaceId, fileId);
            session = collaborationSessionRepository.save(session);
        }

        // 添加参与者
        session.addParticipant(userId, username, avatar);
        session = collaborationSessionRepository.save(session);

        // 通知其他参与者
        notifyParticipants(session, "user_joined", createUserJoinedMessage(userId, username, avatar));

        logger.info("User {} joined collaboration session: {}", userId, session.getId());
        return session;
    }

    /**
     * 离开协作会话
     */
    public void leaveSession(String fileId, String userId) {
        logger.info("User {} leaving collaboration session for file: {}", userId, fileId);

        Optional<CollaborationSession> sessionOpt = collaborationSessionRepository.findByFileId(fileId);
        if (sessionOpt.isPresent()) {
            CollaborationSession session = sessionOpt.get();
            session.removeParticipant(userId);

            if (session.getParticipantCount() == 0) {
                // 如果没有参与者了，结束会话
                session.setStatus(CollaborationSession.SessionStatus.ENDED);
            }

            collaborationSessionRepository.save(session);

            // 通知其他参与者
            notifyParticipants(session, "user_left", createUserLeftMessage(userId));

            logger.info("User {} left collaboration session: {}", userId, session.getId());
        }
    }

    /**
     * 更新光标位置
     */
    public void updateCursorPosition(String fileId, String userId, int line, int column) {
        Optional<CollaborationSession> sessionOpt = collaborationSessionRepository.findByFileId(fileId);
        if (sessionOpt.isPresent()) {
            CollaborationSession session = sessionOpt.get();
            
            if (session.isParticipant(userId)) {
                session.updateCursorPosition(userId, line, column);
                collaborationSessionRepository.save(session);

                // 通知其他参与者
                notifyParticipants(session, "cursor_update", createCursorUpdateMessage(userId, line, column));
            }
        }
    }

    /**
     * 发送代码编辑操作
     */
    public void sendOperation(String fileId, String userId, CollaborationSession.CollaborationOperation operation) {
        logger.debug("User {} sending operation for file: {}", userId, fileId);

        Optional<CollaborationSession> sessionOpt = collaborationSessionRepository.findByFileId(fileId);
        if (sessionOpt.isPresent()) {
            CollaborationSession session = sessionOpt.get();
            
            if (session.isParticipant(userId)) {
                session.addOperation(operation);
                collaborationSessionRepository.save(session);

                // 通知其他参与者
                notifyParticipants(session, "operation", operation);
            }
        }
    }

    /**
     * 获取协作会话
     */
    public Optional<CollaborationSession> getSession(String fileId) {
        return collaborationSessionRepository.findByFileId(fileId);
    }

    /**
     * 获取工作空间的活跃会话
     */
    public List<CollaborationSession> getActiveSessionsByWorkspace(String workspaceId) {
        return collaborationSessionRepository.findActiveSessionsByWorkspaceId(workspaceId);
    }

    /**
     * 通知文件更新
     */
    public void notifyFileUpdate(String fileId, String userId, CodeFile.EditOperation editOperation) {
        Optional<CollaborationSession> sessionOpt = collaborationSessionRepository.findByFileId(fileId);
        if (sessionOpt.isPresent()) {
            CollaborationSession session = sessionOpt.get();
            notifyParticipants(session, "file_updated", editOperation);
        }
    }

    /**
     * 通知文件删除
     */
    public void notifyFileDelete(String fileId, String userId) {
        Optional<CollaborationSession> sessionOpt = collaborationSessionRepository.findByFileId(fileId);
        if (sessionOpt.isPresent()) {
            CollaborationSession session = sessionOpt.get();
            
            // 结束协作会话
            session.setStatus(CollaborationSession.SessionStatus.ENDED);
            collaborationSessionRepository.save(session);

            notifyParticipants(session, "file_deleted", createFileDeletedMessage(fileId, userId));
        }
    }

    /**
     * 清理非活跃会话
     */
    public void cleanupInactiveSessions() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(1); // 1小时未活跃
        List<CollaborationSession> inactiveSessions = collaborationSessionRepository.findInactiveSessions(cutoffTime);

        for (CollaborationSession session : inactiveSessions) {
            logger.info("Cleaning up inactive collaboration session: {}", session.getId());
            session.setStatus(CollaborationSession.SessionStatus.INACTIVE);
            collaborationSessionRepository.save(session);
        }
    }

    /**
     * 通知参与者
     */
    private void notifyParticipants(CollaborationSession session, String messageType, Object payload) {
        for (String userId : session.getParticipants().keySet()) {
            String destination = "/queue/collaboration/" + userId;
            
            CollaborationMessage message = new CollaborationMessage();
            message.setType(messageType);
            message.setFileId(session.getFileId());
            message.setSessionId(session.getId());
            message.setPayload(payload);
            message.setTimestamp(LocalDateTime.now());

            try {
                messagingTemplate.convertAndSend(destination, message);
            } catch (Exception e) {
                logger.error("Failed to send collaboration message to user: {}", userId, e);
            }
        }
    }

    /**
     * 创建用户加入消息
     */
    private Object createUserJoinedMessage(String userId, String username, String avatar) {
        return new UserJoinedMessage(userId, username, avatar);
    }

    /**
     * 创建用户离开消息
     */
    private Object createUserLeftMessage(String userId) {
        return new UserLeftMessage(userId);
    }

    /**
     * 创建光标更新消息
     */
    private Object createCursorUpdateMessage(String userId, int line, int column) {
        return new CursorUpdateMessage(userId, line, column);
    }

    /**
     * 创建文件删除消息
     */
    private Object createFileDeletedMessage(String fileId, String userId) {
        return new FileDeletedMessage(fileId, userId);
    }

    /**
     * 协作消息类
     */
    public static class CollaborationMessage {
        private String type;
        private String fileId;
        private String sessionId;
        private Object payload;
        private LocalDateTime timestamp;

        // Getters and Setters
        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getFileId() {
            return fileId;
        }

        public void setFileId(String fileId) {
            this.fileId = fileId;
        }

        public String getSessionId() {
            return sessionId;
        }

        public void setSessionId(String sessionId) {
            this.sessionId = sessionId;
        }

        public Object getPayload() {
            return payload;
        }

        public void setPayload(Object payload) {
            this.payload = payload;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }
    }

    // 消息载荷类
    public static class UserJoinedMessage {
        private String userId;
        private String username;
        private String avatar;

        public UserJoinedMessage(String userId, String username, String avatar) {
            this.userId = userId;
            this.username = username;
            this.avatar = avatar;
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
    }

    public static class UserLeftMessage {
        private String userId;

        public UserLeftMessage(String userId) {
            this.userId = userId;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }
    }

    public static class CursorUpdateMessage {
        private String userId;
        private int line;
        private int column;

        public CursorUpdateMessage(String userId, int line, int column) {
            this.userId = userId;
            this.line = line;
            this.column = column;
        }

        // Getters and Setters
        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

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
    }

    public static class FileDeletedMessage {
        private String fileId;
        private String deletedBy;

        public FileDeletedMessage(String fileId, String deletedBy) {
            this.fileId = fileId;
            this.deletedBy = deletedBy;
        }

        public String getFileId() {
            return fileId;
        }

        public void setFileId(String fileId) {
            this.fileId = fileId;
        }

        public String getDeletedBy() {
            return deletedBy;
        }

        public void setDeletedBy(String deletedBy) {
            this.deletedBy = deletedBy;
        }
    }
}