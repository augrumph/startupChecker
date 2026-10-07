"use client";

import {
  Activity,
  ArrowRight,
  BrainCircuit,
  CircleDollarSign,
  FilePlus2,
  FlaskConical,
  Gauge,
  LayoutDashboard,
  Search,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";

type Thesis = {
  id: string;
  name: string;
  sector: string;
  engine: string;
  decision: string;
  core: number;
  expert: number;
  learning: number;
  evidence: number;
  next: string;
};

const seeded: Thesis[] = [
  {
    id: "GYF-01",
    name: "Gyfted",
    sector: "Formação esportiva",
    engine: "Aspiration / Transformation",
    decision: "7-day WTP / Demand Test",
    core: 87,
    expert: 88.5,
    learning: 91,
    evidence: 2,
    next: "Conseguir compromissos reais no ticket: reserva, depósito ou matrícula.",
  },
  {
    id: "OLY-01",
    name: "Olympia",
    sector: "Legaltech trabalhista",
    engine: "Economic ROI",
    decision: "30-day Paid Test",
    core: 88.5,
    expert: 86.5,
    learning: 84,
    evidence: 3,
    next: "Fechar piloto pago e medir horas economizadas, custo de entrega e outcome.",
  },
  {
    id: "RHU-01",
    name: "Rhubius",
    sector: "Fintech / PME",
    engine: "Economic ROI",
    decision: "48h Falsification",
    core: 81.5,
    expert: 81,
    learning: 83,
    evidence: 1,
    next: "Tentar destruir a hipótese com donos/CFOs antes de qualquer build.",
  },
  {
    id: "COR-01",
    name: "Cori Insight",
    sector: "Healthtech",
    engine: "Economic ROI",
    decision: "Kill / Reformulate",
    core: 46.5,
    expert: 40,
    learning: 53,
    evidence: 4,
    next: "Não investir mais sem uma nova economia de valor e um pagador claro.",
  },
];

function scoreTone(score: number) {
  if (score >= 80) return "score score-good";
  if (score >= 65) return "score score-warn";
  return "score score-bad";
}

function decisionTone(decision: string) {
  if (decision.toLowerCase().includes("kill")) return "pill pill-bad";
  if (decision.toLowerCase().includes("paid")) return "pill pill-good";
  return "pill pill-warn";
}

export function ThesisWorkbench() {
  const [selected, setSelected] = useState(seeded[0].id);
  const [query, setQuery] = useState("");
  const [showNew, setShowNew] = useState(false);

  const theses = useMemo(
    () =>
      seeded.filter((item) =>
        [item.name, item.sector, item.engine, item.decision]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [query],
  );

  const thesis = seeded.find((item) => item.id === selected) ?? seeded[0];

  return (
    <main className="app-shell">
      <aside className="sidebar glass">
        <div className="brand">
          <div className="brand-mark">
            <BrainCircuit size={18} strokeWidth={2.2} />
          </div>
          <div>
            <strong>Startup Checker</strong>
            <span>Thesis Engine V4</span>
          </div>
        </div>

        <nav className="nav">
          <button className="nav-item nav-active">
            <LayoutDashboard size={17} />
            Teses
          </button>
          <button className="nav-item">
            <FlaskConical size={17} />
            Experimentos
          </button>
          <button className="nav-item">
            <Activity size={17} />
            Outcomes
          </button>
        </nav>

        <div className="smart-blocks">
          <div className="smart smart-blue">
            <span>Investigar agora</span>
            <strong>3</strong>
          </div>
          <div className="smart smart-red">
            <span>Kill</span>
            <strong>7</strong>
          </div>
          <div className="smart smart-green">
            <span>Paid test</span>
            <strong>1</strong>
          </div>
        </div>

        <div className="sidebar-spacer" />

        <button className="nav-item">
          <Settings2 size={17} />
          Motor & pesos
        </button>
      </aside>

      <section className="list-column">
        <header className="list-header">
          <div>
            <h1>Teses</h1>
            <p>Mate cedo. Aprofunde só onde há sinal.</p>
          </div>
          <button className="circle-button" onClick={() => setShowNew(true)} aria-label="Nova tese">
            <FilePlus2 size={18} />
          </button>
        </header>

        <label className="search">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar"
          />
        </label>

        <div className="thesis-list">
          {theses.map((item) => (
            <button
              key={item.id}
              className={item.id === thesis.id ? "thesis-row thesis-selected" : "thesis-row"}
              onClick={() => setSelected(item.id)}
            >
              <div className="mini-ring">
                <span>{Math.round((item.core + item.expert) / 2)}</span>
              </div>
              <div className="row-copy">
                <div className="row-title">
                  <strong>{item.name}</strong>
                  <span>{item.evidence}/5</span>
                </div>
                <p>{item.sector}</p>
                <small>{item.decision}</small>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="detail">
        <header className="detail-bar">
          <div>
            <span className="eyebrow">{thesis.engine}</span>
            <h2>{thesis.name}</h2>
          </div>
          <button className="primary-button" onClick={() => setShowNew(true)}>
            Nova avaliação
          </button>
        </header>

        <div className="content">
          <section className="hero-card">
            <div className="hero-score">
              <div className="big-ring">
                <div>
                  <strong>{Math.round((thesis.core + thesis.expert) / 2)}</strong>
                  <span>estrutura</span>
                </div>
              </div>
            </div>
            <div className="hero-copy">
              <span className={decisionTone(thesis.decision)}>{thesis.decision}</span>
              <h3>Vale founder time?</h3>
              <p>
                O motor separa força estrutural de evidência. A decisão abaixo é o próximo gasto
                racional de tempo — não uma promessa de sucesso.
              </p>
              <div className="next-action">
                <Sparkles size={18} />
                <div>
                  <span>Próximo experimento</span>
                  <strong>{thesis.next}</strong>
                </div>
                <ArrowRight size={18} />
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section-title">
              <div>
                <h3>Leitura do motor</h3>
                <p>Estrutura, especialista, velocidade de aprendizado e evidência.</p>
              </div>
            </div>

            <div className="metric-list">
              <div className="metric-row">
                <div className="metric-icon"><Target size={18} /></div>
                <div className="metric-copy">
                  <strong>Core</strong>
                  <span>Fundamentos universais do valor e do pagador.</span>
                </div>
                <div className={scoreTone(thesis.core)}>{thesis.core}</div>
              </div>

              <div className="metric-row">
                <div className="metric-icon"><CircleDollarSign size={18} /></div>
                <div className="metric-copy">
                  <strong>Expert</strong>
                  <span>Critérios do motor {thesis.engine}.</span>
                </div>
                <div className={scoreTone(thesis.expert)}>{thesis.expert}</div>
              </div>

              <div className="metric-row">
                <div className="metric-icon"><Gauge size={18} /></div>
                <div className="metric-copy">
                  <strong>Learning velocity</strong>
                  <span>Quanto rápido e barato conseguimos descobrir a verdade.</span>
                </div>
                <div className={scoreTone(thesis.learning)}>{thesis.learning}</div>
              </div>

              <div className="metric-row">
                <div className="metric-icon"><TrendingUp size={18} /></div>
                <div className="metric-copy">
                  <strong>Força da evidência</strong>
                  <span>Hipótese → comportamento → dinheiro → outcome observado.</span>
                </div>
                <div className="evidence-dots" aria-label={`Evidência ${thesis.evidence} de 5`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <i key={n} className={n <= thesis.evidence ? "dot dot-on" : "dot"} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="section split">
            <div className="plain-card">
              <span className="eyebrow">Regra do motor</span>
              <h3>Potencial não salva tese ruim.</h3>
              <p>
                TAM, recorrência, margem, IA, moat e adjacências entram depois. Primeiro: alguém
                valoriza isso o suficiente, consegue pagar e conseguimos provar sem desperdiçar meses?
              </p>
            </div>
            <div className="plain-card">
              <span className="eyebrow">V4</span>
              <h3>Mixture of Experts.</h3>
              <p>
                Uma tese pode combinar ROI econômico, aspiração, risco, transação, network e
                conveniência. O roteador não força negócios incomparáveis na mesma régua.
              </p>
            </div>
          </section>
        </div>
      </section>

      {showNew && (
        <div className="sheet-backdrop" onMouseDown={() => setShowNew(false)}>
          <div className="sheet" onMouseDown={(e) => e.stopPropagation()}>
            <div className="sheet-bar">
              <button className="text-button" onClick={() => setShowNew(false)}>Cancelar</button>
              <strong>Nova tese</strong>
              <button className="text-button text-primary" onClick={() => setShowNew(false)}>Continuar</button>
            </div>
            <div className="form-section">
              <label>
                <span>Nome</span>
                <input placeholder="Ex.: marketplace de peças industriais" autoFocus />
              </label>
              <label>
                <span>Setor</span>
                <input placeholder="Mercado principal" />
              </label>
              <label>
                <span>Pagador</span>
                <input placeholder="Quem efetivamente tira dinheiro do bolso?" />
              </label>
              <label>
                <span>Problema / desejo / obrigação</span>
                <textarea placeholder="O que faz esse cliente mudar de comportamento?" rows={4} />
              </label>
              <label>
                <span>Solução / wedge inicial</span>
                <textarea placeholder="Qual é a menor proposta de valor que podemos testar?" rows={3} />
              </label>
            </div>
            <div className="sheet-note">
              A próxima etapa vai rotear a tese para os experts certos e pedir apenas os critérios
              relevantes.
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
