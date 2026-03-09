import { useState, useEffect, useRef } from "react";

const GEMINI_KEY = 'AIzaSyA54TTlVyDo_PkgK4fRy2m4lAB0aYsFk7M';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

// ── Syntax Highlighter ──────────────────────────────────────────
function highlight(code, lang) {
  const e = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  let c = e(code);
  const KW={
    js:/\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|new|this|typeof|instanceof|import|export|default|from|async|await|try|catch|finally|throw|true|false|null|undefined|of|in|delete|void|=>)\b/g,
    py:/\b(def|class|return|if|elif|else|for|while|import|from|as|with|try|except|finally|raise|True|False|None|and|or|not|in|is|lambda|pass|break|continue|yield|global|print|len|range)\b/g,
    ts:/\b(const|let|var|function|return|if|else|for|while|class|new|this|import|export|default|from|async|await|type|interface|enum|implements|extends|public|private|protected|readonly|true|false|null|undefined|any|void|string|number|boolean)\b/g,
  };
  c = c.replace(/(\/\/[^\n]*)/g,'<span style="color:#8b949e">$1</span>');
  c = c.replace(/(#[^\n]*)/g,'<span style="color:#8b949e">$1</span>');
  c = c.replace(/(\/\*[\s\S]*?\*\/)/g,'<span style="color:#8b949e">$1</span>');
  c = c.replace(/(["'`])((?:\\.|(?!\1)[^\\])*)\1/g,'<span style="color:#a5d6ff">$&</span>');
  c = c.replace(/\b(\d+\.?\d*)\b/g,'<span style="color:#f2cc60">$1</span>');
  const kw = KW[lang]||KW.js;
  c = c.replace(kw,'<span style="color:#ff7b72">$&</span>');
  c = c.replace(/\b([A-Z][a-zA-Z0-9_]*)\b/g,'<span style="color:#ffa657">$&</span>');
  c = c.replace(/([a-zA-Z_$][\w$]*)\s*(?=\()/g,'<span style="color:#d2a8ff">$1</span>');
  return c;
}

// ── Markdown ─────────────────────────────────────────────────────
function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);
  const hl = highlight(code, lang.toLowerCase());
  const copy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{margin:'10px 0',borderRadius:10,overflow:'hidden',border:'1px solid rgba(0,255,135,0.12)'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 14px',background:'rgba(0,0,0,0.5)',borderBottom:'1px solid rgba(0,255,135,0.07)'}}>
        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:'#00c96b',letterSpacing:1}}>{lang.toUpperCase()||'CODE'}</span>
        <button onClick={copy} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:copied?'#00ff87':'#3d7a5a',background:copied?'rgba(0,255,135,0.08)':'transparent',border:'1px solid '+(copied?'rgba(0,255,135,0.35)':'rgba(0,255,135,0.12)'),borderRadius:4,padding:'3px 10px',cursor:'pointer',letterSpacing:.5}}>
          {copied?'✓ تم':'نسخ'}
        </button>
      </div>
      <pre style={{margin:0,padding:16,background:'#161b22',overflowX:'auto',maxHeight:420}}>
        <code style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,lineHeight:1.65}} dangerouslySetInnerHTML={{__html:hl}}/>
      </pre>
    </div>
  );
}

function MdBlock({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  const blocks = [];
  let i = 0;
  const inline = t => {
    if (!t) return '';
    return t
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*\*(.*?)\*\*\*/g,'<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.*?)\*/g,'<em>$1</em>')
      .replace(/`([^`]+)`/g,'<code style="font-family:\'IBM Plex Mono\',monospace;font-size:13px;background:rgba(0,255,135,0.1);padding:2px 7px;border-radius:4px;color:#00ff87;border:1px solid rgba(0,255,135,0.12)">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" style="color:#00ff87;text-decoration:underline">$1</a>');
  };
  while (i < lines.length) {
    const l = lines[i];
    const cb = l.match(/^```(\w*)/);
    if (cb) {
      const lang = cb[1]||'text'; let code=''; i++;
      while (i<lines.length && !lines[i].startsWith('```')) { code+=(code?'\n':'')+lines[i]; i++; }
      blocks.push(<CodeBlock key={i} lang={lang} code={code}/>); i++; continue;
    }
    if (l.startsWith('### ')) { blocks.push(<h3 key={i} style={{fontFamily:"'Bricolage Grotesque',sans-serif",color:'#00ff87',fontSize:15,margin:'8px 0 4px',fontWeight:700}} dangerouslySetInnerHTML={{__html:inline(l.slice(4))}}/>); i++; continue; }
    if (l.startsWith('## '))  { blocks.push(<h2 key={i} style={{fontFamily:"'Bricolage Grotesque',sans-serif",color:'#00ff87',fontSize:17,margin:'10px 0 5px',fontWeight:700}} dangerouslySetInnerHTML={{__html:inline(l.slice(3))}}/>); i++; continue; }
    if (l.startsWith('# '))   { blocks.push(<h1 key={i} style={{fontFamily:"'Bricolage Grotesque',sans-serif",color:'#00ff87',fontSize:20,margin:'12px 0 6px',fontWeight:800}} dangerouslySetInnerHTML={{__html:inline(l.slice(2))}}/>); i++; continue; }
    if (l==='---') { blocks.push(<hr key={i} style={{border:'none',borderTop:'1px solid rgba(0,255,135,0.12)',margin:'10px 0'}}/>); i++; continue; }
    if (l.match(/^[\*\-] /)) {
      const items=[]; while(i<lines.length&&lines[i].match(/^[\*\-] /)){items.push(lines[i].replace(/^[\*\-] /,''));i++;}
      blocks.push(<ul key={i} style={{paddingRight:20,margin:'6px 0'}}>{items.map((it,j)=><li key={j} style={{color:'#7ab896',margin:'3px 0',fontSize:14}} dangerouslySetInnerHTML={{__html:inline(it)}}/>)}</ul>); continue;
    }
    if (l.match(/^\d+\. /)) {
      const items=[]; while(i<lines.length&&lines[i].match(/^\d+\. /)){items.push(lines[i].replace(/^\d+\. /,''));i++;}
      blocks.push(<ol key={i} style={{paddingRight:20,margin:'6px 0'}}>{items.map((it,j)=><li key={j} style={{color:'#7ab896',margin:'3px 0',fontSize:14}} dangerouslySetInnerHTML={{__html:inline(it)}}/>)}</ol>); continue;
    }
    if (!l.trim()) { blocks.push(<div key={i} style={{height:6}}/>); i++; continue; }
    blocks.push(<p key={i} style={{margin:'3px 0',lineHeight:1.8,fontSize:14.5,color:'#e8f5ee'}} dangerouslySetInnerHTML={{__html:inline(l)}}/>); i++;
  }
  return <div>{blocks}</div>;
}

// ── Main App ─────────────────────────────────────────────────────
function useLS(k, def) {
  const [v, setV] = useState(() => { try { const s=localStorage.getItem(k); return s?JSON.parse(s):def; } catch { return def; } });
  const set = val => { setV(val); try { localStorage.setItem(k, JSON.stringify(val)); } catch {} };
  return [v, set];
}

export default function Jimmy() {
  const [users, setUsers] = useLS('jmy_u', {});
  const [me, setMe] = useLS('jmy_me', null);
  const [chats, setChats] = useLS('jmy_c', {});
  const [cid, setCid] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [title, setTitle] = useState('JIMMY AI');
  const [tab, setTab] = useState('l');
  const [lE, setLE] = useState(''); const [lP, setLP] = useState('');
  const [rN, setRN] = useState(''); const [rE, setRE] = useState(''); const [rP, setRP] = useState('');
  const [authErr, setAuthErr] = useState('');
  const [text, setText] = useState('');
  const [pendFiles, setPendFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lb, setLb] = useState(null);
  const msgsRef = useRef(null);
  const txtRef = useRef(null);
  const fileRef = useRef(null);
  const u = me ? users[me] : null;

  useEffect(() => { if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight; }, [msgs, loading]);
  useEffect(() => { if (me && u) { const ids = u.ids||[]; if (ids.length) loadChat(ids[ids.length-1]); } }, [me]);

  // Auth
  const doLogin = () => {
    if (!lE||!lP) return setAuthErr('أدخل البريد وكلمة المرور');
    if (!users[lE]) return setAuthErr('البريد غير مسجل');
    if (users[lE].pass!==lP) return setAuthErr('كلمة المرور غير صحيحة');
    setMe(lE); setAuthErr('');
  };
  const doReg = () => {
    if (!rN||!rE||!rP) return setAuthErr('أكمل جميع الحقول');
    if (users[rE]) return setAuthErr('البريد مسجل مسبقاً');
    if (rP.length<6) return setAuthErr('كلمة المرور ٦ أحرف على الأقل');
    const nu={...users,[rE]:{name:rN,pass:rP,ids:[]}};
    setUsers(nu); setMe(rE); setAuthErr('');
  };
  const doLogout = () => { setMe(null); setCid(null); setMsgs([]); };

  // Chats
  const newChat = () => {
    const id='c'+Date.now();
    const nc={...chats,[id]:{title:'محادثة جديدة',history:[],uiMsgs:[]}};
    setChats(nc);
    const nu={...users}; nu[me]={...nu[me],ids:[...(nu[me].ids||[]),id]};
    setUsers(nu); setCid(id); setMsgs([]); setTitle('محادثة جديدة');
  };
  const loadChat = id => {
    const ch=chats[id]; if(!ch) return;
    setCid(id); setTitle(ch.title||'محادثة'); setMsgs(ch.uiMsgs||[]);
  };
  const delChat = (id,e) => {
    e.stopPropagation();
    const nc={...chats}; delete nc[id]; setChats(nc);
    const nu={...users}; nu[me]={...nu[me],ids:(nu[me].ids||[]).filter(x=>x!==id)};
    setUsers(nu); if(cid===id){setCid(null);setMsgs([]);setTitle('JIMMY AI');}
  };

  // File upload
  const onFile = async ev => {
    const files=[...ev.target.files]; ev.target.value='';
    const nf=[];
    for(const f of files){
      if(f.type.startsWith('image/')){
        const b64=await new Promise(res=>{const r=new FileReader();r.onload=e=>res(e.target.result);r.readAsDataURL(f);});
        nf.push({type:'image',name:f.name,b64,mime:f.type});
      } else {
        const t=await f.text().catch(()=>'[binary]');
        nf.push({type:'file',name:f.name,text:t.slice(0,15000)});
      }
    }
    setPendFiles(p=>[...p,...nf]);
  };

  // Send
  const send = async () => {
    if(!text.trim()&&!pendFiles.length) return;
    let curCid=cid;
    if(!curCid){
      const id='c'+Date.now();
      setChats(p=>({...p,[id]:{title:'محادثة جديدة',history:[],uiMsgs:[]}}));
      const nu={...users}; nu[me]={...nu[me],ids:[...(nu[me].ids||[]),id]};
      setUsers(nu); setCid(id); curCid=id;
    }
    const time=new Date().toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'});
    const files=[...pendFiles]; const msg=text.trim();
    const imgF=files.filter(f=>f.type==='image');
    const txtF=files.filter(f=>f.type==='file');
    const uiMsg={role:'user',content:msg,time,img:imgF[0]?.b64||null,files:txtF.map(f=>f.name)};
    const newMsgs=[...msgs,uiMsg];
    setMsgs(newMsgs); setText(''); setPendFiles([]); setLoading(true);

    if(newMsgs.filter(m=>m.role==='user').length===1){
      const t=(msg||files[0]?.name||'محادثة').slice(0,28);
      setTitle(t);
      setChats(p=>({...p,[curCid]:{...(p[curCid]||{}),title:t}}));
    }

    const isGen=/^(ولّد|ارسم|اصنع|صور لي|توليد|generate|draw|create image)/i.test(msg);
    try {
      if(isGen){ await doGen(msg,curCid,newMsgs,time); }
      else { await doChat(msg,files,curCid,newMsgs,time); }
    } catch(err) {
      const em='⚠️ '+(err.message||'خطأ في الاتصال');
      const final=[...newMsgs,{role:'ai',content:em,time}];
      setMsgs(final);
      setChats(p=>({...p,[curCid]:{...(p[curCid]||{}),uiMsgs:final}}));
    }
    setLoading(false);
  };

  const doChat = async (msg, files, curCid, prevMsgs, time) => {
    const history = chats[curCid]?.history||[];
    const parts=[];
    const txtF=files.filter(f=>f.type==='file');
    if(txtF.length>0){
      const fc=txtF.map(f=>`### ${f.name}\n\`\`\`\n${f.text}\n\`\`\``).join('\n\n');
      parts.push({text:(msg||'حلل هذه الملفات:')+'\n\n--- الملفات ---\n\n'+fc});
    } else { parts.push({text:msg||'حلل هذه الصورة'}); }
    files.filter(f=>f.type==='image').forEach(f=>{
      parts.push({inline_data:{mime_type:f.mime,data:f.b64.split(',')[1]}});
    });
    const contents=[...history.slice(-16),{role:'user',parts}];
    const res=await fetch(GEMINI_URL,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        contents,
        systemInstruction:{parts:[{text:'أنت JIMMY، مساعد ذكاء اصطناعي خبير. تجيب بالعربية افتراضياً. متخصص في تحليل الكود والمشاريع وفهم الصور. عند كتابة كود استخدم code blocks مع اسم اللغة.'}]},
        generationConfig:{maxOutputTokens:2048,temperature:0.7}
      })
    });
    if(!res.ok){const d=await res.json().catch(()=>({}));throw new Error(d.error?.message||'Gemini Error '+res.status);}
    const data=await res.json();
    const reply=data.candidates?.[0]?.content?.parts?.[0]?.text||'لم أتمكن من الرد.';
    const newHistory=[...history.slice(-14),{role:'user',parts},{role:'model',parts:[{text:reply}]}];
    const aiMsg={role:'ai',content:reply,time};
    const final=[...prevMsgs,aiMsg];
    setMsgs(final);
    setChats(p=>({...p,[curCid]:{...(p[curCid]||{}),history:newHistory,uiMsgs:final}}));
  };

  const doGen = async (msg, curCid, prevMsgs, time) => {
    let eng=msg;
    try {
      const tr=await fetch(GEMINI_URL,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({contents:[{role:'user',parts:[{text:`Translate this Arabic image prompt to detailed English for AI image generation. Return ONLY the English prompt:\n${msg}`}]}],generationConfig:{maxOutputTokens:150}})
      });
      if(tr.ok){const td=await tr.json();eng=td.candidates?.[0]?.content?.parts?.[0]?.text||msg;}
    } catch(e){}
    const url=`https://image.pollinations.ai/prompt/${encodeURIComponent(eng+', high quality, 4k, digital art')}?width=768&height=768&nologo=true&seed=${Date.now()}`;
    await new Promise(res=>{const i=new Image();i.onload=res;i.onerror=res;i.src=url;setTimeout(res,15000);});
    const aiMsg={role:'ai',content:'تم توليد الصورة! 🎨',time,genImg:url};
    const final=[...prevMsgs,aiMsg];
    setMsgs(final);
    setChats(p=>({...p,[curCid]:{...(p[curCid]||{}),uiMsgs:final}}));
  };

  const G={g1:'#00ff87',g2:'#00c96b',g4:'#003d20',bg:'#050a07',s1:'#091410',s2:'#0c1c16',s3:'#0f2219',txt:'#e8f5ee',txt2:'#7ab896',txt3:'#3d7a5a',b1:'rgba(0,255,135,0.08)',b2:'rgba(0,255,135,0.16)',red:'#ff5063'};
  const chatIds=[...(u?.ids||[])].reverse();

  // LOGIN
  if(!me) return (
    <div style={{minHeight:'100vh',background:G.bg,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Cairo',sans-serif",direction:'rtl',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 65% 55% at 65% 5%,rgba(0,180,90,0.12),transparent 60%),radial-gradient(ellipse 45% 45% at 5% 80%,rgba(0,255,135,0.07),transparent 55%)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(0,255,135,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,135,0.02) 1px,transparent 1px)',backgroundSize:'48px 48px',WebkitMaskImage:'radial-gradient(ellipse 70% 70% at 50% 50%,black,transparent)',pointerEvents:'none'}}/>
      <div style={{position:'relative',zIndex:1,width:'100%',maxWidth:400,background:'rgba(9,20,16,0.97)',border:'1px solid rgba(0,255,135,0.18)',borderRadius:20,padding:'46px 42px',backdropFilter:'blur(24px)',boxShadow:'0 40px 100px rgba(0,0,0,0.6)'}}>
        <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:44,fontWeight:800,color:G.g1,letterSpacing:6,textAlign:'center',textShadow:'0 0 40px rgba(0,255,135,0.5)',marginBottom:4}}>JIMMY</div>
        <div style={{textAlign:'center',fontSize:10,color:G.txt3,fontFamily:"'IBM Plex Mono',monospace",letterSpacing:2,marginBottom:32,display:'flex',alignItems:'center',gap:10}}>
          <span style={{flex:1,height:1,background:'rgba(0,255,135,0.16)',display:'block'}}/>GEMINI AI<span style={{flex:1,height:1,background:'rgba(0,255,135,0.16)',display:'block'}}/>
        </div>
        <div style={{display:'flex',border:'1px solid rgba(0,255,135,0.18)',borderRadius:8,overflow:'hidden',marginBottom:24}}>
          {['l','r'].map(t=>(
            <button key={t} onClick={()=>{setTab(t);setAuthErr('');}} style={{flex:1,padding:10,background:tab===t?'rgba(0,255,135,0.1)':'transparent',border:'none',cursor:'pointer',fontFamily:"'IBM Plex Mono',monospace",fontSize:12,letterSpacing:1,color:tab===t?G.g1:G.txt3}}>
              {t==='l'?'دخول':'حساب جديد'}
            </button>
          ))}
        </div>
        {tab==='l'?(
          <>
            {[['lE','البريد الإلكتروني','email',lE,setLE],['lP','كلمة المرور','password',lP,setLP]].map(([id,lbl,tp,val,set])=>(
              <div key={id} style={{marginBottom:14}}>
                <div style={{fontSize:10,fontFamily:"'IBM Plex Mono',monospace",color:G.txt3,letterSpacing:1.5,marginBottom:7}}>{lbl}</div>
                <input type={tp} value={val} onChange={e=>set(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doLogin()}
                  style={{width:'100%',background:'rgba(0,0,0,0.4)',border:'1px solid rgba(0,255,135,0.18)',borderRadius:8,padding:'11px 14px',fontSize:14,color:G.txt,fontFamily:"'Cairo',sans-serif",outline:'none'}}/>
              </div>
            ))}
            <button onClick={doLogin} style={{width:'100%',padding:13,background:G.g1,color:G.bg,border:'none',borderRadius:8,cursor:'pointer',fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:15,fontWeight:700,letterSpacing:1,marginTop:6,boxShadow:'0 0 24px rgba(0,255,135,0.25)'}}>دخول ←</button>
          </>
        ):(
          <>
            {[['rN','الاسم','text',rN,setRN],['rE','البريد الإلكتروني','email',rE,setRE],['rP','كلمة المرور','password',rP,setRP]].map(([id,lbl,tp,val,set])=>(
              <div key={id} style={{marginBottom:14}}>
                <div style={{fontSize:10,fontFamily:"'IBM Plex Mono',monospace",color:G.txt3,letterSpacing:1.5,marginBottom:7}}>{lbl}</div>
                <input type={tp} value={val} onChange={e=>set(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doReg()}
                  style={{width:'100%',background:'rgba(0,0,0,0.4)',border:'1px solid rgba(0,255,135,0.18)',borderRadius:8,padding:'11px 14px',fontSize:14,color:G.txt,fontFamily:"'Cairo',sans-serif",outline:'none'}}/>
              </div>
            ))}
            <button onClick={doReg} style={{width:'100%',padding:13,background:G.g1,color:G.bg,border:'none',borderRadius:8,cursor:'pointer',fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:15,fontWeight:700,letterSpacing:1,marginTop:6,boxShadow:'0 0 24px rgba(0,255,135,0.25)'}}>إنشاء حساب ←</button>
          </>
        )}
        {authErr&&<div style={{textAlign:'center',fontSize:12,color:G.red,marginTop:12,fontFamily:"'IBM Plex Mono',monospace",padding:8,background:'rgba(255,80,99,0.08)',borderRadius:6}}>{authErr}</div>}
      </div>
      {lb&&<div onClick={()=>setLb(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.93)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',cursor:'zoom-out'}}><img src={lb} style={{maxWidth:'90vw',maxHeight:'90vh',borderRadius:12}} alt=""/></div>}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=IBM+Plex+Mono:wght@400&family=Cairo:wght@400;600;700&display=swap');*{box-sizing:border-box}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#003d20;border-radius:2px}input::placeholder{color:#3d7a5a}`}</style>
    </div>
  );

  // APP
  return (
    <div style={{height:'100vh',display:'flex',background:G.bg,fontFamily:"'Cairo',sans-serif",overflow:'hidden',direction:'rtl'}}>
      {/* SIDEBAR */}
      <div style={{width:256,minWidth:256,background:G.s1,borderLeft:'1px solid rgba(0,255,135,0.08)',display:'flex',flexDirection:'column',height:'100vh'}}>
        <div style={{padding:'16px 14px 13px',borderBottom:'1px solid rgba(0,255,135,0.08)'}}>
          <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:19,fontWeight:800,color:G.g1,letterSpacing:3,textShadow:'0 0 18px rgba(0,255,135,0.4)',display:'flex',alignItems:'center',gap:8,marginBottom:13}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:G.g1,boxShadow:'0 0 8px #00ff87',flexShrink:0}}/>JIMMY AI
          </div>
          <button onClick={newChat} style={{width:'100%',padding:'9px 13px',background:'rgba(0,255,135,0.07)',border:'1px solid rgba(0,255,135,0.17)',borderRadius:8,color:G.g1,cursor:'pointer',fontFamily:"'IBM Plex Mono',monospace",fontSize:12,letterSpacing:1,display:'flex',alignItems:'center',gap:8}}>
            <span>✦</span>محادثة جديدة
          </button>
        </div>
        <div style={{padding:'10px 15px 5px',fontFamily:"'IBM Plex Mono',monospace",fontSize:9,letterSpacing:2.5,color:G.txt3}}>المحادثات</div>
        <div style={{flex:1,overflowY:'auto',padding:'0 7px 8px'}}>
          {chatIds.map(id=>{
            const ch=chats[id]; if(!ch) return null;
            return (
              <div key={id} onClick={()=>loadChat(id)}
                style={{padding:'9px 11px',borderRadius:8,cursor:'pointer',marginBottom:2,display:'flex',alignItems:'center',gap:9,border:'1px solid '+(id===cid?'rgba(0,255,135,0.18)':'transparent'),background:id===cid?'rgba(0,255,135,0.09)':'transparent',transition:'all 0.2s'}}>
                <span style={{fontSize:12,opacity:.7}}>💬</span>
                <span style={{fontSize:13,color:id===cid?G.txt:G.txt2,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ch.title}</span>
                <button onClick={e=>delChat(id,e)} style={{background:'none',border:'none',cursor:'pointer',color:G.txt3,fontSize:12,padding:'2px 4px',borderRadius:4}}>🗑</button>
              </div>
            );
          })}
        </div>
        <div style={{padding:13,borderTop:'1px solid rgba(0,255,135,0.08)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'9px 11px',borderRadius:8,background:'rgba(0,0,0,0.2)'}}>
            <div style={{width:30,height:30,borderRadius:'50%',background:'linear-gradient(135deg,#003d20,#00c96b)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13,color:G.g1,flexShrink:0}}>{u?.name?.[0]?.toUpperCase()}</div>
            <div style={{fontSize:13,color:G.txt,flex:1,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u?.name}</div>
            <button onClick={doLogout} style={{background:'none',border:'none',cursor:'pointer',color:G.txt3,fontSize:14}}>⏏</button>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{flex:1,display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden'}}>
        <div style={{padding:'13px 24px',borderBottom:'1px solid rgba(0,255,135,0.08)',display:'flex',alignItems:'center',justifyContent:'space-between',background:'rgba(9,20,16,0.85)',backdropFilter:'blur(16px)',flexShrink:0}}>
          <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:15,fontWeight:700,color:G.txt,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{title}</div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:G.g2,background:'rgba(0,255,135,0.06)',border:'1px solid rgba(0,255,135,0.14)',padding:'3px 11px',borderRadius:4,letterSpacing:1,display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
            <div style={{width:5,height:5,borderRadius:'50%',background:G.g1}}/>Gemini 2.0 Flash
          </div>
        </div>

        {/* MESSAGES */}
        <div ref={msgsRef} style={{flex:1,overflowY:'auto',padding:'20px 24px',display:'flex',flexDirection:'column',gap:16}}>
          {msgs.length===0&&!loading&&(
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,textAlign:'center',padding:'40px 20px',gap:14,minHeight:300}}>
              <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:54,fontWeight:800,color:G.g1,letterSpacing:4,textShadow:'0 0 40px rgba(0,255,135,0.4)'}}>JIMMY</div>
              <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:20,fontWeight:700}}>كيف يمكنني مساعدتك؟</div>
              <div style={{fontSize:14,color:G.txt2,maxWidth:400,lineHeight:1.75}}>مساعد Gemini يفهم الكود والصور والملفات ويولّد صور إبداعية</div>
              <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center',marginTop:6}}>
                {[['⚛️ React vs Vue','اشرح الفرق بين React و Vue مع كود'],['🎨 ولّد صورة','ولّد لي صورة لمدينة مستقبلية خضراء مضيئة'],['💻 Node.js API','اكتب REST API بـ Node.js و Express'],['🔍 Code Review','راجع هذا الكود وأخبرني بالمشاكل']].map(([lbl,p])=>(
                  <div key={lbl} onClick={()=>{setText(p);setTimeout(()=>txtRef.current?.focus(),50);}}
                    style={{padding:'7px 14px',borderRadius:20,fontSize:13,background:'rgba(0,255,135,0.05)',border:'1px solid rgba(0,255,135,0.14)',color:G.txt2,cursor:'pointer'}}>
                    {lbl}
                  </div>
                ))}
              </div>
            </div>
          )}

          {msgs.map((m,i)=>(
            <div key={i} style={{display:'flex',gap:10,flexDirection:m.role==='user'?'row-reverse':'row'}}>
              <div style={{width:32,height:32,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,marginTop:2,background:m.role==='ai'?'linear-gradient(135deg,#003d20,#00c96b)':'rgba(255,255,255,0.07)',color:m.role==='ai'?G.g1:G.txt2,border:'1px solid rgba(0,255,135,0.15)'}}>
                {m.role==='ai'?'J':u?.name?.[0]?.toUpperCase()}
              </div>
              <div style={{maxWidth:'74%',minWidth:0}}>
                <div style={{padding:'12px 16px',borderRadius:m.role==='ai'?'4px 16px 16px 16px':'16px 4px 16px 16px',background:m.role==='ai'?G.s2:'rgba(0,255,135,0.09)',border:'1px solid '+(m.role==='ai'?'rgba(0,255,135,0.08)':'rgba(0,255,135,0.18)')}}>
                  {m.img&&m.img!=='__img__'&&<img src={m.img} onClick={()=>setLb(m.img)} style={{maxWidth:220,maxHeight:180,borderRadius:8,marginBottom:8,border:'1px solid rgba(0,255,135,0.15)',display:'block',cursor:'zoom-in'}} alt=""/>}
                  {m.files?.map(f=><div key={f} style={{display:'inline-flex',alignItems:'center',gap:6,background:'rgba(0,255,135,0.06)',border:'1px solid rgba(0,255,135,0.14)',borderRadius:6,padding:'4px 10px',marginBottom:6,fontSize:11,color:G.txt2,fontFamily:"'IBM Plex Mono',monospace"}}>📄 {f}</div>)}
                  {m.content&&<MdBlock text={m.content}/>}
                  {m.genImg&&(
                    <div style={{marginTop:10}}>
                      <img src={m.genImg} onClick={()=>setLb(m.genImg)} style={{maxWidth:280,borderRadius:12,border:'1px solid rgba(0,255,135,0.2)',display:'block',cursor:'zoom-in'}} loading="lazy" alt="generated"/>
                      <div style={{fontSize:10,color:G.txt3,fontFamily:"'IBM Plex Mono',monospace",marginTop:5}}>✦ JIMMY AI — Pollinations</div>
                      <a href={m.genImg} download="jimmy.png" target="_blank" rel="noreferrer" style={{display:'inline-flex',alignItems:'center',gap:5,marginTop:7,fontSize:11,color:G.g2,fontFamily:"'IBM Plex Mono',monospace",background:'rgba(0,255,135,0.06)',border:'1px solid rgba(0,255,135,0.15)',padding:'4px 12px',borderRadius:6,textDecoration:'none'}}>⬇ تحميل</a>
                    </div>
                  )}
                </div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:G.txt3,marginTop:4,padding:'0 4px'}}>{m.time}</div>
              </div>
            </div>
          ))}

          {loading&&(
            <div style={{display:'flex',gap:10}}>
              <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#003d20,#00c96b)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:13,color:G.g1,border:'1px solid rgba(0,255,135,0.15)',flexShrink:0}}>J</div>
              <div style={{padding:'12px 16px',borderRadius:'4px 16px 16px 16px',background:G.s2,border:'1px solid rgba(0,255,135,0.08)'}}>
                <div style={{display:'flex',gap:5}}>
                  {[0,1,2].map(j=><div key={j} style={{width:7,height:7,borderRadius:'50%',background:G.g1,opacity:.4,animation:`td 1.2s ${j*.2}s infinite`}}/>)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* INPUT */}
        <div style={{padding:'12px 22px 16px',borderTop:'1px solid rgba(0,255,135,0.08)',background:'rgba(9,20,16,0.92)',backdropFilter:'blur(16px)',flexShrink:0}}>
          {pendFiles.length>0&&(
            <div style={{display:'flex',gap:8,flexWrap:'wrap',paddingBottom:10}}>
              {pendFiles.map((f,i)=>(
                <div key={i} style={{position:'relative',display:'inline-flex',alignItems:'center',gap:6,background:G.s3,border:'1px solid rgba(0,255,135,0.16)',borderRadius:8,padding:'5px 10px',fontSize:12,color:G.txt2,fontFamily:"'IBM Plex Mono',monospace"}}>
                  {f.type==='image'?<img src={f.b64} style={{height:32,width:32,objectFit:'cover',borderRadius:4}} alt=""/>:<span>📄</span>}
                  <span style={{maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</span>
                  <button onClick={()=>setPendFiles(p=>p.filter((_,j)=>j!==i))} style={{position:'absolute',top:-5,right:-5,width:16,height:16,borderRadius:'50%',background:G.red,color:'#fff',border:'none',fontSize:10,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
                </div>
              ))}
            </div>
          )}
          <div style={{display:'flex',alignItems:'flex-end',gap:8,background:G.s2,border:'1px solid rgba(0,255,135,0.16)',borderRadius:13,padding:'8px 10px'}}>
            <button onClick={()=>fileRef.current?.click()} title="إرفاق صورة أو ملف"
              style={{width:34,height:34,borderRadius:7,background:'transparent',border:'1px solid rgba(0,255,135,0.08)',color:G.txt2,cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>📎</button>
            <input ref={fileRef} type="file" accept="image/*,.txt,.js,.py,.ts,.jsx,.tsx,.html,.css,.json,.md,.csv" multiple onChange={onFile} style={{display:'none'}}/>
            <textarea ref={txtRef} value={text} onChange={e=>setText(e.target.value)}
              onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}}
              placeholder="اكتب رسالتك… أو اطلب توليد صورة 🎨" rows={1}
              style={{flex:1,background:'none',border:'none',outline:'none',fontSize:15,color:G.txt,fontFamily:"'Cairo',sans-serif",resize:'none',maxHeight:140,minHeight:24,lineHeight:1.5,padding:'3px 0'}}/>
            <button onClick={()=>{setText('ولّد لي صورة لـ ');setTimeout(()=>txtRef.current?.focus(),50);}} title="توليد صورة"
              style={{width:34,height:34,borderRadius:7,background:'transparent',border:'1px solid rgba(0,255,135,0.08)',color:G.txt2,cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>🎨</button>
            <button onClick={send} disabled={loading||(!text.trim()&&!pendFiles.length)}
              style={{width:38,height:38,borderRadius:9,background:loading?'rgba(0,255,135,0.3)':G.g1,border:'none',cursor:loading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0,boxShadow:'0 0 16px rgba(0,255,135,0.22)'}}>
              {loading?'⏳':'➤'}
            </button>
          </div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:G.txt3,textAlign:'center',marginTop:7,letterSpacing:.5,opacity:.7}}>
            Enter إرسال · Shift+Enter سطر جديد · 📎 صورة/ملف · 🎨 توليد صورة
          </div>
        </div>
      </div>

      {lb&&<div onClick={()=>setLb(null)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.93)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',cursor:'zoom-out'}}><img src={lb} style={{maxWidth:'90vw',maxHeight:'90vh',borderRadius:12,border:'1px solid rgba(0,255,135,0.2)'}} alt=""/></div>}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=IBM+Plex+Mono:wght@400&family=Cairo:wght@400;600;700&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#003d20;border-radius:2px}
        textarea::placeholder,input::placeholder{color:#3d7a5a}
        textarea::-webkit-scrollbar{width:3px}
        @keyframes td{0%,100%{transform:translateY(0);opacity:.35}50%{transform:translateY(-5px);opacity:1}}
      `}</style>
    </div>
  );
}
