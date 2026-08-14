package com.edgecloud.nsga2.nsga2;

import com.edgecloud.nsga2.model.Task;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Deterministic Multi-Objective Fitness Evaluator for Edge-Cloud Resource Allocation.
 * 
 * Objectives:
 * 1. Minimize Total Latency (ms): Sum of Transmission Latency + Execution Latency.
 * 2. Minimize Total Energy (Joules): Sum of Data Transmission Energy + Server Processing Energy.
 * 3. Minimize Total Cost ($): Sum of Cloud Compute Unit Costs + Storage Overhead Costs.
 * 4. Maximize Resource Utilization (%): Average ratio of allocated resource load to server capacity.
 */
@Component
public class FitnessEvaluator {

    public void evaluate(Chromosome chromosome, List<Task> tasks, List<ServerWrapper> servers) {
        int n = tasks.size();
        int m = servers.size();

        double totalLatency = 0.0;
        double totalEnergy = 0.0;
        double totalCost = 0.0;

        double[] serverCpuLoad = new double[m];
        double[] serverRamLoad = new double[m];
        double[] serverStorageLoad = new double[m];

        for (int i = 0; i < n; i++) {
            Task task = tasks.get(i);
            int serverIdx = chromosome.getGenes()[i];
            ServerWrapper server = servers.get(serverIdx);

            // 1. LATENCY FORMULA
            // Transmission Latency L_trans = (taskSize [MB] * 8 Bits/Byte) / Bandwidth [Mbps] * 1000 ms/s
            double transmissionLatency = (task.getTaskSize() * 8.0) / Math.max(server.getBandwidth(), 1.0) * 1000.0;
            // WAN Latency penalty for Cloud servers (e.g. baseline network delay 25ms)
            if ("CLOUD".equalsIgnoreCase(server.getServerType())) {
                transmissionLatency += 25.0;
            }

            // Execution Latency L_exec = (cpuRequirement / serverCpu) * 100 ms
            double executionLatency = (task.getCpuRequirement() / Math.max(server.getCpu(), 0.1)) * 100.0;
            double taskLatency = transmissionLatency + executionLatency;
            totalLatency += taskLatency;

            // Deadline violation penalty
            if (task.getDeadline() > 0 && taskLatency > task.getDeadline()) {
                totalLatency += (taskLatency - task.getDeadline()) * 2.0;
            }

            // 2. ENERGY FORMULA
            // Transmission Power: Edge = 1.5W, Cloud WAN = 5.0W
            double transPower = "CLOUD".equalsIgnoreCase(server.getServerType()) ? 5.0 : 1.5;
            double transmissionEnergy = (transPower * (transmissionLatency / 1000.0)); // Joules = Watts * Seconds
            double executionEnergy = (server.getProcessingPower() * (executionLatency / 1000.0)); // Joules
            double taskEnergy = transmissionEnergy + executionEnergy;
            totalEnergy += taskEnergy;

            // 3. COST FORMULA
            // Compute Cost = unitCost * executionLatency (in hours)
            double computeCost = server.getUnitCost() * (executionLatency / 3600000.0);
            double storageCost = 0.001 * task.getStorageRequirement();
            double taskCost = computeCost + storageCost;
            totalCost += taskCost;

            // Accumulate load for server capacity tracking
            serverCpuLoad[serverIdx] += task.getCpuRequirement();
            serverRamLoad[serverIdx] += task.getRamRequirement();
            serverStorageLoad[serverIdx] += task.getStorageRequirement();
        }

        // 4. RESOURCE UTILIZATION & OVERLOAD PENALTY
        double totalUtilizationRatio = 0.0;
        int activeServers = 0;
        double overloadPenalty = 0.0;

        for (int j = 0; j < m; j++) {
            ServerWrapper server = servers.get(j);
            if (serverCpuLoad[j] > 0 || serverRamLoad[j] > 0) {
                activeServers++;
                double cpuUtil = serverCpuLoad[j] / Math.max(server.getCpu() * 10.0, 1.0);
                double ramUtil = serverRamLoad[j] / Math.max(server.getRam(), 1.0);
                double storageUtil = serverStorageLoad[j] / Math.max(server.getStorage(), 1.0);

                double avgServerUtil = (cpuUtil + ramUtil + storageUtil) / 3.0;
                totalUtilizationRatio += Math.min(avgServerUtil, 1.0);

                // Capacity Overload Penalty
                if (ramUtil > 1.0) overloadPenalty += (ramUtil - 1.0) * 1000.0;
                if (storageUtil > 1.0) overloadPenalty += (storageUtil - 1.0) * 1000.0;
            }
        }

        double overallAvgUtilization = activeServers > 0 ? (totalUtilizationRatio / activeServers) * 100.0 : 0.0;

        // Set final objective values
        chromosome.setTotalLatency(totalLatency + overloadPenalty);
        chromosome.setTotalEnergy(totalEnergy + overloadPenalty * 0.5);
        chromosome.setTotalCost(totalCost + overloadPenalty * 0.1);
        chromosome.setAverageUtilization(overallAvgUtilization);
    }

    public TaskMetrics calculateTaskMetrics(Task task, ServerWrapper server) {
        double transmissionLatency = (task.getTaskSize() * 8.0) / Math.max(server.getBandwidth(), 1.0) * 1000.0;
        if ("CLOUD".equalsIgnoreCase(server.getServerType())) {
            transmissionLatency += 25.0;
        }
        double executionLatency = (task.getCpuRequirement() / Math.max(server.getCpu(), 0.1)) * 100.0;
        double taskLatency = transmissionLatency + executionLatency;
        if (task.getDeadline() > 0 && taskLatency > task.getDeadline()) {
            taskLatency += (taskLatency - task.getDeadline()) * 2.0;
        }

        double transPower = "CLOUD".equalsIgnoreCase(server.getServerType()) ? 5.0 : 1.5;
        double transmissionEnergy = (transPower * (transmissionLatency / 1000.0));
        double executionEnergy = (server.getProcessingPower() * (executionLatency / 1000.0));
        double taskEnergy = transmissionEnergy + executionEnergy;

        double computeCost = server.getUnitCost() * (executionLatency / 3600000.0);
        double storageCost = 0.001 * task.getStorageRequirement();
        double taskCost = computeCost + storageCost;

        return new TaskMetrics(taskLatency, taskEnergy, taskCost);
    }

    public record TaskMetrics(double latency, double energy, double cost) {}
}

