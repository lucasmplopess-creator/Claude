package com.dentsplysirona.ideias360.repository;

import com.dentsplysirona.ideias360.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, java.util.UUID> {
    Optional<AppUser> findByUsername(String username);
}
