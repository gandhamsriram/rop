package com.edgecloud.nsga2.service;

import com.edgecloud.nsga2.baseline.RandomScheduler;
import com.edgecloud.nsga2.baseline.RoundRobinScheduler;
import com.edgecloud.nsga2.baseline.WeightedSumScheduler;
import com.edgecloud.nsga2.dto.*;
import com.edgecloud.nsga2.metrics.HypervolumeCalculator;
import com.edgecloud.nsga2.metrics.SpacingCalculator;
import com.edgecloud.nsga2.model.Task;
import com.edgecloud.nsga2.nsga2.Chromosome;
import com.edgecloud.nsga2.nsga2.FitnessEvaluator;
import com.edgecloud.nsga2.nsga2.NSGA2Optimizer;
import com.edgecloud.nsga2.nsga2.ServerWrapper;
import com.edgecloud.nsga2.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final TaskRepository taskRepository;
    private final SchedulerService schedulerService;

    private final TaskService taskService;
    private final FitnessEvaluator fitnessEvaluator;
    private final NSGA2Optimizer nsga2Optimizer;
    private final RandomScheduler randomScheduler;
    private final RoundRobinScheduler roundRobinScheduler;
    private final WeightedSumScheduler weightedSumScheduler;
    private final HypervolumeCalculator hypervolumeCalculator;
    private final SpacingCalculator spacingCalculator;

    public ComparisonResponse runComparison(ScheduleRequest request) {
        List<Task> tasks = taskService.getAllTasks();
        List<ServerWrapper> servers = schedulerService.getCombinedServers();

        long startBench = System.currentTimeMillis();
        List<AlgorithmMetricDTO> metricsList = new ArrayList<>();

        // 1. Run NSGA-II
        long t0 = System.currentTimeMillis();
        List<Chromosome> nsgaParetoFront = nsga2Optimizer.runOptimization(
                tasks, servers, request.getPopSize(), request.getGenerations(),
                request.getCrossoverRate(), request.getMutationRate(), request.getSeed()
        );
        long nsgaTime = System.currentTimeMillis() - t0;

        Chromosome nsgaKnee = nsga2Optimizer.getKneePointSelector().selectKneePoint(nsgaParetoFront);

        // Dynamic Reference Point for HV calculation
        double maxLat = nsgaParetoFront.stream().mapToDouble(Chromosome::getTotalLatency).max().orElse(10000.0) * 1.5;
        double maxEng = nsgaParetoFront.stream().mapToDouble(Chromosome::getTotalEnergy).max().orElse(10000.0) * 1.5;
        double maxCost = nsgaParetoFront.stream().mapToDouble(Chromosome::getTotalCost).max().orElse(1000.0) * 1.5;

        double nsgaHv = hypervolumeCalculator.calculateHypervolume(nsgaParetoFront, maxLat, maxEng, maxCost);
        double nsgaSp = spacingCalculator.calculateSpacing(nsgaParetoFront);

        metricsList.add(new AlgorithmMetricDTO(
                "NSGA_II", "NSGA-II (Pareto Optimal)", nsgaHv, nsgaSp, nsgaTime,
                nsgaKnee != null ? nsgaKnee.getTotalLatency() / tasks.size() : 0.0,
                nsgaKnee != null ? nsgaKnee.getTotalEnergy() / tasks.size() : 0.0,
                nsgaKnee != null ? nsgaKnee.getTotalCost() / tasks.size() : 0.0,
                nsgaKnee != null ? nsgaKnee.getAverageUtilization() : 0.0,
                nsgaParetoFront.size()
        ));

        // 2. Run Random Baseline
        t0 = System.currentTimeMillis();
        Chromosome randomSolution = randomScheduler.schedule(tasks, servers, fitnessEvaluator, request);
        long randomTime = System.currentTimeMillis() - t0;
        List<Chromosome> randomFront = List.of(randomSolution);

        metricsList.add(new AlgorithmMetricDTO(
                "RANDOM", "Random Allocation",
                hypervolumeCalculator.calculateHypervolume(randomFront, maxLat, maxEng, maxCost),
                0.0, randomTime,
                randomSolution.getTotalLatency() / tasks.size(),
                randomSolution.getTotalEnergy() / tasks.size(),
                randomSolution.getTotalCost() / tasks.size(),
                randomSolution.getAverageUtilization(),
                1
        ));

        // 3. Run Round Robin Baseline
        t0 = System.currentTimeMillis();
        Chromosome rrSolution = roundRobinScheduler.schedule(tasks, servers, fitnessEvaluator, request);
        long rrTime = System.currentTimeMillis() - t0;
        List<Chromosome> rrFront = List.of(rrSolution);

        metricsList.add(new AlgorithmMetricDTO(
                "ROUND_ROBIN", "Round Robin",
                hypervolumeCalculator.calculateHypervolume(rrFront, maxLat, maxEng, maxCost),
                0.0, rrTime,
                rrSolution.getTotalLatency() / tasks.size(),
                rrSolution.getTotalEnergy() / tasks.size(),
                rrSolution.getTotalCost() / tasks.size(),
                rrSolution.getAverageUtilization(),
                1
        ));

        // 4. Run Weighted Sum Baseline
        t0 = System.currentTimeMillis();
        Chromosome wsSolution = weightedSumScheduler.schedule(tasks, servers, fitnessEvaluator, request);
        long wsTime = System.currentTimeMillis() - t0;
        List<Chromosome> wsFront = List.of(wsSolution);

        metricsList.add(new AlgorithmMetricDTO(
                "WEIGHTED_SUM", "Weighted Sum (Single Obj)",
                hypervolumeCalculator.calculateHypervolume(wsFront, maxLat, maxEng, maxCost),
                0.0, wsTime,
                wsSolution.getTotalLatency() / tasks.size(),
                wsSolution.getTotalEnergy() / tasks.size(),
                wsSolution.getTotalCost() / tasks.size(),
                wsSolution.getAverageUtilization(),
                1
        ));

        long totalBenchTime = System.currentTimeMillis() - startBench;
        return new ComparisonResponse(metricsList, totalBenchTime, tasks.size(), servers.size());
    }

    public WorkloadBenchmarkResponse runWorkloadBenchmark() {
        List<Task> originalTasks = new ArrayList<>(taskService.getAllTasks());
        long startAll = System.currentTimeMillis();
        List<WorkloadMetricDTO> workloads = new ArrayList<>();

        List<String> presets = Arrays.asList("LOW", "MEDIUM", "HIGH");

        try {
            for (String preset : presets) {
                TaskGenerationRequest genReq = new TaskGenerationRequest(50, preset);
                List<Task> workloadTasks = taskService.generateTasks(genReq);

                ScheduleRequest req = new ScheduleRequest("NSGA_II", 50, 50, 0.85, 0.05, 0.4, 0.3, 0.3, 42L);
                ComparisonResponse comp = runComparison(req);

                workloads.add(new WorkloadMetricDTO(
                        preset + " (" + workloadTasks.size() + " tasks)",
                        workloadTasks.size(),
                        comp.getMetrics()
                ));
            }
        } finally {
            if (!originalTasks.isEmpty()) {
                taskService.clearAllTasks();
                taskService.getAllTasks(); // Ensure state
                taskRepository.saveAll(originalTasks);
            }
        }

        long duration = System.currentTimeMillis() - startAll;
        return new WorkloadBenchmarkResponse(workloads, duration);
    }

}
