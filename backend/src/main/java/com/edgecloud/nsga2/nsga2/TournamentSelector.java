package com.edgecloud.nsga2.nsga2;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Random;

/**
 * Binary Tournament Selection based on Pareto Rank and Crowding Distance.
 * Selection rule:
 * 1. Lower rank is preferred.
 * 2. If ranks are equal, higher crowding distance is preferred.
 */
@Component
public class TournamentSelector {

    public Chromosome select(List<Chromosome> population, Random random) {
        int i1 = random.nextInt(population.size());
        int i2 = random.nextInt(population.size());

        Chromosome c1 = population.get(i1);
        Chromosome c2 = population.get(i2);

        if (c1.getRank() < c2.getRank()) {
            return c1;
        } else if (c2.getRank() < c1.getRank()) {
            return c2;
        } else {
            // Equal rank: pick larger crowding distance
            if (c1.getCrowdingDistance() > c2.getCrowdingDistance()) {
                return c1;
            } else {
                return c2;
            }
        }
    }
}
