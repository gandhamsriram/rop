package com.edgecloud.nsga2.dto;

import com.edgecloud.nsga2.model.AllocationResult;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleResponse {
    private String algorithm;
    private List<AllocationResult> results;
    private long executionTimeMs;
    private double totalLatency;
    private double totalEnergy;
    private double totalCost;
    private double averageUtilization;
    private List<ChromosomeDTO> paretoFront;
}
