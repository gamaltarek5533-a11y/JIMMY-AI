import { useState, useRef, useEffect, useCallback } from "react";

// ════════════════════════════════════════════════════
//  CONFIG — عنوان الـ Backend Server
// ════════════════════════════════════════════════════
const API = 'sk-ws-01-M1O_N5zNclJp36j0xpI8cz_XVTYtM07432hqtKQTXwIqlAVdZz1xABn6qQuhfDQkSWCUhh8-jAq7RCBn1LviP37qFaS2dQ';

// ════════════════════════════════════════════════════
//  SYNTAX HIGHLIGHTER
// ════════════════════════════════════════════════════
function hlCode(code, lang) {
  const esc = s => String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  let c = esc(code);
  const KW = {
    javascript: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|new|this|typeof|instanceof|import|export|default|from|async|await|try|catch|finally|throw|true|false|null|undefined|of|in|delete|void|=>)\b/g,
    python:     /\b(def|class|return|if|elif|else|for|while|import|from|as|with|try|except|finally|raise|True|False|None|and|or|not|in|is|lambda|pass|break|continue|yield|global|nonlocal|print|len|range|self|super)\b/g,
    typescript: /\b(const|let|var|function|return|if|else|for|while|class|new|this|import|export|default|from|async|await|type|interface|enum|implements|extends|public|private|protected|readonly|true|false|null|undefined|any|void|never|string|number|boolean)\b/g,
    java:       /\b(public|private|protected|class|interface|extends|implements|return|if|else|for|while|new|this|super|import|package|static|final|void|boolean|int|long|double|float|String|true|false|null|try|catch|finally|throw|throws)\b/g,
    css:        null,
    html:       null,
    json:       null,
  };
  // Comments
  c = c.replace(/(\/\/[^\n]*)/g,   '<span style="color:#8b949e;font-style:italic">$1</span>');
  c = c.replace(/(#[^\n{]+)/g,     '<span style="color:#8b949e;font-style:italic">$1</span>');
  c = c.replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color:#8b949e;font-style:italic">$1</span>');
  // Strings
  c = c.replace(/(["'`])((?:\\.|(?!\1)[^\\])*)\1/g, '<span style="color:#a5d6ff">$&</span>');
  // Numbers
  c = c.replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#f2cc60">$1</span>');

  if (lang === 'json') {
    c = c.replace(/"([^"]+)":/g,  '<span style="color:#79c0ff">"$1"</span>:');
    return c;
  }
  if (lang === 'html') {
    c = c.replace(/(&lt;\/?)([\w-]+)/g, '$1<span style="color:#7ee787">$2</span>');
    c = c.replace(/([\w-]+)=/g, '<span style="color:#ff7b72">$1</span>=');
    return c;
  }
  if (lang === 'css') {
    c = c.replace(/([.#]?[\w-]+)\s*\{/g, '<span style="color:#79c0ff">$1</span>{');
    c = c.replace(/([\w-]+)\s*:/g, '<span style="color:#ff7b72">$1</span>:');
    return c;
  }

  const kw = KW[lang] || KW.javascript;
  if (kw) c = c.replace(kw, '<span style="color:#ff7b72;font-weight:500">$&</span>');
  c = c.replace(/\b([A-Z][a-zA-Z0-9_]*)\b/g, '<span style="color:#ffa657">$&</span>');
  c = c.replace(/([a-zA-Z_$][\w$]*)\s*(?=\()/g, '<span style="color:#d2a8ff">$1</span>');
  return c;
}

// ════════════════════════════════════════════════════
//  CODE BLOCK COMPONENT
// ════════════════════════════════════════════════════
function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  const normalized = (lang || 'text').toLowerCase()
    .replace('js','javascript').replace('py','python').replace('ts','typescript');

  return (
    <div style={{ margin:'10px 0', borderRadius:10, overflow:'hidden', border:'1px solid rgba(0,255,135,0.12)', background:'#0d1117' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 14px', background:'rgba(0,0,0,0.6)', borderBottom:'1px solid rgba(0,255,135,0.08)' }}>
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:'#00c96b', letterSpacing:1.5, textTransform:'uppercase' }}>
          {normalized}
        </span>
        <button onClick={copy} style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color: copied?'#00ff87':'#3d7a5a', background: copied?'rgba(0,255,135,0.08)':'transparent', border:`1px solid ${copied?'rgba(0,255,135,0.35)':'rgba(0,255,135,0.12)'}`, borderRadius:4, padding:'3px 12px', cursor:'pointer', transition:'all .2s', letterSpacing:.5 }}>
          {copied ? '✓ تم النسخ' : 'نسخ الكود'}
        </button>
      </div>
      {/* Code */}
      <pre style={{ margin:0, padding:'16px', background:'#161b22', overflowX:'auto', maxHeight:450 }}>
        <code
          style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, lineHeight:1.7 }}
          dangerouslySetInnerHTML={{ __html: hlCode(code, normalized) }}
        />
      </pre>
    </div>
  );
}

// ════════════════════════════════════════════════════
//  MARKDOWN RENDERER
// ════════════════════════════════════════════════════
function Markdown({ text }) {
  if (!text) return null;

  const inl = t => {
    if (!t) return '';
    return t
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g,     '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g,         '<em style="color:#7ab896">$1</em>')
      .replace(/`([^`]+)`/g,         `<code style="font-family:'IBM Plex Mono',monospace;font-size:12.5px;background:rgba(0,255,135,0.1);padding:2px 7px;border-radius:4px;color:#00ff87;border:1px solid rgba(0,255,135,0.15)">$1</code>`)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" style="color:#00ff87;text-decoration:underline">$1</a>');
  };

  const blocks = [];
  const lines  = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const l = lines[i];

    // ── Code block ──
    const cbMatch = l.match(/^```(\w*)/);
    if (cbMatch) {
      const lang = cbMatch[1] || 'text';
      let code = '';
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        code += (code ? '\n' : '') + lines[i];
        i++;
      }
      blocks.push(<CodeBlock key={`cb-${i}`} lang={lang} code={code} />);
      i++; continue;
    }

    // ── Headings ──
    if (l.startsWith('### ')) { blocks.push(<h3 key={`h3-${i}`} style={{ fontFamily:"'Bricolage Grotesque',sans-serif", color:'#00ff87', fontSize:15, margin:'10px 0 5px', fontWeight:700 }} dangerouslySetInnerHTML={{ __html:inl(l.slice(4)) }}/>); i++; continue; }
    if (l.startsWith('## '))  { blocks.push(<h2 key={`h2-${i}`} style={{ fontFamily:"'Bricolage Grotesque',sans-serif", color:'#00ff87', fontSize:18, margin:'12px 0 6px', fontWeight:700 }} dangerouslySetInnerHTML={{ __html:inl(l.slice(3)) }}/>); i++; continue; }
    if (l.startsWith('# '))   { blocks.push(<h1 key={`h1-${i}`} style={{ fontFamily:"'Bricolage Grotesque',sans-serif", color:'#00ff87', fontSize:22, margin:'14px 0 7px', fontWeight:800 }} dangerouslySetInnerHTML={{ __html:inl(l.slice(2)) }}/>); i++; continue; }

    // ── HR ──
    if (l.trim() === '---') { blocks.push(<hr key={`hr-${i}`} style={{ border:'none', borderTop:'1px solid rgba(0,255,135,0.12)', margin:'12px 0' }}/>); i++; continue; }

    // ── Unordered List ──
    if (l.match(/^[\*\-] /)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[\*\-] /)) {
        items.push({ text: lines[i].replace(/^[\*\-] /, ''), idx: i });
        i++;
      }
      blocks.push(
        <ul key={`ul-${i}`} style={{ paddingRight:22, margin:'6px 0' }}>
          {items.map(it => <li key={`li-${it.idx}`} style={{ color:'#7ab896', margin:'4px 0', fontSize:14.5, lineHeight:1.7 }} dangerouslySetInnerHTML={{ __html:inl(it.text) }}/>)}
        </ul>
      );
      continue;
    }

    // ── Ordered List ──
    if (l.match(/^\d+\. /)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push({ text: lines[i].replace(/^\d+\. /, ''), idx: i });
        i++;
      }
      blocks.push(
        <ol key={`ol-${i}`} style={{ paddingRight:22, margin:'6px 0' }}>
          {items.map(it => <li key={`oli-${it.idx}`} style={{ color:'#7ab896', margin:'4px 0', fontSize:14.5, lineHeight:1.7 }} dangerouslySetInnerHTML={{ __html:inl(it.text) }}/>)}
        </ol>
      );
      continue;
    }

    // ── Table ──
    if (l.startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        if (!/^\|[-| :]+\|$/.test(lines[i].trim())) {
          rows.push({ cells: lines[i].split('|').filter((_, j, a) => j > 0 && j < a.length - 1).map(c => c.trim()), idx: i });
        }
        i++;
      }
      if (rows.length) {
        blocks.push(
          <div key={`tbl-${i}`} style={{ overflowX:'auto', margin:'10px 0' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={`tr-${row.idx}`}>
                    {row.cells.map((cell, ci) => {
                      const Tag = ri === 0 ? 'th' : 'td';
                      return (
                        <Tag key={`tc-${row.idx}-${ci}`} style={ ri === 0
                          ? { background:'rgba(0,255,135,0.08)', color:'#00ff87', padding:'8px 12px', textAlign:'right', fontFamily:"'IBM Plex Mono',monospace", fontSize:11, letterSpacing:.5 }
                          : { padding:'8px 12px', borderBottom:'1px solid rgba(0,255,135,0.07)', color:'#7ab896' }
                        } dangerouslySetInnerHTML={{ __html: inl(cell) }} />
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // ── Empty line ──
    if (!l.trim()) { blocks.push(<div key={`br-${i}`} style={{ height:6 }}/>); i++; continue; }

    // ── Paragraph ──
    blocks.push(<p key={`p-${i}`} style={{ margin:'3px 0', lineHeight:1.85, fontSize:14.5, color:'#e8f5ee' }} dangerouslySetInnerHTML={{ __html:inl(l) }}/>);
    i++;
  }

  return <div>{blocks}</div>;
}

// ════════════════════════════════════════════════════
//  LOCAL STORAGE HOOK
// ════════════════════════════════════════════════════
function useLS(key, def) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; }
    catch { return def; }
  });
  const set = useCallback(v => {
    const next = typeof v === 'function' ? v(val) : v;
    setVal(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
  }, [key, val]);
  return [val, set];
}

// ════════════════════════════════════════════════════
//  COLORS
// ════════════════════════════════════════════════════
const C = {
  g1:'#00ff87', g2:'#00c96b', g4:'#003d20',
  bg:'#050a07', s1:'#091410', s2:'#0c1c16', s3:'#0f2219',
  txt:'#e8f5ee', txt2:'#7ab896', txt3:'#3d7a5a',
  red:'#ff5063'
};

// ════════════════════════════════════════════════════
//  MAIN APP
// ════════════════════════════════════════════════════
export default function JimmyAI() {
  // ── Storage ──
  const [users,  setUsers]  = useLS('jmy_u', {});
  const [me,     setMe]     = useLS('jmy_me', null);
  const [chats,  setChats]  = useLS('jmy_c', {});

  // ── UI State ──
  const [cid,    setCid]    = useState(null);
  const [msgs,   setMsgs]   = useState([]);
  const [title,  setTitle]  = useState('JIMMY AI');
  const [aTab,   setATab]   = useState('login');
  const [busy,   setBusy]   = useState(false);
  const [lb,     setLb]     = useState(null);   // lightbox src

  // ── Auth fields ──
  const [lE, setLE] = useState(''); const [lP, setLP] = useState('');
  const [rN, setRN] = useState(''); const [rE, setRE] = useState(''); const [rP, setRP] = useState('');
  const [aErr, setAErr] = useState('');

  // ── Input ──
  const [text,  setText]  = useState('');
  const [files, setFiles] = useState([]);   // pending attachments

  const msgsRef = useRef(null);
  const txtRef  = useRef(null);
  const fileRef = useRef(null);

  const user = me ? users[me] : null;

  // ── Auto-scroll ──
  useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [msgs, busy]);

  // ── Load last chat on login ──
  useEffect(() => {
    if (me && users[me]) {
      const ids = users[me].ids || [];
      if (ids.length) loadChat(ids[ids.length - 1]);
    }
  }, [me]);

  // ════════════════════════════════════════════════
  //  AUTH
  // ════════════════════════════════════════════════
  const doLogin = () => {
    if (!lE || !lP) return setAErr('أدخل البريد وكلمة المرور');
    if (!users[lE]) return setAErr('البريد غير مسجل');
    if (users[lE].pass !== lP) return setAErr('كلمة المرور غير صحيحة');
    setMe(lE); setAErr('');
  };

  const doRegister = () => {
    if (!rN || !rE || !rP) return setAErr('أكمل جميع الحقول');
    if (users[rE]) return setAErr('البريد مسجل مسبقاً');
    if (rP.length < 6) return setAErr('كلمة المرور ٦ أحرف على الأقل');
    setUsers({ ...users, [rE]: { name: rN, pass: rP, ids: [] } });
    setMe(rE); setAErr('');
  };

  const doLogout = () => { setMe(null); setCid(null); setMsgs([]); };

  // ════════════════════════════════════════════════
  //  CHAT MANAGEMENT
  // ════════════════════════════════════════════════
  const newChat = () => {
    const id = 'c' + Date.now();
    setChats(p => ({ ...p, [id]: { title: 'محادثة جديدة', api: [], ui: [] } }));
    setUsers(p => ({ ...p, [me]: { ...p[me], ids: [...(p[me].ids || []), id] } }));
    setCid(id); setMsgs([]); setTitle('محادثة جديدة');
  };

  const loadChat = useCallback(id => {
    const ch = chats[id]; if (!ch) return;
    setCid(id); setTitle(ch.title || 'محادثة'); setMsgs(ch.ui || []);
  }, [chats]);

  const deleteChat = (id, e) => {
    e.stopPropagation();
    setChats(p => { const n = { ...p }; delete n[id]; return n; });
    setUsers(p => ({ ...p, [me]: { ...p[me], ids: (p[me].ids || []).filter(x => x !== id) } }));
    if (cid === id) { setCid(null); setMsgs([]); setTitle('JIMMY AI'); }
  };

  // ════════════════════════════════════════════════
  //  FILE HANDLING
  // ════════════════════════════════════════════════
  const onFilePick = async ev => {
    const picked = [...ev.target.files]; ev.target.value = '';
    const nf = [];
    for (const f of picked) {
      if (f.type.startsWith('image/')) {
        const b64 = await new Promise(r => {
          const fr = new FileReader();
          fr.onload = e => r(e.target.result);
          fr.readAsDataURL(f);
        });
        nf.push({ type: 'image', name: f.name, b64, mime: f.type });
      } else {
        const t = await f.text().catch(() => '[binary file]');
        nf.push({ type: 'file', name: f.name, text: t.slice(0, 20000) });
      }
    }
    setFiles(p => [...p, ...nf]);
  };

  // ════════════════════════════════════════════════
  //  SEND MESSAGE
  // ════════════════════════════════════════════════
  const sendMessage = async () => {
    if (!text.trim() && !files.length) return;

    // Create chat if needed
    let curCid = cid;
    if (!curCid) {
      curCid = 'c' + Date.now();
      setChats(p => ({ ...p, [curCid]: { title: 'محادثة جديدة', api: [], ui: [] } }));
      setUsers(p => ({ ...p, [me]: { ...p[me], ids: [...(p[me].ids || []), curCid] } }));
      setCid(curCid);
    }

    const time     = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const curFiles = [...files];
    const curText  = text.trim();
    const imgFiles = curFiles.filter(f => f.type === 'image');
    const txtFiles = curFiles.filter(f => f.type === 'file');

    // UI message
    const uiMsg = { id: Date.now(), role: 'user', content: curText, time, img: imgFiles[0]?.b64 || null, fileNames: txtFiles.map(f => f.name) };
    const newMsgs = [...msgs, uiMsg];
    setMsgs(newMsgs);
    setText(''); setFiles([]); setBusy(true);

    // Set title on first message
    const ch = chats[curCid] || { api: [], ui: [], title: 'محادثة جديدة' };
    if (!ch.ui?.length) {
      const t = (curText || curFiles[0]?.name || 'محادثة').slice(0, 30);
      setTitle(t);
      setChats(p => ({ ...p, [curCid]: { ...p[curCid], title: t } }));
    }

    const isGen = /^(ولّد|ارسم|اصنع|صور لي|توليد|generate|draw|create image)/i.test(curText);

    try {
      if (isGen) await handleImageGen(curText, curCid, newMsgs, time, ch);
      else       await handleChat(curText, curFiles, curCid, newMsgs, time, ch);
    } catch (err) {
      const errMsg = '⚠️ ' + (err.message || 'خطأ في الاتصال بالسيرفر');
      const fin = [...newMsgs, { id: Date.now(), role: 'ai', content: errMsg, time }];
      setMsgs(fin);
      setChats(p => ({ ...p, [curCid]: { ...p[curCid], ui: fin } }));
    }
    setBusy(false);
  };

  // ════════════════════════════════════════════════
  //  CHAT via /api/chat  (Gemini 1.5 Pro)
  // ════════════════════════════════════════════════
  const handleChat = async (text, files, curCid, prevMsgs, time, ch) => {
    const prevApi = ch.api || [];

    // Build content parts for current message
    const parts = [];
    const txtFiles = files.filter(f => f.type === 'file');

    if (txtFiles.length) {
      const fileContent = txtFiles.map(f => `### ${f.name}\n\`\`\`\n${f.text}\n\`\`\``).join('\n\n');
      parts.push({ type: 'text', text: (text || 'حلل هذه الملفات:') + '\n\n--- الملفات المرفقة ---\n\n' + fileContent });
    } else {
      parts.push({ type: 'text', text: text || 'صف هذه الصورة' });
    }

    files.filter(f => f.type === 'image').forEach(f => {
      parts.push({ type: 'image', mime_type: f.mime, data: f.b64.split(',')[1] });
    });

    const apiMsg = { role: 'user', content: parts.length === 1 ? parts[0].text : parts };
    const allMsgs = [...prevApi.slice(-16), apiMsg];

    const res = await fetch(`${API}/chat`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ messages: allMsgs })
    });

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || `Server Error ${res.status}`);
    }

    const data  = await res.json();
    const reply = data.reply || 'لم أتمكن من الرد.';

    const newApi = [...prevApi.slice(-14), apiMsg, { role: 'assistant', content: reply }];
    const aiMsg  = { id: Date.now(), role: 'ai', content: reply, time };
    const fin    = [...prevMsgs, aiMsg];

    setMsgs(fin);
    setChats(p => ({ ...p, [curCid]: { ...p[curCid], api: newApi, ui: fin } }));
  };

  // ════════════════════════════════════════════════
  //  IMAGE GENERATION via /api/translate + Pollinations
  // ════════════════════════════════════════════════
  const handleImageGen = async (text, curCid, prevMsgs, time, ch) => {
    // 1. Translate Arabic → English via server
    let engPrompt = text;
    try {
      const r = await fetch(`${API}/translate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text })
      });
      if (r.ok) { const d = await r.json(); engPrompt = d.eng || text; }
    } catch (e) {}

    // 2. Get image URL from server
    const seed   = Date.now();
    const imgRes = await fetch(`${API}/image?prompt=${encodeURIComponent(engPrompt)}&seed=${seed}`);
    const imgData = await imgRes.json();
    const imgUrl  = imgData.url;

    // 3. Preload image
    await new Promise(r => {
      const img = new Image();
      img.onload = r; img.onerror = r;
      img.src = imgUrl;
      setTimeout(r, 15000);
    });

    const aiMsg = { id: Date.now(), role: 'ai', content: 'تم توليد الصورة! 🎨', time, genImg: imgUrl };
    const fin   = [...prevMsgs, aiMsg];
    setMsgs(fin);
    setChats(p => ({ ...p, [curCid]: { ...p[curCid], ui: fin } }));
  };

  // ════════════════════════════════════════════════
  //  KEYBOARD & RESIZE
  // ════════════════════════════════════════════════
  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const onResize = e => { const el = e.target; el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 140) + 'px'; };

  const chatIds = [...(user?.ids || [])].reverse();

  // ════════════════════════════════════════════════
  //  SHARED STYLES
  // ════════════════════════════════════════════════
  const inputStyle = {
    width: '100%', background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(0,255,135,0.18)', borderRadius: 8,
    padding: '11px 14px', fontSize: 14, color: C.txt,
    fontFamily: "'Cairo',sans-serif", outline: 'none', marginBottom: 14
  };
  const labelStyle = {
    fontSize: 10, fontFamily: "'IBM Plex Mono',monospace",
    color: C.txt3, letterSpacing: 1.5, marginBottom: 7, display: 'block'
  };

  // ════════════════════════════════════════════════
  //  LOGIN PAGE
  // ════════════════════════════════════════════════
  if (!me) return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Cairo',sans-serif", direction:'rtl', position:'relative', overflow:'hidden' }}>
      {/* BG Effects */}
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 65% 55% at 65% 5%,rgba(0,180,90,0.12),transparent 60%),radial-gradient(ellipse 45% 45% at 5% 80%,rgba(0,255,135,0.07),transparent 55%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(0,255,135,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,135,0.02) 1px,transparent 1px)', backgroundSize:'48px 48px', WebkitMaskImage:'radial-gradient(ellipse 70% 70% at 50% 50%,black,transparent)', pointerEvents:'none' }}/>

      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:408, background:'rgba(9,20,16,0.97)', border:'1px solid rgba(0,255,135,0.18)', borderRadius:20, padding:'46px 42px', backdropFilter:'blur(24px)', boxShadow:'0 40px 100px rgba(0,0,0,0.6), 0 0 60px rgba(0,255,135,0.04)' }}>

        <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:46, fontWeight:800, color:C.g1, letterSpacing:6, textAlign:'center', textShadow:'0 0 40px rgba(0,255,135,0.5)', marginBottom:4 }}>JIMMY</div>
        <div style={{ textAlign:'center', fontSize:10, color:C.txt3, fontFamily:"'IBM Plex Mono',monospace", letterSpacing:2, marginBottom:34, display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ flex:1, height:1, background:'rgba(0,255,135,0.16)', display:'block' }}/>
          GEMINI AI POWERED
          <span style={{ flex:1, height:1, background:'rgba(0,255,135,0.16)', display:'block' }}/>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', border:'1px solid rgba(0,255,135,0.18)', borderRadius:8, overflow:'hidden', marginBottom:26 }}>
          {[['login','دخول'],['reg','حساب جديد']].map(([t,lbl]) => (
            <button key={t} onClick={() => { setATab(t); setAErr(''); }}
              style={{ flex:1, padding:10, background: aTab===t?'rgba(0,255,135,0.1)':'transparent', border:'none', cursor:'pointer', fontFamily:"'IBM Plex Mono',monospace", fontSize:12, letterSpacing:1, color: aTab===t?C.g1:C.txt3, transition:'all .3s' }}>
              {lbl}
            </button>
          ))}
        </div>

        {aTab === 'login' ? (
          <>
            <label style={labelStyle}>البريد الإلكتروني</label>
            <input type="email" value={lE} onChange={e=>setLE(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doLogin()} placeholder="you@example.com" style={inputStyle}/>
            <label style={labelStyle}>كلمة المرور</label>
            <input type="password" value={lP} onChange={e=>setLP(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doLogin()} placeholder="••••••••" style={inputStyle}/>
            <button onClick={doLogin} style={{ width:'100%', padding:13, background:C.g1, color:C.bg, border:'none', borderRadius:8, cursor:'pointer', fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:15, fontWeight:700, letterSpacing:1, boxShadow:'0 0 24px rgba(0,255,135,0.25)', transition:'all .3s' }}>
              دخول ←
            </button>
          </>
        ) : (
          <>
            <label style={labelStyle}>الاسم</label>
            <input type="text" value={rN} onChange={e=>setRN(e.target.value)} placeholder="اسمك الكريم" style={inputStyle}/>
            <label style={labelStyle}>البريد الإلكتروني</label>
            <input type="email" value={rE} onChange={e=>setRE(e.target.value)} placeholder="you@example.com" style={inputStyle}/>
            <label style={labelStyle}>كلمة المرور</label>
            <input type="password" value={rP} onChange={e=>setRP(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doRegister()} placeholder="٦ أحرف على الأقل" style={inputStyle}/>
            <button onClick={doRegister} style={{ width:'100%', padding:13, background:C.g1, color:C.bg, border:'none', borderRadius:8, cursor:'pointer', fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:15, fontWeight:700, letterSpacing:1, boxShadow:'0 0 24px rgba(0,255,135,0.25)', transition:'all .3s' }}>
              إنشاء حساب ←
            </button>
          </>
        )}

        {aErr && (
          <div style={{ textAlign:'center', fontSize:12, color:C.red, marginTop:12, padding:'8px 12px', background:'rgba(255,80,99,0.08)', borderRadius:6, fontFamily:"'IBM Plex Mono',monospace" }}>
            {aErr}
          </div>
        )}
      </div>
      <style>{globalCSS}</style>
    </div>
  );

  // ════════════════════════════════════════════════
  //  MAIN APP
  // ════════════════════════════════════════════════
  return (
    <div style={{ height:'100vh', display:'flex', background:C.bg, fontFamily:"'Cairo',sans-serif", overflow:'hidden', direction:'rtl' }}>

      {/* ── SIDEBAR ── */}
      <div style={{ width:258, minWidth:258, background:C.s1, borderLeft:'1px solid rgba(0,255,135,0.08)', display:'flex', flexDirection:'column', height:'100vh' }}>

        {/* Top */}
        <div style={{ padding:'16px 14px 13px', borderBottom:'1px solid rgba(0,255,135,0.08)' }}>
          <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:19, fontWeight:800, color:C.g1, letterSpacing:3, textShadow:'0 0 18px rgba(0,255,135,0.4)', display:'flex', alignItems:'center', gap:8, marginBottom:13 }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:C.g1, boxShadow:'0 0 8px #00ff87', animation:'blink 2s infinite', flexShrink:0 }}/>
            JIMMY AI
          </div>
          <button onClick={newChat} style={{ width:'100%', padding:'9px 13px', background:'rgba(0,255,135,0.07)', border:'1px solid rgba(0,255,135,0.17)', borderRadius:8, color:C.g1, cursor:'pointer', fontFamily:"'IBM Plex Mono',monospace", fontSize:12, letterSpacing:1, display:'flex', alignItems:'center', gap:8, transition:'all .3s' }}>
            <span>✦</span> محادثة جديدة
          </button>
        </div>

        {/* Label */}
        <div style={{ padding:'10px 15px 5px', fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:2.5, color:C.txt3 }}>
          المحادثات
        </div>

        {/* Chat List */}
        <div style={{ flex:1, overflowY:'auto', padding:'0 7px 8px' }}>
          {chatIds.map(id => {
            const ch = chats[id]; if (!ch) return null;
            const active = id === cid;
            return (
              <div key={id} onClick={() => loadChat(id)}
                style={{ padding:'9px 11px', borderRadius:8, cursor:'pointer', marginBottom:2, display:'flex', alignItems:'center', gap:9, border:`1px solid ${active?'rgba(0,255,135,0.18)':'transparent'}`, background: active?'rgba(0,255,135,0.09)':'transparent', transition:'all .2s' }}>
                <span style={{ fontSize:12, opacity:.7 }}>💬</span>
                <span style={{ fontSize:13, color: active?C.txt:C.txt2, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ch.title}</span>
                <button onClick={e => deleteChat(id, e)} style={{ background:'none', border:'none', cursor:'pointer', color:C.txt3, fontSize:12, padding:'2px 4px', borderRadius:4, flexShrink:0, opacity:.6 }}>🗑</button>
              </div>
            );
          })}
        </div>

        {/* User Row */}
        <div style={{ padding:13, borderTop:'1px solid rgba(0,255,135,0.08)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 11px', borderRadius:8, background:'rgba(0,0,0,0.2)' }}>
            <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#003d20,#00c96b)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, color:C.g1, flexShrink:0 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ fontSize:13, color:C.txt, flex:1, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
            <button onClick={doLogout} style={{ background:'none', border:'none', cursor:'pointer', color:C.txt3, fontSize:14, padding:4, transition:'color .2s' }} title="خروج">⏏</button>
          </div>
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>

        {/* Topbar */}
        <div style={{ padding:'13px 24px', borderBottom:'1px solid rgba(0,255,135,0.08)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(9,20,16,0.85)', backdropFilter:'blur(16px)', flexShrink:0 }}>
          <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:15, fontWeight:700, color:C.txt, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{title}</div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:C.g2, background:'rgba(0,255,135,0.06)', border:'1px solid rgba(0,255,135,0.14)', padding:'3px 11px', borderRadius:4, letterSpacing:1, display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:C.g1 }}/>
            Gemini 1.5 Pro
          </div>
        </div>

        {/* Messages */}
        <div ref={msgsRef} style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>

          {/* Welcome Screen */}
          {msgs.length === 0 && !busy && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, textAlign:'center', padding:'40px 20px', gap:14, minHeight:320 }}>
              <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:56, fontWeight:800, color:C.g1, letterSpacing:4, textShadow:'0 0 40px rgba(0,255,135,0.4)', animation:'glowPulse 3s ease-in-out infinite' }}>JIMMY</div>
              <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:20, fontWeight:700, color:C.txt }}>كيف يمكنني مساعدتك؟</div>
              <div style={{ fontSize:14, color:C.txt2, maxWidth:420, lineHeight:1.8 }}>مساعد Gemini 1.5 Pro يفهم الكود والصور والملفات ويولّد صور إبداعية</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center', marginTop:8 }}>
                {[
                  ['⚛️ React vs Vue',   'اشرح الفرق بين React و Vue مع أمثلة كود عملية'],
                  ['🎨 ولّد صورة',       'ولّد لي صورة لمدينة مستقبلية خضراء مضيئة في الليل'],
                  ['💻 REST API',        'اكتب REST API كامل بـ Node.js و Express مع MongoDB'],
                  ['🔍 Code Review',    'راجع هذا الكود وأخبرني بالمشاكل والتحسينات الممكنة'],
                  ['📊 Big O',          'اشرح تعقيد Big O بأمثلة عملية بلغة Python'],
                ].map(([lbl, p]) => (
                  <div key={lbl} onClick={() => { setText(p); setTimeout(() => txtRef.current?.focus(), 50); }}
                    style={{ padding:'7px 15px', borderRadius:20, fontSize:13, background:'rgba(0,255,135,0.05)', border:'1px solid rgba(0,255,135,0.14)', color:C.txt2, cursor:'pointer', transition:'all .25s' }}>
                    {lbl}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {msgs.map(m => (
            <div key={m.id} style={{ display:'flex', gap:10, flexDirection: m.role==='user'?'row-reverse':'row', animation:'msgIn .3s ease both' }}>
              {/* Avatar */}
              <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, marginTop:2, background: m.role==='ai'?'linear-gradient(135deg,#003d20,#00c96b)':'rgba(255,255,255,0.07)', color: m.role==='ai'?C.g1:C.txt2, border:'1px solid rgba(0,255,135,0.15)' }}>
                {m.role === 'ai' ? 'J' : user?.name?.[0]?.toUpperCase()}
              </div>

              {/* Bubble */}
              <div style={{ maxWidth:'74%', minWidth:0 }}>
                <div style={{ padding:'12px 16px', borderRadius: m.role==='ai'?'4px 16px 16px 16px':'16px 4px 16px 16px', background: m.role==='ai'?C.s2:'rgba(0,255,135,0.09)', border:`1px solid ${m.role==='ai'?'rgba(0,255,135,0.08)':'rgba(0,255,135,0.18)'}` }}>

                  {/* Uploaded Image */}
                  {m.img && (
                    <img src={m.img} onClick={() => setLb(m.img)}
                      style={{ maxWidth:220, maxHeight:180, borderRadius:8, marginBottom:8, border:'1px solid rgba(0,255,135,0.15)', display:'block', cursor:'zoom-in' }} alt="uploaded"/>
                  )}

                  {/* File Badges */}
                  {m.fileNames?.map((f, fi) => (
                    <div key={`f-${m.id}-${fi}`} style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(0,255,135,0.06)', border:'1px solid rgba(0,255,135,0.14)', borderRadius:6, padding:'4px 10px', marginBottom:6, fontSize:11, color:C.txt2, fontFamily:"'IBM Plex Mono',monospace", marginLeft:6 }}>
                      📄 {f}
                    </div>
                  ))}

                  {/* Text Content */}
                  {m.content && <Markdown text={m.content} />}

                  {/* Generated Image */}
                  {m.genImg && (
                    <div style={{ marginTop:10 }}>
                      <img src={m.genImg} onClick={() => setLb(m.genImg)}
                        style={{ maxWidth:290, borderRadius:12, border:'1px solid rgba(0,255,135,0.2)', display:'block', cursor:'zoom-in' }}
                        loading="lazy" alt="generated"/>
                      <div style={{ fontSize:10, color:C.txt3, fontFamily:"'IBM Plex Mono',monospace", marginTop:5 }}>✦ JIMMY AI — Pollinations</div>
                      <a href={m.genImg} download="jimmy-ai-art.png" target="_blank" rel="noreferrer"
                        style={{ display:'inline-flex', alignItems:'center', gap:5, marginTop:8, fontSize:11, color:C.g2, fontFamily:"'IBM Plex Mono',monospace", background:'rgba(0,255,135,0.06)', border:'1px solid rgba(0,255,135,0.15)', padding:'4px 12px', borderRadius:6, textDecoration:'none' }}>
                        ⬇ تحميل الصورة
                      </a>
                    </div>
                  )}
                </div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:C.txt3, marginTop:4, padding:'0 4px' }}>{m.time}</div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {busy && (
            <div style={{ display:'flex', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#003d20,#00c96b)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:13, color:C.g1, border:'1px solid rgba(0,255,135,0.15)', flexShrink:0 }}>J</div>
              <div style={{ padding:'12px 16px', borderRadius:'4px 16px 16px 16px', background:C.s2, border:'1px solid rgba(0,255,135,0.08)' }}>
                <div style={{ display:'flex', gap:5 }}>
                  {[0,1,2].map(j => <div key={j} style={{ width:7, height:7, borderRadius:'50%', background:C.g1, opacity:.4, animation:`dotBounce 1.2s ${j*.2}s infinite` }}/>)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── INPUT AREA ── */}
        <div style={{ padding:'12px 22px 16px', borderTop:'1px solid rgba(0,255,135,0.08)', background:'rgba(9,20,16,0.92)', backdropFilter:'blur(16px)', flexShrink:0 }}>

          {/* Attachments Preview */}
          {files.length > 0 && (
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', paddingBottom:10 }}>
              {files.map((f, i) => (
                <div key={`att-${i}`} style={{ position:'relative', display:'inline-flex', alignItems:'center', gap:6, background:C.s3, border:'1px solid rgba(0,255,135,0.16)', borderRadius:8, padding:'5px 10px', fontSize:12, color:C.txt2, fontFamily:"'IBM Plex Mono',monospace" }}>
                  {f.type === 'image'
                    ? <img src={f.b64} style={{ height:32, width:32, objectFit:'cover', borderRadius:4 }} alt=""/>
                    : <span>📄</span>
                  }
                  <span style={{ maxWidth:110, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</span>
                  <button onClick={() => setFiles(p => p.filter((_,j) => j !== i))}
                    style={{ position:'absolute', top:-5, right:-5, width:16, height:16, borderRadius:'50%', background:C.red, color:'#fff', border:'none', fontSize:10, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Row */}
          <div style={{ display:'flex', alignItems:'flex-end', gap:8, background:C.s2, border:'1px solid rgba(0,255,135,0.16)', borderRadius:13, padding:'8px 10px' }}>

            {/* Attach Button */}
            <button onClick={() => fileRef.current?.click()}
              style={{ width:34, height:34, borderRadius:7, background:'transparent', border:'1px solid rgba(0,255,135,0.1)', color:C.txt2, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
              title="إرفاق صورة أو ملف">
              📎
            </button>
            <input ref={fileRef} type="file"
              accept="image/*,.txt,.js,.py,.ts,.jsx,.tsx,.html,.css,.json,.md,.csv,.xml,.yaml,.sql"
              multiple onChange={onFilePick} style={{ display:'none' }}/>

            {/* Text Input */}
            <textarea ref={txtRef} value={text}
              onChange={e => setText(e.target.value)}
              onInput={onResize}
              onKeyDown={onKey}
              placeholder="اكتب رسالتك… أو اطلب توليد صورة 🎨"
              rows={1}
              style={{ flex:1, background:'none', border:'none', outline:'none', fontSize:15, color:C.txt, fontFamily:"'Cairo',sans-serif", resize:'none', maxHeight:140, minHeight:24, lineHeight:1.5, padding:'3px 0' }}
            />

            {/* Image Gen Button */}
            <button onClick={() => { setText('ولّد لي صورة لـ '); setTimeout(() => txtRef.current?.focus(), 50); }}
              style={{ width:34, height:34, borderRadius:7, background:'transparent', border:'1px solid rgba(0,255,135,0.1)', color:C.txt2, cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
              title="توليد صورة بـ AI">
              🎨
            </button>

            {/* Send Button */}
            <button onClick={sendMessage} disabled={busy || (!text.trim() && !files.length)}
              style={{ width:38, height:38, borderRadius:9, background: busy?'rgba(0,255,135,0.3)':C.g1, border:'none', cursor: busy?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0, boxShadow:'0 0 16px rgba(0,255,135,0.22)', transition:'all .3s' }}>
              {busy ? '⏳' : '➤'}
            </button>
          </div>

          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:C.txt3, textAlign:'center', marginTop:7, letterSpacing:.5, opacity:.6 }}>
            Enter إرسال · Shift+Enter سطر جديد · 📎 صورة/ملف · 🎨 توليد صورة
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lb && (
        <div onClick={() => setLb(null)}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.93)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', cursor:'zoom-out' }}>
          <img src={lb} style={{ maxWidth:'90vw', maxHeight:'90vh', borderRadius:12, border:'1px solid rgba(0,255,135,0.2)' }} alt=""/>
        </div>
      )}

      <style>{globalCSS}</style>
    </div>
  );
}

// ════════════════════════════════════════════════════
//  GLOBAL CSS
// ════════════════════════════════════════════════════
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,800&family=IBM+Plex+Mono:wght@300;400;500&family=Cairo:wght@300;400;600;700&display=swap');

  * { box-sizing: border-box; }

  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: #003d20; border-radius: 2px; }

  textarea::placeholder,
  input::placeholder { color: #3d7a5a; }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50%       { opacity: .2; }
  }
  @keyframes msgIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes dotBounce {
    0%, 100% { transform: translateY(0);   opacity: .35; }
    50%       { transform: translateY(-5px); opacity: 1; }
  }
  @keyframes glowPulse {
    0%, 100% { text-shadow: 0 0 40px rgba(0,255,135,0.4); }
    50%       { text-shadow: 0 0 80px rgba(0,255,135,0.8), 0 0 120px rgba(0,255,135,0.25); }
  }
`;
