package com.dentsplysirona.ideias360.config;

import com.dentsplysirona.ideias360.model.AppUser;
import com.dentsplysirona.ideias360.repository.AppUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * Garante que exista pelo menos um usuário com acesso à tela "Consultar Ideias
 * Enviadas". Usuário e senha vêm de variáveis de ambiente (ADMIN_USERNAME /
 * ADMIN_PASSWORD) — nunca ficam hardcoded no código-fonte.
 *
 * Se ADMIN_PASSWORD não for definida, uma senha aleatória é gerada e impressa
 * UMA VEZ no log de inicialização, para uso apenas em ambiente de teste/local.
 * Em produção, sempre defina ADMIN_USERNAME e ADMIN_PASSWORD explicitamente.
 */
@Component
public class AdminUserSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminUserSeeder.class);

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username:admin}")
    private String adminUsername;

    @Value("${app.admin.password:}")
    private String adminPassword;

    public AdminUserSeeder(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (appUserRepository.findByUsername(adminUsername).isPresent()) {
            return;
        }

        String passwordToUse = adminPassword;
        boolean generated = false;
        if (passwordToUse == null || passwordToUse.isBlank()) {
            passwordToUse = generateRandomPassword();
            generated = true;
        }

        AppUser user = new AppUser();
        user.setUsername(adminUsername);
        user.setPasswordHash(passwordEncoder.encode(passwordToUse));
        appUserRepository.save(user);

        if (generated) {
            log.warn("Nenhuma variável ADMIN_PASSWORD foi definida. Criado usuário '{}' com senha " +
                    "TEMPORÁRIA gerada automaticamente: {}  " +
                    "-> Defina ADMIN_USERNAME/ADMIN_PASSWORD e troque essa senha antes de usar em produção.",
                    adminUsername, passwordToUse);
        } else {
            log.info("Usuário administrador '{}' criado a partir de ADMIN_USERNAME/ADMIN_PASSWORD.", adminUsername);
        }
    }

    private String generateRandomPassword() {
        byte[] bytes = new byte[18];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
