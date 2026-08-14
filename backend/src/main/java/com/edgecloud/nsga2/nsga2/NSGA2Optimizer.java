package com.edgecloud.nsga2.nsga2;

import com.edgecloud.nsga2.model.Task;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

/**
 * Pure Java NSGA-II Multi-Objective Optimization Engine.
 * 
 * Features:
 * - Deterministic seed configuration for research reproducibility
 * - Fast non-dominated sorting
 * - Crowding distance diversity computation
 * - Binary tournament selection
 * - Elitist replacement across generations
 */
@Component
@RequiredArgsConstructor
public class NSGA2Optimizer {

    private final FitnessEvaluator fitnessEvaluator;
    private final NonDominatedSorter nonDominatedSorter;
    private final CrowdingDistanceCalculator crowdingDistanceCalculator;
    private final TournamentSelector tournamentSelector;
    private final CrossoverOperator crossoverOperator;
    private final MutationOperator mutationOperator;
    private final KneePointSelector kneePointSelector;

    public List<Chromosome> runOptimization(
            List<Task> tasks,
            List<ServerWrapper> servers,
            int popSize,
            int generations,
            double crossoverRate,
            double mutationRate,
            Long seed
    ) {
        if (tasks.isEmpty() || servers.isEmpty()) {
            return Collections.emptyList();
        }

        Random random = seed != null ? new Random(seed) : new Random();
        int taskCount = tasks.size();
        int serverCount = servers.size();

        // 1. Initialize Population P0
        List<Chromosome> population = new ArrayList<>();
        for (int i = 0; i < popSize; i++) {
            Chromosome c = new Chromosome(taskCount);
            for (int t = 0; t < taskCount; t++) {
                c.getGenes()[t] = random.nextInt(serverCount);
            }
            fitnessEvaluator.evaluate(c, tasks, servers);
            population.add(c);
        }

        // Fast non-dominated sort & crowding distance on P0
        List<List<Chromosome>> fronts = nonDominatedSorter.sort(population);
        for (List<Chromosome> front : fronts) {
            crowdingDistanceCalculator.calculate(front);
        }

        // 2. Generational Loop
        for (int gen = 1; gen <= generations; gen++) {
            List<Chromosome> offspring = new ArrayList<>();

            // Generate Offspring Q_t
            while (offspring.size() < popSize) {
                Chromosome parent1 = tournamentSelector.select(population, random);
                Chromosome parent2 = tournamentSelector.select(population, random);

                Chromosome[] children = crossoverOperator.crossover(parent1, parent2, crossoverRate, random);

                mutationOperator.mutate(children[0], serverCount, mutationRate, random);
                mutationOperator.mutate(children[1], serverCount, mutationRate, random);

                fitnessEvaluator.evaluate(children[0], tasks, servers);
                fitnessEvaluator.evaluate(children[1], tasks, servers);

                offspring.add(children[0]);
                if (offspring.size() < popSize) {
                    offspring.add(children[1]);
                }
            }

            // Combine R_t = P_t U Q_t
            List<Chromosome> combined = new ArrayList<>(population);
            combined.addAll(offspring);

            // Fast Non-dominated sort on R_t
            List<List<Chromosome>> combinedFronts = nonDominatedSorter.sort(combined);

            // Build next generation P_{t+1}
            List<Chromosome> nextGen = new ArrayList<>();
            int frontIdx = 0;

            while (frontIdx < combinedFronts.size() && (nextGen.size() + combinedFronts.get(frontIdx).size()) <= popSize) {
                List<Chromosome> currentFront = combinedFronts.get(frontIdx);
                crowdingDistanceCalculator.calculate(currentFront);
                nextGen.addAll(currentFront);
                frontIdx++;
            }

            // Fill remaining slots using Crowding Distance Sorting
            if (nextGen.size() < popSize && frontIdx < combinedFronts.size()) {
                List<Chromosome> lastFront = combinedFronts.get(frontIdx);
                crowdingDistanceCalculator.calculate(lastFront);

                // Sort last front descending by crowding distance
                lastFront.sort((c1, c2) -> Double.compare(c2.getCrowdingDistance(), c1.getCrowdingDistance()));

                int needed = popSize - nextGen.size();
                for (int i = 0; i < needed; i++) {
                    nextGen.add(lastFront.get(i));
                }
            }

            population = nextGen;
        }

        // Return final Pareto Front (Rank 1)
        List<List<Chromosome>> finalFronts = nonDominatedSorter.sort(population);
        List<Chromosome> paretoFront = finalFronts.isEmpty() ? Collections.emptyList() : finalFronts.get(0);
        crowdingDistanceCalculator.calculate(paretoFront);
        return paretoFront;
    }

    public KneePointSelector getKneePointSelector() {
        return kneePointSelector;
    }
}
