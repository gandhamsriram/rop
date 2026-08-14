package com.edgecloud.nsga2.baseline;

import com.edgecloud.nsga2.dto.ScheduleRequest;
import com.edgecloud.nsga2.model.Task;
import com.edgecloud.nsga2.nsga2.Chromosome;
import com.edgecloud.nsga2.nsga2.FitnessEvaluator;
import com.edgecloud.nsga2.nsga2.ServerWrapper;

import java.util.List;

public interface BaselineScheduler {
    Chromosome schedule(List<Task> tasks, List<ServerWrapper> servers, FitnessEvaluator fitnessEvaluator, ScheduleRequest request);
}
