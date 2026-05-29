package com.yourteam.monitoring.machine.repo;

import com.yourteam.monitoring.machine.domain.MachineCommand;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MachineCommandRepository extends JpaRepository<MachineCommand, Long> {

    List<MachineCommand> findByMachineIdAndStatus(UUID machineId, String status);
}
