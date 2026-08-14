package com.edgecloud.nsga2.nsga2;

import lombok.Data;
import java.util.Arrays;

@Data
public class Chromosome {
    private int[] genes;               // gene[taskIndex] = serverIndex
    private double totalLatency;       // Objective 1: Latency (ms) - Minimize
    private double totalEnergy;        // Objective 2: Energy (Joules) - Minimize
    private double totalCost;          // Objective 3: Cost ($) - Minimize
    private double averageUtilization; // Objective 4: Resource Utilization - Maximize (internalized as -utilization)
    private int rank;                  // Pareto Non-domination rank (1 is best)
    private double crowdingDistance;   // Diversity metric

    public Chromosome(int taskCount) {
        this.genes = new int[taskCount];
    }

    public Chromosome(int[] genes) {
        this.genes = Arrays.copyOf(genes, genes.length);
    }

    public Chromosome copy() {
        Chromosome clone = new Chromosome(this.genes);
        clone.totalLatency = this.totalLatency;
        clone.totalEnergy = this.totalEnergy;
        clone.totalCost = this.totalCost;
        clone.averageUtilization = this.averageUtilization;
        clone.rank = this.rank;
        clone.crowdingDistance = this.crowdingDistance;
        return clone;
    }

    /**
     * Checks if this chromosome strictly dominates another chromosome.
     * Solution A dominates Solution B if:
     * 1. A is no worse than B in all objectives (Latency, Energy, Cost)
     * 2. A is strictly better than B in at least one objective.
     */
    public boolean dominates(Chromosome other) {
        boolean noWorse = (this.totalLatency <= other.totalLatency) &&
                          (this.totalEnergy <= other.totalEnergy) &&
                          (this.totalCost <= other.totalCost);

        boolean strictlyBetter = (this.totalLatency < other.totalLatency) ||
                                 (this.totalEnergy < other.totalEnergy) ||
                                 (this.totalCost < other.totalCost);

        return noWorse && strictlyBetter;
    }
}
