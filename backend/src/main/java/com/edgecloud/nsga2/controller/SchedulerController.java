package com.edgecloud.nsga2.controller;

import com.edgecloud.nsga2.dto.ScheduleRequest;
import com.edgecloud.nsga2.dto.ScheduleResponse;
import com.edgecloud.nsga2.model.AllocationResult;
import com.edgecloud.nsga2.service.SchedulerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scheduler")
@RequiredArgsConstructor
public class SchedulerController {

    private final SchedulerService schedulerService;

    @PostMapping("/run")
    public ResponseEntity<ScheduleResponse> runScheduler(@RequestBody ScheduleRequest request) {
        return ResponseEntity.ok(schedulerService.runSchedule(request));
    }

    @GetMapping("/results")
    public ResponseEntity<List<AllocationResult>> getLatestResults() {
        return ResponseEntity.ok(schedulerService.getLatestResults());
    }
}
