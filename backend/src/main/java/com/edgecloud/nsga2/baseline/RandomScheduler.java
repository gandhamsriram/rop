package com.edgecloud.nsga2.baseline;

import com.edgecloud.nsga2.dto.ScheduleRequest;
import com.edgecloud.nsga2.model.Task;
import com.edgecloud.nsga2.nsga2.Chromosome;
import com.edgecloud.nsga2.nsga2.FitnessEvaluator;
import com.edgecloud.nsga2.nsga2.ServerWrapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Random;

@Component
public class RandomScheduler implements BaselineScheduler {

    @Override
    public Chromosome schedule(List<Task> tasks, List<ServerWrapper> servers, FitnessEvaluator fitnessEvaluator, ScheduleRequest request) {
        Random random = request.getSeed() != null ? new Random(request.getSeed()) : new Random();
        int taskCount = tasks.size();
        int serverCount = servers.size();

        Chromosome chromosome = new Chromosome(taskCount);
        for (int i = 0; i < taskCount; i++) {
            chromosome.getGenes()[i] = random.nextInt(serverCount);
        }

        fitnessEvaluator.evaluate(chromosome, tasks, servers);
        chromosome.setRank(1);
        chromosome.setCrowdingDistance(0.0);
        return chromosome;
    }
}
