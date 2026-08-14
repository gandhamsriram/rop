package com.edgecloud.nsga2.metrics;

import com.edgecloud.nsga2.nsga2.Chromosome;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

/**
 * Hypervolume (HV) Metric Calculator.
 * Measures the volume of objective space dominated by a Pareto front set
 * relative to a upper bound reference point (RefLat, RefEng, RefCost).
 */
@Component
public class HypervolumeCalculator {

    public double calculateHypervolume(List<Chromosome> paretoFront, double refLatency, double refEnergy, double refCost) {
        if (paretoFront == null || paretoFront.isEmpty()) {
            return 0.0;
        }

        // Filter valid non-dominated points bounded by reference point
        List<Chromosome> validPoints = paretoFront.stream()
                .filter(c -> c.getTotalLatency() <= refLatency && c.getTotalEnergy() <= refEnergy && c.getTotalCost() <= refCost)
                .sorted(Comparator.comparingDouble(Chromosome::getTotalLatency))
                .toList();

        if (validPoints.isEmpty()) {
            return 0.0;
        }

        // Calculate 3D hypervolume box sum approximation
        double totalVolume = 0.0;
        double currentEnergyBoundary = refEnergy;

        for (int i = 0; i < validPoints.size(); i++) {
            Chromosome point = validPoints.get(i);
            double widthLat = refLatency - point.getTotalLatency();
            double heightEng = currentEnergyBoundary - point.getTotalEnergy();
            double depthCost = refCost - point.getTotalCost();

            if (widthLat > 0 && heightEng > 0 && depthCost > 0) {
                totalVolume += widthLat * heightEng * depthCost;
                currentEnergyBoundary = point.getTotalEnergy();
            }
        }

        return Math.max(totalVolume, 0.0);
    }
}
