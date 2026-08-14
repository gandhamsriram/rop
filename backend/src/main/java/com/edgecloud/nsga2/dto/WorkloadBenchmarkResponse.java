package com.edgecloud.nsga2.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkloadBenchmarkResponse {
    private List<WorkloadMetricDTO> workloads;
    private long totalDurationMs;
}
