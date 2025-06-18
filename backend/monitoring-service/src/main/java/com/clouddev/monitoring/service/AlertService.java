package com.clouddev.monitoring.service;

import com.clouddev.monitoring.entity.Alert;
import com.clouddev.monitoring.entity.AlertRule;
import com.clouddev.monitoring.entity.MetricData;
import com.clouddev.monitoring.repository.AlertRepository;
import com.clouddev.monitoring.repository.AlertRuleRepository;
import com.clouddev.monitoring.dto.AlertCreateRequest;
import com.clouddev.monitoring.dto.AlertResponse;
import com.clouddev.monitoring.exception.AlertNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 告警服务类
 * 提供告警规则管理和告警处理
 */
@Service
@Transactional
public class AlertService {

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private AlertRuleRepository alertRuleRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private MetricService metricService;

    // 缓存活跃的告警规则
    private final Map<String, AlertRule> activeRulesCache = new ConcurrentHashMap<>();

    /**
     * 创建告警
     */
    public AlertResponse createAlert(AlertCreateRequest request) {
        Alert alert = new Alert();
        alert.setTitle(request.getTitle());
        alert.setDescription(request.getDescription());
        alert.setLevel(request.getLevel());
        alert.setService(request.getService());
        alert.setTags(request.getTags());
        alert.setMetadata(request.getMetadata());
        alert.setStatus(Alert.AlertStatus.ACTIVE);
        
        // 设置告警来源
        if (request.getRuleId() != null) {
            AlertRule rule = alertRuleRepository.findById(request.getRuleId())
                .orElseThrow(() -> new IllegalArgumentException("Alert rule not found"));
            alert.setRule(rule);
        }

        Alert savedAlert = alertRepository.save(alert);
        
        // 发送通知
        notificationService.sendAlertNotification(savedAlert);
        
        return convertToResponse(savedAlert);
    }

    /**
     * 评估告警规则
     */
    public void evaluateAlertRules() {
        List<AlertRule> activeRules = alertRuleRepository.findByEnabledTrue();
        
        for (AlertRule rule : activeRules) {
            try {
                evaluateRule(rule);
            } catch (Exception e) {
                // 记录错误但不中断其他规则的评估
                System.err.println("Error evaluating alert rule " + rule.getId() + ": " + e.getMessage());
            }
        }
    }

    /**
     * 评估单个告警规则
     */
    private void evaluateRule(AlertRule rule) {
        // 获取指标数据
        List<MetricData> metrics = metricService.getMetricData(
            rule.getMetricName(),
            rule.getTimeWindow()
        );

        if (metrics.isEmpty()) {
            return;
        }

        // 计算聚合值
        double value = calculateAggregatedValue(metrics, rule.getAggregationType());
        
        // 检查是否满足告警条件
        boolean shouldAlert = evaluateCondition(value, rule.getOperator(), rule.getThreshold());
        
        if (shouldAlert) {
            // 检查是否已存在相同的活跃告警
            boolean existingAlert = alertRepository.existsByRuleAndStatusAndCreatedAtAfter(
                rule, 
                Alert.AlertStatus.ACTIVE,
                LocalDateTime.now().minus(rule.getCooldown())
            );
            
            if (!existingAlert) {
                createAlertFromRule(rule, value);
            }
        } else {
            // 检查是否需要解决现有告警
            List<Alert> activeAlerts = alertRepository.findByRuleAndStatus(
                rule, 
                Alert.AlertStatus.ACTIVE
            );
            
            for (Alert alert : activeAlerts) {
                resolveAlert(alert.getId(), "Condition no longer met");
            }
        }
    }

    /**
     * 计算聚合值
     */
    private double calculateAggregatedValue(List<MetricData> metrics, AlertRule.AggregationType type) {
        switch (type) {
            case AVG:
                return metrics.stream().mapToDouble(MetricData::getValue).average().orElse(0.0);
            case MAX:
                return metrics.stream().mapToDouble(MetricData::getValue).max().orElse(0.0);
            case MIN:
                return metrics.stream().mapToDouble(MetricData::getValue).min().orElse(0.0);
            case SUM:
                return metrics.stream().mapToDouble(MetricData::getValue).sum();
            case COUNT:
                return metrics.size();
            default:
                return 0.0;
        }
    }

    /**
     * 评估告警条件
     */
    private boolean evaluateCondition(double value, AlertRule.Operator operator, double threshold) {
        switch (operator) {
            case GT:
                return value > threshold;
            case GTE:
                return value >= threshold;
            case LT:
                return value < threshold;
            case LTE:
                return value <= threshold;
            case EQ:
                return Math.abs(value - threshold) < 0.001; // 浮点数比较
            case NEQ:
                return Math.abs(value - threshold) >= 0.001;
            default:
                return false;
        }
    }

    /**
     * 从规则创建告警
     */
    private void createAlertFromRule(AlertRule rule, double actualValue) {
        Alert alert = new Alert();
        alert.setTitle(rule.getName());
        alert.setDescription(String.format(
            "Alert triggered: %s %s %.2f (actual: %.2f)",
            rule.getMetricName(),
            rule.getOperator().name(),
            rule.getThreshold(),
            actualValue
        ));
        alert.setLevel(rule.getSeverity());
        alert.setService(extractServiceFromMetric(rule.getMetricName()));
        alert.setRule(rule);
        alert.setStatus(Alert.AlertStatus.ACTIVE);
        
        // 添加元数据
        Map<String, Object> metadata = new ConcurrentHashMap<>();
        metadata.put("metric_name", rule.getMetricName());
        metadata.put("threshold", rule.getThreshold());
        metadata.put("actual_value", actualValue);
        metadata.put("operator", rule.getOperator().name());
        alert.setMetadata(metadata);

        Alert savedAlert = alertRepository.save(alert);
        
        // 发送通知
        notificationService.sendAlertNotification(savedAlert);
    }

    /**
     * 确认告警
     */
    public AlertResponse acknowledgeAlert(Long alertId, String acknowledgedBy, String note) {
        Alert alert = alertRepository.findById(alertId)
            .orElseThrow(() -> new AlertNotFoundException("Alert not found with id: " + alertId));

        alert.acknowledge(acknowledgedBy, note);
        Alert savedAlert = alertRepository.save(alert);
        
        return convertToResponse(savedAlert);
    }

    /**
     * 解决告警
     */
    public AlertResponse resolveAlert(Long alertId, String resolution) {
        Alert alert = alertRepository.findById(alertId)
            .orElseThrow(() -> new AlertNotFoundException("Alert not found with id: " + alertId));

        alert.resolve(resolution);
        Alert savedAlert = alertRepository.save(alert);
        
        return convertToResponse(savedAlert);
    }

    /**
     * 获取告警列表
     */
    @Transactional(readOnly = true)
    public Page<AlertResponse> getAlerts(Alert.AlertStatus status, Alert.AlertLevel level, 
                                        String service, Pageable pageable) {
        Page<Alert> alerts;
        
        if (status != null || level != null || service != null) {
            alerts = alertRepository.findByFilters(status, level, service, pageable);
        } else {
            alerts = alertRepository.findAll(pageable);
        }
        
        return alerts.map(this::convertToResponse);
    }

    /**
     * 获取告警详情
     */
    @Transactional(readOnly = true)
    public AlertResponse getAlert(Long alertId) {
        Alert alert = alertRepository.findById(alertId)
            .orElseThrow(() -> new AlertNotFoundException("Alert not found with id: " + alertId));
        
        return convertToResponse(alert);
    }

    /**
     * 获取告警统计
     */
    @Transactional(readOnly = true)
    public AlertStatistics getAlertStatistics() {
        AlertStatistics stats = new AlertStatistics();
        
        // 活跃告警数量
        stats.setActiveAlerts(alertRepository.countByStatus(Alert.AlertStatus.ACTIVE));
        
        // 按级别统计
        stats.setCriticalAlerts(alertRepository.countByStatusAndLevel(
            Alert.AlertStatus.ACTIVE, Alert.AlertLevel.CRITICAL));
        stats.setWarningAlerts(alertRepository.countByStatusAndLevel(
            Alert.AlertStatus.ACTIVE, Alert.AlertLevel.WARNING));
        stats.setInfoAlerts(alertRepository.countByStatusAndLevel(
            Alert.AlertStatus.ACTIVE, Alert.AlertLevel.INFO));
        
        // 今日告警数量
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        stats.setTodayAlerts(alertRepository.countByCreatedAtAfter(startOfDay));
        
        // 平均解决时间（分钟）
        Double avgResolutionTime = alertRepository.getAverageResolutionTimeInMinutes();
        stats.setAverageResolutionTimeMinutes(avgResolutionTime != null ? avgResolutionTime : 0.0);
        
        return stats;
    }

    /**
     * 批量操作告警
     */
    public void batchUpdateAlerts(List<Long> alertIds, Alert.AlertStatus newStatus, 
                                 String note, String operatedBy) {
        List<Alert> alerts = alertRepository.findAllById(alertIds);
        
        for (Alert alert : alerts) {
            switch (newStatus) {
                case ACKNOWLEDGED:
                    alert.acknowledge(operatedBy, note);
                    break;
                case RESOLVED:
                    alert.resolve(note);
                    break;
            }
        }
        
        alertRepository.saveAll(alerts);
    }

    /**
     * 清理过期告警
     */
    public void cleanupExpiredAlerts() {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30); // 保留30天
        
        List<Alert> expiredAlerts = alertRepository.findByStatusAndCreatedAtBefore(
            Alert.AlertStatus.RESOLVED, cutoffDate);
        
        alertRepository.deleteAll(expiredAlerts);
    }

    // 私有辅助方法

    /**
     * 从指标名称提取服务名
     */
    private String extractServiceFromMetric(String metricName) {
        if (metricName.contains(".")) {
            return metricName.split("\\.")[0];
        }
        return "unknown";
    }

    /**
     * 转换为响应对象
     */
    private AlertResponse convertToResponse(Alert alert) {
        AlertResponse response = new AlertResponse();
        response.setId(alert.getId());
        response.setTitle(alert.getTitle());
        response.setDescription(alert.getDescription());
        response.setLevel(alert.getLevel());
        response.setService(alert.getService());
        response.setStatus(alert.getStatus());
        response.setTags(alert.getTags());
        response.setMetadata(alert.getMetadata());
        response.setAcknowledgedBy(alert.getAcknowledgedBy());
        response.setAcknowledgedAt(alert.getAcknowledgedAt());
        response.setAcknowledgmentNote(alert.getAcknowledgmentNote());
        response.setResolvedAt(alert.getResolvedAt());
        response.setResolution(alert.getResolution());
        response.setCreatedAt(alert.getCreatedAt());
        response.setUpdatedAt(alert.getUpdatedAt());
        
        if (alert.getRule() != null) {
            response.setRuleId(alert.getRule().getId());
            response.setRuleName(alert.getRule().getName());
        }
        
        return response;
    }

    /**
     * 告警统计信息类
     */
    public static class AlertStatistics {
        private Long activeAlerts;
        private Long criticalAlerts;
        private Long warningAlerts;
        private Long infoAlerts;
        private Long todayAlerts;
        private Double averageResolutionTimeMinutes;

        // Getters and Setters
        public Long getActiveAlerts() {
            return activeAlerts;
        }

        public void setActiveAlerts(Long activeAlerts) {
            this.activeAlerts = activeAlerts;
        }

        public Long getCriticalAlerts() {
            return criticalAlerts;
        }

        public void setCriticalAlerts(Long criticalAlerts) {
            this.criticalAlerts = criticalAlerts;
        }

        public Long getWarningAlerts() {
            return warningAlerts;
        }

        public void setWarningAlerts(Long warningAlerts) {
            this.warningAlerts = warningAlerts;
        }

        public Long getInfoAlerts() {
            return infoAlerts;
        }

        public void setInfoAlerts(Long infoAlerts) {
            this.infoAlerts = infoAlerts;
        }

        public Long getTodayAlerts() {
            return todayAlerts;
        }

        public void setTodayAlerts(Long todayAlerts) {
            this.todayAlerts = todayAlerts;
        }

        public Double getAverageResolutionTimeMinutes() {
            return averageResolutionTimeMinutes;
        }

        public void setAverageResolutionTimeMinutes(Double averageResolutionTimeMinutes) {
            this.averageResolutionTimeMinutes = averageResolutionTimeMinutes;
        }
    }
}