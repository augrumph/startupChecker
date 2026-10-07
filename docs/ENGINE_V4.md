# Thesis Engine V4

## O objetivo real

A V4 não tenta responder “qual startup parece mais bonita?”.
Ela responde:

1. **Esta tese falha em algum fundamento que deveria matá-la agora?**
2. **Qual mecanismo de valor realmente explica por que alguém pagaria?**
3. **A tese é híbrida?**
4. **Quanto da nossa convicção é evidência e quanto é opinião?**
5. **Qual experimento produz mais informação com menor custo de founder time?**

## 1. Roteamento multi-expert

A V3 escolhia um especialista principal. A V4 aceita até três especialistas quando a afinidade está próxima do vencedor.

Exemplo:
- Gyfted: Aspiration/Transformation dominante, com Convenience/Experience secundário se fizer sentido.
- Olympia: Economic ROI dominante, com Risk/Mandatory secundário.
- Marketplace de médicos: Network/Marketplace + Risk/Mandatory + Economic ROI podem coexistir.

O score híbrido pondera os experts pela afinidade do roteador.

## 2. Vetos continuam não compensatórios

Quatro fundamentos universais são fatais:

- `payer_clarity >= 6`
- `ability_to_pay >= 6`
- `value_intensity >= 6`
- `value_price_surplus >= 6`

Cada expert ainda possui seus próprios gates.
TAM, margem, recorrência, IA, moat e adjacências ficam fora da lógica de resgate.

## 3. Evidência é por critério

Cada `Signal` possui:

- `score`: hipótese de 0 a 10.
- `evidence`: HYPO­THESIS → OBSERVED_OUTCOME.
- `quality`: 0..1.
- `contradictions`: número de evidências relevantes que contradizem a hipótese.

O motor calcula confiança por critério.
Dessa forma, “WTP = 9” baseado em opinião não é tratado como “WTP = 9” baseado em dinheiro real.

### Evidence levels

| Nível | Significado |
|---|---|
| HYPOTHESIS | opinião / tese |
| DESK_RESEARCH | pesquisa / especialista / benchmark |
| CUSTOMER_BEHAVIOR | comportamento atual confirmado |
| COMMERCIAL_COMMITMENT | preço/proposta/LOI/piloto negociado |
| MONEY | depósito/pré-venda/piloto pago |
| OBSERVED_OUTCOME | valor observado + comportamento pós-entrega |

## 4. Dois scores, não uma falsa precisão

- **Structural strength**: “se estas notas forem verdade, quão forte é a estrutura?”
- **Conservative strength**: score retraído em direção a 50 conforme falta evidência.

Pouca evidência **não mata automaticamente**. Ela muda a ação para falsificação rápida.

## 5. Investigation Priority

O motor premia:

- estrutura forte,
- aprendizado rápido,
- incerteza relevante.

Isto é deliberado.
Uma tese 85/100 com evidência baixa e teste barato é exatamente onde founders deveriam aprender agora.

Uma tese 85/100 comprovada já não precisa de discovery; precisa de execução.

## 6. Decisões

- `KILL_REFORMULATE`
- `THESIS_GOOD_ENTRY_BAD`
- `FALSIFY_48H`
- `VALIDATE_DEMAND_7D`
- `PAID_TEST_30D`
- `DELIVER_MEASURE_VALUE`
- `SCALE_EXPAND`

## 7. Próximo experimento

Se não há veto, o motor encontra a hipótese de maior risco informacional:
**score alto × baixa confiança**.

A intenção é atacar primeiro a premissa que, se falsa, mais muda nossa decisão.

## 8. Engines

### ECONOMIC_ROI
Para redução de custo, receita, produtividade, tempo monetizável.

Critérios:
- `status_quo_cost`
- `money_causality`
- `value_magnitude`
- `roi_attribution`
- `price_headroom`

### ASPIRATION_TRANSFORMATION
Para esporte, educação premium, luxo, status, identidade, transformação.

- `transformation_intensity`
- `existing_spend`
- `premium_wtp`
- `outcome_differentiation`
- `paying_segment_density`

### RISK_MANDATORY
Para compliance, legal, segurança, obrigação e perda relevante.

- `consequence_severity`
- `inevitability`
- `forced_budget`
- `deadline_trigger`
- `risk_reduction_power`

### TRANSACTION_ASSET
Para investimento, arbitragem, turnaround, ativos e capital.

- `economic_edge`
- `repeatable_access`
- `capital_efficiency`
- `edge_durability`
- `execution_liquidity`

### NETWORK_MARKETPLACE
Para marketplaces e negócios multi-sided.

- `matching_pain`
- `reachable_sides`
- `cross_side_value`
- `monetization_space`
- `cold_start_wedge`

### CONVENIENCE_EXPERIENCE
Para conveniência e redução de fricção.

- `friction_intensity`
- `usage_context`
- `convenience_wtp`
- `perceived_delta`
- `substitution_resistance`

## 9. Learning layer

- `access_to_payer`
- `test_without_full_build`
- `cheap_to_learn`
- `fast_to_learn`
- `low_adoption_friction`
- `independent_entry`

Baixo acesso, adoção impossível ou dependência de lobby podem produzir
`THESIS_GOOD_ENTRY_BAD`: necessidade potencialmente boa, entrada ruim para nós agora.

## 10. Potencial

Potencial nunca salva a tese:

- `payer_density`
- `profit_pool`
- `adjacency`
- `capital_efficiency`

É contexto para decidir quanto vale a oportunidade **depois que ela passa pelos fundamentos**.

## API

### POST /v1/evaluate

Envie um `ThesisInput` completo.

### GET /health

Status simples.

### GET /v1/config

Metadados públicos básicos do motor.

## Stack

O core é Rust porque o objetivo é:
- regras determinísticas,
- enums/contratos fortemente tipados,
- fácil versionamento,
- baixa chance de divergência entre API e motor,
- performance irrelevante mas gratuita.

Treino de ML futuro deve ficar fora do core transacional:
Python para training/calibration, artefato versionado, inferência adicionada como overlay.
