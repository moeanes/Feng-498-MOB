package com.yourteam.monitoring.machine.repo;

import com.yourteam.monitoring.machine.domain.Machine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MachineRepository extends JpaRepository<Machine, UUID> {

    List<Machine> findAllByOrderByNameAsc();
}
