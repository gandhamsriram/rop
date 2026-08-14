package com.edgecloud.nsga2.metrics;

import com.edgecloud.nsga2.nsga2.Chromosome;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Spacing Metric (SP) Calculator.
 * Measures how evenly spread the solutions are along the Pareto front.
 * Lower spacing values indicate a more uniform distribution of trade-offs.
 */
@Component
public class SpacingCalculator {

    public double calculateSpacing(List<Chromosome> paretoFront) {
        int n = paretoFront != null ? paretoFront.size() : 0;
        if (n <= 1) {
            return 0.0;
        }

        double[] minDistances = new double[n];
        double sumDistance = 0.0;

        for (int i = 0; i < n; i++) {
            Chromosome c1 = paretoFront.get(i);
            double minD = Double.MAX_VALUE;

            for (int j = 0; j < n; j++) {
                if (i == j) continue;
                Chromosome c2 = paretoFront.get(j);

                // Manhattan distance in normalized 3D objective space
                double d = Math.abs(c1.getTotalLatency() - c2.getTotalLatency())
                         + Math.abs(c1.getTotalEnergy() - c2.getTotalEnergy())
                         + Math.abs(c1.getTotalCost() - c2.getTotalCost());

                if (d < minD) {
                    minD = d;
                }
            }

            minDistances[i] = minD;
            sumDistance += minD;
        }

        double meanDistance = sumDistance / n;
        double varianceSum = 0.0;

        for (int i = 0; i < n; i++) {
            double diff = meanDistance - minDistances[i];
            varianceSum += diff * diff;
        }

        return Math.sqrt(varianceSum / (n - 1));
    }
}
