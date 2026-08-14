package com.edgecloud.nsga2.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComparisonResponse {
    private List<AlgorithmMetricDTO> metrics;
    private long totalBenchmarkTimeMs;
    private int taskCount;
    private int serverCount;
}
