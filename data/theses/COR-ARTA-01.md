# Cori ARTA

> Tese própria adicionada ao universo canônico do StartupChecker. O contexto abaixo vem do histórico real do projeto e será usado como seed para pesquisa. **Não está autorizada a receber score V10 até ficar 100% ENGINE_READY.**

- **ID:** `COR-ARTA-01`
- **Source:** Internal / Founder
- **Market:** B2B
- **Macro area:** Enterprise Software
- **Area:** Recruiting & HR / Healthcare
- **Product type:** Assessment Platform
- **Sales motion:** Enterprise Sales
- **Capital intensity:** LOW
- **Regulatory intensity:** MEDIUM
- **Research status:** `RESEARCH_INCOMPLETE`
- **V10 Thesis Score:** N/A

## Tese

Assessment clínico plugável pré-contratação, por especialidade, com microcases e casos em voz; cliente recebe nota/relatório e toma 100% da decisão.

## Pagador conhecido / hipótese atual

Empresas de telemedicina, hospitais, clínicas, operadoras e organizações que contratam médicos

## Usuário

RH, direção médica e recrutadores; médico candidato é avaliado

## Problema

Contratação médica mede currículo e conhecimento de forma imperfeita e tem dificuldade de observar raciocínio clínico, triagem, comunicação e decisão em situações simuladas.

## Pricing já discutido

Por candidato e por fase; valor ainda não validado.

## Contexto já conhecido do projeto

- ARTA = Assessment → Reasoning → Triage → Action.
- Produto é assessment, não ATS; deve integrar a Gupy/Pandapé/etc.
- Stage 1: microcases para filtro em massa; Stage 2: casos em voz com transcrição e métricas.
- Blueprint histórico: 12 microcases de texto (15–20 min) + 5 casos em voz (30–35 min) + revisão humana em críticos/borderline.
- Dimensões discutidas: anamnese, exame, hipótese, plano, encaminhamento; métricas como Final Diagnostic Accuracy, Evidence Responsiveness, Critical Pivot, Premature Closure e Decisive Point.
- ICP inicial: telemedicinas pequenas com alta rotatividade; hospitais/operadoras/clínicas como expansão.
- Cliente decide 100%; LGPD Art.20, fairness, contestação e explicabilidade precisam ser observados.
- Pricing pensado por candidato e por fase; margens potencialmente altas, mas WTP não comprovado.

## Evidência já conhecida

- Arquitetura do assessment e ICP definidos; falta validação robusta de WTP e validade preditiva/psicométrica.

## Riscos já conhecidos

- WTP insuficiente
- validade psicométrica fraca
- fairness/LGPD
- ciclo de venda RH/saúde
- volume de contratação insuficiente
- risco de empty ocean

## Regra antes do motor

Este contexto **não conta como dossiê completo**. A pesquisa externa deve completar e auditar buyer, WTP, economics, mercado, concorrência, distribuição, produto, regulação, defensibilidade, retenção, tração, Brasil/global, contradições e evidências.

## Machine record

<!-- STARTUPCHECKER_RECORD_V1 -->
~~~json
{"schema_version":1,"thesis":{"id":"COR-ARTA-01","name":"Cori ARTA","context":{"sector":"Healthcare / Hiring Assessment","business_models":["Assessment Platform"],"payer":"Empresas de telemedicina, hospitais, clínicas, operadoras e organizações que contratam médicos","user":"RH, direção médica e recrutadores; médico candidato é avaliado","problem":"Contratação médica mede currículo e conhecimento de forma imperfeita e tem dificuldade de observar raciocínio clínico, triagem, comunicação e decisão em situações simuladas.","solution":"Assessment clínico plugável pré-contratação, por especialidade, com microcases e casos em voz; cliente recebe nota/relatório e toma 100% da decisão.","source":"Internal / Founder","batch":"Internal 2026","location":"Brazil","area":"Recruiting & HR / Healthcare","source_url":"","analysis_status":"RESEARCH_INCOMPLETE","adaptation_mode":"BRAZIL_OR_GLOBAL","market_types":["B2B"],"macro_area":"Enterprise Software","product_type":"Assessment Platform","sales_motion":"Enterprise Sales","capital_intensity":"LOW","regulatory_intensity":"MEDIUM","filter_confidence":"FOUNDER_CONTEXT"},"router":{},"engine_override":[],"universal":{},"experts":{},"learning":{},"potential":{},"blue_ocean":{},"founder_fit":{},"hypotheses":[],"candidate_experiments":[],"experiment_ledger":[],"outcomes":[],"decision_history":[],"scenario_value":null,"evidence_records":[],"evidence_as_of_unix":1791376109,"research_dossier":{"version":"internal-seed-v1","_seed_context":{"thesis_ptbr":"Assessment clínico plugável pré-contratação, por especialidade, com microcases e casos em voz; cliente recebe nota/relatório e toma 100% da decisão.","economic_buyer":"Empresas de telemedicina, hospitais, clínicas, operadoras e organizações que contratam médicos","end_user":"RH, direção médica e recrutadores; médico candidato é avaliado","problem_ptbr":"Contratação médica mede currículo e conhecimento de forma imperfeita e tem dificuldade de observar raciocínio clínico, triagem, comunicação e decisão em situações simuladas.","pricing_history":"Por candidato e por fase; valor ainda não validado.","known_project_facts":["ARTA = Assessment → Reasoning → Triage → Action.","Produto é assessment, não ATS; deve integrar a Gupy/Pandapé/etc.","Stage 1: microcases para filtro em massa; Stage 2: casos em voz com transcrição e métricas.","Blueprint histórico: 12 microcases de texto (15–20 min) + 5 casos em voz (30–35 min) + revisão humana em críticos/borderline.","Dimensões discutidas: anamnese, exame, hipótese, plano, encaminhamento; métricas como Final Diagnostic Accuracy, Evidence Responsiveness, Critical Pivot, Premature Closure e Decisive Point.","ICP inicial: telemedicinas pequenas com alta rotatividade; hospitais/operadoras/clínicas como expansão.","Cliente decide 100%; LGPD Art.20, fairness, contestação e explicabilidade precisam ser observados.","Pricing pensado por candidato e por fase; margens potencialmente altas, mas WTP não comprovado."],"known_evidence":["Arquitetura do assessment e ICP definidos; falta validação robusta de WTP e validade preditiva/psicométrica."],"known_risks":["WTP insuficiente","validade psicométrica fraca","fairness/LGPD","ciclo de venda RH/saúde","volume de contratação insuficiente","risco de empty ocean"],"provenance":"Contexto histórico do próprio projeto. Deve orientar a pesquisa, mas não substitui evidência externa nem pagamento/outcome."}},"research_readiness":{"status":"RESEARCH_INCOMPLETE","dossier_version":"internal-seed-v1","completeness":0,"missing_fields":["buyer.budgetOwner","buyer.endUser_or_validation","buyer.purchaseTrigger","buyer.purchaseProcess","buyer.procurementReality","problem.currentWorkflow","problem.frequency","problem.urgency","problem.severity","problem.currentAlternatives","problem.statusQuoCost","problem.switchingFriction","problem.whyNow","economics.currentSpend","economics.pricingBenchmarks","economics.wtpEvidence","economics.roiMechanism","economics.valueEquation","economics.paybackLogic","economics.grossMarginLogic","economics.implementationCostLogic","economics.ongoingCostDrivers","economics.unitEconomicRisks","market.buyerCount","market.buyerDensity","market.tam","market.sam","market.somEntryWedge","market.marketGrowth","market.segmentation","market.geographicConcentration","market.seasonalityCyclicality","competition.direct>=3","competition.indirectAlternatives","competition.incumbentResponse","competition.substitutionRisk","competition.marketCrowding","distribution.primaryChannels","distribution.salesCycle","distribution.cacProxy","distribution.trustBarrier","distribution.channelDependencies","distribution.landAndExpand","product.minimumViableWedge","product.workflowInsertionPoint","product.requiredIntegrations","product.requiredData","product.automationBoundary","product.humanInTheLoop","product.technicalRisks","product.implementationComplexity","product.timeToValue","regulation.obligations","regulation.licenses","regulation.privacyData","regulation.liability","regulation.procurementLobby","regulation.regulatoryRiskSummary","defensibility.switchingCosts","defensibility.dataAdvantage","defensibility.workflowEmbedding","defensibility.networkEffects","defensibility.scaleEconomies","defensibility.brandTrust","defensibility.proprietaryTechnology","defensibility.platformDependency","defensibility.incumbentCopyRisk","retentionExpansion.usageFrequency","retentionExpansion.retentionDriver","retentionExpansion.churnRisks","retentionExpansion.expansionPaths","retentionExpansion.naturalUpsell","traction.revenue","traction.customerCount","traction.namedCustomers","traction.growth","traction.funding","traction.usage","traction.outcomes","localization.brazilApplicability","localization.brazilSpecificWorkflow","localization.brazilCompetitors","localization.brazilRegulation","localization.brazilPricingReality","localization.globalFromBrazilCase","risks.contradictionEvidence","risks.externalDependencies"],"source_count":0,"independent_domains":0,"primary_or_official_sources":0,"evidence_claim_count":0,"field_count":87,"supported_field_count":0,"critical_unknowns":["Pesquisa externa completa ainda não executada sob research-dossier-v2-full"]}},"evaluation":null,"created_at_unix":1791376109,"updated_at_unix":1791376109}
~~~
<!-- END_STARTUPCHECKER_RECORD_V1 -->
