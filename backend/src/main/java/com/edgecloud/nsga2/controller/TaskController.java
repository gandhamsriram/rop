package com.edgecloud.nsga2.controller;

import com.edgecloud.nsga2.dto.TaskGenerationRequest;
import com.edgecloud.nsga2.model.Task;
import com.edgecloud.nsga2.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @PostMapping("/generate")
    public ResponseEntity<List<Task>> generateTasks(@RequestBody TaskGenerationRequest request) {
        return ResponseEntity.ok(taskService.generateTasks(request));
    }

    @PostMapping("/upload")
    public ResponseEntity<List<Task>> uploadTasksFromCsv(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(taskService.uploadTasksFromCsv(file));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearAllTasks() {
        taskService.clearAllTasks();
        return ResponseEntity.noContent().build();
    }
}
