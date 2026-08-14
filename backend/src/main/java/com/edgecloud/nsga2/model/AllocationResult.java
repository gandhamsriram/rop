package com.edgecloud.nsga2.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "allocation_results")
public class AllocationResult {
    @Id
    private String id;
    private String taskId;
    private String allocatedServerId;
    private String allocatedServerName;
    private String serverType; // "EDGE" or "CLOUD"
    private double latency;    // Latency in ms
    private double energy;     // Energy consumption in Joules
    private double cost;       // Cost in monetary units ($)
    private double executionTime;
    private long timestamp = System.currentTimeMillis();
}
