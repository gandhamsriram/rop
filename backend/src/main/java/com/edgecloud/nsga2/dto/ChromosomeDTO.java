package com.edgecloud.nsga2.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChromosomeDTO {
    private Map<String, String> taskAllocations; // TaskId -> ServerId
    private double latency;
    private double energy;
    private double cost;
    private double utilization;
    private int rank;
    private double crowdingDistance;
}
