# Current Best Hypotheses

> Source of truth for the StartupChecker front-page leaderboard. Scores from different engine generations are never mixed without an explicit legacy label.

<!-- STARTUPCHECKER_LEADERBOARD_V1 -->
~~~json
{
  "updated_at": "2026-10-07",
  "analyzed": [
    {
      "rank": 1,
      "id": "OLY-01",
      "name": "Olympia",
      "kind": "ANALYZED",
      "score": 6.8,
      "evidence_level": 3,
      "decision": "48H_FALSIFICATION",
      "area": "Legal & Compliance",
      "market": ["B2B"],
      "why_important": "Ataca trabalho operacional recorrente de advogados trabalhistas patronais, com comprador claro e valor potencialmente mensurável em horas, controle e velocidade de defesa.",
      "why_ranked": [
        "Dor operacional concreta e frequente, não uma curiosidade de produto.",
        "Pagador identificável: advogado/escritório patronal.",
        "ROI pode ser medido por horas economizadas, velocidade e redução de perda operacional.",
        "Piloto pode ser vendido antes de automação total."
      ],
      "what_can_kill": [
        "Advogados não pagarem o ticket premium.",
        "Custo de IA e suporte consumir a margem.",
        "Automação não reduzir horas de trabalho suficientes.",
        "Integrações/documentos criarem fricção maior que o valor."
      ],
      "next_step": "Fechar piloto pago e medir horas economizadas, custo de entrega e outcome.",
      "why_not_higher": "Ainda falta MONEY/OBSERVED_OUTCOME suficiente na régua V10."
    },
    {
      "rank": 2,
      "id": "GYF-01",
      "name": "Gyfted",
      "kind": "ANALYZED",
      "score": 6.8,
      "evidence_level": 2,
      "decision": "48H_FALSIFICATION",
      "area": "Consumer / Sports",
      "market": ["B2C"],
      "why_important": "Existe um motor de valor legítimo de aspiração e transformação: pais já gastam dinheiro para desenvolver filhos no futebol, e evolução pode ser transformada em treino, vídeo, dados e scouting.",
      "why_ranked": [
        "Categoria já possui gasto real do consumidor.",
        "Valor não depende de economia de custo: desenvolvimento/status/sonho é um value engine válido.",
        "Oferta pode ser testada com pagamento antes de escala.",
        "Resultado pode ser tornado mensurável com assessment, evolução e scouting."
      ],
      "what_can_kill": [
        "Pais gostarem da proposta mas não pagarem o ticket necessário.",
        "CAC local destruir unit economics.",
        "Evolução/scouting não ser percebido como superior a escolinhas existentes.",
        "Operação presencial limitar escala."
      ],
      "next_step": "Conseguir compromissos reais no ticket: reserva, depósito ou matrícula.",
      "why_not_higher": "WTP e economics ainda não foram provados com dinheiro suficiente."
    },
    {
      "rank": 3,
      "id": "RHU-01",
      "name": "Rhubius",
      "kind": "ANALYZED",
      "score": 6.1,
      "evidence_level": 1,
      "decision": "48H_FALSIFICATION",
      "area": "Finance / SME",
      "market": ["B2B"],
      "why_important": "Pode criar ROI direto em decisões financeiras de PMEs, onde tempo, caixa e erro têm consequência econômica clara.",
      "why_ranked": [
        "Motor de valor econômico é plausível e mensurável.",
        "Founder consegue chegar a donos/CFOs para aprender rápido.",
        "Pode ser falsificada sem build completo."
      ],
      "what_can_kill": [
        "PMEs não confiarem decisões financeiras a um sistema novo.",
        "Dados ruins/fragmentados impedirem recomendação útil.",
        "WTP baixo frente a contador, ERP e banco.",
        "Integrações elevarem custo de implantação."
      ],
      "next_step": "Tentar destruir a hipótese com donos/CFOs antes de qualquer build.",
      "why_not_higher": "Quase tudo ainda é hipótese; pouca evidência comercial."
    },
    {
      "rank": 4,
      "id": "COR-01",
      "name": "Cori Insight",
      "kind": "ANALYZED",
      "score": 3.0,
      "evidence_level": 4,
      "decision": "KILL_REFORMULATE",
      "area": "Healthcare",
      "market": ["B2B"],
      "why_important": "É importante como caso de calibração negativa: muita sofisticação técnica não compensou pagador/budget/economics insuficientes.",
      "why_ranked": [
        "Serve como referência de falso positivo que o motor deve evitar.",
        "Mostra que produto tecnicamente forte pode continuar sendo uma tese ruim."
      ],
      "what_can_kill": [
        "Já foi efetivamente reprovada pela lógica econômica atual."
      ],
      "next_step": "Não investir mais sem uma nova economia de valor e um pagador claro.",
      "why_not_higher": "Pagador, budget e value-price surplus não sustentaram a tese."
    }
  ],
  "research_priority": [
    {
      "rank": 1,
      "id": "yc-winter-2027-linklane",
      "name": "LinkLane",
      "kind": "RESEARCH_PRIORITY",
      "priority": "P1",
      "area": "Supply Chain & Logistics",
      "market": ["B2B"],
      "adaptation": "LOCALIZE_BRAZIL",
      "why_important": "Frete rodoviário brasileiro tem workflow operacional e regulatório próprio; cotação, booking, tracking, documentos e exceções podem formar um wedge local forte.",
      "why_ranked": [
        "Problema operacional frequente e monetizável.",
        "Brasil cria diferenciação real frente a simples clone americano.",
        "Há caminho para concierge/manual-first antes de integrações completas."
      ],
      "what_can_kill": [
        "TMS e plataformas atuais resolverem o suficiente.",
        "Margem de brokerage ser pequena.",
        "Integrações/execução serem o gargalo real.",
        "Shippers não delegarem pricing/booking."
      ],
      "next_step": "Entrevistar 8–12 shippers/3PLs, reconstruir o workflow e pedir piloto pago."
    },
    {
      "rank": 2,
      "id": "yc-winter-2027-rote",
      "name": "Rote",
      "kind": "RESEARCH_PRIORITY",
      "priority": "P1",
      "area": "Insurance",
      "market": ["B2B"],
      "adaptation": "LOCALIZE_BRAZIL",
      "why_important": "O reparo segurado cria uma interface operacional real entre oficina, seguradora e cliente, com orçamento, fotos, autorização, suplementos e acompanhamento.",
      "why_ranked": [
        "Wedge estreito e operacionalmente claro.",
        "Pode reduzir trabalho administrativo e tempo parado.",
        "Piloto manual/concierge é barato de testar."
      ],
      "what_can_kill": [
        "Seguradora controlar quase todo o workflow.",
        "Portais/sistemas incumbentes bloquearem automação.",
        "Oficinas pequenas terem baixo WTP.",
        "Integração ser indispensável desde o dia 1."
      ],
      "next_step": "Acompanhar 20 reparos segurados em 5 oficinas e cobrar um piloto concierge."
    },
    {
      "rank": 3,
      "id": "yc-summer-2027-memorable",
      "name": "Memorable",
      "kind": "RESEARCH_PRIORITY",
      "priority": "P2",
      "area": "AI Infrastructure & Developer Tools",
      "market": ["B2B"],
      "adaptation": "GLOBAL_FROM_BRAZIL",
      "why_important": "Se graph search reduzir custo/latência e aumentar confiabilidade de agentes de forma mensurável, existe valor econômico global.",
      "why_ranked": [
        "Problema técnico relevante para agentes.",
        "Pode ser benchmarkado objetivamente.",
        "Mercado potencial é global."
      ],
      "what_can_kill": [
        "Ser apenas uma técnica e não um produto.",
        "Open source/modelos absorverem a vantagem.",
        "Buyer/wedge comercial permanecerem vagos.",
        "Mercado de agent infra continuar extremamente congestionado."
      ],
      "next_step": "Benchmarkar custo, latência e success rate contra três baselines e obter design partners."
    }
  ],
  "legacy": [
    {"name":"Cori ARTA","decision":"KILL","note":"Avaliação histórica pré-V7; não comparar score diretamente."},
    {"name":"Cori ENAMED","decision":"KILL","note":"Avaliação histórica pré-V7; não comparar score diretamente."},
    {"name":"CoriEdu","decision":"KILL","note":"Avaliação histórica pré-V7; não comparar score diretamente."},
    {"name":"Cori Staffing","decision":"KILL","note":"Avaliação histórica pré-V7; não comparar score diretamente."},
    {"name":"Cori Revalida","decision":"KILL","note":"Avaliação histórica pré-V7; não comparar score diretamente."},
    {"name":"Kroupi","decision":"KILL","note":"Avaliação histórica pré-V7; trust/access/repeatable sourcing fracos."},
    {"name":"AI Turnaround","decision":"KILL","note":"Avaliação histórica pré-V7."},
    {"name":"White-label supplements","decision":"48H_FALSIFICATION","note":"Economics plausíveis; validar volume/preço antes de CAPEX."},
    {"name":"Generic cement brand","decision":"KILL","note":"Falta wedge econômico/aplicação específica."}
  ],
  "training": {
    "name": "ScoutNet V6 legacy teacher",
    "role": "Research triage only",
    "promoted_classifier": "LinearSVC",
    "classifier_macro_f1": 0.7664,
    "classifier_accuracy": 0.8154,
    "neural_challenger_macro_f1": 0.7334,
    "promoted_priority_model": "Ridge",
    "priority_mae": 7.129,
    "neural_priority_mae": 8.372,
    "guardrail": "Teacher-only. Cannot change Rust vetoes or final decision."
  }
}
~~~
<!-- END_STARTUPCHECKER_LEADERBOARD_V1 -->
