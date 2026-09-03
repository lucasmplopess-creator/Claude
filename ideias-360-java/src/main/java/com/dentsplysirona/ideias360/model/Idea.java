package com.dentsplysirona.ideias360.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ideas")
public class Idea {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false, length = 200)
    private String setorOportunidade;

    @Column(nullable = false, length = 50)
    private String matricula;

    @Column(nullable = false, length = 200)
    private String nome;

    @Column(nullable = false, length = 200)
    private String setorTrabalho;

    @Column(nullable = false, length = 200)
    private String eixo;

    @Column(nullable = false, length = 200)
    private String valorDs;

    @Column(nullable = false, columnDefinition = "text")
    private String situacao;

    @Column(nullable = false, columnDefinition = "text")
    private String causaRaiz;

    @Column(nullable = false, columnDefinition = "text")
    private String solucao;

    @Column(nullable = false, columnDefinition = "text")
    private String beneficios;

    @Column(nullable = false, columnDefinition = "text")
    private String recursos;

    @Column(nullable = false, columnDefinition = "text")
    private String desafios;

    @Column(nullable = false, length = 10)
    private String indicarOutraPessoa;

    @Column(length = 200)
    private String nomePessoaIndicada;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public String getSetorOportunidade() { return setorOportunidade; }
    public void setSetorOportunidade(String v) { this.setorOportunidade = v; }

    public String getMatricula() { return matricula; }
    public void setMatricula(String v) { this.matricula = v; }

    public String getNome() { return nome; }
    public void setNome(String v) { this.nome = v; }

    public String getSetorTrabalho() { return setorTrabalho; }
    public void setSetorTrabalho(String v) { this.setorTrabalho = v; }

    public String getEixo() { return eixo; }
    public void setEixo(String v) { this.eixo = v; }

    public String getValorDs() { return valorDs; }
    public void setValorDs(String v) { this.valorDs = v; }

    public String getSituacao() { return situacao; }
    public void setSituacao(String v) { this.situacao = v; }

    public String getCausaRaiz() { return causaRaiz; }
    public void setCausaRaiz(String v) { this.causaRaiz = v; }

    public String getSolucao() { return solucao; }
    public void setSolucao(String v) { this.solucao = v; }

    public String getBeneficios() { return beneficios; }
    public void setBeneficios(String v) { this.beneficios = v; }

    public String getRecursos() { return recursos; }
    public void setRecursos(String v) { this.recursos = v; }

    public String getDesafios() { return desafios; }
    public void setDesafios(String v) { this.desafios = v; }

    public String getIndicarOutraPessoa() { return indicarOutraPessoa; }
    public void setIndicarOutraPessoa(String v) { this.indicarOutraPessoa = v; }

    public String getNomePessoaIndicada() { return nomePessoaIndicada; }
    public void setNomePessoaIndicada(String v) { this.nomePessoaIndicada = v; }
}
