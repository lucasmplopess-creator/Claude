package com.dentsplysirona.ideias360.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * O token CSRF (guardado em um cookie legivel por JS, XSRF-TOKEN) so' e'
 * gerado/gravado quando algo le' o CsrfToken da requisicao (carregamento
 * "preguicoso" do Spring Security). Como esta aplicacao e' uma SPA que nunca
 * renderiza um formulario Thymeleaf/JSP lendo esse token, precisamos forcar
 * essa leitura em toda requisicao para garantir que o cookie sempre exista -
 * caso contrario o front-end nunca teria o valor para reenviar no cabecalho
 * X-XSRF-TOKEN e todo POST/DELETE seria rejeitado com 403.
 */
@Component
public class CsrfCookieFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            csrfToken.getToken();
        }
        filterChain.doFilter(request, response);
    }
}
