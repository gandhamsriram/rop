package com.edgecloud.nsga2.service;

import com.edgecloud.nsga2.baseline.RandomScheduler;
import com.edgecloud.nsga2.baseline.RoundRobinScheduler;
import com.edgecloud.nsga2.baseline.WeightedSumScheduler;
import com.edgecloud.nsga2.dto.ChromosomeDTO;
import com.edgecloud.nsga2.dto.ScheduleRequest;
import com.edgecloud.nsga2.dto.ScheduleResponse;
import com.edgecloud.nsga2.model.AllocationResult;
import com.edgecloud.nsga2.model.Task;
import com.edgecloud.nsga2.nsga2.Chromosome;
import com.edgecloud.nsga2.nsga2.FitnessEvaluator;
import com.edgecloud.nsga2.nsga2.NSGA2Optimizer;
import com.edgecloud.nsga2.nsga2.ServerWrapper;
import com.edgecloud.nsga2.repository.AllocationResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SchedulerService {

    private final EdgeServerService edgeServerService;
    private final CloudServerService cloudServerService;
    private final TaskService taskService;
    private final FitnessEvaluator fitnessEvaluator;
    private final NSGA2Optimizer nsga2Optimizer;
    private final RandomScheduler randomScheduler;
    private final RoundRobinScheduler roundRobinScheduler;
    private final WeightedSumScheduler weightedSumScheduler;
    private final AllocationResultRepository allocationResultRepository;

    public ScheduleResponse runSchedule(ScheduleRequest request) {
        List<Task> tasks = taskService.getAllTasks();
        List<ServerWrapper> servers = getCombinedServers();

        if (tasks.isEmpty() || servers.isEmpty()) {
            throw new IllegalStateException("Tasks or Servers database is empty. Please generate tasks/servers first.");
        }

        long startTime = System.currentTimeMillis();
        List<Chromosome> paretoFront = new ArrayList<>();
        Chromosome recommendedSolution = null;

        String algo = request.getAlgorithm() != null ? request.getAlgorithm().toUpperCase() : "NSGA_II";

        switch (algo) {
            case "RANDOM":
                recommendedSolution = randomScheduler.schedule(tasks, servers, fitnessEvaluator, request);
                paretoFront.add(recommendedSolution);
                break;
            case "ROUND_ROBIN":
                recommendedSolution = roundRobinScheduler.schedule(tasks, servers, fitnessEvaluator, request);
                paretoFront.add(recommendedSolution);
                break;
            case "WEIGHTED_SUM":
                recommendedSolution = weightedSumScheduler.schedule(tasks, servers, fitnessEvaluator, request);
                paretoFront.add(recommendedSolution);
                break;
            case "NSGA_II":
            default:
                paretoFront = nsga2Optimizer.runOptimization(
                        tasks,
                        servers,
                        request.getPopSize(),
                        request.getGenerations(),
                        request.getCrossoverRate(),
                        request.getMutationRate(),
                        request.getSeed()
                );
                recommendedSolution = nsga2Optimizer.getKneePointSelector().selectKneePoint(paretoFront);
                break;
        }

        long executionTimeMs = System.currentTimeMillis() - startTime;

        if (recommendedSolution == null) {
            throw new RuntimeException("Optimization failed to produce a valid solution.");
        }

        // Map recommended solution to AllocationResult records and persist
        allocationResultRepository.deleteAll();
        List<AllocationResult> results = new ArrayList<>();
        int taskCount = tasks.size();

        for (int i = 0; i < taskCount; i++) {
            Task task = tasks.get(i);
            int serverIdx = recommendedSolution.getGenes()[i];
            ServerWrapper server = servers.get(serverIdx);
            FitnessEvaluator.TaskMetrics tm = fitnessEvaluator.calculateTaskMetrics(task, server);

            AllocationResult result = new AllocationResult(
                    null,
                    task.getTaskId(),
                    server.getId(),
                    server.getName(),
                    server.getServerType(),
                    tm.latency(),
                    tm.energy(),
                    tm.cost(),
                    executionTimeMs,
                    System.currentTimeMillis()
            );
            results.add(result);
        }


        allocationResultRepository.saveAll(results);

        // Convert Pareto Front to DTOs
        List<ChromosomeDTO> paretoDTOs = new ArrayList<>();
        for (Chromosome c : paretoFront) {
            Map<String, String> allocations = new HashMap<>();
            for (int i = 0; i < taskCount; i++) {
                allocations.put(tasks.get(i).getTaskId(), servers.get(c.getGenes()[i]).getName());
            }
            paretoDTOs.add(new ChromosomeDTO(
                    allocations,
                    c.getTotalLatency(),
                    c.getTotalEnergy(),
                    c.getTotalCost(),
                    c.getAverageUtilization(),
                    c.getRank(),
                    c.getCrowdingDistance()
            ));
        }

        return new ScheduleResponse(
                algo,
                results,
                executionTimeMs,
                recommendedSolution.getTotalLatency(),
                recommendedSolution.getTotalEnergy(),
                recommendedSolution.getTotalCost(),
                recommendedSolution.getAverageUtilization(),
                paretoDTOs
        );
    }

    public List<AllocationResult> getLatestResults() {
        return allocationResultRepository.findAll();
    }

    public List<ServerWrapper> getCombinedServers() {
        List<ServerWrapper> combined = new ArrayList<>();
        edgeServerService.getAllEdgeServers().forEach(es -> combined.add(new ServerWrapper(es)));
        cloudServerService.getAllCloudServers().forEach(cs -> combined.add(new ServerWrapper(cs)));
        return combined;
    }
}
