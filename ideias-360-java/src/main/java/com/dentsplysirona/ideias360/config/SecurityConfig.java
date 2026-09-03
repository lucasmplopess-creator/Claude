package com.dentsplysirona.ideias360.config;

import com.dentsplysirona.ideias360.security.CsrfCookieFilter;
import com.dentsplysirona.ideias360.security.RateLimitFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.http.HttpStatus;

/**
 * Regras de segurança da aplicação.
 *
 * - "/", os arquivos estáticos (HTML/CSS/JS/imagens) e POST /api/ideias (enviar
 *   uma nova ideia) e /api/auth/login ficam PÚBLICOS, sem exigir login: qualquer
 *   colaborador pode abrir o app e enviar uma sugestão.
 * - Todo o resto de /api/** (listar, exportar, apagar ideias) exige login
 *   (usuário criado em AdminUserSeeder, autenticado via sessão).
 * - CSRF fica habilitado para toda a aplicação, com o token exposto em um
 *   cookie legível por JavaScript (o front-end envia esse valor de volta no
 *   cabeçalho X-XSRF-TOKEN em toda chamada que muda estado - POST/DELETE).
 * - Cabeçalhos de segurança padrão (HSTS, X-Content-Type-Options, X-Frame-Options,
 *   Referrer-Policy) ficam habilitados para reduzir superfície de ataque comum
 *   (clickjacking, MIME sniffing, vazamento de referrer).
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new org.springframework.security.authentication.ProviderManager(provider);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, RateLimitFilter rateLimitFilter,
                                                     CsrfCookieFilter csrfCookieFilter) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                        "/", "/index.html", "/styles.css", "/app.js",
                        "/assets/**", "/favicon.ico",
                        "/api/auth/login", "/api/auth/me"
                ).permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/ideias").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .sessionFixation(sf -> sf.newSession())
                .maximumSessions(3)
            )
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                // Handler "plano" (nao BREACH-protected): o valor gravado no
                // cookie XSRF-TOKEN e' o mesmo valor puro que o front-end
                // reenvia no cabecalho X-XSRF-TOKEN. O handler padrao do
                // Spring Security 6 (Xor) espera um valor mascarado vindo de
                // um formulario renderizado pelo servidor, o que quebraria
                // essa comparacao simples usada por SPAs.
                .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
            )
            .exceptionHandling(ex -> ex
                .defaultAuthenticationEntryPointFor(
                        new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                        request -> true
                )
            )
            .headers(headers -> headers
                .contentTypeOptions(org.springframework.security.config.Customizer.withDefaults())
                .frameOptions(frame -> frame.deny())
                .httpStrictTransportSecurity(hsts -> hsts
                        .includeSubDomains(true)
                        .maxAgeInSeconds(31536000)
                )
                .referrerPolicy(referrer -> referrer
                        .policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.SAME_ORIGIN)
                )
            )
            .addFilterBefore(rateLimitFilter, org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class)
            .addFilterAfter(csrfCookieFilter, org.springframework.security.web.authentication.www.BasicAuthenticationFilter.class)
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((req, res, auth) -> res.setStatus(204))
                .deleteCookies("JSESSIONID")
            );

        return http.build();
    }
}
