import { useState, useRef, useEffect } from "react";
import { supabase } from "./supabase";
import antes1 from "./assets/antes1.jpg";
import depois1 from "./assets/depois1.jpg";
import antes2 from "./assets/antes2.jpg";
import depois2 from "./assets/depois2.jpg";

const ANTES_DEPOIS = [
  { antes: antes1, depois: depois1, label: "Esfiha / Wrap" },
  { antes: antes2, depois: depois2, label: "Pizza" },
];

const PLANS = [
  { id: "starter", name: "Kit Início",  credits: 10,  price: "R$ 19,90", perUnit: "R$ 1,99/foto", badge: null,          features: ["10 gerações de imagem", "IA especializada cardápio", "Créditos que não expiram", "Download instantâneo"] },
  { id: "pro",     name: "Kit Negócio", credits: 30,  price: "R$ 44,90", perUnit: "R$ 1,49/foto", badge: "Mais vendido", features: ["30 gerações de imagem", "IA de alta fidelidade", "Formatos iFood e Stories", "Créditos que não expiram"] },
  { id: "agency",  name: "Kit Agência", credits: 100, price: "R$ 99,90", perUnit: "R$ 0,99/foto", badge: "Melhor custo", features: ["100 gerações de imagem", "IA máxima qualidade", "Uso em anúncios pagos", "Suporte prioritário"] },
];

const DEPOIMENTOS = [
  { nome: "Carla S.", negocio: "Doceria Carla", texto: "Minhas vendas no iFood aumentaram depois que troquei as fotos. Os clientes comentam como tudo parece mais apetitoso!", estrelas: 5 },
  { nome: "João R.",  negocio: "Hamburgueria do João", texto: "Eu mesmo tirava as fotos com o celular. Agora parecem de restaurante profissional. Incrível!", estrelas: 5 },
  { nome: "Ana P.",   negocio: "Marmitas da Ana", texto: "Uso toda semana para atualizar o cardápio do WhatsApp. Meus clientes adoram as fotos novas.", estrelas: 5 },
];

const FAQ = [
  { q: "Como funciona?", r: "Você envia a foto do seu prato tirada pelo celular. Nossa IA recria a iluminação e o cenário, entregando uma foto profissional pronta para iFood e redes sociais em segundos." },
  { q: "Os créditos expiram?", r: "Não! Seus créditos são vitalícios. Compre hoje e use quando quiser — sem pressão." },
  { q: "O resultado é fiel ao meu prato?", r: "Sim. Nossa IA é treinada para gastronomia e preserva os ingredientes, porções e apresentação do prato original." },
  { q: "Precisa instalar algum app?", r: "Não. Funciona direto no navegador, no celular ou no computador." },
];

const COR = { laranja: "#FF5A1F", escuro: "#0D0D0D", card: "#1A1A1A", fundo: "#F9F5F0" };

function Logo({ onClick, dark }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={onClick}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#FF5A1F,#FFBA08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🍽️</div>
      <span style={{ fontWeight: 800, fontSize: 17, color: dark ? "#fff" : COR.escuro, letterSpacing: -.4 }}>foto<span style={{ color: COR.laranja }}>cardápio</span></span>
    </div>
  );
}

function BtnPrimary({ children, onClick, style, disabled }) {
  return <button onClick={onClick} disabled={disabled} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: disabled ? "#888" : "linear-gradient(135deg,#FF5A1F,#FF8C42)", color: "#fff", border: "none", borderRadius: 50, padding: "13px 30px", fontSize: 15, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", boxShadow: disabled ? "none" : "0 4px 20px rgba(255,90,31,.4)", ...style }}>{children}</button>;
}

function SliderAntesDep({ antes, depois, label }) {
  const [pos, setPos] = useState(50);
  const [dragging, setDragging] = useState(false);
  const ref = useRef();

  function getPos(clientX) {
    const rect = ref.current.getBoundingClientRect();
    return Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
  }

  function onMouseDown(e) { e.preventDefault(); setDragging(true); setPos(getPos(e.clientX)); }
  function onMouseMove(e) { if (dragging) setPos(getPos(e.clientX)); }
  function onMouseUp()   { setDragging(false); }
  function onTouchStart(e) { setDragging(true); setPos(getPos(e.touches[0].clientX)); }
  function onTouchMove(e)  { e.preventDefault(); if (dragging) setPos(getPos(e.touches[0].clientX)); }
  function onTouchEnd()    { setDragging(false); }

  useEffect(function() {
    window.addEventListener("mouseup", onMouseUp);
    return function() { window.removeEventListener("mouseup", onMouseUp); };
  }, []);

  return (
    <div ref={ref}
      style={{ position: "relative", borderRadius: 16, overflow: "hidden", cursor: "col-resize", userSelect: "none", aspectRatio: "1/1", background: "#000", touchAction: "none" }}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <img src={depois} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} alt="depois" draggable="false" />
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", width: pos + "%" }}>
        <img src={antes} style={{ position: "absolute", top: 0, left: 0, width: ref.current ? ref.current.offsetWidth + "px" : "100%", height: "100%", objectFit: "cover" }} alt="antes" draggable="false" />
      </div>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: pos + "%", width: 3, background: "#fff", transform: "translateX(-50%)", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 40, height: 40, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 16px rgba(0,0,0,.4)", fontSize: 15, color: COR.escuro, fontWeight: 900 }}>⇔</div>
      </div>
      <div style={{ position: "absolute", top: 12, left: 12, background: "rgba(0,0,0,.65)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, pointerEvents: "none" }}>ANTES</div>
      <div style={{ position: "absolute", top: 12, right: 12, background: COR.laranja, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, pointerEvents: "none" }}>DEPOIS</div>
      <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,.5)", color: "#fff", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, whiteSpace: "nowrap", pointerEvents: "none" }}>{label}</div>
    </div>
  );
}

function FAQItem({ q, r }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #2a2a2a" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", background: "none", border: "none", textAlign: "left", padding: "20px 0", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", gap: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{q}</span>
        <span style={{ color: COR.laranja, fontSize: 20, fontWeight: 700, flexShrink: 0 }}>{open ? "−" : "+"}</span>
      </button>
      {open && <p style={{ fontSize: 14, color: "#aaa", paddingBottom: 20, lineHeight: 1.7 }}>{r}</p>}
    </div>
  );
}

// ── TELA DE LOGIN / CADASTRO ──────────────────────────────────
function AuthScreen({ onSuccess }) {
  const [mode,     setMode]     = useState("login");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [msg,      setMsg]      = useState(null);

  async function handleSubmit() {
    if (!email || !password) { setError("Preencha e-mail e senha."); return; }
    setLoading(true); setError(null); setMsg(null);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError("E-mail ou senha incorretos."); setLoading(false); return; }
      onSuccess();
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      setMsg("Cadastro realizado! Verifique seu e-mail para confirmar.");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: COR.escuro, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "system-ui,sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 24 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#FF5A1F,#FFBA08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🍽️</div>
            <span style={{ fontWeight: 800, fontSize: 20, color: "#fff" }}>foto<span style={{ color: COR.laranja }}>cardápio</span></span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
            {mode === "login" ? "Entrar na sua conta" : "Criar conta grátis"}
          </h2>
          <p style={{ fontSize: 14, color: "#888" }}>
            {mode === "login" ? "Bem-vindo de volta!" : "1 foto gratuita para começar"}
          </p>
        </div>

        <div style={{ background: COR.card, borderRadius: 20, padding: "32px 28px", border: "1px solid #2a2a2a" }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#aaa", display: "block", marginBottom: 6 }}>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              style={{ width: "100%", background: "#111", border: "1px solid #333", borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "#fff", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#aaa", display: "block", marginBottom: 6 }}>Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="mínimo 6 caracteres"
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={{ width: "100%", background: "#111", border: "1px solid #333", borderRadius: 10, padding: "12px 16px", fontSize: 14, color: "#fff", outline: "none", boxSizing: "border-box" }} />
          </div>

          {error && <div style={{ background: "#2a0a0a", border: "1px solid #5a1a1a", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#ff8888", marginBottom: 16 }}>❌ {error}</div>}
          {msg   && <div style={{ background: "#0a2a0a", border: "1px solid #1a5a1a", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#88ff88", marginBottom: 16 }}>✅ {msg}</div>}

          <BtnPrimary onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "14px", fontSize: 15 }}>
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta grátis"}
          </BtnPrimary>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <span style={{ fontSize: 13, color: "#666" }}>
              {mode === "login" ? "Não tem conta? " : "Já tem conta? "}
            </span>
            <span style={{ fontSize: 13, color: COR.laranja, cursor: "pointer", fontWeight: 600 }}
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); setMsg(null); }}>
              {mode === "login" ? "Cadastre-se grátis" : "Entrar"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── APP PRINCIPAL ─────────────────────────────────────────────
export default function App() {
  const [screen,      setScreen]      = useState("home");
  const [user,        setUser]        = useState(null);
  const [profile,     setProfile]     = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [previewSrc,  setPreviewSrc]  = useState(null);
  const [previewB64,  setPreviewB64]  = useState(null);
  const [previewMime, setPreviewMime] = useState("image/jpeg");
  const [descricao,   setDescricao]   = useState("");
  const [loading,     setLoading]     = useState(false);
  const [loadMsg,     setLoadMsg]     = useState("");
  const [resultSrc,   setResultSrc]   = useState(null);
  const [error,       setError]       = useState(null);
  const [showAuth,    setShowAuth]    = useState(false);
  const fileRef = useRef();

  // Verificar sessão ao carregar
  useEffect(function() {
    supabase.auth.getSession().then(function({ data: { session } }) {
      if (session) {
        setUser(session.user);
        loadProfile(session.user.id);
      }
      setLoadingAuth(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(function(event, session) {
      if (session) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });
    return function() { subscription.unsubscribe(); };
  }, []);

  async function loadProfile(userId) {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) setProfile(data);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setScreen("home");
  }

  function handleFile(e) {
    var f = e.target.files[0]; if (!f) return;
    setError(null); setResultSrc(null);
    setPreviewMime(f.type || "image/jpeg");
    var reader = new FileReader();
    reader.onload = function(ev) { setPreviewSrc(ev.target.result); setPreviewB64(ev.target.result.split(",")[1]); };
    reader.readAsDataURL(f);
  }

  async function generate() {
    if (!previewB64) { setError("Envie uma imagem antes de gerar."); return; }
    if (!user) { setShowAuth(true); return; }
    if (profile && profile.credits <= 0) { setError("Você não tem créditos. Adquira um plano para continuar."); return; }

    setLoading(true); setError(null); setResultSrc(null); setLoadMsg("Analisando o prato...");
    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: previewB64, mimeType: previewMime, category: "cardapio", plan: "basic", descricao: descricao.trim() }),
      });
      setLoadMsg("Gerando foto profissional...");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Debitar 1 crédito
      const newCredits = (profile?.credits || 1) - 1;
      await supabase.from("profiles").update({ credits: newCredits }).eq("id", user.id);
      setProfile(function(p) { return { ...p, credits: newCredits }; });

      setResultSrc("data:" + data.mimeType + ";base64," + data.image);
    } catch (err) {
      setError(err.message || "Erro ao gerar. Tente novamente.");
    }
    setLoading(false);
  }

  function download() {
    if (!resultSrc) return;
    var a = document.createElement("a"); a.href = resultSrc; a.download = "fotocardapio-" + Date.now() + ".jpg"; a.click();
  }

  if (loadingAuth) return (
    <div style={{ minHeight: "100vh", background: COR.escuro, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#fff", fontSize: 16 }}>Carregando...</div>
    </div>
  );

  if (showAuth) return <AuthScreen onSuccess={function() { setShowAuth(false); setScreen("app"); }} />;

  // ── HOME ───────────────────────────────────────────────────
  if (screen === "home") return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: COR.escuro, background: "#fff", width: "100vw", maxWidth: "100%", overflowX: "hidden", margin: 0, padding: 0 }}>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(13,13,13,.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,.08)", padding: "0 6%", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo onClick={() => setScreen("home")} dark />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {user ? (
            <>
              <span style={{ fontSize: 13, color: "#aaa" }}>
                {profile?.credits ?? 0} crédito{profile?.credits !== 1 ? "s" : ""}
              </span>
              <button style={{ background: "none", border: "1px solid #333", color: "#aaa", borderRadius: 50, padding: "8px 18px", fontSize: 13, cursor: "pointer" }} onClick={() => setScreen("app")}>Gerar foto</button>
              <button style={{ background: "none", border: "none", color: "#666", fontSize: 13, cursor: "pointer" }} onClick={signOut}>Sair</button>
            </>
          ) : (
            <>
              <button style={{ background: "none", border: "1px solid rgba(255,255,255,.2)", color: "#fff", borderRadius: 50, padding: "8px 20px", fontSize: 13, fontWeight: 500, cursor: "pointer" }} onClick={() => setShowAuth(true)}>Entrar</button>
              <BtnPrimary onClick={() => setShowAuth(true)} style={{ padding: "9px 22px", fontSize: 13 }}>Testar grátis →</BtnPrimary>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(160deg,#0D0D0D 0%,#1a0800 60%,#2d0f00 100%)", padding: "130px 6% 90px", width: "100%", boxSizing: "border-box" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div style={{ display: "inline-block", background: "rgba(255,90,31,.15)", border: "1px solid rgba(255,90,31,.4)", color: "#FF8C42", fontSize: 13, fontWeight: 600, padding: "6px 16px", borderRadius: 20, marginBottom: 24 }}>
            🚀 IA especializada em fotografia gastronômica
          </div>
          <h1 style={{ fontSize: "clamp(34px,5.5vw,60px)", fontWeight: 900, color: "#fff", margin: "0 0 20px", lineHeight: 1.1, letterSpacing: -1.5 }}>
            Sua comida merece<br />
            <span style={{ background: "linear-gradient(135deg,#FF5A1F,#FFBA08)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>fotos que vendem</span>
          </h1>
          <p style={{ fontSize: 18, color: "#ccc", maxWidth: 520, margin: "0 auto 36px", lineHeight: 1.7 }}>
            Tire uma foto com o celular. Nossa IA transforma em imagem profissional de cardápio em segundos — fiel ao seu prato.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <BtnPrimary onClick={() => user ? setScreen("app") : setShowAuth(true)} style={{ fontSize: 16, padding: "15px 36px" }}>✨ Testar agora — é grátis</BtnPrimary>
            <button onClick={() => {}} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,.35)", borderRadius: 50, padding: "15px 36px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Ver exemplos ↓</button>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 56, flexWrap: "wrap" }}>
            {[["1.000+","fotos geradas"],["~30s","por geração"],["100%","fiel ao prato"]].map(function(item, i) {
              return (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: COR.laranja }}>{item[0]}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{item[1]}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ANTES E DEPOIS */}
      <section style={{ background: COR.escuro, padding: "80px 6%", width: "100%", boxSizing: "border-box" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ display: "inline-block", background: "rgba(255,90,31,.15)", border: "1px solid rgba(255,90,31,.3)", color: "#FF8C42", fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Resultados reais</div>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: "#fff", letterSpacing: -.5 }}>Arraste e compare</h2>
            <p style={{ color: "#888", fontSize: 15, marginTop: 8 }}>A mesma comida, antes e depois da nossa IA</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
            {ANTES_DEPOIS.map(function(item, i) { return <SliderAntesDep key={i} {...item} />; })}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section style={{ background: "#fff", padding: "80px 6%", width: "100%", boxSizing: "border-box" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ display: "inline-block", background: "#FFF3E0", color: COR.laranja, fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Como funciona</div>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: COR.escuro, letterSpacing: -.5 }}>Simples assim</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 24 }}>
            {[["📱","Tire uma foto","Com o celular mesmo."],["⬆️","Faça o upload","Envie a imagem no site."],["🤖","IA transforma","Resultado profissional em 30s."],["📲","Use em tudo","iFood, WhatsApp, Instagram."]].map(function(item, i) {
              return (
                <div key={i} style={{ background: COR.fundo, borderRadius: 20, padding: "32px 24px", textAlign: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg,rgba(255,90,31,.12),rgba(255,186,8,.15))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px" }}>{item[0]}</div>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: COR.laranja, color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>{i+1}</div>
                  <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: COR.escuro }}>{item[1]}</p>
                  <p style={{ fontSize: 13, color: "#664422", lineHeight: 1.6 }}>{item[2]}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section style={{ background: COR.fundo, padding: "80px 6%", width: "100%", boxSizing: "border-box" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-block", background: "#FFF3E0", color: COR.laranja, fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Depoimentos</div>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: COR.escuro, letterSpacing: -.5 }}>Quem usa, aprova</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
            {DEPOIMENTOS.map(function(d, i) {
              return (
                <div key={i} style={{ background: "#fff", borderRadius: 20, padding: "28px 24px", border: "1.5px solid #f0e0d0" }}>
                  <div style={{ color: "#FFBA08", fontSize: 16, marginBottom: 12 }}>{"★".repeat(d.estrelas)}</div>
                  <p style={{ fontSize: 14, color: "#443322", lineHeight: 1.7, marginBottom: 20 }}>"{d.texto}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#FF5A1F,#FFBA08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15 }}>{d.nome[0]}</div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 14, color: COR.escuro }}>{d.nome}</p>
                      <p style={{ fontSize: 12, color: "#aa8866" }}>{d.negocio}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PLANOS */}
      <section style={{ background: COR.escuro, padding: "80px 6%", width: "100%", boxSizing: "border-box" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ display: "inline-block", background: "rgba(255,90,31,.15)", border: "1px solid rgba(255,90,31,.3)", color: "#FF8C42", fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20, marginBottom: 14, textTransform: "uppercase", letterSpacing: 1 }}>Preços</div>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: "#fff", letterSpacing: -.5 }}>Créditos que não expiram</h2>
            <p style={{ color: "#888", fontSize: 15, marginTop: 8 }}>Pague por uso. Sem mensalidade.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
            {PLANS.map(function(p) {
              var isBest = p.id === "pro";
              return (
                <div key={p.id} style={{ background: isBest ? "linear-gradient(160deg,#1f0a00,#2d1200)" : COR.card, borderRadius: 24, padding: "32px 28px", border: isBest ? "1.5px solid rgba(255,90,31,.5)" : "1px solid #2a2a2a", position: "relative" }}>
                  {p.badge && <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#FF5A1F,#FFBA08)", color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 16px", borderRadius: 20, whiteSpace: "nowrap" }}>{p.badge}</div>}
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{p.name}</p>
                  <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", marginBottom: 2 }}>{p.price}</div>
                  <div style={{ fontSize: 13, color: COR.laranja, fontWeight: 600, marginBottom: 6 }}>{p.credits} créditos · {p.perUnit}</div>
                  <div style={{ height: 1, background: "#2a2a2a", margin: "20px 0" }}></div>
                  <ul style={{ listStyle: "none", padding: 0, marginBottom: 24 }}>
                    {p.features.map(function(f, i) {
                      return <li key={i} style={{ fontSize: 13, color: "#ccc", padding: "5px 0", display: "flex", gap: 10 }}><span style={{ color: COR.laranja, fontWeight: 700 }}>✓</span>{f}</li>;
                    })}
                  </ul>
                  <BtnPrimary onClick={() => user ? setScreen("app") : setShowAuth(true)} style={{ width: "100%", padding: "13px" }}>Começar agora</BtnPrimary>
                </div>
              );
            })}
          </div>
          <p style={{ textAlign: "center", color: "#555", fontSize: 13, marginTop: 24 }}>💳 Pagamento seguro · Créditos vitalícios</p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: COR.escuro, padding: "80px 6%", width: "100%", boxSizing: "border-box", borderTop: "1px solid #1a1a1a" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: "#fff", letterSpacing: -.5 }}>Dúvidas frequentes</h2>
          </div>
          {FAQ.map(function(item, i) { return <FAQItem key={i} q={item.q} r={item.r} />; })}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ background: "linear-gradient(135deg,#FF5A1F,#FF8C42)", padding: "80px 6%", textAlign: "center", width: "100%", boxSizing: "border-box" }}>
        <h2 style={{ fontSize: 38, fontWeight: 900, color: "#fff", marginBottom: 12, letterSpacing: -.5 }}>Pronto para vender mais?</h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,.85)", marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>Transforme as fotos do seu cardápio agora mesmo.</p>
        <button style={{ background: "#fff", color: COR.laranja, border: "none", borderRadius: 50, padding: "16px 44px", fontSize: 16, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 24px rgba(0,0,0,.2)" }}
          onClick={() => user ? setScreen("app") : setShowAuth(true)}>
          ✨ Fazer minha primeira foto
        </button>
      </section>

      <footer style={{ background: "#080808", padding: "36px 6%", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <Logo dark />
        <p style={{ fontSize: 12, color: "#444" }}>© 2026 FotoCardápio · IA para negócios de comida</p>
      </footer>
    </div>
  );

  // ── PLANOS ────────────────────────────────────────────────────
  if (screen === "plans") return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: COR.escuro, minHeight: "100vh", width: "100%" }}>
      <nav style={{ padding: "0 6%", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1a1a1a" }}>
        <Logo onClick={() => setScreen("home")} dark />
        <BtnPrimary onClick={() => user ? setScreen("app") : setShowAuth(true)} style={{ padding: "9px 22px", fontSize: 13 }}>Gerar foto →</BtnPrimary>
      </nav>
      <div style={{ padding: "60px 6%", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: "#fff", letterSpacing: -.5 }}>Créditos que não expiram</h2>
          <p style={{ color: "#888", marginTop: 8 }}>Pague por uso. Sem mensalidade.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
          {PLANS.map(function(p) {
            var isBest = p.id === "pro";
            return (
              <div key={p.id} style={{ background: isBest ? "linear-gradient(160deg,#1f0a00,#2d1200)" : COR.card, borderRadius: 24, padding: "32px 28px", border: isBest ? "1.5px solid rgba(255,90,31,.5)" : "1px solid #2a2a2a", position: "relative" }}>
                {p.badge && <div style={{ position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg,#FF5A1F,#FFBA08)", color: "#fff", fontSize: 11, fontWeight: 800, padding: "4px 16px", borderRadius: 20, whiteSpace: "nowrap" }}>{p.badge}</div>}
                <p style={{ fontSize: 12, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{p.name}</p>
                <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", marginBottom: 2 }}>{p.price}</div>
                <div style={{ fontSize: 13, color: COR.laranja, fontWeight: 600, marginBottom: 6 }}>{p.credits} créditos · {p.perUnit}</div>
                <div style={{ height: 1, background: "#2a2a2a", margin: "20px 0" }}></div>
                <ul style={{ listStyle: "none", padding: 0, marginBottom: 24 }}>
                  {p.features.map(function(f, i) {
                    return <li key={i} style={{ fontSize: 13, color: "#ccc", padding: "5px 0", display: "flex", gap: 10 }}><span style={{ color: COR.laranja, fontWeight: 700 }}>✓</span>{f}</li>;
                  })}
                </ul>
                <BtnPrimary onClick={() => user ? setScreen("app") : setShowAuth(true)} style={{ width: "100%", padding: "13px" }}>Começar agora</BtnPrimary>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── APP ───────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: COR.escuro, minHeight: "100vh", width: "100%", color: "#fff" }}>
      <nav style={{ padding: "0 6%", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #1a1a1a" }}>
        <Logo onClick={() => setScreen("home")} dark />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {user && profile && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 20, padding: "6px 14px" }}>
              <span style={{ fontSize: 13, color: COR.laranja, fontWeight: 700 }}>{profile.credits}</span>
              <span style={{ fontSize: 13, color: "#666" }}>crédito{profile.credits !== 1 ? "s" : ""}</span>
            </div>
          )}
          <button style={{ background: "none", border: "1px solid #333", color: "#aaa", borderRadius: 50, padding: "8px 20px", fontSize: 13, cursor: "pointer" }} onClick={() => setScreen("plans")}>Ver planos</button>
        </div>
      </nav>

      <div style={{ padding: "48px 6%", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: "inline-block", background: "rgba(255,90,31,.15)", border: "1px solid rgba(255,90,31,.3)", color: "#FF8C42", fontSize: 12, fontWeight: 700, padding: "5px 14px", borderRadius: 20, marginBottom: 14 }}>🍽️ IA Gastronômica</div>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: "#fff", marginBottom: 6, letterSpacing: -.5 }}>Transforme seu prato</h2>
          <p style={{ fontSize: 14, color: "#888" }}>Envie a foto e receba uma imagem profissional em segundos.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: resultSrc ? "1fr 1fr" : "1fr", gap: 24 }}>
          <div>
            <div style={{ border: "2px dashed #333", borderRadius: 20, padding: "40px 20px", textAlign: "center", background: "#111", minHeight: 260, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              {!previewSrc ? (
                <div>
                  <div style={{ fontSize: 52, marginBottom: 14 }}>📸</div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Envie a foto do prato</p>
                  <p style={{ fontSize: 13, color: "#666", marginBottom: 24 }}>JPG, PNG ou WEBP</p>
                  <BtnPrimary onClick={() => fileRef.current.click()}>Escolher imagem</BtnPrimary>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
                  <p style={{ fontSize: 11, color: "#444", marginTop: 14 }}>Não precisa ser perfeita — a IA cuida do resto</p>
                </div>
              ) : (
                <div>
                  <img src={previewSrc} style={{ maxHeight: 220, maxWidth: "100%", borderRadius: 12, marginBottom: 12, objectFit: "contain" }} alt="preview" />
                  <span style={{ fontSize: 12, color: "#666", cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => { setPreviewSrc(null); setPreviewB64(null); setResultSrc(null); }}>Trocar foto</span>
                </div>
              )}
            </div>
            {previewSrc && (
              <div style={{ marginTop: 14 }}>
                <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)}
                  placeholder='Opcional: descreva o prato (ex: "esfiha de carne e queijo")'
                  style={{ width: "100%", background: "#111", border: "1px solid #333", borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "#fff", marginBottom: 12, outline: "none", boxSizing: "border-box" }} />
                <BtnPrimary onClick={generate} disabled={loading} style={{ width: "100%", padding: "15px", fontSize: 16 }}>
                  {loading ? loadMsg + "..." : "✨ Gerar foto profissional"}
                </BtnPrimary>
                {loading && <p style={{ fontSize: 12, color: "#666", textAlign: "center", marginTop: 8 }}>⏳ Aguarde até 30 segundos...</p>}
              </div>
            )}
          </div>

          {resultSrc && (
            <div>
              <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid #2a2a2a", background: "#111" }}>
                <div style={{ padding: "10px 16px", background: "#1a1a1a", borderBottom: "1px solid #2a2a2a", display: "flex", gap: 8 }}>
                  <span style={{ background: "#1a3a1a", color: "#4caf50", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>✓ Gerada</span>
                  <span style={{ background: "rgba(255,90,31,.15)", color: COR.laranja, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>🍽️ Cardápio</span>
                </div>
                <img src={resultSrc} style={{ width: "100%", display: "block", maxHeight: 340, objectFit: "contain", background: "#000" }} alt="resultado" />
                <div style={{ padding: 14, display: "flex", gap: 10 }}>
                  <BtnPrimary onClick={download} style={{ flex: 1, padding: "12px" }}>⬇ Baixar foto</BtnPrimary>
                  <button style={{ flex: 1, background: "none", border: "1px solid #333", color: "#aaa", borderRadius: 50, fontSize: 14, cursor: "pointer" }}
                    onClick={() => { setResultSrc(null); setPreviewSrc(null); setPreviewB64(null); setDescricao(""); }}>
                    Nova foto
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {error && <div style={{ marginTop: 18, background: "#2a0a0a", border: "1px solid #5a1a1a", borderRadius: 12, padding: "13px 16px", fontSize: 13, color: "#ff8888" }}>❌ {error}</div>}
      </div>
    </div>
  );
}