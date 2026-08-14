package com.edgecloud.nsga2.controller;

import com.edgecloud.nsga2.model.EdgeServer;
import com.edgecloud.nsga2.service.EdgeServerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/servers/edge")
@RequiredArgsConstructor
public class EdgeServerController {

    private final EdgeServerService edgeServerService;

    @GetMapping
    public ResponseEntity<List<EdgeServer>> getAllEdgeServers() {
        return ResponseEntity.ok(edgeServerService.getAllEdgeServers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EdgeServer> getEdgeServerById(@PathVariable String id) {
        return edgeServerService.getEdgeServerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<EdgeServer> createEdgeServer(@RequestBody EdgeServer server) {
        return ResponseEntity.ok(edgeServerService.saveEdgeServer(server));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EdgeServer> updateEdgeServer(@PathVariable String id, @RequestBody EdgeServer server) {
        return ResponseEntity.ok(edgeServerService.updateEdgeServer(id, server));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEdgeServer(@PathVariable String id) {
        edgeServerService.deleteEdgeServer(id);
        return ResponseEntity.noContent().build();
    }
}
