package com.edgecloud.nsga2.controller;

import com.edgecloud.nsga2.dto.ComparisonResponse;
import com.edgecloud.nsga2.dto.ScheduleRequest;
import com.edgecloud.nsga2.dto.WorkloadBenchmarkResponse;
import com.edgecloud.nsga2.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/evaluation")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping("/compare")
    public ResponseEntity<ComparisonResponse> compareAlgorithms(@RequestBody ScheduleRequest request) {
        return ResponseEntity.ok(evaluationService.runComparison(request));
    }

    @PostMapping("/workload")
    public ResponseEntity<WorkloadBenchmarkResponse> runWorkloadBenchmark() {
        return ResponseEntity.ok(evaluationService.runWorkloadBenchmark());
    }
}
