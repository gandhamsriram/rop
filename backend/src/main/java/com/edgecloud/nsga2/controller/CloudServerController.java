package com.edgecloud.nsga2.controller;

import com.edgecloud.nsga2.model.CloudServer;
import com.edgecloud.nsga2.service.CloudServerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/servers/cloud")
@RequiredArgsConstructor
public class CloudServerController {

    private final CloudServerService cloudServerService;

    @GetMapping
    public ResponseEntity<List<CloudServer>> getAllCloudServers() {
        return ResponseEntity.ok(cloudServerService.getAllCloudServers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CloudServer> getCloudServerById(@PathVariable String id) {
        return cloudServerService.getCloudServerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CloudServer> createCloudServer(@RequestBody CloudServer server) {
        return ResponseEntity.ok(cloudServerService.saveCloudServer(server));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CloudServer> updateCloudServer(@PathVariable String id, @RequestBody CloudServer server) {
        return ResponseEntity.ok(cloudServerService.updateCloudServer(id, server));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCloudServer(@PathVariable String id) {
        cloudServerService.deleteCloudServer(id);
        return ResponseEntity.noContent().build();
    }
}
