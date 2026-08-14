package com.edgecloud.nsga2.nsga2;

import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Knee Point Selector for extracting the single best balanced compromise solution
 * from the Pareto Optimal front (Rank 1).
 * Uses min normalized Euclidean distance to ideal point (0,0,0).
 */
@Component
public class KneePointSelector {

    public Chromosome selectKneePoint(List<Chromosome> paretoFront) {
        if (paretoFront == null || paretoFront.isEmpty()) {
            return null;
        }

        if (paretoFront.size() == 1) {
            return paretoFront.get(0);
        }

        double minLat = Double.MAX_VALUE, maxLat = Double.MIN_VALUE;
        double minEng = Double.MAX_VALUE, maxEng = Double.MIN_VALUE;
        double minCost = Double.MAX_VALUE, maxCost = Double.MIN_VALUE;

        for (Chromosome c : paretoFront) {
            if (c.getTotalLatency() < minLat) minLat = c.getTotalLatency();
            if (c.getTotalLatency() > maxLat) maxLat = c.getTotalLatency();
            if (c.getTotalEnergy() < minEng) minEng = c.getTotalEnergy();
            if (c.getTotalEnergy() > maxEng) maxEng = c.getTotalEnergy();
            if (c.getTotalCost() < minCost) minCost = c.getTotalCost();
            if (c.getTotalCost() > maxCost) maxCost = c.getTotalCost();
        }

        double rangeLat = Math.max(maxLat - minLat, 0.0001);
        double rangeEng = Math.max(maxEng - minEng, 0.0001);
        double rangeCost = Math.max(maxCost - minCost, 0.0001);

        Chromosome kneePoint = paretoFront.get(0);
        double minDistance = Double.MAX_VALUE;

        for (Chromosome c : paretoFront) {
            double normLat = (c.getTotalLatency() - minLat) / rangeLat;
            double normEng = (c.getTotalEnergy() - minEng) / rangeEng;
            double normCost = (c.getTotalCost() - minCost) / rangeCost;

            // Distance to ideal (0, 0, 0)
            double dist = Math.sqrt(normLat * normLat + normEng * normEng + normCost * normCost);
            if (dist < minDistance) {
                minDistance = dist;
                kneePoint = c;
            }
        }

        return kneePoint;
    }
}
