package com.edgecloud.nsga2.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tasks")
public class Task {
    @Id
    private String id;
    private String taskId;
    private double cpuRequirement;     // Required compute instructions / cycles
    private double ramRequirement;     // Required RAM in GB
    private double storageRequirement; // Required Storage in GB
    private double taskSize;           // Input data payload in MB
    private double deadline;           // Maximum allowed response time in ms
    private int priority;              // Priority rank 1 (lowest) to 5 (highest)
    private double executionTime;      // Benchmark base execution time
}
