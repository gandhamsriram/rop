package com.edgecloud.nsga2.repository;

import com.edgecloud.nsga2.model.AllocationResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AllocationResultRepository extends MongoRepository<AllocationResult, String> {
}
