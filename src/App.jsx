import { useState, useRef } from "react";

const PLANS = [
  { id: "free",  name: "Grátis",  price: "R$ 0",  period: "",     badge: null,              desc: "Teste sem compromisso",      features: ["1 geração gratuita", "Qualidade padrão", "Sem cartão de crédito"], maxGen: 1   },
  { id: "basic", name: "Básico",  price: "R$ 19", period: "/mês", badge: "Mais popular",    desc: "Para quem vende todo dia",   features: ["20 fotos por mês", "Alta qualidade", "Suporte por e-mail"], maxGen: 20  },
  { id: "pro",   name: "Pro",     price: "R$ 49", period: "/mês", badge: "Qualidade máxima",desc: "Para catálogos e impressão", features: ["Fotos ilimitadas", "Qualidade máxima", "Suporte prioritário"], maxGen: 999 },
];

const s = {
  page:    { fontFamily: "system-ui,-apple-system,sans-serif", color: "#1a1a1a", background: "#fff", minHeight: "100vh" },
  nav:     { padding: "0 5%", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0", background: "#fff", position: "sticky", top: 0, zIndex: 10 },
  dark:    { display: "inline-flex", alignItems: "center", gap: 8, background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontSize: 14, fontWeight: 500, cursor: "pointer" },
  outline: { display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: "#1a1a1a", border: "1.5px solid #d0d0d0", borderRadius: 8, padding: "10px 22px", fontSize: 14, fontWeight: 500, cursor: "pointer" },
  pill:    { display: "inline-block", padding: "3px 11px", borderRadius: 20, fontSize: 11, fontWeight: 600 },
  upload:  { border: "1.5px dashed #ddd", borderRadius: 14, padding: "28px 20px", textAlign: "center", background: "#fafafa", minHeight: 220, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" },
  error:   { marginTop: 18, background: "#fff0f0", border: "1px solid #fcc", borderRadius: 10, padding: "13px 16px", fontSize: 13, color: "#c00" },
  card:    { background: "#fff", borderRadius: 16, padding: "26px 22px", border: "1.5px solid #e8e8e8", position: "relative" },
};

function Logo({ onClick }) {
  return (
    <span style={{ fontWeight: 700, fontSize: 19, letterSpacing: "-.5px", cursor: "pointer" }} onClick={onClick}>
      foto<span style={{ color: "#888" }}>cardápio</span>
    </span>
  );
}

function PlanCard({ p, onSelect }) {
  const isBasic = p.id === "basic";
  const isPro   = p.id === "pro";
  return (
    <div style={{ ...s.card, border: isBasic ? "2px solid #1a1a1a" : s.card.border }}>
      {p.badge && (
        <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "#1a1a1a", color: "#fff", fontSize: 11, fontWeight: 600, padding: "4px 14px", borderRadius: 20, whiteSpace: "nowrap" }}>
          {p.badge}
        </div>
      )}
      <p style={{ fontSize: 13, fontWeight: 600, color: "#888", marginBottom: 6 }}>{p.name}</p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 4 }}>
        <span style={{ fontSize: 30, fontWeight: 700 }}>{p.price}</span>
        <span style={{ color: "#aaa", fontSize: 13 }}>{p.period}</span>
      </div>
      <p style={{ fontSize: 13, color: "#aaa", marginBottom: 16 }}>{p.desc}</p>
      <ul style={{ listStyle: "none", marginBottom: 22, padding: 0 }}>
        {p.features.map(function(f, i) {
          return (
            <li key={i} style={{ fontSize: 13, color: "#555", padding: "4px 0", display: "flex", gap: 8 }}>
              <span>✓</span>{f}
            </li>
          );
        })}
      </ul>
      <button style={{ ...(isBasic ? s.dark : s.outline), width: "100%", justifyContent: "center" }} onClick={function() { onSelect(p.id); }}>
        {p.id === "free" ? "Começar grátis" : "Assinar " + p.name}
      </button>
    </div>
  );
}

function PlansGrid({ onSelect }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 20, maxWidth: 880, margin: "0 auto" }}>
      {PLANS.map(function(p) { return <PlanCard key={p.id} p={p} onSelect={onSelect} />; })}
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
    var f = e.target.files[0];
    if (!f) return;
    setError(null);
    setResultSrc(null);
    setPreviewMime(f.type || "image/jpeg");
    var reader = new FileReader();
    reader.onload = function(ev) {
      setPreviewSrc(ev.target.result);
      setPreviewB64(ev.target.result.split(",")[1]);
    };
    reader.readAsDataURL(f);
  }

  function generate() {
    if (!previewB64) {
      setError("Envie uma imagem antes de gerar.");
      return;
    }
    setLoading(true);
    setError(null);
    setResultSrc(null);
    setLoadMsg("Analisando o prato...");

    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: previewB64,
        mimeType: previewMime,
        category: "cardapio",
        plan: curPlan,
      }),
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.error) throw new Error(data.error);
      setResultSrc("data:" + data.mimeType + ";base64," + data.image);
      setGenCount(function(c) { return c + 1; });
      setLoading(false);
    })
    .catch(function(err) {
      setError(err.message || "Erro ao gerar. Tente novamente.");
      setLoading(false);
    });
  }

  function startCheckout(planId) {
    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planId, userEmail: "cliente@email.com" }),
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.url) window.location.href = data.url;
    })
    .catch(function() {
      alert("Erro ao iniciar pagamento. Tente novamente.");
    });
  }

  function download() {
    if (!resultSrc) return;
    var a = document.createElement("a");
    a.href = resultSrc;
    a.download = "fotocardapio-" + Date.now() + ".jpg";
    a.click();
  }

  // HOME
  if (screen === "home") return (
    <div style={s.page}>
      <nav style={s.nav}>
        <Logo onClick={function() { setScreen("home"); }} />
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...s.outline, padding: "8px 18px", fontSize: 13 }} onClick={function() { setScreen("plans"); }}>Planos</button>
          <button style={{ ...s.dark,    padding: "8px 18px", fontSize: 13 }} onClick={function() { setScreen("app"); }}>Gerar foto</button>
        </div>
      </nav>

      <div style={{ padding: "72px 5% 56px", textAlign: "center", maxWidth: 700, margin: "0 auto" }}>
        <span style={{ display: "inline-block", background: "#fff3e0", color: "#e65100", fontSize: 12, padding: "4px 12px", borderRadius: 20, fontWeight: 600 }}>
          🍽️ Fotos de cardápio com IA
        </span>
        <h1 style={{ fontSize: "clamp(26px,5vw,46px)", fontWeight: 700, margin: "16px 0 14px", lineHeight: 1.15, letterSpacing: -1 }}>
          Fotos de comida<br /><span style={{ color: "#888" }}>que dão água na boca</span>
        </h1>
        <p style={{ fontSize: 16, color: "#666", maxWidth: 480, margin: "0 auto 32px" }}>
          Envie uma foto simples do seu prato e receba uma imagem profissional de cardápio em segundos — pronta para iFood, WhatsApp, Instagram e muito mais.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button style={{ ...s.dark,    fontSize: 15, padding: "13px 30px" }} onClick={function() { setScreen("app"); }}>Testar grátis agora</button>
          <button style={{ ...s.outline, fontSize: 15, padding: "13px 30px" }} onClick={function() { setScreen("plans"); }}>Ver planos</button>
        </div>
        <p style={{ fontSize: 12, color: "#bbb", marginTop: 14 }}>Sem cadastro · Sem cartão · 1 foto gratuita</p>
      </div>

      <div style={{ padding: "40px 5% 56px", background: "#fafafa", borderTop: "1px solid #f0f0f0" }}>
        <h2 style={{ textAlign: "center", fontSize: 20, fontWeight: 700, marginBottom: 36 }}>Como funciona</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 28, maxWidth: 840, margin: "0 auto", textAlign: "center" }}>
          {[
            ["📱", "Tire uma foto", "Com o celular mesmo. Não precisa ser perfeita."],
            ["🤖", "IA transforma", "Nossa IA gera uma foto profissional do mesmo prato."],
            ["🍔", "Resultado real", "Fiel ao seu prato — sem enganar o cliente."],
            ["📲", "Use em tudo",   "iFood, cardápio, Instagram, WhatsApp e mais."]
          ].map(function(item, i) {
            return (
              <div key={i}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{item[0]}</div>
                <div style={{ fontSize: 11, color: "#bbb", fontWeight: 600, textTransform: "uppercase", letterSpacing: .8, marginBottom: 4 }}>Passo {i+1}</div>
                <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 5 }}>{item[1]}</p>
                <p style={{ fontSize: 13, color: "#777" }}>{item[2]}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "60px 5%", borderTop: "1px solid #f0f0f0", background: "#fafafa" }}>
        <h2 style={{ textAlign: "center", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Planos e preços</h2>
        <p style={{ textAlign: "center", color: "#888", fontSize: 14, marginBottom: 44 }}>Simples, sem surpresas</p>
        <PlansGrid onSelect={function(id) { selectPlan(id); if (id !== "free") startCheckout(id); }} />
      </div>

      <footer style={{ padding: "24px 5%", borderTop: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <Logo onClick={function() { setScreen("home"); }} />
        <p style={{ fontSize: 12, color: "#ccc" }}>Fotos de cardápio com IA · Para restaurantes e deliveries</p>
      </footer>
    </div>
  );

  // PLANOS
  if (screen === "plans") return (
    <div style={s.page}>
      <nav style={s.nav}>
        <Logo onClick={function() { setScreen("home"); }} />
        <button style={{ ...s.dark, padding: "8px 18px", fontSize: 13 }} onClick={function() { setScreen("app"); }}>Gerar foto</button>
      </nav>
      <div style={{ padding: "48px 5%" }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, textAlign: "center", marginBottom: 8 }}>Planos e preços</h2>
        <p style={{ textAlign: "center", color: "#666", fontSize: 15, marginBottom: 44 }}>Escolha o plano ideal para o seu negócio</p>
        <PlansGrid onSelect={function(id) { selectPlan(id); if (id !== "free") startCheckout(id); }} />
      </div>
    </div>
  );

  // APP
  return (
    <div style={s.page}>
      <nav style={s.nav}>
        <Logo onClick={function() { setScreen("home"); }} />
        <button style={{ ...s.outline, padding: "8px 18px", fontSize: 13 }} onClick={function() { setScreen("plans"); }}>Ver planos</button>
      </nav>
      <div style={{ padding: "36px 5%", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Transforme a foto do seu prato</h2>
        <p style={{ fontSize: 14, color: "#666", marginBottom: 28 }}>Envie qualquer foto e receba uma imagem profissional pronta para o seu cardápio.</p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
          {PLANS.map(function(p) {
            var active = p.id === curPlan;
            return (
              <button key={p.id} onClick={function() { setCurPlan(p.id); setGenCount(0); }}
                style={{ padding: "8px 18px", borderRadius: 20, border: "1.5px solid", borderColor: active ? "#1a1a1a" : "#ddd", background: active ? "#1a1a1a" : "#fff", color: active ? "#fff" : "#555", fontSize: 13, cursor: "pointer", fontWeight: active ? 600 : 400 }}>
                {p.name}
              </button>
            );
          })}
        </div>
        <p style={{ fontSize: 13, color: "#777", marginBottom: 28 }}>
          Plano <strong>{plan.name}</strong>
          {plan.maxGen < 999 && <span> · <strong>{genCount}/{plan.maxGen}</strong> gerações usadas</span>}
        </p>

        {limited ? (
          <div style={{ border: "1.5px solid #f0d080", borderRadius: 14, padding: 28, textAlign: "center", background: "#fffdf0" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⭐</div>
            <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Limite atingido</h3>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 18 }}>Faça upgrade para continuar gerando fotos.</p>
            <button style={s.dark} onClick={function() { setScreen("plans"); }}>Ver planos</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: resultSrc ? "1fr 1fr" : "1fr", gap: 24 }}>
            <div>
              <div style={s.upload}>
                {!previewSrc ? (
                  <div>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🍽️</div>
                    <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Envie a foto do prato</p>
                    <p style={{ fontSize: 12, color: "#aaa", marginBottom: 18 }}>JPG, PNG ou WEBP</p>
                    <button style={s.dark} onClick={function() { fileRef.current.click(); }}>Escolher imagem</button>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
                  </div>
                ) : (
                  <div>
                    <img src={previewSrc} style={{ maxHeight: 190, maxWidth: "100%", borderRadius: 8, marginBottom: 10, objectFit: "contain" }} alt="preview" />
                    <span style={{ fontSize: 12, color: "#aaa", cursor: "pointer", textDecoration: "underline" }}
                      onClick={function() { setPreviewSrc(null); setPreviewB64(null); setResultSrc(null); }}>
                      Trocar foto
                    </span>
                  </div>
                )}
              </div>
              {previewSrc && (
                <div style={{ marginTop: 14 }}>
                  <button style={{ ...s.dark, width: "100%", justifyContent: "center", opacity: loading ? .7 : 1 }}
                    onClick={generate} disabled={loading}>
                    {loading ? loadMsg + "..." : "✨ Gerar foto de cardápio"}
                  </button>
                  {loading && <p style={{ fontSize: 11, color: "#aaa", textAlign: "center", marginTop: 6 }}>Pode levar até 30 segundos...</p>}
                </div>
              )}
            </div>

            {resultSrc && (
              <div>
                <div style={{ border: "1.5px solid #e0e0e0", borderRadius: 14, overflow: "hidden", background: "#fff" }}>
                  <div style={{ padding: "9px 14px", borderBottom: "1px solid #f0f0f0", display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ ...s.pill, background: "#e8f5e9", color: "#2e7d32" }}>✓ Gerada</span>
                    <span style={{ ...s.pill, background: "#fff3e0", color: "#e65100" }}>🍽️ Cardápio</span>
                    <span style={{ ...s.pill, background: "#f0f0f0", color: "#555" }}>{plan.name}</span>
                  </div>
                  <img src={resultSrc} style={{ width: "100%", display: "block", maxHeight: 340, objectFit: "contain", background: "#f9f9f9" }} alt="resultado" />
                  <div style={{ padding: 14, display: "flex", gap: 10 }}>
                    <button style={{ ...s.dark, flex: 1, justifyContent: "center" }} onClick={download}>⬇ Baixar foto</button>
                    <button style={{ ...s.outline, flex: 1, justifyContent: "center" }}
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