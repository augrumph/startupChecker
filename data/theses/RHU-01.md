# Rhubius

> Tese própria adicionada ao universo canônico do StartupChecker. O contexto abaixo vem do histórico real do projeto e será usado como seed para pesquisa. **Não está autorizada a receber score V10 até ficar 100% ENGINE_READY.**

- **ID:** `RHU-01`
- **Source:** Internal / Founder
- **Market:** B2B
- **Macro area:** Financial Services & Risk
- **Area:** Finance & Accounting
- **Product type:** AI Decision System
- **Sales motion:** SMB Sales
- **Capital intensity:** LOW
- **Regulatory intensity:** MEDIUM
- **Research status:** `RESEARCH_INCOMPLETE`
- **V10 Thesis Score:** N/A

## Tese

AI-native Finance Office que acompanha a realidade financeira, encontra riscos/oportunidades, testa decisões, envolve especialistas, acompanha execução e mede resultados.

## Pagador conhecido / hipótese atual

Donos de negócios owner-led e profissionais PJ

## Usuário

Dono/gestor financeiro e, quando necessário, especialistas convidados

## Problema

Negócios owner-led tomam decisões financeiras com visão fragmentada de caixa, tributos, compromissos, reservas e consequências futuras.

## Pricing já discutido

Ainda não há pricing validado recuperado.

## Contexto já conhecido do projeto

- Primeiro valor definido: retirada segura sem comprometer tributos, compromissos e reserva.
- Destino de produto: Business Decision Office.
- Sistemas de registro permanecem externos; Rhubius é camada de decisão, não system of record.
- O produto deve se abster quando faltam evidências.
- ICPs já descritos: Professional PJ e Business, compartilhando infraestrutura.
- Riscos técnicos P0 já identificados: tenancy, verdade financeira, saldo ≠ lucro distribuível, claims ≠ facts e dados ausentes/stale.
- Documento canônico auditado em 16/09/2026; à época, LLM ainda não estava conectada ponta a ponta.

## Evidência já conhecida

- Há tese de produto e riscos técnicos bem definidos; faltam cliente pagante, WTP e economics de aquisição/implantação.

## Riscos já conhecidos

- confiança insuficiente
- dados fragmentados ou stale
- erro entre saldo e lucro distribuível
- WTP baixo frente a contador/ERP/banco
- integrações caras

## Regra antes do motor

Este contexto **não conta como dossiê completo**. A pesquisa externa deve completar e auditar buyer, WTP, economics, mercado, concorrência, distribuição, produto, regulação, defensibilidade, retenção, tração, Brasil/global, contradições e evidências.

## Machine record

<!-- STARTUPCHECKER_RECORD_V1 -->
~~~json
{"schema_version":1,"thesis":{"id":"RHU-01","name":"Rhubius","context":{"sector":"Finance / SME","business_models":["AI Decision System"],"payer":"Donos de negócios owner-led e profissionais PJ","user":"Dono/gestor financeiro e, quando necessário, especialistas convidados","problem":"Negócios owner-led tomam decisões financeiras com visão fragmentada de caixa, tributos, compromissos, reservas e consequências futuras.","solution":"AI-native Finance Office que acompanha a realidade financeira, encontra riscos/oportunidades, testa decisões, envolve especialistas, acompanha execução e mede resultados.","source":"Internal / Founder","batch":"Internal 2026","location":"Brazil","area":"Finance & Accounting","source_url":"","analysis_status":"RESEARCH_INCOMPLETE","adaptation_mode":"BRAZIL_OR_GLOBAL","market_types":["B2B"],"macro_area":"Financial Services & Risk","product_type":"AI Decision System","sales_motion":"SMB Sales","capital_intensity":"LOW","regulatory_intensity":"MEDIUM","filter_confidence":"FOUNDER_CONTEXT"},"router":{},"engine_override":[],"universal":{},"experts":{},"learning":{},"potential":{},"blue_ocean":{},"founder_fit":{},"hypotheses":[],"candidate_experiments":[],"experiment_ledger":[],"outcomes":[],"decision_history":[],"scenario_value":null,"evidence_records":[],"evidence_as_of_unix":1791376109,"research_dossier":{"version":"internal-seed-v1","_seed_context":{"thesis_ptbr":"AI-native Finance Office que acompanha a realidade financeira, encontra riscos/oportunidades, testa decisões, envolve especialistas, acompanha execução e mede resultados.","economic_buyer":"Donos de negócios owner-led e profissionais PJ","end_user":"Dono/gestor financeiro e, quando necessário, especialistas convidados","problem_ptbr":"Negócios owner-led tomam decisões financeiras com visão fragmentada de caixa, tributos, compromissos, reservas e consequências futuras.","pricing_history":"Ainda não há pricing validado recuperado.","known_project_facts":["Primeiro valor definido: retirada segura sem comprometer tributos, compromissos e reserva.","Destino de produto: Business Decision Office.","Sistemas de registro permanecem externos; Rhubius é camada de decisão, não system of record.","O produto deve se abster quando faltam evidências.","ICPs já descritos: Professional PJ e Business, compartilhando infraestrutura.","Riscos técnicos P0 já identificados: tenancy, verdade financeira, saldo ≠ lucro distribuível, claims ≠ facts e dados ausentes/stale.","Documento canônico auditado em 16/09/2026; à época, LLM ainda não estava conectada ponta a ponta."],"known_evidence":["Há tese de produto e riscos técnicos bem definidos; faltam cliente pagante, WTP e economics de aquisição/implantação."],"known_risks":["confiança insuficiente","dados fragmentados ou stale","erro entre saldo e lucro distribuível","WTP baixo frente a contador/ERP/banco","integrações caras"],"provenance":"Contexto histórico do próprio projeto. Deve orientar a pesquisa, mas não substitui evidência externa nem pagamento/outcome."}},"research_readiness":{"status":"RESEARCH_INCOMPLETE","dossier_version":"internal-seed-v1","completeness":0,"missing_fields":["buyer.budgetOwner","buyer.endUser_or_validation","buyer.purchaseTrigger","buyer.purchaseProcess","buyer.procurementReality","problem.currentWorkflow","problem.frequency","problem.urgency","problem.severity","problem.currentAlternatives","problem.statusQuoCost","problem.switchingFriction","problem.whyNow","economics.currentSpend","economics.pricingBenchmarks","economics.wtpEvidence","economics.roiMechanism","economics.valueEquation","economics.paybackLogic","economics.grossMarginLogic","economics.implementationCostLogic","economics.ongoingCostDrivers","economics.unitEconomicRisks","market.buyerCount","market.buyerDensity","market.tam","market.sam","market.somEntryWedge","market.marketGrowth","market.segmentation","market.geographicConcentration","market.seasonalityCyclicality","competition.direct>=3","competition.indirectAlternatives","competition.incumbentResponse","competition.substitutionRisk","competition.marketCrowding","distribution.primaryChannels","distribution.salesCycle","distribution.cacProxy","distribution.trustBarrier","distribution.channelDependencies","distribution.landAndExpand","product.minimumViableWedge","product.workflowInsertionPoint","product.requiredIntegrations","product.requiredData","product.automationBoundary","product.humanInTheLoop","product.technicalRisks","product.implementationComplexity","product.timeToValue","regulation.obligations","regulation.licenses","regulation.privacyData","regulation.liability","regulation.procurementLobby","regulation.regulatoryRiskSummary","defensibility.switchingCosts","defensibility.dataAdvantage","defensibility.workflowEmbedding","defensibility.networkEffects","defensibility.scaleEconomies","defensibility.brandTrust","defensibility.proprietaryTechnology","defensibility.platformDependency","defensibility.incumbentCopyRisk","retentionExpansion.usageFrequency","retentionExpansion.retentionDriver","retentionExpansion.churnRisks","retentionExpansion.expansionPaths","retentionExpansion.naturalUpsell","traction.revenue","traction.customerCount","traction.namedCustomers","traction.growth","traction.funding","traction.usage","traction.outcomes","localization.brazilApplicability","localization.brazilSpecificWorkflow","localization.brazilCompetitors","localization.brazilRegulation","localization.brazilPricingReality","localization.globalFromBrazilCase","risks.contradictionEvidence","risks.externalDependencies"],"source_count":0,"independent_domains":0,"primary_or_official_sources":0,"evidence_claim_count":0,"field_count":87,"supported_field_count":0,"critical_unknowns":["Pesquisa externa completa ainda não executada sob research-dossier-v2-full"]}},"evaluation":null,"created_at_unix":1791376109,"updated_at_unix":1791376109}
~~~
<!-- END_STARTUPCHECKER_RECORD_V1 -->
