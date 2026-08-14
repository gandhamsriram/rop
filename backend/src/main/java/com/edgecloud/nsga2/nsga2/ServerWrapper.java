package com.edgecloud.nsga2.nsga2;

import com.edgecloud.nsga2.model.CloudServer;
import com.edgecloud.nsga2.model.EdgeServer;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServerWrapper {
    private String id;
    private String name;
    private String serverType; // "EDGE" or "CLOUD"
    private double cpu;
    private double ram;
    private double storage;
    private double bandwidth;
    private double unitCost;
    private double processingPower;
    private double idlePower;

    public ServerWrapper(EdgeServer edgeServer) {
        this.id = edgeServer.getId();
        this.name = edgeServer.getName();
        this.serverType = "EDGE";
        this.cpu = edgeServer.getCpu();
        this.ram = edgeServer.getRam();
        this.storage = edgeServer.getStorage();
        this.bandwidth = edgeServer.getBandwidth();
        this.unitCost = 0.02; // Fixed operational cost for edge
        this.processingPower = edgeServer.getProcessingPower();
        this.idlePower = edgeServer.getIdlePower();
    }

    public ServerWrapper(CloudServer cloudServer) {
        this.id = cloudServer.getId();
        this.name = cloudServer.getName();
        this.serverType = "CLOUD";
        this.cpu = cloudServer.getCpu();
        this.ram = cloudServer.getRam();
        this.storage = cloudServer.getStorage();
        this.bandwidth = cloudServer.getBandwidth();
        this.unitCost = cloudServer.getUnitCost();
        this.processingPower = cloudServer.getProcessingPower();
        this.idlePower = cloudServer.getIdlePower();
    }
}
