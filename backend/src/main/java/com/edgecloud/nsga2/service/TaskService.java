package com.edgecloud.nsga2.service;

import com.edgecloud.nsga2.dto.TaskGenerationRequest;
import com.edgecloud.nsga2.model.Task;
import com.edgecloud.nsga2.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.annotation.PostConstruct;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    @PostConstruct
    public void initDefaultTasks() {
        if (taskRepository.count() == 0) {
            generateTasks(new TaskGenerationRequest(50, "LOW"));
        }
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public List<Task> generateTasks(TaskGenerationRequest request) {
        taskRepository.deleteAll();
        int count = request.getCount();
        if ("LOW".equalsIgnoreCase(request.getPreset())) {
            count = 50;
        } else if ("MEDIUM".equalsIgnoreCase(request.getPreset())) {
            count = 500;
        } else if ("HIGH".equalsIgnoreCase(request.getPreset())) {
            count = 5000;
        }

        Random random = new Random(42L); // Fixed seed for reproducible research benchmarks
        List<Task> tasks = new ArrayList<>();

        for (int i = 1; i <= count; i++) {
            double cpuReq = Math.round((0.5 + random.nextDouble() * 4.5) * 100.0) / 100.0;     // 0.5 - 5.0 GHz cycles
            double ramReq = Math.round((0.1 + random.nextDouble() * 3.9) * 100.0) / 100.0;     // 0.1 - 4.0 GB
            double storageReq = Math.round((0.5 + random.nextDouble() * 9.5) * 100.0) / 100.0; // 0.5 - 10.0 GB
            double taskSize = Math.round((1.0 + random.nextDouble() * 49.0) * 100.0) / 100.0;  // 1 - 50 MB
            double deadline = Math.round(50.0 + random.nextDouble() * 950.0);                 // 50 - 1000 ms
            int priority = 1 + random.nextInt(5);                                            // Priority 1 to 5
            double executionTime = Math.round(10.0 + random.nextDouble() * 290.0);             // 10 - 300 ms

            Task task = new Task(
                    null,
                    "TASK-" + String.format("%04d", i),
                    cpuReq,
                    ramReq,
                    storageReq,
                    taskSize,
                    deadline,
                    priority,
                    executionTime
            );
            tasks.add(task);
        }

        return taskRepository.saveAll(tasks);
    }

    public List<Task> uploadTasksFromCsv(MultipartFile file) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            taskRepository.deleteAll();
            List<Task> tasks = new ArrayList<>();
            String line;
            boolean firstLine = true;
            int counter = 1;

            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                if (firstLine) {
                    firstLine = false;
                    // Skip header line if present
                    if (line.toLowerCase().contains("taskid") || line.toLowerCase().contains("cpurequirement")) {
                        continue;
                    }
                }

                String[] parts = line.split(",");
                if (parts.length >= 7) {
                    String taskId = parts[0].trim();
                    if (taskId.isEmpty()) taskId = "TASK-" + String.format("%04d", counter);
                    double cpuReq = Double.parseDouble(parts[1].trim());
                    double ramReq = Double.parseDouble(parts[2].trim());
                    double storageReq = Double.parseDouble(parts[3].trim());
                    double taskSize = Double.parseDouble(parts[4].trim());
                    double deadline = Double.parseDouble(parts[5].trim());
                    int priority = Integer.parseInt(parts[6].trim());
                    double execTime = parts.length >= 8 ? Double.parseDouble(parts[7].trim()) : (cpuReq * 50.0);

                    Task task = new Task(null, taskId, cpuReq, ramReq, storageReq, taskSize, deadline, priority, execTime);
                    tasks.add(task);
                    counter++;
                }
            }
            return taskRepository.saveAll(tasks);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse CSV file: " + e.getMessage(), e);
        }
    }

    public void clearAllTasks() {
        taskRepository.deleteAll();
    }
}
