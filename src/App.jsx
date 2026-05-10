import { useState } from "react";

const CHANNELS = [
  { id: "facebook", name: "Facebook", color: "#1877F2" },
  { id: "instagram", name: "Instagram", color: "#E4405F" },
  { id: "tiktok", name: "TikTok", color: "#010101" },
  { id: "linkedin", name: "LinkedIn", color: "#0A66C2" },
  { id: "twitter", name: "Twitter / X", color: "#1DA1F2" },
  { id: "youtube", name: "YouTube", color: "#FF0000" },
  { id: "google", name: "Google Business", color: "#4285F4" },
];

const CH_ICON = {
  facebook: "📘", instagram: "📸", tiktok: "🎵",
  linkedin: "💼", twitter: "𝕏", youtube: "▶", google: "🔍",
};

const STATUSES = ["Ideas", "In Progress", "Scheduled", "Published"];

const STATUS_COLOR = {
  Ideas: "#8B5CF6", "In Progress": "#F59E0B",
  Scheduled: "#3B82F6", Published: "#22C55E",
};

const SEED = [
  { id: 1, title: "5 Ways AI Transforms Social Media", content: "Discover how AI is revolutionizing content creation for small businesses.", channels: ["facebook", "linkedin"], status: "Ideas", scheduledDate: "2026-05-15", tags: ["AI", "Marketing"] },
  { id: 2, title: "Behind the Scenes: Our AI Tools", content: "Take a look at the tools we use to power our clients' social presence.", channels: ["instagram", "tiktok"], status: "In Progress", scheduledDate: "2026-05-18", tags: ["BTS"] },
  { id: 3, title: "Client Success Story", content: "How we helped a local business grow their online presence by 300%.", channels: ["facebook", "instagram", "linkedin"], status: "Scheduled", scheduledDate: "2026-05-20", tags: ["CaseStudy"] },
  { id: 4, title: "AI Content Tips for SMBs", content: "Small businesses can now compete with enterprise brands using AI tools.", channels: ["twitter", "linkedin"], status: "Published", scheduledDate: "2026-05-10", tags: ["Tips"] },
  { id: 5, title: "Weekly Engagement Roundup", content: "Top-performing posts from our client network this week.", channels: ["facebook", "instagram", "twitter"], status: "Scheduled", scheduledDate: "2026-05-22", tags: ["Weekly"] },
];

export default function ContentOS() {
  const [view, setView] = useState("kanban");
  const [posts, setPosts] = useState(SEED);
  const [editing, setEditing] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [activeCh, setActiveCh] = useState("all");
  const [dragId, setDragId] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiIdeas, setAiIdeas] = useState([]);
  const [aiForm, setAiForm] = useState({
    business: "AI marketing agency generating social media content using AI tools",
    audience: "Small and medium businesses wanting consistent social media presence",
  });

  const filtered = activeCh === "all" ? posts : posts.filter(p => p.channels.includes(activeCh));

  const nextId = () => Math.max(0, ...posts.map(p => p.id)) + 1;

  const savePost = (p) => {
    setPosts(prev => p.id ? prev.map(x => x.id === p.id ? p : x) : [...prev, { ...p, id: nextId() }]);
    setEditing(null);
  };

  const delPost = (id) => { setPosts(prev => prev.filter(p => p.id !== id)); setEditing(null); };
  const movePost = (id, status) => setPosts(prev => prev.map(p => p.id === id ? { ...p, status } : p));

  const genIdeas = async () => {
    setAiLoading(true); setAiIdeas([]);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: headers: {
  "Content-Type": "application/json",
  "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
  "anthropic-version": "2023-06-01",
},,
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          messages: [{ role: "user", content: `Generate 6 social media content ideas.\nBusiness: ${aiForm.business}\nAudience: ${aiForm.audience}\nReturn ONLY a JSON array. Each object: title (max 60 chars), content (1-2 sentences), tags (array 1-3), suggestedChannels (array from: facebook instagram tiktok linkedin twitter youtube google). No markdown, pure JSON.` }],
        }),
      });
      const d = await r.json();
      setAiIdeas(JSON.parse(d.content[0].text.replace(/```json|```/g, "").trim()));
    } catch { setAiIdeas([{ title: "Generation failed", content: "Please try again.", tags: [], suggestedChannels: [] }]); }
    setAiLoading(false);
  };

  const addIdea = (idea) => setPosts(prev => [...prev, { id: nextId(), title: idea.title, content: idea.content, channels: idea.suggestedChannels || [], status: "Ideas", scheduledDate: "", tags: idea.tags || [] }]);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', system-ui, sans-serif", background: "#F7F6F3", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:99px;}
        .nb{display:flex;align-items:center;gap:9px;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:13px;font-weight:500;color:#94A3B8;transition:all .12s;border:none;background:none;width:100%;text-align:left;font-family:inherit;}
        .nb:hover{background:rgba(255,255,255,.08);color:#CBD5E1;}
        .nb.on{background:rgba(34,197,94,.14);color:#4ADE80;}
        .btn{padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:all .12s;font-family:inherit;border:none;}
        .bp{background:#22C55E;color:#fff;}.bp:hover{background:#16A34A;}.bp:disabled{background:#86EFAC;cursor:not-allowed;}
        .bg{background:transparent;color:#475569;border:1.5px solid #E2E8F0;}.bg:hover{background:#F1F5F9;}
        .bd{background:#FEE2E2;color:#DC2626;border:none;}.bd:hover{background:#FECACA;}
        .pc{background:white;border-radius:10px;padding:14px;margin-bottom:10px;cursor:grab;border:1.5px solid #F1F5F9;transition:all .15s;box-shadow:0 1px 3px rgba(0,0,0,.05);}
        .pc:hover{border-color:#22C55E;box-shadow:0 3px 12px rgba(34,197,94,.1);transform:translateY(-1px);}
        .pc.dr{opacity:.35;cursor:grabbing;}
        .kc{min-height:100px;border-radius:8px;transition:all .15s;padding:2px;}
        .kc.do{background:rgba(34,197,94,.06);outline:2px dashed #22C55E;}
        .inp{width:100%;padding:10px 14px;border:1.5px solid #E2E8F0;border-radius:8px;font-size:14px;font-family:inherit;outline:none;transition:border-color .15s;background:white;color:#0F172A;}
        .inp:focus{border-color:#22C55E;box-shadow:0 0 0 3px rgba(34,197,94,.1);}
        textarea.inp{resize:vertical;min-height:88px;line-height:1.5;}
        .lbl{font-size:11px;font-weight:700;color:#64748B;margin-bottom:6px;display:block;text-transform:uppercase;letter-spacing:.07em;}
        .chip{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;background:#F1F5F9;color:#475569;}
        .cpill{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:20px;cursor:pointer;font-size:12px;font-weight:600;border:1.5px solid #E2E8F0;transition:all .12s;background:white;color:#64748B;}
        .cpill:hover{border-color:#94A3B8;}
        .ic{background:#F8FAFC;border:1.5px solid #E2E8F0;border-radius:10px;padding:14px;cursor:pointer;transition:all .12s;}
        .ic:hover{border-color:#22C55E;background:#F0FDF4;}
        .spin{animation:sp .8s linear infinite;display:inline-block;}
        @keyframes sp{to{transform:rotate(360deg);}}
        .moverlay{position:fixed;inset:0;background:rgba(15,23,42,.45);display:flex;align-items:center;justify-content:center;z-index:50;backdrop-filter:blur(3px);}
        .mbox{background:white;border-radius:16px;padding:28px;max-height:88vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,.18);}
        .ccell{background:white;min-height:86px;padding:6px 8px;border:0.5px solid #F1F5F9;}
        .ccell:hover{background:#F8FAFC;}
        .cppost{font-size:11px;padding:2px 6px;border-radius:4px;margin-bottom:2px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:white;font-weight:600;}
        .cppost:hover{opacity:.85;}
      `}</style>

      {/* SIDEBAR */}
      <div style={{ width: 214, background: "#0F172A", display: "flex", flexDirection: "column", padding: "20px 10px", flexShrink: 0, overflow: "hidden" }}>
        <div style={{ padding: "2px 12px 16px", borderBottom: "1px solid rgba(255,255,255,.07)", marginBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "white", letterSpacing: "-.03em" }}>✦ ContentOS</div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>Internal Content Hub</div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: ".1em", padding: "0 12px", marginBottom: 5 }}>Workspace</div>
          <button className={`nb ${view === "kanban" ? "on" : ""}`} onClick={() => setView("kanban")}><span>⬡</span> Kanban</button>
          <button className={`nb ${view === "calendar" ? "on" : ""}`} onClick={() => setView("calendar")}><span>◫</span> Calendar</button>
          <button className="nb" onClick={() => setAiOpen(true)}><span>✦</span> AI Ideas</button>
        </div>

        <div style={{ flex: 1, overflow: "hidden" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: ".1em", padding: "0 12px", marginBottom: 5 }}>Channels</div>
          <button className={`nb ${activeCh === "all" ? "on" : ""}`} onClick={() => setActiveCh("all")}>
            <span>◈</span> All channels
            <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#334155" }}>{posts.length}</span>
          </button>
          {CHANNELS.map(ch => (
            <button key={ch.id} className="nb"
              style={activeCh === ch.id ? { color: ch.color, background: `${ch.color}1A` } : {}}
              onClick={() => setActiveCh(p => p === ch.id ? "all" : ch.id)}>
              <span style={{ fontSize: 13 }}>{CH_ICON[ch.id]}</span>
              <span>{ch.name}</span>
              <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: "#334155" }}>{posts.filter(p => p.channels.includes(ch.id)).length}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 12, padding: "12px", background: "rgba(34,197,94,.09)", borderRadius: 10, border: "1px solid rgba(34,197,94,.18)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#4ADE80" }}>{posts.filter(p => p.status === "Published").length} published</div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
            {posts.filter(p => p.status === "Scheduled").length} scheduled · {posts.filter(p => p.status === "Ideas").length} ideas
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ background: "white", borderBottom: "1px solid #F1F5F9", padding: "15px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", letterSpacing: "-.025em" }}>
              {view === "kanban" ? "Content Board" : "Content Calendar"}
            </div>
            <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>
              {activeCh === "all" ? "All channels" : CHANNELS.find(c => c.id === activeCh)?.name} · {filtered.length} posts
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn bg" onClick={() => setAiOpen(true)}>✦ Generate Ideas</button>
            <button className="btn bp" onClick={() => setEditing({ title: "", content: "", channels: [], status: "Ideas", scheduledDate: "", tags: [] })}>+ New Post</button>
          </div>
        </div>

        {/* View */}
        <div style={{ flex: 1, overflow: "auto", padding: 22 }}>
          {view === "kanban"
            ? <KanbanView posts={filtered} onEdit={setEditing} onMove={movePost} dragId={dragId} setDragId={setDragId} dragOver={dragOver} setDragOver={setDragOver} />
            : <CalendarView posts={filtered} onEdit={setEditing} />}
        </div>
      </div>

      {editing && <PostModal post={editing} onSave={savePost} onDelete={delPost} onClose={() => setEditing(null)} />}
      {aiOpen && <AIModal form={aiForm} setForm={setAiForm} ideas={aiIdeas} loading={aiLoading} onGen={genIdeas} onAdd={addIdea} onClose={() => { setAiOpen(false); setAiIdeas([]); }} />}
    </div>
  );
}

function KanbanView({ posts, onEdit, onMove, dragId, setDragId, dragOver, setDragOver }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      {STATUSES.map(status => {
        const col = posts.filter(p => p.status === status);
        return (
          <div key={status} style={{ flex: 1, minWidth: 210, maxWidth: 270 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 11 }}>
              <div style={{ width: 9, height: 9, borderRadius: "50%", background: STATUS_COLOR[status], flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, fontWeight: 700, color: "#334155" }}>{status}</span>
              <span style={{ marginLeft: "auto", background: "#F1F5F9", borderRadius: 99, padding: "1px 8px", fontSize: 11, fontWeight: 700, color: "#64748B" }}>{col.length}</span>
            </div>
            <div className={`kc ${dragOver === status ? "do" : ""}`}
              onDragOver={e => { e.preventDefault(); setDragOver(status); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => { e.preventDefault(); if (dragId) onMove(dragId, status); setDragOver(null); setDragId(null); }}>
              {col.map(post => (
                <div key={post.id} className={`pc ${dragId === post.id ? "dr" : ""}`}
                  draggable onDragStart={() => setDragId(post.id)} onDragEnd={() => setDragId(null)}
                  onClick={() => onEdit(post)}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 5, lineHeight: 1.35 }}>{post.title}</div>
                  <div style={{ fontSize: 11.5, color: "#94A3B8", marginBottom: 9, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{post.content}</div>
                  {post.tags.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                      {post.tags.map(t => <span key={t} className="chip">#{t}</span>)}
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: 3 }}>
                      {post.channels.slice(0, 4).map(ch => <span key={ch} title={CHANNELS.find(c => c.id === ch)?.name} style={{ fontSize: 13 }}>{CH_ICON[ch]}</span>)}
                      {post.channels.length > 4 && <span style={{ fontSize: 10, color: "#94A3B8", alignSelf: "center" }}>+{post.channels.length - 4}</span>}
                    </div>
                    {post.scheduledDate && <span style={{ fontSize: 10, color: "#94A3B8" }}>{post.scheduledDate}</span>}
                  </div>
                </div>
              ))}
              {col.length === 0 && <div style={{ textAlign: "center", padding: "18px 0", color: "#CBD5E1", fontSize: 12 }}>Drop here</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CalendarView({ posts, onEdit }) {
  const [date, setDate] = useState(new Date(2026, 4, 1));
  const y = date.getFullYear(), m = date.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const label = date.toLocaleString("default", { month: "long", year: "numeric" });
  const today = new Date();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  const postsOn = (d) => {
    const k = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return posts.filter(p => p.scheduledDate === k);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <button className="btn bg" style={{ padding: "6px 12px" }} onClick={() => setDate(new Date(y, m - 1, 1))}>←</button>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", letterSpacing: "-.02em", minWidth: 180, textAlign: "center" }}>{label}</span>
        <button className="btn bg" style={{ padding: "6px 12px" }} onClick={() => setDate(new Date(y, m + 1, 1))}>→</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", border: "0.5px solid #E2E8F0", borderRadius: 10, overflow: "hidden" }}>
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
          <div key={d} style={{ background: "#F8FAFC", padding: "7px", fontSize: 10, fontWeight: 700, color: "#94A3B8", textAlign: "center", textTransform: "uppercase", letterSpacing: ".08em", borderBottom: "0.5px solid #E2E8F0" }}>{d}</div>
        ))}
        {cells.map((day, i) => {
          const dp = day ? postsOn(day) : [];
          const isToday = day && day === today.getDate() && m === today.getMonth() && y === today.getFullYear();
          return (
            <div key={i} className="ccell">
              {day && (
                <>
                  <div style={{ fontSize: 11, fontWeight: isToday ? 700 : 400, color: isToday ? "white" : "#64748B", background: isToday ? "#22C55E" : "transparent", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 3 }}>{day}</div>
                  {dp.map(p => (
                    <div key={p.id} className="cppost" onClick={() => onEdit(p)} style={{ background: STATUS_COLOR[p.status] }} title={p.title}>
                      {CH_ICON[p.channels[0]]} {p.title}
                    </div>
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PostModal({ post, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({ ...post });
  const [tagIn, setTagIn] = useState("");
  const isNew = !post.id;

  const toggleCh = id => setForm(f => ({ ...f, channels: f.channels.includes(id) ? f.channels.filter(c => c !== id) : [...f.channels, id] }));
  const handleTag = e => {
    if ((e.key === "Enter" || e.key === ",") && tagIn.trim()) {
      e.preventDefault();
      if (!form.tags.includes(tagIn.trim())) setForm(f => ({ ...f, tags: [...f.tags, tagIn.trim()] }));
      setTagIn("");
    }
  };

  return (
    <div className="moverlay" onClick={onClose}>
      <div className="mbox" style={{ width: 530 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#0F172A" }}>{isNew ? "New Post" : "Edit Post"}</span>
          <button className="btn bg" onClick={onClose} style={{ padding: "4px 10px" }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
          <div><label className="lbl">Title</label><input className="inp" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Post title..." /></div>
          <div><label className="lbl">Content / Caption</label><textarea className="inp" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Write your content..." /></div>
          <div>
            <label className="lbl">Channels</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {CHANNELS.map(ch => {
                const on = form.channels.includes(ch.id);
                return (
                  <div key={ch.id} className="cpill" onClick={() => toggleCh(ch.id)}
                    style={on ? { background: `${ch.color}14`, borderColor: ch.color, color: ch.color } : {}}>
                    {CH_ICON[ch.id]} {ch.name}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label className="lbl">Status</label><select className="inp" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
            <div><label className="lbl">Scheduled Date</label><input className="inp" type="date" value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} /></div>
          </div>
          <div>
            <label className="lbl">Tags (Enter to add)</label>
            {form.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 7 }}>
                {form.tags.map(t => <span key={t} className="chip" style={{ cursor: "pointer" }} onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))}>#{t} ✕</span>)}
              </div>
            )}
            <input className="inp" value={tagIn} onChange={e => setTagIn(e.target.value)} onKeyDown={handleTag} placeholder="Type tag and press Enter..." />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, paddingTop: 16, borderTop: "1px solid #F1F5F9" }}>
          <div>{!isNew && <button className="btn bd" onClick={() => onDelete(post.id)}>Delete</button>}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn bg" onClick={onClose}>Cancel</button>
            <button className="btn bp" onClick={() => onSave(form)} disabled={!form.title.trim()}>{isNew ? "Create Post" : "Save Changes"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AIModal({ form, setForm, ideas, loading, onGen, onAdd, onClose }) {
  return (
    <div className="moverlay" onClick={onClose}>
      <div className="mbox" style={{ width: 610 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#0F172A" }}>✦ AI Idea Generator</div>
            <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 1 }}>Powered by Claude — click any idea to add it to the board</div>
          </div>
          <button className="btn bg" onClick={onClose} style={{ padding: "4px 10px" }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 16 }}>
          <div><label className="lbl">What is your business about?</label><textarea className="inp" rows={2} value={form.business} onChange={e => setForm(f => ({ ...f, business: e.target.value }))} /></div>
          <div><label className="lbl">Who is your target audience?</label><textarea className="inp" rows={2} value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))} /></div>
          <button className="btn bp" onClick={onGen} disabled={loading} style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 8 }}>
            <span className={loading ? "spin" : ""}>✦</span> {loading ? "Generating..." : "Generate 6 Ideas"}
          </button>
        </div>

        {ideas.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>
              {ideas.length} ideas generated — click to add
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, maxHeight: 340, overflowY: "auto" }}>
              {ideas.map((idea, i) => (
                <div key={i} className="ic" onClick={() => onAdd(idea)}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0F172A", marginBottom: 5, lineHeight: 1.35 }}>{idea.title}</div>
                  <div style={{ fontSize: 11.5, color: "#64748B", lineHeight: 1.5, marginBottom: 7 }}>{idea.content}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {(idea.suggestedChannels || []).map(ch => <span key={ch} title={CHANNELS.find(c => c.id === ch)?.name} style={{ fontSize: 13 }}>{CH_ICON[ch]}</span>)}
                    {(idea.tags || []).map(t => <span key={t} className="chip">#{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}