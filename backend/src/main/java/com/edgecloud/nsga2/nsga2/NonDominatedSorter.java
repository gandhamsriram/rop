package com.edgecloud.nsga2.nsga2;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Deb's Fast Non-Dominated Sorting Algorithm for NSGA-II.
 * Assigns Pareto ranks (1, 2, ...) to chromosomes in the population.
 */
@Component
public class NonDominatedSorter {

    public List<List<Chromosome>> sort(List<Chromosome> population) {
        int size = population.size();
        List<List<Chromosome>> fronts = new ArrayList<>();
        List<List<Integer>> dominatedSolutions = new ArrayList<>(size);
        int[] dominationCount = new int[size];

        for (int i = 0; i < size; i++) {
            dominatedSolutions.add(new ArrayList<>());
            dominationCount[i] = 0;
        }

        List<Chromosome> firstFront = new ArrayList<>();

        for (int i = 0; i < size; i++) {
            Chromosome p = population.get(i);
            for (int j = 0; j < size; j++) {
                if (i == j) continue;
                Chromosome q = population.get(j);

                if (p.dominates(q)) {
                    dominatedSolutions.get(i).add(j);
                } else if (q.dominates(p)) {
                    dominationCount[i]++;
                }
            }

            if (dominationCount[i] == 0) {
                p.setRank(1);
                firstFront.add(p);
            }
        }

        fronts.add(firstFront);
        int currentFrontIdx = 0;

        while (currentFrontIdx < fronts.size() && !fronts.get(currentFrontIdx).isEmpty()) {
            List<Chromosome> currentFront = fronts.get(currentFrontIdx);
            List<Chromosome> nextFront = new ArrayList<>();

            for (Chromosome p : currentFront) {
                int pIndex = population.indexOf(p);
                for (int qIndex : dominatedSolutions.get(pIndex)) {
                    dominationCount[qIndex]--;
                    if (dominationCount[qIndex] == 0) {
                        Chromosome q = population.get(qIndex);
                        q.setRank(currentFrontIdx + 2);
                        nextFront.add(q);
                    }
                }
            }

            currentFrontIdx++;
            if (!nextFront.isEmpty()) {
                fronts.add(nextFront);
            }
        }

        return fronts;
    }
}
