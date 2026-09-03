package com.dentsplysirona.ideias360.controller;

import com.dentsplysirona.ideias360.dto.IdeaSubmitRequest;
import com.dentsplysirona.ideias360.model.Idea;
import com.dentsplysirona.ideias360.service.IdeaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@RestController
@RequestMapping("/api/ideias")
public class IdeaController {

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss").withLocale(new Locale("pt", "BR")).withZone(ZoneId.systemDefault());

    private static final String[] CSV_HEADERS = {
            "Data de envio", "Em qual setor você observou a oportunidade de Melhoria?", "Matrícula",
            "Seu Nome e Sobrenome", "Em qual setor você trabalha?", "Qual eixo está relacionado à sua sugestão?",
            "Sua sugestão está alinhada a qual Valor da DS?", "Qual é a situação que você deseja melhorar?",
            "Qual é a causa Raiz do problema?", "Qual seria sua solução sugerida?",
            "Quais benefícios você espera alcançar?", "Quais recursos seriam necessários?",
            "Quais desafios ou obstáculos você prevê?", "Gostaria de indicar outra pessoa?", "Nome da pessoa indicada"
    };

    private final IdeaService ideaService;

    public IdeaController(IdeaService ideaService) {
        this.ideaService = ideaService;
    }

    /** Público: qualquer colaborador pode enviar uma nova ideia, sem login. */
    @PostMapping
    public ResponseEntity<Idea> submit(@Valid @RequestBody IdeaSubmitRequest request) {
        Idea saved = ideaService.submit(request);
        return ResponseEntity.status(201).body(saved);
    }

    /** Protegido (exige login) — tela "Consultar Ideias Enviadas". */
    @GetMapping
    public List<Idea> listAll() {
        return ideaService.listAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Idea> getOne(@PathVariable UUID id) {
        return ideaService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        return ideaService.deleteById(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAll() {
        ideaService.deleteAll();
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/export/csv")
    public ResponseEntity<byte[]> exportCsv() {
        StringBuilder sb = new StringBuilder();
        sb.append('﻿'); // BOM, para acentuação abrir corretamente no Excel
        sb.append(String.join(";", quoteAll(CSV_HEADERS))).append("\r\n");

        for (Idea i : ideaService.listAll()) {
            String[] row = {
                    DATE_FMT.format(i.getCreatedAt()), i.getSetorOportunidade(), i.getMatricula(), i.getNome(),
                    i.getSetorTrabalho(), i.getEixo(), i.getValorDs(), i.getSituacao(), i.getCausaRaiz(),
                    i.getSolucao(), i.getBeneficios(), i.getRecursos(), i.getDesafios(),
                    i.getIndicarOutraPessoa(), nullToEmpty(i.getNomePessoaIndicada())
            };
            sb.append(String.join(";", quoteAll(row))).append("\r\n");
        }

        byte[] body = sb.toString().getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ideias360-respostas.csv\"")
                .contentType(MediaType.parseMediaType("text/csv;charset=UTF-8"))
                .body(body);
    }

    @GetMapping("/export/json")
    public ResponseEntity<List<Idea>> exportJson() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ideias360-respostas.json\"")
                .body(ideaService.listAll());
    }

    private String[] quoteAll(String[] values) {
        String[] out = new String[values.length];
        for (int i = 0; i < values.length; i++) {
            String v = values[i] == null ? "" : values[i];
            out[i] = "\"" + v.replace("\"", "\"\"") + "\"";
        }
        return out;
    }

    private String nullToEmpty(String v) {
        return v == null ? "" : v;
    }
}
