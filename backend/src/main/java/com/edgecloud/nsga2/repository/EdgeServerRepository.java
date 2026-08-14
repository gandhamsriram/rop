package com.edgecloud.nsga2.repository;

import com.edgecloud.nsga2.model.EdgeServer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EdgeServerRepository extends MongoRepository<EdgeServer, String> {
}
