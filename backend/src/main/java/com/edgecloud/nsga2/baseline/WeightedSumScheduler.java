package com.edgecloud.nsga2.baseline;

import com.edgecloud.nsga2.dto.ScheduleRequest;
import com.edgecloud.nsga2.model.Task;
import com.edgecloud.nsga2.nsga2.Chromosome;
import com.edgecloud.nsga2.nsga2.FitnessEvaluator;
import com.edgecloud.nsga2.nsga2.ServerWrapper;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Traditional Weighted Sum Single-Objective Scheduler.
 * Combines objectives into a scalar fitness = W_L * Latency + W_E * Energy + W_C * Cost.
 */
@Component
public class WeightedSumScheduler implements BaselineScheduler {

    @Override
    public Chromosome schedule(List<Task> tasks, List<ServerWrapper> servers, FitnessEvaluator fitnessEvaluator, ScheduleRequest request) {
        Random random = request.getSeed() != null ? new Random(request.getSeed()) : new Random();
        int taskCount = tasks.size();
        int serverCount = servers.size();
        int popSize = Math.max(request.getPopSize(), 50);
        int generations = Math.max(request.getGenerations(), 100);

        double wL = request.getWeightLatency();
        double wE = request.getWeightEnergy();
        double wC = request.getWeightCost();

        List<Chromosome> pop = new ArrayList<>();
        for (int i = 0; i < popSize; i++) {
            Chromosome c = new Chromosome(taskCount);
            for (int t = 0; t < taskCount; t++) {
                c.getGenes()[t] = random.nextInt(serverCount);
            }
            fitnessEvaluator.evaluate(c, tasks, servers);
            pop.add(c);
        }

        Chromosome best = pop.get(0);
        double bestFitness = computeScalarFitness(best, wL, wE, wC);

        for (int gen = 0; gen < generations; gen++) {
            List<Chromosome> nextPop = new ArrayList<>();
            while (nextPop.size() < popSize) {
                Chromosome p1 = pop.get(random.nextInt(popSize));
                Chromosome p2 = pop.get(random.nextInt(popSize));

                Chromosome child = p1.copy();
                // Discrete Crossover & Mutation
                int cut = random.nextInt(taskCount);
                for (int t = cut; t < taskCount; t++) {
                    child.getGenes()[t] = p2.getGenes()[t];
                }
                for (int t = 0; t < taskCount; t++) {
                    if (random.nextDouble() < request.getMutationRate()) {
                        child.getGenes()[t] = random.nextInt(serverCount);
                    }
                }

                fitnessEvaluator.evaluate(child, tasks, servers);
                double childScore = computeScalarFitness(child, wL, wE, wC);
                if (childScore < bestFitness) {
                    bestFitness = childScore;
                    best = child.copy();
                }
                nextPop.add(child);
            }
            pop = nextPop;
        }

        best.setRank(1);
        best.setCrowdingDistance(0.0);
        return best;
    }

    private double computeScalarFitness(Chromosome c, double wL, double wE, double wC) {
        return wL * c.getTotalLatency() + wE * c.getTotalEnergy() + wC * c.getTotalCost();
    }
}
