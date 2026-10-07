# Dayjob

> Pesquisa migrada do Deep Research Pass 1 para o registro canônico da tese. Este arquivo contém tudo que já foi pesquisado, mas **ainda não está ENGINE_READY** segundo o novo gate de pesquisa.

- **ID:** `yc-spring-2026-dayjob`
- **Source:** Y Combinator
- **Batch:** Spring 2026
- **Location:** London, England, United Kingdom
- **Market:** B2B
- **Macro area:** Commerce & Logistics
- **Area:** Supply Chain & Logistics
- **Product type:** SaaS / Workflow
- **Sales motion:** B2B Sales
- **Research status:** `RESEARCH_INCOMPLETE`
- **Deep Research Pass 1:** `DEEP_RESEARCHED`
- **Research priority (legado):** 8.3
- **Scout priority (legado):** 4.2
- **V10 Thesis Score:** N/A

## Tese reformulada em PT-BR

Otimiza automaticamente a escala e o despacho de frotas de curta distância, buscando reduzir ociosidade, atraso e trabalho manual de planejamento.

## Quem paga

Operadores de frota, waste management, transporte local e empresas com despacho recorrente.

## Dor econômica

Escalas e rotas mudam o tempo todo e ainda dependem de despachantes coordenando exceções manualmente.

## Como captura valor

Aumentar utilização de frota e produtividade sem contratar mais planners/dispatchers.

## O que já foi encontrado

- YC relata ganhos de eficiência superiores a 8% em clientes de waste management desde o início do uso.

## Por que entrou no ranking de pesquisa

É #9 porque o ROI operacional é mensurável e aparece cedo. O principal limite é integração com TMS/ERP e capacidade de lidar com exceções reais.

## O que pode matar a tese

Cai se o ganho de 8% não se repetir fora dos primeiros clientes ou se integração consumir meses.

## Fontes já pesquisadas

1. https://www.ycombinator.com/companies/dayjob

## Lacunas obrigatórias antes do motor

Este registro **não pode ser pontuado pelo V10 ainda**. O Pass 1 não cobriu com profundidade suficiente:

- `buyer.budgetOwner`
- `buyer.purchaseTrigger`
- `buyer.purchaseProcess`
- `buyer.procurementReality`
- `problem.currentWorkflow`
- `problem.frequency`
- `problem.urgency`
- `problem.severity`
- `problem.statusQuoCost`
- `problem.switchingFriction`
- `economics.currentSpend`
- `economics.pricingBenchmarks`
- `economics.wtpEvidence`
- `economics.roiMechanism`
- `economics.valueEquation`
- `economics.paybackLogic`
- `economics.grossMarginLogic`
- `economics.implementationCostLogic`
- `market.buyerCount`
- `market.buyerDensity`
- `market.tam`
- `market.sam`
- `market.somEntryWedge`
- `market.marketGrowth`
- `competition.direct>=3`
- `competition.indirectAlternatives`
- `competition.incumbentResponse`
- `competition.substitutionRisk`
- `competition.marketCrowding`
- `distribution.primaryChannels`
- `distribution.salesCycle`
- `distribution.cacProxy`
- `distribution.trustBarrier`
- `distribution.landAndExpand`
- `product.requiredIntegrations`
- `product.requiredData`
- `product.automationBoundary`
- `product.humanInTheLoop`
- `product.technicalRisks`
- `product.implementationComplexity`
- `product.timeToValue`
- `regulation.obligations`
- `regulation.licenses`
- `regulation.privacyData`
- `regulation.liability`
- `regulation.regulatoryRiskSummary`
- `defensibility.switchingCosts`
- `defensibility.dataAdvantage`
- `defensibility.workflowEmbedding`
- `defensibility.networkEffects`
- `defensibility.platformDependency`
- `defensibility.incumbentCopyRisk`
- `retentionExpansion.usageFrequency`
- `retentionExpansion.retentionDriver`
- `retentionExpansion.churnRisks`
- `retentionExpansion.expansionPaths`
- `localization.brazilSpecificWorkflow`
- `localization.brazilCompetitors`
- `localization.brazilRegulation`
- `localization.brazilPricingReality`

Além disso, o novo gate exige no mínimo 12 fontes, 6 domínios independentes, 2 fontes primárias/oficiais, 12 claims auditáveis e ausência de unknowns críticos.

## Machine record

<!-- STARTUPCHECKER_RECORD_V1 -->
~~~json
{"schema_version":1,"thesis":{"id":"yc-spring-2026-dayjob","name":"Dayjob","context":{"sector":"B2B / Supply Chain and Logistics","business_models":["B2B","Supply Chain and Logistics"],"payer":"Operadores de frota, waste management, transporte local e empresas com despacho recorrente.","user":"","problem":"Escalas e rotas mudam o tempo todo e ainda dependem de despachantes coordenando exceções manualmente.","solution":"Otimiza automaticamente a escala e o despacho de frotas de curta distância, buscando reduzir ociosidade, atraso e trabalho manual de planejamento.","source":"Y Combinator","batch":"Spring 2026","location":"London, England, United Kingdom","area":"Supply Chain & Logistics","source_url":"","analysis_status":"RESEARCH_INCOMPLETE","adaptation_mode":"LOCALIZE_BRAZIL","market_types":["B2B"],"macro_area":"Commerce & Logistics","product_type":"SaaS / Workflow","sales_motion":"B2B Sales","capital_intensity":"LOW","regulatory_intensity":"LOW","filter_confidence":"TRIAGE_HEURISTIC"},"router":{},"engine_override":[],"universal":{},"experts":{},"learning":{},"potential":{},"blue_ocean":{},"founder_fit":{},"hypotheses":[],"candidate_experiments":[],"experiment_ledger":[],"outcomes":[],"decision_history":[],"scenario_value":null,"evidence_records":[{"id":"pass1-1","claim":"YC relata ganhos de eficiência superiores a 8% em clientes de waste management desde o início do uso.","source_kind":"UNKNOWN","source_url":"https://www.ycombinator.com/companies/dayjob","source_title":null,"published_at_unix":null,"observed_at_unix":null,"fetched_at_unix":1791375246,"criterion_keys":[],"direction":"SUPPORTS","strength":0.55,"reliability":0.55,"independence_group":null,"content_hash":null,"note":"Migrado do Deep Research Pass 1; associação claim↔fonte ainda precisa de auditoria granular."}],"evidence_as_of_unix":1791375246,"research_dossier":{"version":"deep-research-pass1-migrated-v1","original_status":"DEEP_RESEARCHED","research_priority":8.3,"scout_priority":4.2,"ocean_hypothesis":"BLUE_HYPOTHESIS","thesis":{"rewritten_ptbr":"Otimiza automaticamente a escala e o despacho de frotas de curta distância, buscando reduzir ociosidade, atraso e trabalho manual de planejamento.","original_tagline":"AI Scheduling for Short Haul Trucks","category":"B2B / Supply Chain and Logistics","market_types":["B2B"],"macro_area":"Commerce & Logistics","area":"Supply Chain & Logistics","product_type":"SaaS / Workflow","sales_motion":"B2B Sales"},"buyer":{"economic_buyer_ptbr":"Operadores de frota, waste management, transporte local e empresas com despacho recorrente.","budget_owner":"UNKNOWN","end_user":"UNKNOWN","beneficiary":"UNKNOWN","purchase_trigger":"UNKNOWN","purchase_process":"UNKNOWN","procurement_reality":"UNKNOWN"},"problem":{"economic_pain_ptbr":"Escalas e rotas mudam o tempo todo e ainda dependem de despachantes coordenando exceções manualmente.","current_workflow":"UNKNOWN","frequency":"UNKNOWN","urgency":"UNKNOWN","severity":"UNKNOWN","status_quo_cost":"UNKNOWN","switching_friction":"UNKNOWN"},"economics":{"value_capture_ptbr":"Aumentar utilização de frota e produtividade sem contratar mais planners/dispatchers.","current_spend":[],"pricing_benchmarks":[],"wtp_evidence":[],"roi_mechanism":"UNKNOWN","value_equation":"UNKNOWN","payback_logic":"UNKNOWN","gross_margin_logic":"UNKNOWN","implementation_cost_logic":"UNKNOWN"},"evidence":{"facts_ptbr":["YC relata ganhos de eficiência superiores a 8% em clientes de waste management desde o início do uso."],"source_urls":["https://www.ycombinator.com/companies/dayjob"],"source_count":1,"independent_domains":0},"ranking":{"deep_research_rank":9,"why_ranked_ptbr":"É #9 porque o ROI operacional é mensurável e aparece cedo. O principal limite é integração com TMS/ERP e capacidade de lidar com exceções reais.","what_can_kill_ptbr":"Cai se o ganho de 8% não se repetir fora dos primeiros clientes ou se integração consumir meses."},"market":{"buyer_count":"UNKNOWN","buyer_density":"UNKNOWN","tam":"UNKNOWN","sam":"UNKNOWN","som_entry_wedge":"UNKNOWN","market_growth":"UNKNOWN"},"competition":{"direct":[],"indirect_alternatives":[],"incumbent_response":"UNKNOWN","substitution_risk":"UNKNOWN","market_crowding":"UNKNOWN"},"distribution":{"primary_channels":[],"sales_motion":"B2B Sales","sales_cycle":"UNKNOWN","cac_proxy":"UNKNOWN","trust_barrier":"UNKNOWN","land_and_expand":"UNKNOWN"},"product":{"minimum_viable_wedge":"UNKNOWN","workflow_insertion_point":"UNKNOWN","required_integrations":[],"required_data":[],"automation_boundary":"UNKNOWN","human_in_the_loop":"UNKNOWN","technical_risks":[],"implementation_complexity":"UNKNOWN","time_to_value":"UNKNOWN"},"regulation":{"obligations":[],"licenses":[],"privacy_data":[],"liability":[],"regulatory_risk_summary":"UNKNOWN"},"defensibility":{"switching_costs":"UNKNOWN","data_advantage":"UNKNOWN","workflow_embedding":"UNKNOWN","network_effects":"UNKNOWN","scale_economies":"UNKNOWN","brand_trust":"UNKNOWN","proprietary_technology":"UNKNOWN","platform_dependency":"UNKNOWN","incumbent_copy_risk":"UNKNOWN"},"retention_expansion":{"usage_frequency":"UNKNOWN","retention_driver":"UNKNOWN","churn_risks":[],"expansion_paths":[],"natural_upsell":"UNKNOWN"},"traction":{"revenue":"UNKNOWN","customer_count":"UNKNOWN","named_customers":[],"growth":"UNKNOWN","funding":"UNKNOWN","usage":"UNKNOWN","outcomes":["YC relata ganhos de eficiência superiores a 8% em clientes de waste management desde o início do uso."]},"localization":{"brazil_applicability":"UNKNOWN","brazil_specific_workflow":"UNKNOWN","brazil_competitors":[],"brazil_regulation":[],"brazil_pricing_reality":"UNKNOWN","global_from_brazil_case":"UNKNOWN"},"risks":{"fatal_assumptions":["Cai se o ganho de 8% não se repetir fora dos primeiros clientes ou se integração consumir meses."],"contradiction_evidence":[],"unknowns":["buyer.budgetOwner","buyer.purchaseTrigger","buyer.purchaseProcess","buyer.procurementReality","problem.currentWorkflow","problem.frequency","problem.urgency","problem.severity","problem.statusQuoCost","problem.switchingFriction","economics.currentSpend","economics.pricingBenchmarks","economics.wtpEvidence","economics.roiMechanism","economics.valueEquation","economics.paybackLogic","economics.grossMarginLogic","economics.implementationCostLogic","market.buyerCount","market.buyerDensity","market.tam","market.sam","market.somEntryWedge","market.marketGrowth","competition.direct>=3","competition.indirectAlternatives","competition.incumbentResponse","competition.substitutionRisk","competition.marketCrowding","distribution.primaryChannels","distribution.salesCycle","distribution.cacProxy","distribution.trustBarrier","distribution.landAndExpand","product.requiredIntegrations","product.requiredData","product.automationBoundary","product.humanInTheLoop","product.technicalRisks","product.implementationComplexity","product.timeToValue","regulation.obligations","regulation.licenses","regulation.privacyData","regulation.liability","regulation.regulatoryRiskSummary","defensibility.switchingCosts","defensibility.dataAdvantage","defensibility.workflowEmbedding","defensibility.networkEffects","defensibility.platformDependency","defensibility.incumbentCopyRisk","retentionExpansion.usageFrequency","retentionExpansion.retentionDriver","retentionExpansion.churnRisks","retentionExpansion.expansionPaths","localization.brazilSpecificWorkflow","localization.brazilCompetitors","localization.brazilRegulation","localization.brazilPricingReality"],"external_dependencies":[]}},"research_readiness":{"status":"RESEARCH_INCOMPLETE","dossier_version":"deep-research-pass1-migrated-v1","completeness":0.35,"missing_fields":["buyer.budgetOwner","buyer.purchaseTrigger","buyer.purchaseProcess","buyer.procurementReality","problem.currentWorkflow","problem.frequency","problem.urgency","problem.severity","problem.statusQuoCost","problem.switchingFriction","economics.currentSpend","economics.pricingBenchmarks","economics.wtpEvidence","economics.roiMechanism","economics.valueEquation","economics.paybackLogic","economics.grossMarginLogic","economics.implementationCostLogic","market.buyerCount","market.buyerDensity","market.tam","market.sam","market.somEntryWedge","market.marketGrowth","competition.direct>=3","competition.indirectAlternatives","competition.incumbentResponse","competition.substitutionRisk","competition.marketCrowding","distribution.primaryChannels","distribution.salesCycle","distribution.cacProxy","distribution.trustBarrier","distribution.landAndExpand","product.requiredIntegrations","product.requiredData","product.automationBoundary","product.humanInTheLoop","product.technicalRisks","product.implementationComplexity","product.timeToValue","regulation.obligations","regulation.licenses","regulation.privacyData","regulation.liability","regulation.regulatoryRiskSummary","defensibility.switchingCosts","defensibility.dataAdvantage","defensibility.workflowEmbedding","defensibility.networkEffects","defensibility.platformDependency","defensibility.incumbentCopyRisk","retentionExpansion.usageFrequency","retentionExpansion.retentionDriver","retentionExpansion.churnRisks","retentionExpansion.expansionPaths","localization.brazilSpecificWorkflow","localization.brazilCompetitors","localization.brazilRegulation","localization.brazilPricingReality"],"source_count":1,"independent_domains":0,"primary_or_official_sources":0,"evidence_claim_count":1,"critical_unknowns":["pagador detalhado/budget owner","WTP/pricing","economics completos","concorrência exaustiva","distribuição/CAC","regulação aplicável","Brasil/localização"]}},"evaluation":null,"created_at_unix":1791375246,"updated_at_unix":1791375246}
~~~
<!-- END_STARTUPCHECKER_RECORD_V1 -->
