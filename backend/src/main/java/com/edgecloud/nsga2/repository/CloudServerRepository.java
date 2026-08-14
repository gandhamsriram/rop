package com.edgecloud.nsga2.repository;

import com.edgecloud.nsga2.model.CloudServer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CloudServerRepository extends MongoRepository<CloudServer, String> {
}
