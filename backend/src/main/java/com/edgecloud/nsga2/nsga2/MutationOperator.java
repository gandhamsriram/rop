package com.edgecloud.nsga2.nsga2;

import org.springframework.stereotype.Component;

import java.util.Random;

/**
 * Uniform random gene mutation operator for reassigning task -> server mapping.
 */
@Component
public class MutationOperator {

    public void mutate(Chromosome chromosome, int serverCount, double mutationRate, Random random) {
        int[] genes = chromosome.getGenes();
        for (int i = 0; i < genes.length; i++) {
            if (random.nextDouble() < mutationRate) {
                genes[i] = random.nextInt(serverCount);
            }
        }
    }
}
