package com.edgecloud.nsga2.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskGenerationRequest {
    private int count = 50;
    private String preset = "CUSTOM"; // "LOW", "MEDIUM", "HIGH", "CUSTOM"
}
