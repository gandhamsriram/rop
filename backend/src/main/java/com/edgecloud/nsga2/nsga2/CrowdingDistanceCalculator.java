package com.edgecloud.nsga2.nsga2;

import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

/**
 * Crowding Distance Calculator for preserving population diversity in NSGA-II.
 */
@Component
public class CrowdingDistanceCalculator {

    public void calculate(List<Chromosome> front) {
        int l = front.size();
        if (l == 0) return;

        for (Chromosome c : front) {
            c.setCrowdingDistance(0.0);
        }

        if (l <= 2) {
            for (Chromosome c : front) {
                c.setCrowdingDistance(Double.POSITIVE_INFINITY);
            }
            return;
        }

        // Objective 1: Latency
        calculateObjectiveDistance(front, Comparator.comparingDouble(Chromosome::getTotalLatency), c -> c.getTotalLatency());

        // Objective 2: Energy
        calculateObjectiveDistance(front, Comparator.comparingDouble(Chromosome::getTotalEnergy), c -> c.getTotalEnergy());

        // Objective 3: Cost
        calculateObjectiveDistance(front, Comparator.comparingDouble(Chromosome::getTotalCost), c -> c.getTotalCost());
    }

    private void calculateObjectiveDistance(List<Chromosome> front, Comparator<Chromosome> comparator, java.util.function.ToDoubleFunction<Chromosome> valueExtractor) {
        int l = front.size();
        front.sort(comparator);

        front.get(0).setCrowdingDistance(Double.POSITIVE_INFINITY);
        front.get(l - 1).setCrowdingDistance(Double.POSITIVE_INFINITY);

        double minVal = valueExtractor.applyAsDouble(front.get(0));
        double maxVal = valueExtractor.applyAsDouble(front.get(l - 1));
        double range = maxVal - minVal;

        if (range == 0.0) return;

        for (int i = 1; i < l - 1; i++) {
            if (Double.isInfinite(front.get(i).getCrowdingDistance())) continue;
            double distance = front.get(i).getCrowdingDistance();
            double nextVal = valueExtractor.applyAsDouble(front.get(i + 1));
            double prevVal = valueExtractor.applyAsDouble(front.get(i - 1));
            distance += (nextVal - prevVal) / range;
            front.get(i).setCrowdingDistance(distance);
        }
    }
}
