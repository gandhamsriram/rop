package com.edgecloud.nsga2.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlgorithmMetricDTO {
    private String algorithmKey;
    private String algorithmName;
    private double hypervolume;
    private double spacing;
    private long executionTimeMs;
    private double avgLatency;
    private double avgEnergy;
    private double avgCost;
    private double avgUtilization;
    private int solutionCount;
}
