package com.edgecloud.nsga2.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "cloud_servers")
public class CloudServer {
    @Id
    private String id;
    private String name;
    private double cpu;         // High-performance compute speed
    private double ram;         // Capacity in GB
    private double storage;     // Capacity in GB
    private double bandwidth;   // WAN Transfer rate in Mbps
    private double unitCost;    // Pay-per-use cost per compute unit
    private double processingPower = 120.0; // Watts during execution
    private double idlePower = 35.0;        // Watts when idle
}
