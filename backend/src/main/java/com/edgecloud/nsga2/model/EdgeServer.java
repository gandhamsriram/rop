package com.edgecloud.nsga2.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "edge_servers")
public class EdgeServer {
    @Id
    private String id;
    private String name;
    private double cpu;         // Processing speed (e.g. GHz / ops unit)
    private double ram;         // Capacity in GB
    private double storage;     // Capacity in GB
    private double bandwidth;   // Transfer rate in Mbps
    private double processingPower = 25.0; // Watts during execution
    private double idlePower = 5.0;        // Watts when idle
}
