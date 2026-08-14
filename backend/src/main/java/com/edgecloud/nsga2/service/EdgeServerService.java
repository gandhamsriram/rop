package com.edgecloud.nsga2.service;

import com.edgecloud.nsga2.model.EdgeServer;
import com.edgecloud.nsga2.repository.EdgeServerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EdgeServerService {

    private final EdgeServerRepository edgeServerRepository;

    @PostConstruct
    public void initDefaultServers() {
        if (edgeServerRepository.count() == 0) {
            EdgeServer es1 = new EdgeServer(null, "Edge-Node-Alpha", 2.4, 8.0, 128.0, 100.0, 20.0, 4.0);
            EdgeServer es2 = new EdgeServer(null, "Edge-Node-Beta", 3.0, 16.0, 256.0, 250.0, 30.0, 5.0);
            EdgeServer es3 = new EdgeServer(null, "Edge-Node-Gamma", 2.0, 4.0, 64.0, 50.0, 15.0, 3.0);
            edgeServerRepository.saveAll(Arrays.asList(es1, es2, es3));
        }
    }

    public List<EdgeServer> getAllEdgeServers() {
        return edgeServerRepository.findAll();
    }

    public Optional<EdgeServer> getEdgeServerById(String id) {
        return edgeServerRepository.findById(id);
    }

    public EdgeServer saveEdgeServer(EdgeServer server) {
        return edgeServerRepository.save(server);
    }

    public EdgeServer updateEdgeServer(String id, EdgeServer updatedServer) {
        updatedServer.setId(id);
        return edgeServerRepository.save(updatedServer);
    }

    public void deleteEdgeServer(String id) {
        edgeServerRepository.deleteById(id);
    }
}
