package com.edgecloud.nsga2.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleRequest {
    private String algorithm = "NSGA_II"; // "NSGA_II", "RANDOM", "ROUND_ROBIN", "WEIGHTED_SUM"
    private int popSize = 100;
    private int generations = 150;
    private double crossoverRate = 0.85;
    private double mutationRate = 0.05;
    private double weightLatency = 0.4;
    private double weightEnergy = 0.3;
    private double weightCost = 0.3;
    private Long seed = 42L;
}
