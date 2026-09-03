package com.dentsplysirona.ideias360.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

/**
 * Limite simples de requisições por IP, em memória, para os endpoints mais
 * sensíveis a abuso: login (força bruta de senha) e envio de ideias (spam).
 * Não substitui um WAF/rate-limit de borda, mas cobre o caso mínimo sem
 * exigir infraestrutura extra (Redis, etc.) para uma aplicação interna.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int LOGIN_MAX_ATTEMPTS = 10;
    private static final int LOGIN_WINDOW_SECONDS = 60;

    private static final int SUBMIT_MAX_ATTEMPTS = 20;
    private static final int SUBMIT_WINDOW_SECONDS = 60;

    private final ConcurrentHashMap<String, Deque<Instant>> loginHits = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Deque<Instant>> submitHits = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();
        String ip = clientIp(request);

        if ("POST".equals(method) && path.equals("/api/auth/login")) {
            if (isRateLimited(loginHits, ip, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_SECONDS)) {
                tooManyRequests(response, "Muitas tentativas de login. Aguarde um minuto e tente novamente.");
                return;
            }
        } else if ("POST".equals(method) && path.equals("/api/ideias")) {
            if (isRateLimited(submitHits, ip, SUBMIT_MAX_ATTEMPTS, SUBMIT_WINDOW_SECONDS)) {
                tooManyRequests(response, "Muitos envios em pouco tempo. Aguarde um minuto e tente novamente.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isRateLimited(ConcurrentHashMap<String, Deque<Instant>> hits, String key, int max, int windowSeconds) {
        Instant now = Instant.now();
        Deque<Instant> deque = hits.computeIfAbsent(key, k -> new ConcurrentLinkedDeque<>());
        synchronized (deque) {
            while (!deque.isEmpty() && deque.peekFirst().isBefore(now.minusSeconds(windowSeconds))) {
                deque.pollFirst();
            }
            if (deque.size() >= max) {
                return true;
            }
            deque.addLast(now);
            return false;
        }
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void tooManyRequests(HttpServletResponse response, String message) throws IOException {
        response.setStatus(429);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }
}
