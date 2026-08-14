package com.edgecloud.nsga2.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkloadMetricDTO {
    private String workloadName; // "LOW (50)", "MEDIUM (500)", "HIGH (5000)"
    private int taskCount;
    private List<AlgorithmMetricDTO> algorithmMetrics;
}
