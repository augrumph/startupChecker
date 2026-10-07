# YC 539 — Model-informed shortlist

> This is the current **research shortlist** across the 539 sparse YC theses in the repository.
>
> It is **not** a V10 Thesis Score leaderboard. Sparse taglines do not contain enough evidence for a deterministic V10 score.

## Method

1. Run the trained ScoutNet weak-label model over all 539 theses.
2. Remove `EMPTY_OCEAN_RISK` predictions from the first shortlist pass.
3. Downweight high-capital / high-regulatory theses for founder-time prioritization.
4. Prefer explicit buyers/workflows.
5. Diversify the first pass by area so one vocabulary-heavy category does not dominate the leaderboard.
6. Keep the original Scout priority visible as advisory-only.

ScoutNet is known to have vocabulary/category bias. It is a research router, never the final judge.

## Top 30

| # | Thesis | Sparse thesis | Area | Scout | Ocean |
|---:|---|---|---|---:|---|
| 1 | Dayjob | AI Scheduling for Short Haul Trucks | Supply Chain & Logistics | 4.2 | Blue candidate |
| 2 | Khotan | FDE as a platform for rebuilding critical operations in software | Enterprise Operations & Vertical SaaS | 4.2 | Blue candidate |
| 3 | Lunavo | AI assistant for carriers | Supply Chain & Logistics | 4.2 | Blue candidate |
| 4 | Hexa | Autonomous operations for industrial distributors | Industrial / Distribution | 4.2 | Blue candidate |
| 5 | Alchemize | AI Native Customs Brokerages | Supply Chain & Logistics | 4.2 | Blue candidate |
| 6 | LinkLane | AI-powered freight brokerage | Supply Chain & Logistics | 4.2 | Blue candidate |
| 7 | Balance | Full-Stack AI Accounting | Finance & Accounting | 3.9 | Blue candidate |
| 8 | FullSeam | AI agents for corporate accounting teams | Finance & Accounting | 3.9 | Blue candidate |
| 9 | Cohesion | Modern Intelligence for Finance | Finance & Accounting | 3.9 | Blue candidate |
| 10 | Rote | AI-native insurance department for auto body shops | Insurance | 3.9 | Purple |
| 11 | Valgo | Insurance risk layer for physical AI | Insurance | 3.9 | Purple |
| 12 | Huscarl | AI-native actuary enabling self-insurance | Insurance | 3.9 | Purple |
| 13 | Clawvisor | Authorization Layer for AI Agents | Security, Identity & Trust | 3.7 | Purple |
| 14 | Modern | ServiceNow killer | Enterprise Operations | 3.7 | Purple |
| 15 | Asendia AI | AI recruiters for staffing agencies | Recruiting & HR | 3.7 | Purple |
| 16 | PumpGTM | Find and engage desperate buyers | Sales & Marketing | 3.7 | Purple |
| 17 | AgentPhone | Phone Numbers for AI Agents | AI Infrastructure | 3.7 | Purple |
| 18 | Runtime | AI agent harness for payment teams | AI Infrastructure | 3.7 | Purple |
| 19 | Silmaril | Security for agents that self-improves | Security | 3.7 | Purple |
| 20 | Wato | Control point for AI agents at work | AI Infrastructure | 3.7 | Purple |
| 21 | Chronicle Labs | Staging Environments for Enterprise AI Agents | Enterprise AI | 3.7 | Purple |
| 22 | Auxos | Simulations of real people for market research | Research & Simulation | 3.7 | Purple |
| 23 | Saudara AI | AI Native Sourcing Broker | Supply Chain | 3.7 | Purple |
| 24 | Kinect | AI revenue platform for D2C brands | Sales & Marketing | 3.7 | Purple |
| 25 | Maquoketa Research | Automated LiveOps for Game Studios | Vertical AI | 3.7 | Purple |
| 26 | Pentagon | Control plane for agent-native work | Vertical AI | 3.7 | Purple |
| 27 | ProjectX | Agent native workspace for heavy parallel workflows | AI Infrastructure | 3.7 | Purple |
| 28 | Manicule | Devrel For Agents | Sales & Marketing | 3.7 | Purple |
| 29 | Thomas | AI founder running its own companies | Vertical AI | 3.7 | Purple |
| 30 | InventoryQuant | Automate inventory process in insurance | Insurance | 3.9 | Purple |

## Frontend behavior

The StartupChecker front now opens in **Melhores** by default.

For every shortlist thesis it shows:

- rank among the 539;
- sparse thesis;
- Scout priority;
- Blue/Purple hypothesis;
- why it matters;
- what can kill it;
- explicit warning that Scout priority is not V10 Thesis Score.

Other tabs:

- **Todas 539** — complete repository-backed universe and filters.
- **Treino** — current ScoutNet training metrics and guardrails.

## Next calibration step

Deep Research should run first on the shortlist. Once payer, WTP, economics, evidence provenance and alternatives are present, the sparse Scout ranking is replaced by V10 Thesis Score / Truth Score / Founder Attention.
