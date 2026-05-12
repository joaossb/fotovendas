import { useState, useRef } from "react";

const PLANS = [
  { id: "free",  name: "Grátis",  price: "R$ 0",  period: "",     badge: null,           desc: "Experimente sem compromisso", features: ["1 foto gratuita", "Qualidade padrão", "Sem cartão de crédito"], maxGen: 1   },
  { id: "basic", name: "Básico",  price: "R$ 19", period: "/mês", badge: "Mais popular",  desc: "Para quem vende todo dia",    features: ["20 fotos por mês", "Alta qualidade", "Suporte por e-mail", "Download instantâneo"], maxGen: 20  },
  { id: "pro",   name: "Pro",     price: "R$ 49", period: "/mês", badge: null,            desc: "Para quem não tem limite",    features: ["Fotos ilimitadas", "Qualidade máxima", "Suporte prioritário", "Download instantâneo"], maxGen: 999 },
];

const DEPOIMENTOS = [
  { nome: "Carla S.", negocio: "Doceria Carla", texto: "Minhas vendas no iFood aumentaram depois que troquei as fotos. Os clientes comentam como tudo parece mais apetitoso!" },
  { nome: "João R.",  negocio: "Hamburgueria do João", texto: "Eu mesmo tirava as fotos com o celular. Agora parecem de restaurante profissional. Incrível!" },
  { nome: "Ana P.",   negocio: "Marmitas da Ana", texto: "Uso toda semana para atualizar o cardápio do WhatsApp. Meus clientes adoram as fotos novas." },
];

const G = {
  laranja: "#FF5A1F",
  laranjaClaro: "#FF7A45",
  amarelo: "#FFBA08",
  fundo: "#FFF8F3",
  escuro: "#1A0A00",
};

const s = {
  page:    { fontFamily: "'Inter', system-ui, sans-serif", color: G.escuro, background: "#fff", minHeight: "100vh" },
  nav:     { padding: "0 5%", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderBottom: "1px solid #f0e8e0", position: "sticky", top: 0, zIndex: 10 },
  btnMain: { display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(135deg, " + G.laranja + ", " + G.laranjaClaro + ")", color: "#fff", border: "none", borderRadius: 50, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(255,90,31,.35)", letterSpacing: .2 },
  btnSec:  { display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: G.escuro, border: "2px solid #e0d0c0", borderRadius: 50, padding: "12px 28px", fontSize: 15, fontWeight: 600, cursor: "pointer" },
  btnDark: { display: "inline-flex", alignItems: "center", gap: 8, background: G.escuro, color: "#fff", border: "none", borderRadius: 50, padding: "12px 28px", fontSize: 15, fontWeight: 700, cursor: "pointer" },
  pill:    { display: "inline-block", padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700 },
  upload:  { border: "2px dashed #ffd0b0", borderRadius: 20, padding: "40px 20px", textAlign: "center", background: G.fundo, minHeight: 240, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  error:   { marginTop: 18, background: "#fff0f0", border: "1px solid #fcc", borderRadius: 12, padding: "13px 16px", fontSize: 13, color: "#c00" },
};

function Logo({ onClick }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={onClick}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg," + G.laranja + "," + G.amarelo + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🍽️</div>
      <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: -.5 }}>foto<span style={{ color: G.laranja }}>cardápio</span></span>
    </div>
  );
}

function Badge({ children, color }) {
  return <span style={{ display: "inline-block", background: color || G.amarelo, color: G.escuro, fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20, letterSpacing: .3 }}>{children}</span>;
}

function PlanCard({ p, onSelect }) {
  const isBasic = p.id === "basic";
  return (
    <div style={{ background: isBasic ? G.escuro : "#fff", borderRadius: 24, padding: "32px 28px", border: isBasic ? "none" : "2px solid #f0e0d0", position: "relative", boxShadow: isBasic ? "0 8px 32px rgba(0,0,0,.18)" : "none" }}>
      {isBasic && <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg," + G.laranja + "," + G.amarelo + ")", color: "#fff", fontSize: 11, fontWeight: 800, padding: "5px 18px", borderRadius: 20, whiteSpace: "nowrap", letterSpacing: .5 }}>⭐ MAIS POPULAR</div>}
      <p style={{ fontSize: 13, fontWeight: 700, color: isBasic ? "#aaa" : "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{p.name}</p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 4 }}>
        <span style={{ fontSize: 36, fontWeight: 800, color: isBasic ? "#fff" : G.escuro }}>{p.price}</span>
        <span style={{ color: isBasic ? "#aaa" : "#999", fontSize: 14 }}>{p.period}</span>
      </div>
      <p style={{ fontSize: 13, color: isBasic ? "#ccc" : "#999", marginBottom: 24 }}>{p.desc}</p>
      <ul style={{ listStyle: "none", marginBottom: 28, padding: 0 }}>
        {p.features.map(function(f, i) {
          return (
            <li key={i} style={{ fontSize: 14, color: isBasic ? "#eee" : "#555", padding: "5px 0", display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ color: isBasic ? G.amarelo : G.laranja, fontWeight: 800 }}>✓</span>{f}
            </li>
          );
        })}
      </ul>
      <button
        style={{ ...(isBasic ? { background: "linear-gradient(135deg," + G.laranja + "," + G.amarelo + ")", color: "#fff", border: "none", boxShadow: "0 4px 16px rgba(255,90,31,.4)" } : { background: "transparent", color: G.escuro, border: "2px solid #e0d0c0" }), width: "100%", justifyContent: "center", display: "flex", alignItems: "center", borderRadius: 50, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
        onClick={function() { onSelect(p.id); }}>
        {p.id === "free" ? "Começar grátis" : "Assinar " + p.name}
      </button>
    </div>
  );
}

export default function App() {
  const [screen,      setScreen]      = useState("home");
  const [curPlan,     setCurPlan]     = useState("free");
  const [genCount,    setGenCount]    = useState(0);
  const [previewSrc,  setPreviewSrc]  = useState(null);
  const [previewB64,  setPreviewB64]  = useState(null);
  const [previewMime, setPreviewMime] = useState("image/jpeg");
  const [loading,     setLoading]     = useState(false);
  const [loadMsg,     setLoadMsg]     = useState("");
  const [resultSrc,   setResultSrc]   = useState(null);
  const [error,       setError]       = useState(null);
  const fileRef = useRef();

  const plan    = PLANS.find(function(p) { return p.id === curPlan; });
  const limited = genCount >= plan.maxGen;

  function selectPlan(id) { setCurPlan(id); setGenCount(0); setScreen("app"); }

  function handleFile(e) {
    var f = e.target.files[0]; if (!f) return;
    setError(null); setResultSrc(null);
    setPreviewMime(f.type || "image/jpeg");
    var reader = new FileReader();
    reader.onload = function(ev) { setPreviewSrc(ev.target.result); setPreviewB64(ev.target.result.split(",")[1]); };
    reader.readAsDataURL(f);
  }

  function generate() {
    if (!previewB64) { setError("Envie uma imagem antes de gerar."); return; }
    setLoading(true); setError(null); setResultSrc(null); setLoadMsg("Analisando o prato...");
    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: previewB64, mimeType: previewMime, category: "cardapio", plan: curPlan }),
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (data.error) throw new Error(data.error);
      setResultSrc("data:" + data.mimeType + ";base64," + data.image);
      setGenCount(function(c) { return c + 1; });
      setLoading(false);
    })
    .catch(function(err) { setError(err.message || "Erro ao gerar. Tente novamente."); setLoading(false); });
  }

  function startCheckout(planId) {
    fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: planId, userEmail: "cliente@email.com" }) })
    .then(function(r) { return r.json(); })
    .then(function(d) { if (d.url) window.location.href = d.url; })
    .catch(function() { alert("Erro ao iniciar pagamento."); });
  }

  function download() {
    if (!resultSrc) return;
    var a = document.createElement("a"); a.href = resultSrc; a.download = "fotocardapio-" + Date.now() + ".jpg"; a.click();
  }

  // ── HOME ─────────────────────────────────────────────────────
  if (screen === "home") return (
    <div style={s.page}>
      <nav style={s.nav}>
        <Logo onClick={function() { setScreen("home"); }} />
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...s.btnSec, padding: "9px 22px", fontSize: 13 }} onClick={function() { setScreen("plans"); }}>Planos</button>
          <button style={{ ...s.btnMain, padding: "9px 22px", fontSize: 13 }} onClick={function() { setScreen("app"); }}>Testar grátis →</button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ background: "linear-gradient(160deg, #FFF8F3 0%, #FFE8D0 100%)", padding: "80px 5% 70px", textAlign: "center" }}>
        <Badge>🚀 Mais de 1.000 pratos transformados</Badge>
        <h1 style={{ fontSize: "clamp(32px,5.5vw,58px)", fontWeight: 900, margin: "20px 0 16px", lineHeight: 1.1, letterSpacing: -1.5 }}>
          Foto de comida<br />
          <span style={{ background: "linear-gradient(135deg," + G.laranja + "," + G.amarelo + ")", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            que faz vender mais
          </span>
        </h1>
        <p style={{ fontSize: 18, color: "#664422", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.6 }}>
          Tire uma foto simples do seu prato com o celular.<br />Nossa IA transforma em foto profissional de cardápio em segundos.
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
          <button style={{ ...s.btnMain, fontSize: 16, padding: "15px 36px" }} onClick={function() { setScreen("app"); }}>
            ✨ Testar grátis agora
          </button>
          <button style={{ ...s.btnSec, fontSize: 16, padding: "15px 36px" }} onClick={function() { setScreen("plans"); }}>
            Ver planos
          </button>
        </div>
        <p style={{ fontSize: 13, color: "#aa7755" }}>Sem cadastro · Sem cartão · Resultado em segundos</p>

        {/* Indicadores */}
        <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 48, flexWrap: "wrap" }}>
          {[["1.000+","fotos geradas"],["30s","tempo médio"],["100%","fiel ao prato"]].map(function(item, i) {
            return (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: G.laranja }}>{item[0]}</div>
                <div style={{ fontSize: 13, color: "#aa7755", fontWeight: 500 }}>{item[1]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* COMO FUNCIONA */}
      <div style={{ padding: "70px 5%", background: "#fff" }}>
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <Badge color="#FFE8D0">Como funciona</Badge>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginTop: 12, letterSpacing: -.5 }}>Simples assim</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 32, maxWidth: 900, margin: "0 auto" }}>
          {[
            ["📱", "Tire uma foto", "Com o celular mesmo, sem precisar de iluminação especial."],
            ["⬆️", "Envie para a IA", "Faça upload da foto no FotoCardápio."],
            ["🤖", "IA transforma", "Em até 30 segundos, a IA gera a versão profissional."],
            ["📲", "Use em tudo",   "iFood, WhatsApp, Instagram, cardápio impresso e mais."],
          ].map(function(item, i) {
            return (
              <div key={i} style={{ textAlign: "center", padding: "28px 20px", borderRadius: 20, background: G.fundo }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg," + G.laranja + "20," + G.amarelo + "30)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 16px" }}>{item[0]}</div>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: G.laranja, color: "#fff", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>{i+1}</div>
                <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{item[1]}</p>
                <p style={{ fontSize: 13, color: "#886644", lineHeight: 1.5 }}>{item[2]}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* DEPOIMENTOS */}
      <div style={{ padding: "70px 5%", background: G.fundo }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Badge color="#FFE8D0">Depoimentos</Badge>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginTop: 12, letterSpacing: -.5 }}>Quem já usa, aprova</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20, maxWidth: 900, margin: "0 auto" }}>
          {DEPOIMENTOS.map(function(d, i) {
            return (
              <div key={i} style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", border: "1.5px solid #f0e0d0" }}>
                <div style={{ color: G.amarelo, fontSize: 18, marginBottom: 12 }}>★★★★★</div>
                <p style={{ fontSize: 14, color: "#553322", lineHeight: 1.7, marginBottom: 20 }}>"{d.texto}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg," + G.laranja + "," + G.amarelo + ")", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15 }}>{d.nome[0]}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{d.nome}</p>
                    <p style={{ fontSize: 12, color: "#aa8866" }}>{d.negocio}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PLANOS */}
      <div style={{ padding: "70px 5%", background: "#fff" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <Badge color="#FFE8D0">Preços</Badge>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginTop: 12, letterSpacing: -.5 }}>Simples e acessível</h2>
          <p style={{ fontSize: 15, color: "#886644", marginTop: 8 }}>Comece grátis. Assine quando quiser.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20, maxWidth: 860, margin: "0 auto" }}>
          {PLANS.map(function(p) { return <PlanCard key={p.id} p={p} onSelect={function(id) { selectPlan(id); if (id !== "free") startCheckout(id); }} />; })}
        </div>
      </div>

      {/* CTA FINAL */}
      <div style={{ padding: "70px 5%", background: "linear-gradient(135deg," + G.laranja + "," + G.amarelo + ")", textAlign: "center" }}>
        <h2 style={{ fontSize: 36, fontWeight: 900, color: "#fff", marginBottom: 12, letterSpacing: -.5 }}>Pronto para vender mais?</h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,.85)", marginBottom: 32 }}>Transforme as fotos do seu cardápio agora mesmo. É grátis para começar.</p>
        <button style={{ background: "#fff", color: G.laranja, border: "none", borderRadius: 50, padding: "15px 40px", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,.15)" }} onClick={function() { setScreen("app"); }}>
          ✨ Começar agora — é grátis
        </button>
      </div>

      <footer style={{ padding: "32px 5%", background: G.escuro, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg," + G.laranja + "," + G.amarelo + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🍽️</div>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>foto<span style={{ color: G.laranja }}>cardápio</span></span>
        </div>
        <p style={{ fontSize: 12, color: "#666" }}>Fotos de cardápio com IA · Para todo negócio de comida</p>
      </footer>
    </div>
  );

  // ── PLANOS ────────────────────────────────────────────────────
  if (screen === "plans") return (
    <div style={s.page}>
      <nav style={s.nav}>
        <Logo onClick={function() { setScreen("home"); }} />
        <button style={{ ...s.btnMain, padding: "9px 22px", fontSize: 13 }} onClick={function() { setScreen("app"); }}>Gerar foto →</button>
      </nav>
      <div style={{ padding: "60px 5%" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <Badge color="#FFE8D0">Preços</Badge>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginTop: 12, letterSpacing: -.5 }}>Escolha seu plano</h2>
          <p style={{ fontSize: 15, color: "#886644", marginTop: 8 }}>Comece grátis. Assine quando quiser.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20, maxWidth: 860, margin: "0 auto" }}>
          {PLANS.map(function(p) { return <PlanCard key={p.id} p={p} onSelect={function(id) { selectPlan(id); if (id !== "free") startCheckout(id); }} />; })}
        </div>
      </div>
    </div>
  );

  // ── APP ───────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <Logo onClick={function() { setScreen("home"); }} />
        <button style={{ ...s.btnSec, padding: "8px 20px", fontSize: 13 }} onClick={function() { setScreen("plans"); }}>Ver planos</button>
      </nav>
      <div style={{ padding: "40px 5%", maxWidth: 860, margin: "0 auto" }}>

        {/* Header da página */}
        <div style={{ marginBottom: 36 }}>
          <Badge color="#FFE8D0">🍽️ Cardápio</Badge>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginTop: 10, marginBottom: 6, letterSpacing: -.5 }}>Transforme seu prato</h2>
          <p style={{ fontSize: 14, color: "#886644" }}>Envie a foto e receba uma imagem profissional em segundos.</p>
        </div>

        {/* Seletor de plano */}
        <div style={{ background: G.fundo, borderRadius: 16, padding: "16px 20px", marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#aa7755", textTransform: "uppercase", letterSpacing: .8, marginBottom: 4 }}>Plano atual</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PLANS.map(function(p) {
                var active = p.id === curPlan;
                return (
                  <button key={p.id} onClick={function() { setCurPlan(p.id); setGenCount(0); }}
                    style={{ padding: "6px 16px", borderRadius: 20, border: "2px solid", borderColor: active ? G.laranja : "#e0d0c0", background: active ? G.laranja : "#fff", color: active ? "#fff" : G.escuro, fontSize: 13, cursor: "pointer", fontWeight: active ? 700 : 500 }}>
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>
          {plan.maxGen < 999 && (
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 12, color: "#aa7755", fontWeight: 600 }}>Gerações usadas</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: genCount >= plan.maxGen ? "#c00" : G.laranja }}>{genCount}<span style={{ fontSize: 14, color: "#aa7755" }}>/{plan.maxGen}</span></p>
            </div>
          )}
        </div>

        {limited ? (
          <div style={{ borderRadius: 20, padding: 36, textAlign: "center", background: "linear-gradient(135deg,#FFF3E0,#FFE0C0)" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Você usou todas as gerações!</h3>
            <p style={{ fontSize: 15, color: "#664422", marginBottom: 24 }}>Faça upgrade para continuar gerando fotos profissionais.</p>
            <button style={{ ...s.btnMain, fontSize: 15, padding: "13px 32px" }} onClick={function() { setScreen("plans"); }}>Ver planos →</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: resultSrc ? "1fr 1fr" : "1fr", gap: 24 }}>
            <div>
              <div style={s.upload}>
                {!previewSrc ? (
                  <div>
                    <div style={{ fontSize: 52, marginBottom: 14 }}>📸</div>
                    <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Envie a foto do prato</p>
                    <p style={{ fontSize: 13, color: "#aa7755", marginBottom: 22 }}>JPG, PNG ou WEBP · Qualquer qualidade</p>
                    <button style={s.btnMain} onClick={function() { fileRef.current.click(); }}>Escolher imagem</button>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
                    <p style={{ fontSize: 11, color: "#cc9977", marginTop: 16 }}>Não precisa ser perfeita — a IA cuida do resto</p>
                  </div>
                ) : (
                  <div>
                    <img src={previewSrc} style={{ maxHeight: 200, maxWidth: "100%", borderRadius: 12, marginBottom: 12, objectFit: "contain" }} alt="preview" />
                    <span style={{ fontSize: 12, color: "#cc9977", cursor: "pointer", textDecoration: "underline" }}
                      onClick={function() { setPreviewSrc(null); setPreviewB64(null); setResultSrc(null); }}>
                      Trocar foto
                    </span>
                  </div>
                )}
              </div>

              {previewSrc && (
                <div style={{ marginTop: 16 }}>
                  <button style={{ ...s.btnMain, width: "100%", justifyContent: "center", fontSize: 16, padding: "14px", opacity: loading ? .75 : 1 }}
                    onClick={generate} disabled={loading}>
                    {loading
                      ? <span>{loadMsg}...</span>
                      : <span>✨ Gerar foto profissional</span>}
                  </button>
                  {loading && (
                    <p style={{ fontSize: 12, color: "#aa7755", textAlign: "center", marginTop: 8 }}>
                      ⏳ Aguarde até 30 segundos...
                    </p>
                  )}
                </div>
              )}
            </div>

            {resultSrc && (
              <div>
                <div style={{ borderRadius: 20, overflow: "hidden", border: "2px solid #f0e0d0", background: "#fff" }}>
                  <div style={{ padding: "10px 16px", background: "linear-gradient(135deg," + G.laranja + "15," + G.amarelo + "15)", borderBottom: "1px solid #f0e0d0", display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ ...s.pill, background: "#e8f5e9", color: "#2e7d32" }}>✓ Gerada com sucesso</span>
                    <span style={{ ...s.pill, background: "#fff3e0", color: G.laranja }}>🍽️ Cardápio</span>
                  </div>
                  <img src={resultSrc} style={{ width: "100%", display: "block", maxHeight: 340, objectFit: "contain", background: G.fundo }} alt="resultado" />
                  <div style={{ padding: 16, display: "flex", gap: 10 }}>
                    <button style={{ ...s.btnMain, flex: 1, justifyContent: "center", padding: "12px" }} onClick={download}>⬇ Baixar foto</button>
                    <button style={{ ...s.btnSec, flex: 1, justifyContent: "center", padding: "12px" }}
                      onClick={function() { setResultSrc(null); setPreviewSrc(null); setPreviewB64(null); }}>
                      Nova foto
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {error && <div style={s.error}>❌ {error}</div>}
      </div>
    </div>
  );
}