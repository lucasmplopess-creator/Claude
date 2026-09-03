package com.dentsplysirona.ideias360.repository;

import com.dentsplysirona.ideias360.model.Idea;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface IdeaRepository extends JpaRepository<Idea, UUID> {
    List<Idea> findAllByOrderByCreatedAtDesc();
}
