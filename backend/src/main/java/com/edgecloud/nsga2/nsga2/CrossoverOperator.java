package com.edgecloud.nsga2.nsga2;

import org.springframework.stereotype.Component;

import java.util.Random;

/**
 * Single-point discrete crossover operator for task assignment vectors.
 */
@Component
public class CrossoverOperator {

    public Chromosome[] crossover(Chromosome parent1, Chromosome parent2, double crossoverRate, Random random) {
        int n = parent1.getGenes().length;
        Chromosome child1 = parent1.copy();
        Chromosome child2 = parent2.copy();

        if (random.nextDouble() < crossoverRate) {
            int point = 1 + random.nextInt(n - 1);
            for (int i = point; i < n; i++) {
                child1.getGenes()[i] = parent2.getGenes()[i];
                child2.getGenes()[i] = parent1.getGenes()[i];
            }
        }

        return new Chromosome[]{child1, child2};
    }
}
