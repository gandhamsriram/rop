package com.edgecloud.nsga2.service;

import com.edgecloud.nsga2.model.CloudServer;
import com.edgecloud.nsga2.repository.CloudServerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CloudServerService {

    private final CloudServerRepository cloudServerRepository;

    @PostConstruct
    public void initDefaultServers() {
        if (cloudServerRepository.count() == 0) {
            CloudServer cs1 = new CloudServer(null, "Cloud-AWS-c5.xlarge", 3.4, 32.0, 1024.0, 1000.0, 0.17, 150.0, 40.0);
            CloudServer cs2 = new CloudServer(null, "Cloud-Azure-F8s", 3.7, 64.0, 2048.0, 2000.0, 0.34, 250.0, 60.0);
            cloudServerRepository.saveAll(Arrays.asList(cs1, cs2));
        }
    }

    public List<CloudServer> getAllCloudServers() {
        return cloudServerRepository.findAll();
    }

    public Optional<CloudServer> getCloudServerById(String id) {
        return cloudServerRepository.findById(id);
    }

    public CloudServer saveCloudServer(CloudServer server) {
        return cloudServerRepository.save(server);
    }

    public CloudServer updateCloudServer(String id, CloudServer updatedServer) {
        updatedServer.setId(id);
        return cloudServerRepository.save(updatedServer);
    }

    public void deleteCloudServer(String id) {
        cloudServerRepository.deleteById(id);
    }
}
