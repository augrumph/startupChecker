# Olympia

> Tese própria adicionada ao universo canônico do StartupChecker. O contexto abaixo vem do histórico real do projeto e será usado como seed para pesquisa. **Não está autorizada a receber score V10 até ficar 100% ENGINE_READY.**

- **ID:** `OLY-01`
- **Source:** Internal / Founder
- **Market:** B2B
- **Macro area:** Enterprise Software
- **Area:** Legal & Compliance
- **Product type:** AI Agent / Workflow
- **Sales motion:** SMB Sales
- **Capital intensity:** LOW
- **Regulatory intensity:** MEDIUM
- **Research status:** `RESEARCH_INCOMPLETE`
- **V10 Thesis Score:** N/A

## Tese

Esteira de inteligência probatória e automação defensiva: inicial → revisão humana → organização de provas → solicitação/coleta segura de documentos.

## Pagador conhecido / hipótese atual

Advogados trabalhistas patronais solo e pequenos/médios escritórios

## Usuário

Advogado responsável pelo contencioso e equipe jurídica

## Problema

A defesa trabalhista patronal exige leitura da inicial, estruturação de fatos, verificação, organização probatória e cobrança de documentos em fluxos muito manuais.

## Pricing já discutido

Hipótese: ~R$1.000/mês por advogado + cobrança por casos adicionais; ainda precisa validação com dinheiro.

## Contexto já conhecido do projeto

- Marco A: inicial → extração/verificação → fila humana → organização de provas → solicitação estruturada com link seguro.
- Backend Go + Rust; Railway; banco por cliente; bucket/GED; IA via OpenAI/Anthropic.
- JEV TypeSafe SystemOne em shadow; Engine desacoplado Question/Request/Answer/Result.
- Validações V4, livro-razão imutável, fila de verificação, catálogo de requisitos de prova e solicitações com token fazem parte do escopo.
- ICP inicial: advogado patronal solo e pequenos escritórios.
- Discussão de pricing: cerca de R$1.000/mês por advogado + cobrança por novos casos; alternativa de mensalidade maior sem adicionais.
- Meta econômica discutida: margem líquida alta; custo de IA/caso precisa ser controlado.

## Evidência já conhecida

- Produto em desenvolvimento com arquitetura e fluxo do piloto definidos; ainda falta série consistente de clientes pagantes + outcome observado.

## Riscos já conhecidos

- ticket premium não fechar
- IA/suporte comprimirem margem
- integrações/documentos gerarem implantação pesada
- revisão jurídica excessiva
- LGPD/segurança
- economia de tempo menor que prometida

## Regra antes do motor

Este contexto **não conta como dossiê completo**. A pesquisa externa deve completar e auditar buyer, WTP, economics, mercado, concorrência, distribuição, produto, regulação, defensibilidade, retenção, tração, Brasil/global, contradições e evidências.

## Machine record

<!-- STARTUPCHECKER_RECORD_V1 -->
~~~json
{"schema_version":1,"thesis":{"id":"OLY-01","name":"Olympia","context":{"sector":"Legaltech / Trabalhista patronal","business_models":["AI Agent / Workflow"],"payer":"Advogados trabalhistas patronais solo e pequenos/médios escritórios","user":"Advogado responsável pelo contencioso e equipe jurídica","problem":"A defesa trabalhista patronal exige leitura da inicial, estruturação de fatos, verificação, organização probatória e cobrança de documentos em fluxos muito manuais.","solution":"Esteira de inteligência probatória e automação defensiva: inicial → revisão humana → organização de provas → solicitação/coleta segura de documentos.","source":"Internal / Founder","batch":"Internal 2026","location":"Brazil","area":"Legal & Compliance","source_url":"","analysis_status":"RESEARCH_INCOMPLETE","adaptation_mode":"BRAZIL_OR_GLOBAL","market_types":["B2B"],"macro_area":"Enterprise Software","product_type":"AI Agent / Workflow","sales_motion":"SMB Sales","capital_intensity":"LOW","regulatory_intensity":"MEDIUM","filter_confidence":"FOUNDER_CONTEXT"},"router":{},"engine_override":[],"universal":{},"experts":{},"learning":{},"potential":{},"blue_ocean":{},"founder_fit":{},"hypotheses":[],"candidate_experiments":[],"experiment_ledger":[],"outcomes":[],"decision_history":[],"scenario_value":null,"evidence_records":[],"evidence_as_of_unix":1791376109,"research_dossier":{"version":"internal-seed-v1","_seed_context":{"thesis_ptbr":"Esteira de inteligência probatória e automação defensiva: inicial → revisão humana → organização de provas → solicitação/coleta segura de documentos.","economic_buyer":"Advogados trabalhistas patronais solo e pequenos/médios escritórios","end_user":"Advogado responsável pelo contencioso e equipe jurídica","problem_ptbr":"A defesa trabalhista patronal exige leitura da inicial, estruturação de fatos, verificação, organização probatória e cobrança de documentos em fluxos muito manuais.","pricing_history":"Hipótese: ~R$1.000/mês por advogado + cobrança por casos adicionais; ainda precisa validação com dinheiro.","known_project_facts":["Marco A: inicial → extração/verificação → fila humana → organização de provas → solicitação estruturada com link seguro.","Backend Go + Rust; Railway; banco por cliente; bucket/GED; IA via OpenAI/Anthropic.","JEV TypeSafe SystemOne em shadow; Engine desacoplado Question/Request/Answer/Result.","Validações V4, livro-razão imutável, fila de verificação, catálogo de requisitos de prova e solicitações com token fazem parte do escopo.","ICP inicial: advogado patronal solo e pequenos escritórios.","Discussão de pricing: cerca de R$1.000/mês por advogado + cobrança por novos casos; alternativa de mensalidade maior sem adicionais.","Meta econômica discutida: margem líquida alta; custo de IA/caso precisa ser controlado."],"known_evidence":["Produto em desenvolvimento com arquitetura e fluxo do piloto definidos; ainda falta série consistente de clientes pagantes + outcome observado."],"known_risks":["ticket premium não fechar","IA/suporte comprimirem margem","integrações/documentos gerarem implantação pesada","revisão jurídica excessiva","LGPD/segurança","economia de tempo menor que prometida"],"provenance":"Contexto histórico do próprio projeto. Deve orientar a pesquisa, mas não substitui evidência externa nem pagamento/outcome."}},"research_readiness":{"status":"RESEARCH_INCOMPLETE","dossier_version":"internal-seed-v1","completeness":0,"missing_fields":["buyer.budgetOwner","buyer.endUser_or_validation","buyer.purchaseTrigger","buyer.purchaseProcess","buyer.procurementReality","problem.currentWorkflow","problem.frequency","problem.urgency","problem.severity","problem.currentAlternatives","problem.statusQuoCost","problem.switchingFriction","problem.whyNow","economics.currentSpend","economics.pricingBenchmarks","economics.wtpEvidence","economics.roiMechanism","economics.valueEquation","economics.paybackLogic","economics.grossMarginLogic","economics.implementationCostLogic","economics.ongoingCostDrivers","economics.unitEconomicRisks","market.buyerCount","market.buyerDensity","market.tam","market.sam","market.somEntryWedge","market.marketGrowth","market.segmentation","market.geographicConcentration","market.seasonalityCyclicality","competition.direct>=3","competition.indirectAlternatives","competition.incumbentResponse","competition.substitutionRisk","competition.marketCrowding","distribution.primaryChannels","distribution.salesCycle","distribution.cacProxy","distribution.trustBarrier","distribution.channelDependencies","distribution.landAndExpand","product.minimumViableWedge","product.workflowInsertionPoint","product.requiredIntegrations","product.requiredData","product.automationBoundary","product.humanInTheLoop","product.technicalRisks","product.implementationComplexity","product.timeToValue","regulation.obligations","regulation.licenses","regulation.privacyData","regulation.liability","regulation.procurementLobby","regulation.regulatoryRiskSummary","defensibility.switchingCosts","defensibility.dataAdvantage","defensibility.workflowEmbedding","defensibility.networkEffects","defensibility.scaleEconomies","defensibility.brandTrust","defensibility.proprietaryTechnology","defensibility.platformDependency","defensibility.incumbentCopyRisk","retentionExpansion.usageFrequency","retentionExpansion.retentionDriver","retentionExpansion.churnRisks","retentionExpansion.expansionPaths","retentionExpansion.naturalUpsell","traction.revenue","traction.customerCount","traction.namedCustomers","traction.growth","traction.funding","traction.usage","traction.outcomes","localization.brazilApplicability","localization.brazilSpecificWorkflow","localization.brazilCompetitors","localization.brazilRegulation","localization.brazilPricingReality","localization.globalFromBrazilCase","risks.contradictionEvidence","risks.externalDependencies"],"source_count":0,"independent_domains":0,"primary_or_official_sources":0,"evidence_claim_count":0,"field_count":87,"supported_field_count":0,"critical_unknowns":["Pesquisa externa completa ainda não executada sob research-dossier-v2-full"]}},"evaluation":null,"created_at_unix":1791376109,"updated_at_unix":1791376109}
~~~
<!-- END_STARTUPCHECKER_RECORD_V1 -->
