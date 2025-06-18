package com.clouddev.cicd.service;

import com.clouddev.cicd.entity.Pipeline;
import com.clouddev.cicd.entity.PipelineExecution;
import com.clouddev.cicd.dto.PipelineCreateRequest;
import com.clouddev.cicd.dto.PipelineUpdateRequest;
import com.clouddev.cicd.dto.PipelineExecutionRequest;
import com.clouddev.cicd.dto.PipelineResponse;
import com.clouddev.cicd.repository.PipelineRepository;
import com.clouddev.cicd.repository.PipelineExecutionRepository;
import com.clouddev.cicd.exception.PipelineNotFoundException;
import com.clouddev.cicd.exception.PipelineExecutionException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 流水线服务类
 * 提供流水线的CRUD操作和执行管理
 */
@Service
@Transactional
public class PipelineService {

    @Autowired
    private PipelineRepository pipelineRepository;

    @Autowired
    private PipelineExecutionRepository executionRepository;

    @Autowired
    private PipelineExecutionService executionService;

    @Autowired
    private GitService gitService;

    @Autowired
    private NotificationService notificationService;

    /**
     * 创建流水线
     */
    public PipelineResponse createPipeline(PipelineCreateRequest request, Long userId) {
        Pipeline pipeline = new Pipeline();
        pipeline.setName(request.getName());
        pipeline.setDescription(request.getDescription());
        pipeline.setRepository(request.getRepository());
        pipeline.setBranch(request.getBranch());
        pipeline.setProjectId(request.getProjectId());
        pipeline.setCreatedBy(userId);
        pipeline.setConfiguration(request.getConfiguration());

        // 设置触发器
        Pipeline.PipelineTriggers triggers = new Pipeline.PipelineTriggers();
        triggers.setWebhookEnabled(request.getTriggers().getWebhookEnabled());
        triggers.setManualEnabled(request.getTriggers().getManualEnabled());
        triggers.setScheduleEnabled(request.getTriggers().getScheduleEnabled());
        triggers.setScheduleCron(request.getTriggers().getScheduleCron());
        pipeline.setTriggers(triggers);

        // 设置变量和标签
        if (request.getVariables() != null) {
            pipeline.setVariables(request.getVariables());
        }
        if (request.getTags() != null) {
            pipeline.setTags(request.getTags());
        }

        Pipeline savedPipeline = pipelineRepository.save(pipeline);
        
        // 如果启用了Webhook，创建Git仓库的Webhook
        if (triggers.getWebhookEnabled()) {
            try {
                gitService.createWebhook(savedPipeline.getRepository(), savedPipeline.getId());
            } catch (Exception e) {
                // 记录警告，但不阻止流水线创建
                System.err.println("Failed to create webhook for pipeline " + savedPipeline.getId() + ": " + e.getMessage());
            }
        }

        return convertToResponse(savedPipeline);
    }

    /**
     * 更新流水线
     */
    public PipelineResponse updatePipeline(Long pipelineId, PipelineUpdateRequest request, Long userId) {
        Pipeline pipeline = pipelineRepository.findById(pipelineId)
            .orElseThrow(() -> new PipelineNotFoundException("Pipeline not found with id: " + pipelineId));

        // 检查权限
        if (!canUserModifyPipeline(pipeline, userId)) {
            throw new IllegalArgumentException("User does not have permission to modify this pipeline");
        }

        // 更新基本信息
        if (request.getName() != null) {
            pipeline.setName(request.getName());
        }
        if (request.getDescription() != null) {
            pipeline.setDescription(request.getDescription());
        }
        if (request.getBranch() != null) {
            pipeline.setBranch(request.getBranch());
        }
        if (request.getStatus() != null) {
            pipeline.setStatus(request.getStatus());
        }
        if (request.getConfiguration() != null) {
            pipeline.setConfiguration(request.getConfiguration());
        }

        // 更新触发器
        if (request.getTriggers() != null) {
            Pipeline.PipelineTriggers triggers = pipeline.getTriggers();
            if (triggers == null) {
                triggers = new Pipeline.PipelineTriggers();
                pipeline.setTriggers(triggers);
            }
            triggers.setWebhookEnabled(request.getTriggers().getWebhookEnabled());
            triggers.setManualEnabled(request.getTriggers().getManualEnabled());
            triggers.setScheduleEnabled(request.getTriggers().getScheduleEnabled());
            triggers.setScheduleCron(request.getTriggers().getScheduleCron());
        }

        // 更新变量和标签
        if (request.getVariables() != null) {
            pipeline.setVariables(request.getVariables());
        }
        if (request.getTags() != null) {
            pipeline.setTags(request.getTags());
        }

        Pipeline updatedPipeline = pipelineRepository.save(pipeline);
        return convertToResponse(updatedPipeline);
    }

    /**
     * 删除流水线
     */
    public void deletePipeline(Long pipelineId, Long userId) {
        Pipeline pipeline = pipelineRepository.findById(pipelineId)
            .orElseThrow(() -> new PipelineNotFoundException("Pipeline not found with id: " + pipelineId));

        // 检查权限
        if (!canUserModifyPipeline(pipeline, userId)) {
            throw new IllegalArgumentException("User does not have permission to delete this pipeline");
        }

        // 检查是否有正在运行的执行
        List<PipelineExecution> runningExecutions = executionRepository
            .findByPipelineAndStatus(pipeline, PipelineExecution.ExecutionStatus.RUNNING);
        
        if (!runningExecutions.isEmpty()) {
            throw new PipelineExecutionException("Cannot delete pipeline with running executions");
        }

        // 删除Webhook
        try {
            gitService.deleteWebhook(pipeline.getRepository(), pipeline.getId());
        } catch (Exception e) {
            System.err.println("Failed to delete webhook for pipeline " + pipeline.getId() + ": " + e.getMessage());
        }

        pipelineRepository.delete(pipeline);
    }

    /**
     * 获取流水线详情
     */
    @Transactional(readOnly = true)
    public PipelineResponse getPipeline(Long pipelineId) {
        Pipeline pipeline = pipelineRepository.findById(pipelineId)
            .orElseThrow(() -> new PipelineNotFoundException("Pipeline not found with id: " + pipelineId));
        
        return convertToResponse(pipeline);
    }

    /**
     * 获取项目的所有流水线
     */
    @Transactional(readOnly = true)
    public Page<PipelineResponse> getProjectPipelines(Long projectId, Pageable pageable) {
        Page<Pipeline> pipelines = pipelineRepository.findByProjectId(projectId, pageable);
        return pipelines.map(this::convertToResponse);
    }

    /**
     * 搜索流水线
     */
    @Transactional(readOnly = true)
    public Page<PipelineResponse> searchPipelines(String keyword, Long projectId, 
                                                 Pipeline.PipelineStatus status, Pageable pageable) {
        Page<Pipeline> pipelines = pipelineRepository.searchPipelines(keyword, projectId, status, pageable);
        return pipelines.map(this::convertToResponse);
    }

    /**
     * 执行流水线
     */
    public Long executePipeline(Long pipelineId, PipelineExecutionRequest request, Long userId) {
        Pipeline pipeline = pipelineRepository.findById(pipelineId)
            .orElseThrow(() -> new PipelineNotFoundException("Pipeline not found with id: " + pipelineId));

        // 检查流水线是否可以执行
        if (!pipeline.canExecute()) {
            throw new PipelineExecutionException("Pipeline is not in a state that allows execution");
        }

        // 获取最新的提交信息
        String commitHash = request.getCommitHash();
        String branch = request.getBranch() != null ? request.getBranch() : pipeline.getBranch();
        
        if (commitHash == null) {
            commitHash = gitService.getLatestCommitHash(pipeline.getRepository(), branch);
        }

        // 创建执行实例
        PipelineExecution execution = new PipelineExecution();
        execution.setPipeline(pipeline);
        execution.setTriggerType(request.getTriggerType());
        execution.setTriggeredBy(userId);
        execution.setBranch(branch);
        execution.setCommitHash(commitHash);
        
        // 获取提交信息
        try {
            execution.setCommitMessage(gitService.getCommitMessage(pipeline.getRepository(), commitHash));
            execution.setCommitAuthor(gitService.getCommitAuthor(pipeline.getRepository(), commitHash));
        } catch (Exception e) {
            System.err.println("Failed to get commit info: " + e.getMessage());
        }

        // 设置变量
        execution.setVariables(pipeline.getVariables());
        if (request.getVariables() != null) {
            execution.getVariables().putAll(request.getVariables());
        }

        // 生成执行编号
        execution.setExecutionNumber(generateExecutionNumber(pipeline));

        PipelineExecution savedExecution = executionRepository.save(execution);

        // 更新流水线的最后执行信息
        pipeline.setLastExecutionId(savedExecution.getId());
        pipeline.setLastExecutionTime(LocalDateTime.now());
        pipelineRepository.save(pipeline);

        // 异步启动执行
        executionService.startExecution(savedExecution.getId());

        return savedExecution.getId();
    }

    /**
     * 停止流水线执行
     */
    public void stopExecution(Long executionId, Long userId) {
        PipelineExecution execution = executionRepository.findById(executionId)
            .orElseThrow(() -> new PipelineExecutionException("Execution not found with id: " + executionId));

        if (!execution.isRunning()) {
            throw new PipelineExecutionException("Execution is not running");
        }

        executionService.stopExecution(executionId);
    }

    /**
     * 获取流水线统计信息
     */
    @Transactional(readOnly = true)
    public PipelineStatistics getPipelineStatistics(Long pipelineId) {
        Pipeline pipeline = pipelineRepository.findById(pipelineId)
            .orElseThrow(() -> new PipelineNotFoundException("Pipeline not found with id: " + pipelineId));

        List<PipelineExecution> recentExecutions = executionRepository
            .findTop30ByPipelineOrderByCreatedAtDesc(pipeline);

        PipelineStatistics stats = new PipelineStatistics();
        stats.setTotalExecutions(pipeline.getTotalExecutions());
        stats.setSuccessfulExecutions(pipeline.getSuccessfulExecutions());
        stats.setFailedExecutions(pipeline.getFailedExecutions());
        stats.setSuccessRate(pipeline.getSuccessRate());
        stats.setRecentExecutions(recentExecutions);

        return stats;
    }

    // 私有辅助方法

    /**
     * 检查用户是否可以修改流水线
     */
    private boolean canUserModifyPipeline(Pipeline pipeline, Long userId) {
        // TODO: 实现权限检查逻辑
        return true;
    }

    /**
     * 生成执行编号
     */
    private String generateExecutionNumber(Pipeline pipeline) {
        int nextNumber = pipeline.getTotalExecutions() + 1;
        return String.format("P%d-E%d", pipeline.getId(), nextNumber);
    }

    /**
     * 转换为响应对象
     */
    private PipelineResponse convertToResponse(Pipeline pipeline) {
        PipelineResponse response = new PipelineResponse();
        response.setId(pipeline.getId());
        response.setName(pipeline.getName());
        response.setDescription(pipeline.getDescription());
        response.setRepository(pipeline.getRepository());
        response.setBranch(pipeline.getBranch());
        response.setStatus(pipeline.getStatus());
        response.setProjectId(pipeline.getProjectId());
        response.setCreatedBy(pipeline.getCreatedBy());
        response.setTags(pipeline.getTags());
        response.setVariables(pipeline.getVariables());
        response.setTriggers(pipeline.getTriggers());
        response.setConfiguration(pipeline.getConfiguration());
        response.setTotalExecutions(pipeline.getTotalExecutions());
        response.setSuccessfulExecutions(pipeline.getSuccessfulExecutions());
        response.setFailedExecutions(pipeline.getFailedExecutions());
        response.setSuccessRate(pipeline.getSuccessRate());
        response.setLastExecutionId(pipeline.getLastExecutionId());
        response.setLastExecutionTime(pipeline.getLastExecutionTime());
        response.setCreatedAt(pipeline.getCreatedAt());
        response.setUpdatedAt(pipeline.getUpdatedAt());
        
        return response;
    }

    /**
     * 流水线统计信息类
     */
    public static class PipelineStatistics {
        private Integer totalExecutions;
        private Integer successfulExecutions;
        private Integer failedExecutions;
        private Double successRate;
        private List<PipelineExecution> recentExecutions;

        // Getters and Setters
        public Integer getTotalExecutions() {
            return totalExecutions;
        }

        public void setTotalExecutions(Integer totalExecutions) {
            this.totalExecutions = totalExecutions;
        }

        public Integer getSuccessfulExecutions() {
            return successfulExecutions;
        }

        public void setSuccessfulExecutions(Integer successfulExecutions) {
            this.successfulExecutions = successfulExecutions;
        }

        public Integer getFailedExecutions() {
            return failedExecutions;
        }

        public void setFailedExecutions(Integer failedExecutions) {
            this.failedExecutions = failedExecutions;
        }

        public Double getSuccessRate() {
            return successRate;
        }

        public void setSuccessRate(Double successRate) {
            this.successRate = successRate;
        }

        public List<PipelineExecution> getRecentExecutions() {
            return recentExecutions;
        }

        public void setRecentExecutions(List<PipelineExecution> recentExecutions) {
            this.recentExecutions = recentExecutions;
        }
    }
}