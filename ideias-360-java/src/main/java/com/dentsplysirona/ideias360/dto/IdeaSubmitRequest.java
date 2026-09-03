package com.dentsplysirona.ideias360.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Dados recebidos do formulario publico (tela "Nova Ideia").
 * Toda entrada de texto e' limitada em tamanho para evitar payloads abusivos,
 * e validada como nao-vazia nos campos obrigatorios do formulario original.
 */
public class IdeaSubmitRequest {

    @NotBlank
    @Size(max = 200)
    private String setorOportunidade;

    @NotBlank
    @Size(max = 50)
    private String matricula;

    @NotBlank
    @Size(max = 200)
    private String nome;

    @NotBlank
    @Size(max = 200)
    private String setorTrabalho;

    @NotBlank
    @Size(max = 200)
    private String eixo;

    @NotBlank
    @Size(max = 200)
    private String valorDs;

    @NotBlank
    @Size(max = 4000)
    private String situacao;

    @NotBlank
    @Size(max = 4000)
    private String causaRaiz;

    @NotBlank
    @Size(max = 4000)
    private String solucao;

    @NotBlank
    @Size(max = 4000)
    private String beneficios;

    @NotBlank
    @Size(max = 4000)
    private String recursos;

    @NotBlank
    @Size(max = 4000)
    private String desafios;

    @NotBlank
    @Pattern(regexp = "Sim|Não|Nao")
    private String indicarOutraPessoa;

    @Size(max = 200)
    private String nomePessoaIndicada;

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
