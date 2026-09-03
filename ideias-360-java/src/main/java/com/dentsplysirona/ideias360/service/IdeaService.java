package com.dentsplysirona.ideias360.service;

import com.dentsplysirona.ideias360.dto.IdeaSubmitRequest;
import com.dentsplysirona.ideias360.model.Idea;
import com.dentsplysirona.ideias360.repository.IdeaRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class IdeaService {

    private final IdeaRepository ideaRepository;

    public IdeaService(IdeaRepository ideaRepository) {
        this.ideaRepository = ideaRepository;
    }

    public Idea submit(IdeaSubmitRequest req) {
        Idea idea = new Idea();
        idea.setCreatedAt(Instant.now());
        idea.setSetorOportunidade(req.getSetorOportunidade().trim());
        idea.setMatricula(req.getMatricula().trim());
        idea.setNome(req.getNome().trim());
        idea.setSetorTrabalho(req.getSetorTrabalho().trim());
        idea.setEixo(req.getEixo().trim());
        idea.setValorDs(req.getValorDs().trim());
        idea.setSituacao(req.getSituacao().trim());
        idea.setCausaRaiz(req.getCausaRaiz().trim());
        idea.setSolucao(req.getSolucao().trim());
        idea.setBeneficios(req.getBeneficios().trim());
        idea.setRecursos(req.getRecursos().trim());
        idea.setDesafios(req.getDesafios().trim());
        idea.setIndicarOutraPessoa(req.getIndicarOutraPessoa().trim());

        boolean indicou = "Sim".equalsIgnoreCase(idea.getIndicarOutraPessoa());
        String nomeIndicado = req.getNomePessoaIndicada();
        idea.setNomePessoaIndicada(indicou && nomeIndicado != null ? nomeIndicado.trim() : null);

        return ideaRepository.save(idea);
    }

    public List<Idea> listAll() {
        return ideaRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<Idea> findById(UUID id) {
        return ideaRepository.findById(id);
    }

    public boolean deleteById(UUID id) {
        if (!ideaRepository.existsById(id)) {
            return false;
        }
        ideaRepository.deleteById(id);
        return true;
    }

    public void deleteAll() {
        ideaRepository.deleteAll();
    }
}
