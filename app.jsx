const { useState, useEffect, useRef, useCallback, useMemo } = React;
const fz = (n) => `calc(${n}px * var(--fz, 1))`;

const API_URL = 'https://script.google.com/macros/s/AKfycbyJAJwr3ILkVxnV3lUqmLzUss2S68DwEQU8J05dzXxCpSWACuby3qF3Jb3vrIDRrPKL/exec';
const C = { R: '#7AA7FF', A: '#FFB35C', S: '#5FDDB0' };
const TINT = { R: 'rgba(122,167,255,.14)', A: 'rgba(255,179,92,.14)', S: 'rgba(95,221,176,.14)' };
const GRAD = {
  R: 'linear-gradient(120deg,#3F6FF5 0%,#8FB2FF 30%,#6A5CFF 62%,#3F6FF5 100%)',
  A: 'linear-gradient(120deg,#EE8424 0%,#FFC98A 30%,#FF6A5C 62%,#EE8424 100%)',
  S: 'linear-gradient(120deg,#11A574 0%,#7BE8BF 30%,#10B7C7 62%,#11A574 100%)'
};
const GLOW = { R: 'rgba(79,127,255,.35)', A: 'rgba(255,154,60,.32)', S: 'rgba(34,192,138,.32)' };
const DELAY = { R: '0s', A: '-1.7s', S: '-3.4s' };
const NAME = { R: '독서', A: '예술', S: '러닝' };
const EN = { R: 'READING', A: 'ARTS', S: 'SPORTS' };
const UNIT = { R: '권', A: 'P', S: 'km' };

const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} },
  sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
  sset(k, v) { try { v === null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, v); } catch (e) {} }
};

async function api(action, data) {
  const body = Object.assign({ action }, data || {});
  if (!body.token) body.token = store.get('ras_token') || '';
  let lastErr;
  for (let i = 0; i < 2; i++) {
    try {
      const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify(body) });
      const j = await res.json();
      if (!j.ok) { const e = new Error(j.error || '요청이 실패했어요.'); e.server = true; throw e; }
      return j;
    } catch (e) {
      lastErr = e;
      if (e.server) break;
      await new Promise(r => setTimeout(r, 800));
    }
  }
  if (!lastErr.server) lastErr.message = '인터넷 연결을 확인해 주세요.';
  throw lastErr;
}

let toastSet = null;
function toast(msg) { if (toastSet) toastSet(msg); }

function Icon({ name, size = 22, sw = 1.9, color = 'currentColor' }) {
  const P = {
    back: <path d="M15 5l-7 7 7 7" />, home: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
    trophy: <g><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" /></g>,
    plus: <path d="M12 5v14M5 12h14" />, check: <path d="M5 12l5 5 9-10" />, chev: <path d="M9 5l7 7-7 7" />,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />, search: <g><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></g>,
    warn: <g><path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18v.5" /></g>,
    pin: <g><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></g>,
    close: <path d="M6 6l12 12M18 6L6 18" />,
    spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" />,
    list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{P[name]}</svg>;
}

function Badge({ e, size = 44, lv, label }) {
  const r = Math.round(size * 0.32);
  return (
    <span className="ras-badge" style={{ position: 'relative', width: size, height: size, borderRadius: r, backgroundImage: GRAD[e], animationDelay: DELAY[e],
      boxShadow: `inset 0 1px 0 rgba(255,255,255,.45), inset 0 -2px 0 rgba(0,0,0,.18), 0 6px 18px ${GLOW[e]}`, color: '#fff', display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0, fontSize: fz(Math.round(size * 0.52)), fontWeight: 900, letterSpacing: -.5, lineHeight: 1, textShadow: '0 1px 2px rgba(0,0,0,.28)' }}>
      {label || e}
      {lv !== undefined && lv !== null && <span style={{ position: 'absolute', top: -6, right: -6, minWidth: 18, height: 18, padding: '0 4px', borderRadius: 9, background: 'var(--bg)',
        boxShadow: '0 0 0 2px var(--sf)', color: C[e], fontSize: fz(10), fontWeight: 800, textShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{lv}</span>}
    </span>
  );
}

function Segs({ value, th, color, h = 4 }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {th.map((t, i) => {
        const prev = i ? th[i - 1] : 0;
        const f = Math.max(0, Math.min(1, (value - prev) / (t - prev)));
        return <div key={i} style={{ flexGrow: 1, height: h, background: 'var(--track)', borderRadius: 2, overflow: 'hidden' }}><div style={{ height: h, width: (f * 100) + '%', background: color }} /></div>;
      })}
    </div>
  );
}

function Header({ title, onBack, eyebrow, right }) {
  return (
    <header className="row" style={{ padding: '18px 16px 8px', gap: 6 }}>
      <button className="iconbtn" aria-label="뒤로" onClick={onBack}><Icon name="back" size={24} sw={2.2} /></button>
      <div className="col" style={{ flexGrow: 1, gap: 1 }}>
        {eyebrow && <span style={{ fontSize: fz(12), fontWeight: 600, color: 'var(--t2)' }}>{eyebrow}</span>}
        <span className="h-title">{title}</span>
      </div>
      {right}
    </header>
  );
}

function Logo({ big }) {
  const s = big ? 64 : 50;
  return (
    <div className="col" style={{ gap: big ? 10 : 8 }}>
      <div className="row" style={{ gap: 8 }}>
        <span className="row" style={{ gap: 2 }}>{['R', 'A', 'S'].map(e => <span key={e} style={{ width: 10, height: 3, borderRadius: 2, background: C[e] }} />)}</span>
        <span style={{ fontSize: fz(12), fontWeight: 600, color: 'var(--t2)' }}>과천여고 · 2학기 시즌</span>
        {!big && <DdayChip />}
      </div>
      <div className="row" style={{ gap: big ? 14 : 12 }}>
        <span className="ras-title" style={{ fontSize: fz(s), fontWeight: 900, letterSpacing: big ? -2 : -1.5, lineHeight: .9 }}>RAS</span>
        <span style={{ width: 2, height: big ? 48 : 38, borderRadius: 1, background: 'rgba(255,255,255,.14)' }} />
        <div className="col" style={{ gap: 5 }}>
          <span style={{ fontSize: fz(big ? 32 : 26), fontWeight: 800, letterSpacing: -1.1, lineHeight: 1 }}>철인3종</span>
          <span style={{ fontSize: fz(big ? 10 : 9.5), fontWeight: 800, letterSpacing: 1.2, lineHeight: 1, whiteSpace: 'nowrap' }}>
            <span style={{ color: C.R }}>READING</span><span style={{ color: '#4A4F57' }}> · </span><span style={{ color: C.A }}>ARTS</span><span style={{ color: '#4A4F57' }}> · </span><span style={{ color: C.S }}>SPORTS</span>
          </span>
        </div>
      </div>
    </div>
  );
}

let DDAY = null;
function DdayChip() {
  if (DDAY === null) return null;
  return <span style={{ fontSize: fz(11), fontWeight: 800, color: 'var(--bg)', background: 'var(--tx)', padding: '2px 7px', borderRadius: 6 }}>{DDAY >= 0 ? 'D-' + DDAY : '시즌 종료'}</span>;
}

function Spinner({ size = 28 }) {
  return <svg className="spin" width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="var(--track)" strokeWidth="3" /><path d="M21 12a9 9 0 0 0-9-9" stroke="var(--r)" strokeWidth="3" strokeLinecap="round" /></svg>;
}

function Busy({ text }) {
  return <div className="overlay"><div className="card col" style={{ alignItems: 'center', gap: 12, padding: '22px 26px' }}><Spinner /><span style={{ fontSize: fz(14), fontWeight: 600 }}>{text || '잠시만요'}</span></div></div>;
}

function useAsync(fn, deps) {
  const [state, set] = useState({ loading: true, data: null, error: null });
  const reload = useCallback(() => {
    set(s => ({ ...s, loading: true, error: null }));
    fn().then(d => set({ loading: false, data: d, error: null })).catch(e => set({ loading: false, data: null, error: e.message }));
  }, deps);
  useEffect(() => { reload(); }, [reload]);
  return [state, reload];
}

function ErrorBox({ msg, onRetry }) {
  return <div className="card col" style={{ margin: 16, padding: 20, gap: 12, alignItems: 'center', textAlign: 'center' }}><span style={{ color: 'var(--red)', fontWeight: 700 }}>{msg}</span>{onRetry && <button className="btn sm ghost" onClick={onRetry}>다시 시도</button>}</div>;
}

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('이 기기에서는 위치를 쓸 수 없어요.'));
    navigator.geolocation.getCurrentPosition(p => resolve(p.coords), e => reject(new Error(e.code === 1 ? '위치 권한을 허용해 주세요. 설정에서 이 사이트의 위치 사용을 켜야 해요.' : '위치를 찾지 못했어요. 밖으로 나가서 다시 시도해 주세요.')),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 });
  });
}

function haversine(a, b, c, d) {
  const R = 6371000, t = Math.PI / 180, x = (c - a) * t, y = (d - b) * t;
  const h = Math.sin(x / 2) ** 2 + Math.cos(a * t) * Math.cos(c * t) * Math.sin(y / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function fmtClock(sec) {
  sec = Math.max(0, Math.round(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  const p = n => String(n).padStart(2, '0');
  return h ? h + ':' + p(m) + ':' + p(s) : p(m) + ':' + p(s);
}
function fmtPace(sec, km) {
  if (!km || km < 0.05) return "-'--\"";
  const s = sec / km, m = Math.floor(s / 60), r = Math.round(s % 60);
  return m + "'" + String(r).padStart(2, '0') + '"';
}
function fmtNum(v) { return Number.isInteger(v) ? String(v) : (Math.round(v * 100) / 100).toString(); }
function seasonState() {
  let se = null; try { se = JSON.parse(store.get('ras_season') || 'null'); } catch (e) {}
  if (!se || !se.start) return { ok: true };
  const d = new Date(); const today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const md = s => s.slice(5).replace('-', '.');
  if (today < se.start) { const dd = Math.ceil((new Date(se.start) - new Date(today)) / 86400000); return { ok: false, before: true, start: md(se.start), end: md(se.end), dday: dd }; }
  if (today > se.end) return { ok: false, after: true, start: md(se.start), end: md(se.end) };
  return { ok: true, start: md(se.start), end: md(se.end) };
}
function DistBig({ km, size = 124, unitSize = 30, color = 'var(--s)' }) {
  const m = Math.round(km * 1000);
  const big = m < 1000 ? String(m) : (m / 1000).toFixed(2);
  const unit = m < 1000 ? 'M' : 'KM';
  return (
    <div className="col" style={{ alignItems: 'center', gap: 6 }}>
      <div className="row" style={{ alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontSize: fz(size), fontWeight: 800, letterSpacing: -6, lineHeight: .95, fontVariantNumeric: 'tabular-nums' }}>{big}</span>
        <span style={{ fontSize: fz(unitSize), fontWeight: 800, letterSpacing: 1, color }}>{unit}</span>
      </div>
      <span style={{ fontSize: fz(20), fontWeight: 700, color: 'var(--t15)', fontVariantNumeric: 'tabular-nums' }}>{m < 1000 ? (m / 1000).toFixed(2) + ' km' : m.toLocaleString() + ' m'}</span>
    </div>
  );
}

/* ---------------------------------------------------------------- Join */
function PwInput({ id, value, onChange, placeholder, onEnter }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input id={id} className="input" type={show ? 'text' : 'password'} inputMode={show ? 'text' : undefined} autoComplete="current-password" placeholder={placeholder || '비밀번호'} value={value}
        onChange={e => onChange(e.target.value.replace(/\s/g, ''))} onKeyDown={e => { if (e.key === 'Enter' && onEnter) onEnter(); }} style={{ paddingRight: 64 }} />
      <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 6, top: 6, height: 40, padding: '0 12px', borderRadius: 12, border: 0, background: 'var(--sf2)', color: 'var(--t2)', fontSize: fz(12), fontWeight: 700 }}>{show ? '숨김' : '보기'}</button>
    </div>
  );
}

function JoinScreen({ onDone, prev, rejected }) {
  const remembered = store.get('ras_hakbun') || '';
  const [mode, setMode] = useState(prev || rejected ? 'join' : 'login');
  const [hb, setHb] = useState(prev ? prev.hakbun : remembered);
  const [name, setName] = useState(prev ? prev.name : '');
  const [nick, setNick] = useState(prev ? prev.nick : '');
  const [pw, setPw] = useState('');
  const [agree, setAgree] = useState(!!prev);
  const [nickMsg, setNickMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [changeHb, setChangeHb] = useState(!remembered);
  const timer = useRef(null);
  useEffect(() => {
    clearTimeout(timer.current);
    if (mode !== 'join' || !nick) { setNickMsg(null); return; }
    const cost = nick.split('').reduce((c, ch) => c + (/[가-힣]/.test(ch) ? 1 : 0.7), 0);
    const local = !/^[가-힣A-Za-z0-9]+$/.test(nick) ? '한글·영문·숫자만 쓸 수 있어요' : nick.length < 2 ? '2자 이상 써 주세요' : cost > 7.001 ? '너무 길어요 · 한글 7자, 영문·숫자 10자까지' : '';
    if (local) { setNickMsg({ ok: false, text: local }); return; }
    setNickMsg({ ok: null, text: '확인 중…' });
    timer.current = setTimeout(() => {
      api('joinCheckNick', { nick }).then(r => setNickMsg({ ok: r.valid, text: r.message })).catch(() => setNickMsg(null));
    }, 450);
  }, [nick, mode]);
  const pwOk = pw.length >= 4 && pw.length <= 20;
  const loginValid = /^\d{5}$/.test(hb) && pw.length > 0;
  const joinValid = /^\d{5}$/.test(hb) && /^[가-힣]{2,5}$/.test(name) && nickMsg && nickMsg.ok && pwOk && agree;
  async function doLogin() {
    setBusy(true);
    try {
      const r = await api('login', { hakbun: hb, password: pw });
      store.set('ras_token', r.token); store.set('ras_hakbun', hb);
      if (r.status === '승인') toast('로그인했어요');
      onDone();
    } catch (e) { toast(e.message); }
    setBusy(false);
  }
  async function doJoin() {
    setBusy(true);
    try {
      const r = await api('joinRequest', { hakbun: hb, name, nick, password: pw, agree });
      store.set('ras_token', r.token); store.set('ras_hakbun', hb);
      onDone();
    } catch (e) { toast(e.message); }
    setBusy(false);
  }
  const Tab = ({ k, label }) => <button type="button" onClick={() => setMode(k)} style={{ flex: 1, height: 44, border: 0, borderRadius: 14, background: mode === k ? 'var(--sf)' : 'transparent', boxShadow: mode === k ? 'inset 0 0 0 1.5px var(--r)' : 'none', color: mode === k ? 'var(--tx)' : 'var(--t2)', fontSize: fz(15), fontWeight: mode === k ? 800 : 600 }}>{label}</button>;
  return (
    <div className="app nonav fade">
      <div style={{ padding: '48px 24px 0' }}><Logo big /></div>
      <p style={{ margin: '16px 24px 0', fontSize: fz(15), lineHeight: 1.55, color: 'var(--t2)' }}>독서 · 예술 · 러닝 세 종목을 모두 완주하면 <b style={{ color: 'var(--tx)' }}>철인</b>이 돼요.</p>
      {rejected && <div style={{ margin: '16px 16px 0', padding: '12px 14px', borderRadius: 14, background: 'rgba(255,107,90,.1)', boxShadow: 'inset 0 0 0 1px rgba(255,107,90,.35)', color: '#FFB4AA', fontSize: fz(13) }}>지난 신청이 반려됐어요. 학번과 이름을 다시 확인해 주세요.</div>}
      <div style={{ margin: '20px 16px 0', padding: 4, background: 'var(--sf3)', borderRadius: 18, boxShadow: 'inset 0 0 0 1px var(--line)', display: 'flex', gap: 4 }}>
        <Tab k="login" label="로그인" /><Tab k="join" label="처음 참가" />
      </div>
      <section className="pad" style={{ paddingTop: 12 }}>
        {mode === 'login' ? (
          <div className="card col" style={{ padding: 18, gap: 14 }}>
            {!changeHb ? (
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="col" style={{ gap: 2 }}><span className="label">학번</span><span style={{ fontSize: fz(20), fontWeight: 800 }}>{hb}</span></div>
                <button type="button" className="btn sm ghost" onClick={() => { setChangeHb(true); setHb(''); }}>다른 학번</button>
              </div>
            ) : (
              <label className="col" style={{ gap: 6 }}><span className="label">학번</span>
                <input id="lhb" className="input" inputMode="numeric" maxLength={5} placeholder="20312" value={hb} onChange={e => setHb(e.target.value.replace(/\D/g, ''))} />
                <span className="dim" style={{ fontSize: fz(12), fontWeight: 600 }}>학년·반·번호 5자리</span></label>
            )}
            <label className="col" style={{ gap: 6 }}><span className="label">비밀번호</span>
              <PwInput id="lpw" value={pw} onChange={setPw} onEnter={() => loginValid && !busy && doLogin()} /></label>
            <button className="btn" disabled={!loginValid || busy} onClick={doLogin}>로그인</button>
            <span className="dim" style={{ fontSize: fz(12), lineHeight: 1.5, textAlign: 'center' }}>비밀번호를 잊었으면 선생님께 재설정을 요청하세요<br />처음이라면 위의 "처음 참가"를 누르세요</span>
          </div>
        ) : (
          <div className="card col" style={{ padding: 18, gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '130px minmax(0,1fr)', gap: 10 }}>
              <label className="col" style={{ gap: 6 }}><span className="label">학번</span>
                <input id="hb" className="input" inputMode="numeric" maxLength={5} placeholder="20312" value={hb} onChange={e => setHb(e.target.value.replace(/\D/g, ''))} />
                <span className="dim" style={{ fontSize: fz(12), fontWeight: 600 }}>학년·반·번호 5자리</span></label>
              <label className="col" style={{ gap: 6 }}><span className="label">이름</span>
                <input id="nm" className="input" placeholder="이름" value={name} onChange={e => setName(e.target.value.trim())} /></label>
            </div>
            <label className="col" style={{ gap: 6 }}><span className="label">닉네임</span>
              <input id="nk" className="input" placeholder="한글 2~7자 · 영문 10자" maxLength={10} value={nick} onChange={e => setNick(e.target.value.trim())} />
              <span style={{ fontSize: fz(12), fontWeight: 600, color: nickMsg ? (nickMsg.ok ? 'var(--s)' : nickMsg.ok === false ? 'var(--red)' : 'var(--t2)') : 'var(--t3)' }}>
                {nickMsg ? (nickMsg.ok ? '✓ ' : '') + nickMsg.text : '한글 7자 · 영문·숫자 10자까지 · 랭킹에는 닉네임만 보여요'}</span></label>
            <label className="col" style={{ gap: 6 }}><span className="label">비밀번호</span>
              <PwInput id="jpw" value={pw} onChange={setPw} placeholder="4자 이상" />
              <span style={{ fontSize: fz(12), fontWeight: 600, color: pw && !pwOk ? 'var(--red)' : 'var(--t3)' }}>{pw && !pwOk ? '4~20자로 정해 주세요' : '다른 휴대폰에서 로그인할 때 써요 · 잊지 않게 기억해 두세요'}</span></label>
            <label className="row" style={{ alignItems: 'flex-start', gap: 10, paddingTop: 2 }}>
              <input id="ag" type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} style={{ margin: 0, flexShrink: 0 }} />
              <span style={{ fontSize: fz(13), lineHeight: 1.5, color: 'var(--t15)' }}>러닝·문화시설 체크인에 <b style={{ color: 'var(--tx)' }}>위치 사용</b>, 랭킹에 <b style={{ color: 'var(--tx)' }}>닉네임·등급 공개</b>에 동의해요</span></label>
            <button className="btn" disabled={!joinValid || busy} onClick={doJoin}>{prev ? '정보 고쳐서 다시 요청' : '선생님께 인증 요청'}</button>
            <span className="dim" style={{ fontSize: fz(12), lineHeight: 1.5, textAlign: 'center' }}>선생님이 학번과 이름을 확인하면 바로 시작할 수 있어요</span>
          </div>
        )}
      </section>
      {busy && <Busy text={mode === 'login' ? '로그인 중' : '요청 보내는 중'} />}
    </div>
  );
}

function WaitScreen({ req, onEdit, onCheck }) {
  useEffect(() => { const t = setInterval(onCheck, 20000); return () => clearInterval(t); }, []);
  const Row = ({ k, v, c }) => <div className="row" style={{ justifyContent: 'space-between', fontSize: fz(14) }}><span className="muted">{k}</span><span style={{ fontWeight: 700, color: c }}>{v}</span></div>;
  return (
    <div className="app nonav fade">
      <div className="col" style={{ alignItems: 'center', padding: '110px 24px 0', gap: 18, flexGrow: 1 }}>
        <div style={{ position: 'relative', width: 120, height: 120 }}>
          <svg className="spin" width="120" height="120" viewBox="0 0 120 120" fill="none"><defs><linearGradient id="gw" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7AA7FF" /><stop offset="50%" stopColor="#FFB35C" /><stop offset="100%" stopColor="#5FDDB0" /></linearGradient></defs>
            <circle cx="60" cy="60" r="50" stroke="var(--track)" strokeWidth="8" /><circle cx="60" cy="60" r="50" stroke="url(#gw)" strokeWidth="8" strokeLinecap="round" strokeDasharray="180 314.16" transform="rotate(-90 60 60)" /></svg>
          <span className="ras-title" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fz(28), fontWeight: 900 }}>RAS</span>
        </div>
        <div className="col" style={{ alignItems: 'center', gap: 6, paddingTop: 6 }}>
          <span style={{ fontSize: fz(24), fontWeight: 900, letterSpacing: -.8 }}>인증 요청을 보냈어요</span>
          <span className="muted" style={{ fontSize: fz(14), lineHeight: 1.55, textAlign: 'center' }}>선생님이 학번과 이름을 확인하고 있어요.<br />승인되면 이 화면이 자동으로 홈으로 바뀌어요.</span>
        </div>
        <div className="card col" style={{ width: '100%', padding: '16px 18px', gap: 10, marginTop: 14 }}>
          <Row k="학번" v={req.hakbun} /><Row k="이름" v={req.name} /><Row k="닉네임" v={req.nick} /><Row k="상태" v="승인 대기 중" c="var(--a)" />
        </div>
      </div>
      <div className="pad col" style={{ gap: 10, paddingTop: 20 }}>
        <button className="btn" onClick={onCheck}>승인됐는지 확인</button>
        <button className="btn ghost" style={{ height: 48 }} onClick={onEdit}>정보 고치기</button>
        <span className="dim" style={{ fontSize: fz(12), textAlign: 'center' }}>보통 하루 안에 확인돼요 · 궁금하면 교무기획부로 문의하세요</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Home */
function Triangle({ pct, animate = true, size = 150 }) {
  const P = (a, f) => [80 + 58 * f * Math.cos(a * Math.PI / 180), 84 + 58 * f * Math.sin(a * Math.PI / 180)];
  const tri = f => [-90, 30, 150].map(a => P(a, f).map(n => n.toFixed(2)).join(',')).join(' ');
  const pts = [['R', -90], ['A', 30], ['S', 150]].map(([e, a]) => [e, ...P(a, Math.max(0.04, (pct[e] || 0) / 100))]);
  const weakest = ['R', 'A', 'S'].reduce((m, e) => (pct[e] < pct[m] ? e : m), 'S');
  const allFull = pct.R >= 100 && pct.A >= 100 && pct.S >= 100;
  const lab = { R: [80, 15], A: [138, 132], S: [22, 132] };
  return (
    <svg width={size} height={size * 140 / 150} viewBox="0 0 160 150" fill="none" role="img" aria-label={`RAS 지수 삼각형: 독서 ${pct.R}, 예술 ${pct.A}, 러닝 ${pct.S}`} style={{ flexShrink: 0, overflow: 'visible' }}>
      <defs><linearGradient id="rtri" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7AA7FF" stopOpacity=".55" /><stop offset="100%" stopColor="#5FDDB0" stopOpacity=".35" /></linearGradient></defs>
      {[1, 2, 3, 4, 5].map(k => <polygon key={k} points={tri(k / 5)} fill={k === 5 ? 'rgba(255,255,255,.025)' : 'none'} stroke={`rgba(255,255,255,${k === 5 ? .2 : .07})`} strokeWidth="1" />)}
      {[[80, 26], [130.23, 113], [29.77, 113]].map(([x, y], i) => <line key={i} x1="80" y1="84" x2={x} y2={y} stroke="rgba(255,255,255,.08)" />)}
      <g className={animate ? 'ras-poly' : ''}>
        <polygon points={pts.map(p => p[1].toFixed(2) + ',' + p[2].toFixed(2)).join(' ')} fill="url(#rtri)" stroke="#F4F5F6" strokeOpacity=".9" strokeWidth="1.5" strokeLinejoin="round" />
        {pts.map(p => <circle key={p[0]} cx={p[1]} cy={p[2]} r="4" fill={C[p[0]]} stroke="#1D2026" strokeWidth="2" />)}
      </g>
      {['R', 'A', 'S'].map(e => <text key={e} x={lab[e][0]} y={lab[e][1]} textAnchor="middle" fontSize="12" fontWeight="800" fill={C[e]}>{e} <tspan fill="#C9CDD3" fontWeight="700">{pct[e] || 0}</tspan></text>)}
      {!allFull && <text x={lab[weakest][0]} y={lab[weakest][1] + (weakest === 'R' ? -12 : 13)} textAnchor="middle" fontSize="9" fontWeight="800" fill="#FF8A7A">보강</text>}
    </svg>
  );
}

function HomeScreen({ go, refreshKey }) {
  const [st, reload] = useAsync(() => api('home'), [refreshKey]);
  if (st.loading && !st.data) return <div className="col" style={{ padding: 16, gap: 12 }}><div className="skel" style={{ height: 80 }} /><div className="skel" style={{ height: 250 }} /><div className="skel" style={{ height: 220 }} /></div>;
  if (st.error) return <ErrorBox msg={st.error} onRetry={reload} />;
  const d = st.data;
  DDAY = d.season.dday;
  store.set('ras_season', JSON.stringify(d.season));
  const t = d.totals, L = d.levels;
  const best = ['R', 'A', 'S'].reduce((m, e) => (t.pct[e] > t.pct[m] ? e : m), 'R');
  const weak = ['R', 'A', 'S'].reduce((m, e) => (t.pct[e] < t.pct[m] ? e : m), 'S');
  const lvName = t.overall ? L.names[t.overall - 1] : '출발 전';
  const maxDay = Math.max(1, ...d.week.map(w => w.R * 18 + w.A * 18 + w.S * 7));
  const scale = Math.min(1, 52 / maxDay);
  return (
    <div className="fade">
      <header className="row" style={{ padding: '22px 20px 0', gap: 12 }}>
        <div style={{ flexGrow: 1 }}><Logo /></div>
      </header>
      {t.overall >= 5 && <button onClick={() => go('ironman')} style={{ margin: '14px 16px 0', width: 'calc(100% - 32px)', border: 0, borderRadius: 18, padding: '14px 16px', background: 'linear-gradient(90deg,rgba(245,196,81,.2),rgba(29,32,38,1))', boxShadow: 'inset 0 0 0 1.5px rgba(245,196,81,.5)', color: 'var(--tx)', fontSize: fz(15), fontWeight: 800, textAlign: 'left' }}>🏅 철인 달성! 기록 보기 →</button>}
      <section className="card col" style={{ margin: '14px 16px 0', padding: 20, gap: 16, background: 'radial-gradient(120% 90% at 0% 0%, rgba(122,167,255,.13) 0%, rgba(29,32,38,0) 55%), var(--sf)' }}>
        <div className="row" style={{ gap: 10 }}>
          <span style={{ width: 32, height: 32, borderRadius: 999, background: '#2A2E35', boxShadow: 'inset 0 0 0 1.5px var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fz(13), fontWeight: 700 }}>{d.profile.nick.charAt(0)}</span>
          <span style={{ fontSize: fz(15), fontWeight: 700 }}>{d.profile.nick}</span>
          <span className="muted" style={{ fontSize: fz(13) }}>{d.profile.grade}학년</span>
        </div>
        <div className="row" style={{ gap: 12 }}>
          <Triangle pct={t.pct} />
          <div className="col" style={{ flexGrow: 1, gap: 10, minWidth: 0 }}>
            <div className="col" style={{ gap: 2 }}>
              <span className="muted" style={{ fontSize: fz(12), fontWeight: 500 }}>종합 등급</span>
              <div className="row" style={{ alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: fz(30), fontWeight: 800, letterSpacing: -1, lineHeight: 1.1 }}>{lvName}</span>
                {t.overall > 0 && <span className="muted" style={{ fontSize: fz(14), fontWeight: 700 }}>LV.{t.overall}</span>}
              </div>
            </div>
            <div className="col" style={{ gap: 7, fontSize: fz(13) }}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}><span className="muted">RAS 지수</span><span style={{ fontWeight: 800 }}><span className="ras-title" style={{ fontSize: fz(17), fontWeight: 900 }}>{t.ras}</span><span className="dim" style={{ fontWeight: 500 }}> / 300</span></span></div>
              <div className="row" style={{ justifyContent: 'space-between' }}><span className="muted">전체 순위</span><span style={{ fontWeight: 700 }}>{d.rank}<span className="dim" style={{ fontWeight: 500 }}> / {d.participants}</span> {d.rankDelta > 0 && <span style={{ color: 'var(--s)' }}>▲{d.rankDelta}</span>}{d.rankDelta < 0 && <span style={{ color: 'var(--red)' }}>▼{-d.rankDelta}</span>}</span></div>
              <div className="row" style={{ justifyContent: 'space-between' }}><span className="muted">가장 강한</span><span style={{ fontWeight: 700, color: C[best] }}>{best} {NAME[best]}</span></div>
              <div className="row" style={{ justifyContent: 'space-between' }}><span className="muted">보강할 곳</span><span style={{ fontWeight: 700, color: C[weak] }}>{weak} {NAME[weak]}</span></div>
            </div>
          </div>
        </div>
        <button onClick={() => go('record', { tab: d.next.need && d.next.need[0] ? d.next.need[0].event : 'R' })} className="row" style={{ border: 0, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.06)', gap: 10, background: 'none', color: 'inherit', textAlign: 'left', width: '100%' }}>
          <span style={{ fontSize: fz(12), fontWeight: 700, color: 'var(--bg)', background: 'var(--a)', padding: '3px 8px', borderRadius: 6 }}>NEXT</span>
          <span style={{ flexGrow: 1, fontSize: fz(13), color: 'var(--t15)' }}>
            {d.next.done ? '철인 달성! 세 종목 모두 LV.5예요' : <>{d.next.need.map((n, i) => <span key={n.event}>{i ? ' · ' : ''}{NAME[n.event]} <b style={{ color: 'var(--tx)' }}>{fmtNum(n.left)}{n.unit}</b></span>)} 더 하면 <b style={{ color: 'var(--tx)' }}>{d.next.levelName}</b></>}
          </span>
          <Icon name="chev" size={16} sw={2.2} color="#5F656E" />
        </button>
      </section>

      <section className="pad col" style={{ paddingTop: 18, gap: 10 }}>
        <div className="row" style={{ justifyContent: 'space-between', padding: '0 4px' }}>
          <span className="sec-title">종목별 기록</span>
          <button onClick={() => go('grades', { levels: L })} style={{ background: 'none', border: 0, fontSize: fz(13), fontWeight: 500, color: 'var(--t2)' }}>등급표</button>
        </div>
        <div className="card col">
          {['R', 'A', 'S'].map((e, i) => (
            <button key={e} onClick={() => go('record', { tab: e })} className="row" style={{ border: 0, height: 66, padding: '0 16px', gap: 12, borderTop: i ? '1px solid rgba(255,255,255,.05)' : 0, background: 'none', color: 'inherit', textAlign: 'left' }}>
              <Badge e={e} lv={t.lv[e]} />
              <div className="col" style={{ flexGrow: 1, gap: 8, minWidth: 0 }}>
                <div className="row" style={{ alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: fz(15), fontWeight: 700 }}>{NAME[e]}</span>
                  <span style={{ fontSize: fz(10), fontWeight: 700, letterSpacing: 1.2, color: 'var(--t3)' }}>{EN[e]}</span>
                  <span style={{ fontSize: fz(12), fontWeight: 600, color: C[e] }}>{t.lv[e] ? 'LV.' + t.lv[e] + ' ' + L.names[t.lv[e] - 1] : '시작 전'}</span>
                </div>
                <Segs value={t[e]} th={L[e]} color={C[e]} />
              </div>
              <div className="col" style={{ width: 76, alignItems: 'flex-end', gap: 1 }}>
                <span style={{ fontSize: fz(20), fontWeight: 800, letterSpacing: -.5 }}>{fmtNum(t[e])}<span className="muted" style={{ fontSize: fz(13), fontWeight: 500 }}>{L.unit[e]}</span></span>
                <span className="dim" style={{ fontSize: fz(11) }}>철인 {fmtNum(L[e][4])}{L.unit[e]}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section style={{ padding: '18px 20px 0' }} className="col">
        <div className="row" style={{ justifyContent: 'space-between', paddingBottom: 10 }}>
          <span className="sec-title">최근 7일</span>
          <div className="row" style={{ gap: 10, fontSize: fz(11), color: 'var(--t2)' }}>{['R', 'A', 'S'].map(e => <span key={e} className="row" style={{ gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: 2, background: C[e] }} />{NAME[e]}</span>)}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,minmax(0,1fr))', gap: 6, alignItems: 'end' }}>
          {d.week.map((w, i) => {
            const hs = { R: w.R * 18 * scale, A: w.A * 18 * scale, S: w.S * 7 * scale };
            const empty = !(w.R || w.A || w.S);
            const today = i === 6;
            return (
              <div key={w.date} className="col" style={{ alignItems: 'center', gap: 8 }}>
                <div className="col" style={{ height: 56, justifyContent: 'flex-end' }}>
                  {empty ? <div style={{ width: 16, height: 4, borderRadius: 2, background: '#2E323A' }} /> :
                    <div className="col" style={{ width: 16, borderRadius: 5, overflow: 'hidden', gap: 2 }}>{['R', 'A', 'S'].map(e => hs[e] > 0 && <div key={e} style={{ height: Math.max(3, hs[e]), background: C[e] }} />)}</div>}
                </div>
                <span style={{ fontSize: fz(12), fontWeight: today ? 700 : 500, color: today ? 'var(--tx)' : 'var(--t3)' }}>{w.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="pad col" style={{ paddingTop: 20, gap: 8 }}>
        <div className="row" style={{ justifyContent: 'space-between', padding: '0 4px' }}><span className="sec-title">최근 기록</span><button onClick={() => go('records')} style={{ background: 'none', border: 0, fontSize: fz(13), color: 'var(--t2)' }}>전체 보기</button></div>
        {d.recent.length === 0 ? <div className="card" style={{ padding: 18, fontSize: fz(14), color: 'var(--t2)', textAlign: 'center' }}>아직 기록이 없어요. 아래 + 버튼으로 첫 기록을 남겨 보세요!</div> :
          <div className="card col">{d.recent.slice(0, 4).map((r, i) => <RecordRow key={r.id} r={r} first={!i} />)}</div>}
      </section>

      <footer className="col" style={{ padding: '28px 16px 8px', alignItems: 'center', gap: 10 }}>
        <div style={{ background: '#FFFFFF', borderRadius: 14, padding: '10px 18px' }}>
          <img src="goe-logo.png" alt="경기도교육청 · 경기교육 대전환, 크게 제대로!" style={{ height: 36, display: 'block' }} />
        </div>
        <span className="dim" style={{ fontSize: fz(11), textAlign: 'center', lineHeight: 1.5 }}>경기도교육청 RAS(Reading · Arts · Sports) 교육 연계<br />과천여자고등학교 교무기획부</span>
      </footer>
    </div>
  );
}

function RecordRow({ r, first }) {
  const col = r.status === '인정' ? 'var(--s)' : r.status === '대기' ? 'var(--a)' : 'var(--red)';
  return (
    <div className="row" style={{ minHeight: 52, padding: '8px 14px', gap: 10, borderTop: first ? 0 : '1px solid var(--line)' }}>
      <span style={{ width: 24, height: 22, borderRadius: 7, background: TINT[r.event], color: C[r.event], fontSize: fz(11), fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{r.event}</span>
      <div className="col" style={{ flexGrow: 1, minWidth: 0 }}>
        <span style={{ fontSize: fz(14), fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.text}</span>
        <span className="dim" style={{ fontSize: fz(11) }}>{String(r.time).slice(5, 16).replace('-', '.')}{r.memo && r.memo.indexOf('초과') >= 0 ? ' · 한도 초과' : ''}{r.memo && r.memo.indexOf('도달') >= 0 ? ' · 관람 한도 도달' : ''}</span>
      </div>
      <div className="col" style={{ alignItems: 'flex-end' }}>
        <span style={{ fontSize: fz(12), fontWeight: 700, color: col }}>{r.status === '인정' ? '+' + fmtNum(r.value) + UNIT[r.event] : r.status}</span>
      </div>
    </div>
  );
}

function RecordsScreen({ back }) {
  const [st, reload] = useAsync(() => api('myRecords'), []);
  return (
    <div className="app nonav fade">
      <Header title="내 기록" onBack={back} />
      {st.loading ? <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><Spinner /></div> : st.error ? <ErrorBox msg={st.error} onRetry={reload} /> :
        <div className="pad">{st.data.records.length ? <div className="card col">{st.data.records.map((r, i) => <RecordRow key={r.id} r={r} first={!i} />)}</div> :
          <div className="card" style={{ padding: 18, textAlign: 'center', color: 'var(--t2)' }}>아직 기록이 없어요.</div>}</div>}
    </div>
  );
}

function GradesScreen({ back, levels }) {
  const L = levels;
  return (
    <div className="app nonav fade">
      <Header title="등급표" onBack={back} eyebrow="종합 등급 = 세 종목 중 가장 낮은 등급" />
      <div className="pad col" style={{ gap: 12 }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(3,minmax(0,1fr))', padding: '12px 16px', borderBottom: '1px solid var(--line)', gap: 6, alignItems: 'center' }}>
            <span className="muted" style={{ fontSize: fz(12), fontWeight: 700 }}>등급</span>
            {['R', 'A', 'S'].map(e => <span key={e} className="row" style={{ gap: 6 }}><Badge e={e} size={24} /><span style={{ fontSize: fz(12), color: 'var(--t2)' }}>{L.unit[e]}</span></span>)}
          </div>
          {L.names.map((n, i) => (
            <div key={n} style={{ display: 'grid', gridTemplateColumns: '90px repeat(3,minmax(0,1fr))', padding: '12px 16px', gap: 6, alignItems: 'center', borderTop: i ? '1px solid var(--line)' : 0, background: i === 4 ? 'linear-gradient(90deg,rgba(245,196,81,.12),transparent)' : 'none' }}>
              <span className="col"><span style={{ fontSize: fz(11), fontWeight: 800, color: i === 4 ? 'var(--gold)' : 'var(--t2)' }}>LV.{i + 1}</span><span style={{ fontSize: fz(15), fontWeight: 800 }}>{n}</span></span>
              {['R', 'A', 'S'].map(e => <span key={e} style={{ fontSize: fz(20), fontWeight: 800, color: C[e] }}>{fmtNum(L[e][i])}</span>)}
            </div>
          ))}
        </div>
        <div className="card col" style={{ padding: '16px 18px', gap: 8, fontSize: fz(13), lineHeight: 1.7, color: 'var(--t15)' }}>
          <b style={{ color: 'var(--tx)', fontSize: fz(15) }}>인정 기준</b>
          <span><b style={{ color: C.R }}>R 독서</b> 추천도서 퀴즈 5문항 중 4개 이상 → 자동 인정 · 목록 밖 도서는 서술형 → 선생님 확인</span>
          <span><b style={{ color: C.A }}>A 예술</b> 관람 1P (문화시설 20분 체류 자동 · 감상문 선생님 확인) · 체험·동아리·방과후 2P · 출연·출품 3P · 하루 최대 5P · 관람 누적 최대 8P</span>
          <span><b style={{ color: C.S }}>S 러닝</b> 앱 GPS로 측정한 러닝만 인정 · 1회 500m 이상 · 시속 20km 넘는 구간 제외 · 바로 반영</span>
          <span className="muted">RAS 지수 = 종목별 LV.5 대비 달성률(최대 100)을 합한 점수, 300점 만점</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Ranking */
function RankingScreen() {
  const [ev, setEv] = useState('all');
  const [grade, setGrade] = useState(0);
  const [st, reload] = useAsync(() => api('ranking', { event: ev, grade }), [ev, grade]);
  const d = st.data;
  const unit = ev === 'all' ? '' : UNIT[ev];
  const Mini = ({ e, n }) => <span style={{ width: 24, height: 22, borderRadius: 7, background: TINT[e], color: C[e], fontSize: fz(11), fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{e}{n}</span>;
  const Pod = ({ p, h, medal }) => !p ? <div /> : (
    <div className="col" style={{ alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
      <span style={{ width: 44, height: 44, borderRadius: 999, background: 'var(--sf2)', boxShadow: `inset 0 0 0 2px ${medal}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fz(16), fontWeight: 800 }}>{p.nick.charAt(0)}</span>
      <span style={{ fontSize: fz(13), fontWeight: 700, textAlign: 'center' }}>{p.nick}{p.me ? ' (나)' : ''}</span><span className="dim" style={{ fontSize: fz(11) }}>{p.grade}학년{p.overall >= 5 ? ' · 철인' : ''}</span>
      <div className="col" style={{ width: '100%', height: h, borderRadius: '14px 14px 0 0', background: 'linear-gradient(180deg,#262A31 0%,rgba(38,42,49,.2) 100%)', boxShadow: `inset 0 1px 0 ${medal}`, alignItems: 'center', paddingTop: 8 }}>
        <span style={{ fontSize: fz(22), fontWeight: 900, color: medal }}>{p.rank}</span><span style={{ fontSize: fz(12), fontWeight: 700, color: 'var(--t15)' }}>{fmtNum(p.value)}{unit}</span></div>
    </div>
  );
  return (
    <div className="fade">
      <header className="row" style={{ padding: '22px 20px 0', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div className="col" style={{ gap: 2 }}><span className="muted" style={{ fontSize: fz(12), fontWeight: 600 }}>참가자 {d ? d.total : '-'}명</span><span style={{ fontSize: fz(28), fontWeight: 900, letterSpacing: -1 }}>랭킹</span></div>
        <div className="row" style={{ gap: 12, fontSize: fz(13), paddingBottom: 4 }}>{[0, 1, 2, 3].map(g => <button key={g} onClick={() => setGrade(g)} style={{ background: 'none', border: 0, padding: '0 0 3px', color: grade === g ? 'var(--tx)' : 'var(--t2)', fontWeight: grade === g ? 700 : 500, boxShadow: grade === g ? '0 2px 0 var(--tx)' : 'none', fontSize: fz(13) }}>{g ? g + '학년' : '전체'}</button>)}</div>
      </header>
      <div className="row pad" style={{ paddingTop: 14, gap: 6 }}>
        {[['all', '종합'], ['R', '독서'], ['A', '예술'], ['S', '러닝']].map(([k, n]) => (
          <button key={k} onClick={() => setEv(k)} style={{ height: 36, padding: '0 14px', borderRadius: 99, border: 0, background: ev === k ? 'var(--tx)' : 'var(--sf)', boxShadow: ev === k ? 'none' : 'inset 0 0 0 1px var(--line)', color: ev === k ? 'var(--bg)' : 'var(--tx)', fontSize: fz(14), fontWeight: ev === k ? 800 : 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            {k !== 'all' && <span style={{ fontWeight: 900, color: ev === k ? 'var(--bg)' : C[k] }}>{k}</span>}{n}</button>))}
      </div>
      {st.loading && !d ? <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}><Spinner /></div> : st.error ? <ErrorBox msg={st.error} onRetry={reload} /> : (
        <>
          <div style={{ padding: '18px 20px 0', display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10, alignItems: 'end' }}>
            <Pod p={d.list[1]} h={64} medal="#C9CFD8" /><Pod p={d.list[0]} h={88} medal="#F5C451" /><Pod p={d.list[2]} h={48} medal="#D99A6C" />
          </div>
          <div className="pad"><div style={{ background: 'var(--sf)', borderRadius: '0 0 22px 22px', boxShadow: 'inset 0 0 0 1px var(--line)' }}>
            {d.list.slice(3).map((p, i) => (
              <div key={i} className="row" style={{ height: 50, padding: '0 14px', gap: 10, borderTop: i ? '1px solid var(--line)' : 0, background: p.me ? 'rgba(122,167,255,.08)' : 'none' }}>
                <span style={{ width: 22, fontSize: fz(15), fontWeight: 800, color: 'var(--t2)', textAlign: 'center' }}>{p.rank}</span>
                <div className="col" style={{ flexGrow: 1, minWidth: 0 }}><span style={{ fontSize: fz(14), fontWeight: 700 }}>{p.nick}{p.me ? ' (나)' : ''}</span><span className="dim" style={{ fontSize: fz(11) }}>{p.grade}학년</span></div>
                <div className="row" style={{ gap: 3 }}><Mini e="R" n={p.lv.R} /><Mini e="A" n={p.lv.A} /><Mini e="S" n={p.lv.S} /></div>
                <span style={{ width: 44, textAlign: 'right', fontSize: fz(16), fontWeight: 800 }}>{fmtNum(p.value)}</span>
              </div>))}
            {d.list.length <= 3 && <div style={{ padding: 16, fontSize: fz(13), color: 'var(--t3)', textAlign: 'center' }}>참가자가 늘면 여기에 순위가 보여요</div>}
          </div></div>
          {d.me && d.me.rank > 3 && (
            <div className="pad" style={{ paddingTop: 10 }}><div className="row" style={{ height: 58, borderRadius: 18, background: 'linear-gradient(90deg,rgba(122,167,255,.16) 0%,rgba(29,32,38,1) 70%)', boxShadow: 'inset 0 0 0 1.5px rgba(122,167,255,.45)', gap: 10, padding: '0 14px' }}>
              <span style={{ width: 22, fontSize: fz(15), fontWeight: 800, textAlign: 'center' }}>{d.me.rank}</span>
              <div className="col" style={{ flexGrow: 1 }}><span style={{ fontSize: fz(14), fontWeight: 800 }}>{d.me.nick} (나)</span><span style={{ fontSize: fz(11), fontWeight: 600, color: 'var(--s)' }}>{d.me.grade}학년</span></div>
              <div className="row" style={{ gap: 3 }}><Mini e="R" n={d.me.lv.R} /><Mini e="A" n={d.me.lv.A} /><Mini e="S" n={d.me.lv.S} /></div>
              <span style={{ width: 44, textAlign: 'right', fontSize: fz(16), fontWeight: 800 }}>{fmtNum(d.me.value)}</span>
            </div></div>)}
          <p className="dim" style={{ fontSize: fz(11), textAlign: 'center', margin: '12px 16px 0' }}>{ev === 'all' ? '종합 = RAS 지수(300점 만점) · 같으면 먼저 도달한 순' : NAME[ev] + ' 누적 ' + UNIT[ev] + ' 순'} · 칩 = 종목별 등급</p>
        </>)}
    </div>
  );
}

/* ---------------------------------------------------------------- Record hub */
function Tabs({ tab, setTab }) {
  return (
    <div style={{ margin: '0 16px', padding: 4, background: 'var(--sf3)', borderRadius: 18, boxShadow: 'inset 0 0 0 1px var(--line)', display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 4 }}>
      {['R', 'A', 'S'].map(e => {
        const on = tab === e;
        return <button key={e} onClick={() => setTab(e)} style={{ height: 48, border: 0, borderRadius: 14, background: on ? 'var(--sf)' : 'transparent', boxShadow: on ? `inset 0 0 0 1.5px ${C[e]}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {on ? <Badge e={e} size={26} /> : <span style={{ fontSize: fz(14), fontWeight: 900, color: C[e] }}>{e}</span>}
          <span style={{ fontSize: fz(14), fontWeight: on ? 700 : 600, color: on ? 'var(--tx)' : 'var(--t2)' }}>{NAME[e]}</span></button>;
      })}
    </div>
  );
}

function RecordScreen({ back, go, tab: initTab, item }) {
  const [tab, setTab] = useState(initTab || 'R');
  useEffect(() => { store.set('ras_tab', tab); if (item) item.tab = tab; }, [tab]);
  return (
    <div className="app nonav fade">
      <Header title="기록하기" onBack={back} />
      <Tabs tab={tab} setTab={setTab} />
      {tab === 'R' && <ReadingTab go={go} />}
      {tab === 'A' && <ArtTab go={go} />}
      {tab === 'S' && <RunTab go={go} />}
    </div>
  );
}

function ReadingTab({ go }) {
  const [q, setQ] = useState('');
  const [st, reload] = useAsync(() => api('books'), []);
  const norm = s => String(s || '').replace(/\s/g, '').toLowerCase();
  const list = useMemo(() => {
    if (!st.data) return [];
    const n = norm(q);
    return n ? st.data.books.filter(b => norm(b.title).indexOf(n) >= 0 || norm(b.author).indexOf(n) >= 0) : st.data.books;
  }, [st.data, q]);
  const cover = (t) => {
    let h = 0; for (const ch of t) h = (h * 31 + ch.charCodeAt(0)) % 360;
    return `linear-gradient(160deg,hsl(${h},32%,34%) 0%,hsl(${h},30%,12%) 100%)`;
  };
  return (
    <section className="pad col fade" style={{ paddingTop: 14, gap: 12 }}>
      <label className="row" style={{ height: 52, padding: '0 16px', borderRadius: 16, background: 'var(--sf)', boxShadow: 'inset 0 0 0 1.5px var(--r),0 0 0 4px rgba(122,167,255,.12)', gap: 10, color: 'var(--r)' }}>
        <Icon name="search" size={20} sw={2.2} /><input id="bq" value={q} onChange={e => setQ(e.target.value)} placeholder="책 제목이나 저자로 찾기" aria-label="책 검색" style={{ flexGrow: 1, border: 0, outline: 'none', background: 'transparent', fontSize: fz(16), fontWeight: 600, color: 'var(--tx)' }} />
      </label>
      <button onClick={() => go('bookEssay')} className="row" style={{ borderRadius: 18, border: 0, boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,.14)', padding: '14px 16px', gap: 12, background: 'none', color: 'var(--tx)', textAlign: 'left' }}>
        <span style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--sf2)', color: 'var(--t2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="plus" size={18} sw={2.2} /></span>
        <div className="col" style={{ flexGrow: 1, gap: 2 }}><span style={{ fontSize: fz(14), fontWeight: 700 }}>찾는 책이 목록에 없나요?</span><span className="muted" style={{ fontSize: fz(12) }}>직접 등록하고 서술형 2문항 · 선생님 확인 후 반영</span></div>
      </button>
      <div className="row" style={{ justifyContent: 'space-between', padding: '6px 4px 0' }}><span className="sec-title">추천 도서 {st.data ? st.data.books.length + '권' : ''}</span><span className="muted" style={{ fontSize: fz(12) }}>많이 통과한 순</span></div>
      {st.loading ? <div className="skel" style={{ height: 300 }} /> : st.error ? <ErrorBox msg={st.error} onRetry={reload} /> : (
        <div className="col" style={{ gap: 8 }}>
          {list.slice(0, 60).map(b => (
            <button key={b.id} disabled={b.passed} onClick={() => go('quiz', { book: b })} className="card row" style={{ border: 0, padding: 12, gap: 14, color: 'var(--tx)', textAlign: 'left', opacity: b.passed ? .6 : 1 }}>
              <div style={{ width: 44, height: 60, borderRadius: '4px 8px 8px 4px', background: cover(b.title), boxShadow: 'inset 3px 0 0 rgba(0,0,0,.25),0 4px 12px rgba(0,0,0,.35)', flexShrink: 0, display: 'flex', alignItems: 'flex-end', padding: 5, fontSize: fz(8), fontWeight: 800, lineHeight: 1.2, color: 'rgba(255,255,255,.9)', overflow: 'hidden' }}>{b.title.slice(0, 10)}</div>
              <div className="col" style={{ flexGrow: 1, gap: 3, minWidth: 0 }}>
                <span style={{ fontSize: fz(15), fontWeight: 800, letterSpacing: -.3 }}>{b.title}</span>
                <span className="muted" style={{ fontSize: fz(12), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.author}</span>
                <div className="row" style={{ gap: 6, marginTop: 3 }}>
                  {b.passed ? <span className="chip" style={{ background: TINT.S, color: C.S }}>통과함</span> : <span className="chip" style={{ background: TINT.R, color: C.R }}>퀴즈로 인증</span>}
                  {b.passCount > 0 && <span className="chip" style={{ background: 'var(--sf2)', color: 'var(--t2)', fontWeight: 600 }}>{b.passCount}명 통과</span>}
                </div>
              </div>
              {!b.passed && <Icon name="chev" size={20} sw={2.2} color="#5F656E" />}
            </button>))}
          {list.length === 0 && <div className="card" style={{ padding: 18, textAlign: 'center', color: 'var(--t2)', fontSize: fz(14) }}>찾는 책이 없어요. 위의 "목록에 없나요?"로 등록해 주세요.</div>}
          {list.length > 60 && <span className="dim" style={{ fontSize: fz(12), textAlign: 'center' }}>검색하면 나머지 {list.length - 60}권도 찾을 수 있어요</span>}
        </div>)}
      <span className="dim" style={{ fontSize: fz(12), textAlign: 'center', padding: '8px 0' }}>퀴즈는 같은 책당 하루 1회 · 5문항 중 4개 이상 맞히면 인정</span>
    </section>
  );
}

/* ---------------------------------------------------------------- Quiz */
function QuizScreen({ back, replace, book }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [pick, setPick] = useState(null);
  const [left, setLeft] = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return; started.current = true;
    api('quizStart', { bookId: book.id }).then(d => { setData(d); setLeft(d.seconds); }).catch(e => setErr(e.message));
  }, []);
  const next = useCallback((choice) => {
    const a = answers.concat([choice]);
    setAnswers(a); setPick(null);
    if (a.length >= data.questions.length) {
      setSubmitting(true);
      api('quizSubmit', { sessionId: data.sessionId, answers: a }).then(r => replace('quizResult', { result: r })).catch(e => { setErr(e.message); setSubmitting(false); });
    } else { setIdx(a.length); setLeft(data.seconds); }
  }, [answers, data]);
  useEffect(() => {
    if (!data || submitting) return;
    if (left <= 0) { next(null); return; }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, data, submitting]);
  if (err) return <div className="app nonav"><Header title="독서 퀴즈" onBack={back} /><ErrorBox msg={err} /><div className="pad"><button className="btn ghost" onClick={back}>돌아가기</button></div></div>;
  if (!data) return <div className="app nonav"><Header title="독서 퀴즈" onBack={back} /><div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}><Spinner /></div></div>;
  const q = data.questions[idx];
  const circ = 2 * Math.PI * 22;
  return (
    <div className="app nonav fade">
      <header className="row" style={{ padding: '18px 16px 0', gap: 12 }}>
        <button className="iconbtn" aria-label="그만하기" onClick={back}><Icon name="close" sw={2.2} /></button>
        <div className="row" style={{ flexGrow: 1, gap: 10, minWidth: 0 }}><Badge e="R" size={30} /><div className="col" style={{ minWidth: 0 }}><span className="muted" style={{ fontSize: fz(12), fontWeight: 600 }}>독서 퀴즈</span><span style={{ fontSize: fz(16), fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.book.title}</span></div></div>
        <div style={{ position: 'relative', width: 52, height: 52 }}>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none"><circle cx="26" cy="26" r="22" stroke="var(--track)" strokeWidth="4" /><circle cx="26" cy="26" r="22" stroke={left <= 5 ? 'var(--red)' : 'var(--r)'} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${circ * left / data.seconds} ${circ}`} transform="rotate(-90 26 26)" style={{ transition: 'stroke-dasharray 1s linear' }} /></svg>
          <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fz(17), fontWeight: 800 }}>{left}</span>
        </div>
      </header>
      <div className="row" style={{ padding: '18px 20px 0', gap: 4 }}>{data.questions.map((_, i) => <div key={i} style={{ flexGrow: 1, height: 4, borderRadius: 2, background: i < idx ? C.R : i === idx ? '#B9D0FF' : 'var(--track)' }} />)}</div>
      <div key={idx} className="col fade" style={{ padding: '30px 20px 0', gap: 12 }}>
        <span style={{ fontSize: fz(14), fontWeight: 800, color: C.R }}>Q {idx + 1} <span className="dim">/ {data.questions.length}</span></span>
        <span style={{ fontSize: fz(22), fontWeight: 800, letterSpacing: -.7, lineHeight: 1.4 }}>{q.q}</span>
      </div>
      <div className="pad col" style={{ paddingTop: 24, gap: 10 }}>
        {q.options.map((o, i) => {
          const on = pick === i;
          return <button key={idx + '-' + i} onClick={() => setPick(i)} className="row" style={{ minHeight: 60, border: 0, borderRadius: 18, background: on ? TINT.R : 'var(--sf)', boxShadow: `inset 0 0 0 ${on ? '2px ' + C.R : '1px var(--line)'}`, gap: 14, padding: '10px 16px', fontSize: fz(16), fontWeight: on ? 800 : 600, textAlign: 'left', color: 'var(--tx)' }}>
            <span style={{ width: 30, height: 30, borderRadius: 10, background: on ? C.R : 'var(--sf2)', color: on ? 'var(--bg)' : 'var(--t2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fz(14), fontWeight: 800, flexShrink: 0 }}>{'ABCD'[i]}</span>
            <span style={{ flexGrow: 1 }}>{o}</span>{on && <Icon name="check" size={20} sw={2.6} color={C.R} />}</button>;
        })}
      </div>
      <div className="pad col" style={{ marginTop: 'auto', paddingTop: 20, gap: 12 }}>
        <span className="dim" style={{ fontSize: fz(12), textAlign: 'center' }}>문항당 {data.seconds}초 · 시간이 지나면 오답 처리 · 이전 문제로 돌아갈 수 없어요</span>
        <button className="btn" disabled={pick === null || submitting} onClick={() => next(pick)}>{idx + 1 >= data.questions.length ? '제출하기' : '다음 문제'}</button>
      </div>
      {submitting && <Busy text="채점 중" />}
    </div>
  );
}

function QuizResultScreen({ result: r, home, replace }) {
  const L = r.levels, t = r.totals;
  return (
    <div className="app nonav fade">
      <div className="col" style={{ padding: '48px 20px 0', alignItems: 'center', gap: 6 }}>
        <span className="muted" style={{ fontSize: fz(13), fontWeight: 600 }}>{r.book.title} · {r.book.author}</span>
        <div className="row" style={{ alignItems: 'baseline', gap: 6 }}><span className={r.passed ? 'ras-r' : ''} style={{ fontSize: fz(104), fontWeight: 900, letterSpacing: -5, lineHeight: 1, color: r.passed ? undefined : 'var(--t2)' }}>{r.score}</span><span className="dim" style={{ fontSize: fz(30), fontWeight: 800 }}>/ {r.total}</span></div>
        <span style={{ fontSize: fz(20), fontWeight: 800 }}>{r.passed ? '통과! 독서 1권 인정' : r.late ? '시간이 초과됐어요' : '아쉽지만 통과하지 못했어요'}</span>
      </div>
      <div className="row" style={{ padding: '22px 16px 0', justifyContent: 'center', gap: 8 }}>
        {r.marks.map((m, i) => <span key={i} style={{ width: 44, height: 44, borderRadius: 14, background: m ? TINT.R : 'rgba(255,107,90,.14)', boxShadow: `inset 0 0 0 1px ${m ? 'rgba(122,167,255,.35)' : 'rgba(255,107,90,.4)'}`, color: m ? C.R : 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={m ? 'check' : 'close'} size={20} sw={2.8} /></span>)}
      </div>
      <div className="pad col" style={{ paddingTop: 24, gap: 10 }}>
        <div className="card col" style={{ padding: 18, gap: 12 }}>
          <div className="row" style={{ gap: 12 }}><Badge e="R" size={40} lv={t.lv.R} />
            <div className="col" style={{ flexGrow: 1 }}><span style={{ fontSize: fz(15), fontWeight: 700 }}>독서 기록</span><span style={{ fontSize: fz(12), fontWeight: 600, color: C.R }}>{t.lv.R ? 'LV.' + t.lv.R + ' ' + L.names[t.lv.R - 1] : '시작 전'}</span></div>
            <span style={{ fontSize: fz(24), fontWeight: 800 }}>{t.R}<span className="muted" style={{ fontSize: fz(13) }}>권</span></span></div>
          <Segs value={t.R} th={L.R} color={C.R} h={6} />
        </div>
        <div className="card col" style={{ padding: '14px 16px', gap: 4 }}><span style={{ fontSize: fz(13), fontWeight: 700, color: 'var(--t15)' }}>정답과 해설은 시즌이 끝난 뒤 공개돼요</span><span className="muted" style={{ fontSize: fz(13), lineHeight: 1.55 }}>문제 공유를 막기 위해서예요. {r.passed ? '' : '같은 책은 내일 다른 문항으로 다시 도전할 수 있어요.'}</span></div>
      </div>
      <div className="pad" style={{ marginTop: 'auto', paddingTop: 20, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8 }}>
        <button className="btn" onClick={() => replace('record', { tab: 'R' })}>다음 책 찾기</button><button className="btn ghost" onClick={home}>홈으로</button>
      </div>
    </div>
  );
}

function EssayForm({ kind, back, done, preset }) {
  const [title, setTitle] = useState(preset && preset.title || '');
  const [sub, setSub] = useState(preset && preset.sub || '');
  const [date, setDate] = useState(preset && preset.date || new Date().toISOString().slice(5, 10).replace('-', '. '));
  const [a1, setA1] = useState('');
  const [a2, setA2] = useState('');
  const [busy, setBusy] = useState(false);
  const draftKey = 'ras_draft_' + kind;
  useEffect(() => { const d = store.get(draftKey); if (d) try { const j = JSON.parse(d); setA1(j.a1 || ''); setA2(j.a2 || ''); if (!title) setTitle(j.title || ''); } catch (e) {} }, []);
  useEffect(() => { store.set(draftKey, JSON.stringify({ a1, a2, title })); }, [a1, a2, title]);
  const R = kind === 'R';
  const Q1 = R ? '책에서 가장 기억에 남는 장면 하나와 그 이유를 쓰세요.' : '가장 오래 본 작품(장면) 하나를 묘사하고, 왜 눈길이 갔는지 쓰세요.';
  const Q2 = R ? '작가의 생각에 동의하지 않는 부분이 있다면? 없다면 가장 공감한 부분은?' : '작가가 전하려던 것은 무엇이라고 생각하나요? 나의 생각은?';
  const ok = title.trim() && a1.trim().length >= 100 && a2.trim().length >= 100;
  async function submit() {
    setBusy(true);
    try { await api('essaySubmit', { kind, title, sub, date, a1, a2, checkinId: preset && preset.checkinId }); store.set(draftKey, null); done(); }
    catch (e) { toast(e.message); }
    setBusy(false);
  }
  const color = C[kind];
  const Counter = ({ v }) => <span style={{ fontSize: fz(12), color: v.trim().length >= 100 ? 'var(--s)' : 'var(--t2)', fontWeight: 600 }}>{v.trim().length} / 최소 100자</span>;
  return (
    <div className="app nonav fade">
      <Header title={R ? '서술형 인증' : '관람 감상문'} onBack={back} eyebrow={R ? 'R 독서 · 목록 밖 도서 · 선생님 확인 후 반영' : 'A 예술 · 선생님 확인 후 반영'} />
      <section className="pad col" style={{ paddingTop: 6, gap: 12 }}>
        {preset && preset.checkinId && <div className="row" style={{ gap: 10, padding: '12px 14px', borderRadius: 16, background: 'rgba(95,221,176,.1)', boxShadow: 'inset 0 0 0 1px rgba(95,221,176,.3)' }}><Icon name="check" size={18} sw={2.6} color={C.S} /><span style={{ flexGrow: 1, fontSize: fz(13), color: 'var(--t15)' }}><b style={{ color: 'var(--tx)' }}>체크인 기록과 연결됨</b> · {preset.title}</span><span style={{ fontSize: fz(13), fontWeight: 800, color: C.A }}>+1P</span></div>}
        <div style={{ display: 'grid', gridTemplateColumns: R ? 'minmax(0,1fr) minmax(0,1fr)' : 'minmax(0,1fr) 100px', gap: 8 }}>
          <label className="col" style={{ gap: 6 }}><span className="label">{R ? '책 제목' : '전시·공연 이름'}</span><input id="et" className="input" value={title} onChange={e => setTitle(e.target.value)} /></label>
          {R ? <label className="col" style={{ gap: 6 }}><span className="label">저자</span><input id="es" className="input" value={sub} onChange={e => setSub(e.target.value)} /></label>
            : <label className="col" style={{ gap: 6 }}><span className="label">관람일</span><input id="ed" className="input" value={date} onChange={e => setDate(e.target.value)} /></label>}
        </div>
        {!R && <label className="col" style={{ gap: 6 }}><span className="label">장소</span><input id="es2" className="input" placeholder="미술관·공연장 이름" value={sub} onChange={e => setSub(e.target.value)} /></label>}
        <label className="col" style={{ gap: 8 }}><span style={{ fontSize: fz(14), fontWeight: 700, lineHeight: 1.5 }}><span style={{ color }}>Q1.</span> {Q1}</span>
          <textarea id="a1" className="ta" rows={5} value={a1} onChange={e => setA1(e.target.value)} placeholder="100자 이상 써 주세요" /><div className="row" style={{ justifyContent: 'flex-end' }}><Counter v={a1} /></div></label>
        <label className="col" style={{ gap: 8 }}><span style={{ fontSize: fz(14), fontWeight: 700, lineHeight: 1.5 }}><span style={{ color }}>Q2.</span> {Q2}</span>
          <textarea id="a2" className="ta" rows={5} value={a2} onChange={e => setA2(e.target.value)} placeholder="100자 이상 써 주세요" /><div className="row" style={{ justifyContent: 'flex-end' }}><Counter v={a2} /></div></label>
      </section>
      <div className="pad col" style={{ marginTop: 'auto', paddingTop: 16, gap: 10 }}>
        <button className="btn" disabled={!ok || busy} onClick={submit}>제출하기</button>
        <span className="dim" style={{ fontSize: fz(12), textAlign: 'center' }}>{R ? '선생님이 확인하면 독서 1권이 반영돼요' : '체크인 없는 관람도 제출할 수 있어요 · 선생님 확인 후 1P'}</span>
      </div>
      {busy && <Busy text="제출 중" />}
    </div>
  );
}

function SubmittedScreen({ home, kind }) {
  return (
    <div className="app nonav fade">
      <div className="col" style={{ alignItems: 'center', padding: '120px 24px 0', gap: 14, flexGrow: 1, textAlign: 'center' }}>
        <Badge e={kind} size={72} /><span style={{ fontSize: fz(24), fontWeight: 900, marginTop: 8 }}>제출했어요</span>
        <span className="muted" style={{ fontSize: fz(14), lineHeight: 1.6 }}>선생님이 확인하면 기록에 반영돼요.<br />홈의 "최근 기록"에서 상태를 볼 수 있어요.</span>
      </div>
      <div className="pad"><button className="btn" onClick={home}>홈으로</button></div>
    </div>
  );
}

/* ---------------------------------------------------------------- Art */
function ArtTab({ go }) {
  const [cur, setCur] = useState(null);
  const [places, setPlaces] = useState(null);
  const [finding, setFinding] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { api('artCurrent').then(r => setCur(r.checkin)).catch(() => {}); }, []);
  async function find() {
    setFinding(true);
    try { const c = await getPosition(); const r = await api('artNearby', { lat: c.latitude, lng: c.longitude }); setPlaces({ list: r.places, radius: r.radius, lat: c.latitude, lng: c.longitude }); }
    catch (e) { toast(e.message); }
    setFinding(false);
  }
  async function checkin(p) {
    setBusy(true);
    try { const r = await api('artCheckin', { lat: places.lat, lng: places.lng, placeId: p.id }); go('artCheckin', { checkin: r.checkin, minMinutes: r.minMinutes }); }
    catch (e) { toast(e.message); }
    setBusy(false);
  }
  const Method = ({ icon, title, sub, pts, chip, chipC, chipBg, onClick }) => (
    <button onClick={onClick} disabled={!onClick} className="card row" style={{ border: 0, padding: '14px 16px', gap: 14, color: 'var(--tx)', textAlign: 'left', opacity: 1 }}>
      <span style={{ width: 44, height: 44, borderRadius: 14, background: TINT.A, color: C.A, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={icon} /></span>
      <div className="col" style={{ flexGrow: 1, gap: 3, minWidth: 0 }}><div className="row" style={{ gap: 6 }}><span style={{ fontSize: fz(15), fontWeight: 700 }}>{title}</span><span className="chip" style={{ color: chipC, background: chipBg }}>{chip}</span></div><span className="muted" style={{ fontSize: fz(12) }}>{sub}</span></div>
      <span style={{ fontSize: fz(18), fontWeight: 800, color: C.A, whiteSpace: 'nowrap' }}>{pts}</span>
    </button>
  );
  return (
    <section className="pad col fade" style={{ paddingTop: 14, gap: 10 }}>
      {cur && <button onClick={() => go('artCheckin', { checkin: cur, minMinutes: 20 })} className="row" style={{ border: 0, borderRadius: 18, padding: '14px 16px', gap: 12, background: 'rgba(255,179,92,.12)', boxShadow: 'inset 0 0 0 1.5px rgba(255,179,92,.45)', color: 'var(--tx)', textAlign: 'left' }}>
        <span style={{ width: 10, height: 10, borderRadius: 99, background: C.A, boxShadow: '0 0 0 5px rgba(255,179,92,.2)' }} /><span style={{ flexGrow: 1, fontSize: fz(14), fontWeight: 700 }}>관람 중 · {cur.place}</span><span style={{ fontSize: fz(13), color: C.A, fontWeight: 700 }}>이어가기 →</span></button>}
      <span style={{ padding: '6px 4px 0', fontSize: fz(17), fontWeight: 700 }}>인증 방법</span>
      <Method icon="pin" title="문화시설 체크인" sub="미술관·박물관·공연장에서 20분 이상 머물면" pts="+1P" chip="자동" chipC={C.S} chipBg={TINT.S} onClick={places ? null : find} />
      <Method icon="spark" title="관람 감상문" sub="서술형 2문항 · 체크인한 관람이면 +1P 추가" pts="+1P" chip="선생님 확인" chipC="var(--t2)" chipBg="var(--sf2)" onClick={() => go('artEssay', {})} />
      <Method icon="trophy" title="교내 행사 · 활동" sub="체험·동아리·방과후 2P · 출연·출품 3P" pts="+2~3P" chip="선생님 인증" chipC="var(--t2)" chipBg="var(--sf2)" />
      <div className="row" style={{ justifyContent: 'space-between', padding: '8px 4px 0' }}><span style={{ fontSize: fz(15), fontWeight: 700 }}>지금 근처 문화시설</span><span className="muted" style={{ fontSize: fz(12) }}>반경 {places ? places.radius : 200}m 자동 탐색</span></div>
      {!places ? <button className="btn ghost" onClick={find} disabled={finding}>{finding ? <><Spinner size={20} /> 위치 확인 중</> : <><Icon name="pin" size={18} /> 근처 문화시설 찾기</>}</button> :
        places.list.length === 0 ? <div className="card col" style={{ padding: 18, gap: 10, alignItems: 'center', textAlign: 'center' }}><span className="muted" style={{ fontSize: fz(14) }}>근처 {places.radius}m 안에 미술관·박물관·공연장이 없어요.</span><button className="btn sm ghost" onClick={find}>다시 찾기</button></div> :
          <div className="card col">{places.list.map((p, i) => (
            <button key={p.id} onClick={() => checkin(p)} className="row" style={{ border: 0, minHeight: 56, padding: '8px 14px', gap: 10, borderTop: i ? '1px solid var(--line)' : 0, background: 'none', color: 'var(--tx)', textAlign: 'left' }}>
              <span style={{ color: C.A }}><Icon name="pin" size={18} sw={2} /></span>
              <div className="col" style={{ flexGrow: 1, minWidth: 0 }}><span style={{ fontSize: fz(14), fontWeight: 700 }}>{p.name}</span><span className="dim" style={{ fontSize: fz(11) }}>{p.category} · {p.distance}m</span></div>
              <span className="chip" style={{ background: C.A, color: 'var(--bg)' }}>체크인</span></button>))}</div>}
      <span className="dim" style={{ fontSize: fz(12), textAlign: 'center', padding: '8px 0' }}>하루 최대 5P · 관람 인정은 최대 8P까지</span>
      {busy && <Busy text="체크인 중" />}
    </section>
  );
}

function ArtCheckinScreen({ back, replace, checkin, minMinutes }) {
  const min = (minMinutes || 20) * 60;
  const base = useRef({ at: Date.now(), el: checkin.elapsedSec || 0 });
  const [el, setEl] = useState(checkin.elapsedSec || 0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  useEffect(() => { const t = setInterval(() => setEl(base.current.el + (Date.now() - base.current.at) / 1000), 1000); return () => clearInterval(t); }, []);
  const ready = el >= min;
  const C2 = 2 * Math.PI * 96;
  async function checkout() {
    setBusy(true);
    try { const c = await getPosition(); const r = await api('artCheckout', { lat: c.latitude, lng: c.longitude }); setResult(r); }
    catch (e) { toast(e.message); }
    setBusy(false);
  }
  async function cancel() { setBusy(true); try { await api('artCancel'); back(); } catch (e) { toast(e.message); } setBusy(false); }
  if (result) return (
    <div className="app nonav fade">
      <div className="col" style={{ alignItems: 'center', padding: '90px 24px 0', gap: 12, textAlign: 'center' }}>
        <Badge e="A" size={72} /><span style={{ fontSize: fz(26), fontWeight: 900, marginTop: 8 }}>{result.points > 0 ? '예술 +' + result.points + 'P 인정!' : '관람을 기록했어요'}</span>
        <span className="muted" style={{ fontSize: fz(14) }}>{result.place} · {result.minutes}분 관람</span>
        {result.note && <span style={{ fontSize: fz(13), color: 'var(--a)' }}>{result.note}</span>}
      </div>
      <div className="pad col" style={{ marginTop: 'auto', gap: 10 }}>
        <button className="btn" onClick={() => replace('artEssay', { preset: { title: result.place, sub: result.place, checkinId: result.checkinId } })}>감상문 쓰고 +1P 더 받기</button>
        <button className="btn ghost" onClick={back}>나중에 할게요</button>
      </div>
    </div>
  );
  return (
    <div className="app nonav fade">
      <div className="row" style={{ padding: '22px 20px 0', justifyContent: 'space-between' }}>
        <button className="iconbtn" onClick={back} aria-label="뒤로" style={{ marginLeft: -12 }}><Icon name="back" size={24} sw={2.2} /></button>
        <div className="row" style={{ gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: 99, background: C.A, boxShadow: '0 0 0 5px rgba(255,179,92,.2)' }} /><span style={{ fontSize: fz(14), fontWeight: 800 }}>관람 중</span></div>
      </div>
      <div className="col" style={{ padding: '18px 20px 0', alignItems: 'center', gap: 6 }}>
        <div className="row" style={{ gap: 8 }}><Badge e="A" size={30} /><span style={{ fontSize: fz(18), fontWeight: 800, textAlign: 'center' }}>{checkin.place}</span></div>
        <span className="muted" style={{ fontSize: fz(13) }}>{checkin.category} · {String(checkin.enteredAt).slice(11, 16)} 입장 체크인</span>
      </div>
      <div style={{ paddingTop: 22, display: 'flex', justifyContent: 'center' }}><div style={{ position: 'relative', width: 232, height: 232 }}>
        <svg width="232" height="232" viewBox="0 0 232 232" fill="none"><circle cx="116" cy="116" r="96" stroke="var(--track)" strokeWidth="14" /><circle cx="116" cy="116" r="96" stroke={ready ? C.S : C.A} strokeWidth="14" strokeLinecap="round" strokeDasharray={`${C2 * Math.min(1, el / min)} ${C2}`} transform="rotate(-90 116 116)" /></svg>
        <div className="col" style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', gap: 2 }}><span className="muted" style={{ fontSize: fz(12), fontWeight: 600 }}>머문 시간</span><span style={{ fontSize: fz(54), fontWeight: 800, letterSpacing: -2, lineHeight: 1.05 }}>{fmtClock(el)}</span><span className="dim" style={{ fontSize: fz(13) }}>/ {fmtClock(min)}</span></div>
      </div></div>
      <div className="pad col" style={{ paddingTop: 22, gap: 10 }}>
        <div className="card row" style={{ padding: '14px 16px', gap: 12 }}>
          {ready ? <span style={{ fontSize: fz(13), lineHeight: 1.5, color: 'var(--t15)' }}><b style={{ color: 'var(--s)' }}>20분이 지났어요!</b> 장소 근처에서 퇴장 체크아웃을 누르면 예술 <b style={{ color: C.A }}>1P</b>가 들어가요</span> :
            <><span style={{ fontSize: fz(22), fontWeight: 800, color: C.A }}>{fmtClock(min - el)}</span><span style={{ flexGrow: 1, fontSize: fz(13), lineHeight: 1.5, color: 'var(--t15)' }}>뒤에 <b style={{ color: 'var(--tx)' }}>퇴장 체크아웃</b>을 누르면 예술 <b style={{ color: C.A }}>1P</b>가 자동으로 들어가요</span></>}
        </div>
        <div className="col" style={{ gap: 8, padding: '4px 4px 0' }}>{['관람하는 동안 화면을 꺼도 돼요. 나갈 때 앱을 열어 체크아웃하세요.', '입장·퇴장 위치만 확인하고 이동 경로는 저장하지 않아요.', '감상문까지 쓰면 +1P를 더 받을 수 있어요.'].map(t => <span key={t} className="row" style={{ gap: 8, fontSize: fz(12), lineHeight: 1.5, color: 'var(--t2)', alignItems: 'flex-start' }}><span style={{ flexShrink: 0, marginTop: 2 }}><Icon name="check" size={14} sw={2.6} color={C.S} /></span>{t}</span>)}</div>
      </div>
      <div className="pad col" style={{ marginTop: 'auto', paddingTop: 16, gap: 6 }}>
        <button className="btn" disabled={!ready || busy} onClick={checkout}>{ready ? '퇴장 체크아웃' : '퇴장 체크아웃 · ' + Math.ceil((min - el) / 60) + '분 후 가능'}</button>
        <button onClick={cancel} style={{ height: 44, background: 'none', border: 0, fontSize: fz(14), fontWeight: 600, color: 'var(--t2)' }}>체크인 취소</button>
      </div>
      {busy && <Busy text="확인 중" />}
    </div>
  );
}

/* ---------------------------------------------------------------- Run */
function RunTab({ go }) {
  const [gps, setGps] = useState(null);
  useEffect(() => {
    if (!navigator.geolocation) { setGps({ err: '이 기기에서는 GPS를 쓸 수 없어요.' }); return; }
    const id = navigator.geolocation.watchPosition(p => setGps({ acc: Math.round(p.coords.accuracy) }), e => setGps({ err: e.code === 1 ? '위치 권한을 허용해 주세요.' : '위치를 찾는 중이에요…' }), { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
    return () => navigator.geolocation.clearWatch(id);
  }, []);
  const good = gps && gps.acc && gps.acc <= 30;
  const se = seasonState();
  const checks = [['경로는 저장하지 않아요.', ' 거리와 시간만 남아요.'], ['', '시속 20km가 넘는 구간(자전거·차량)은 자동으로 빠져요.'], ['500m 이상', ' 뛰어야 기록으로 남아요. 짧으면 기록 없이 끝낼 수 있어요.'], ['바로 등급에 반영', '돼요. 선생님 승인이 필요 없어요.']];
  return (
    <div className="col fade" style={{ flexGrow: 1 }}>
      {!se.ok && <div className="row" style={{ margin: '14px 16px 0', padding: '14px 16px', borderRadius: 18, background: 'rgba(122,167,255,.10)', boxShadow: 'inset 0 0 0 1.5px rgba(122,167,255,.4)', gap: 12 }}>
        <span style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(122,167,255,.16)', color: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: fz(12), fontWeight: 900 }}>{se.before ? 'D-' + se.dday : '종료'}</span>
        <div className="col" style={{ gap: 2 }}><span style={{ fontSize: fz(15), fontWeight: 800 }}>{se.before ? '시즌은 ' + se.start.replace('.', '월 ') + '일에 시작해요' : '시즌이 끝났어요'}</span><span style={{ fontSize: fz(12), color: 'var(--t15)' }}>{se.before ? '그 전에 뛴 러닝은 기록에 남지 않아요 · 미리 연습만 해 두세요' : '이번 시즌 기록은 마감됐어요'}</span></div></div>}
      <section className="pad col" style={{ paddingTop: 16, gap: 12 }}>
        <div className="card col" style={{ padding: 20, gap: 18 }}>
          <div className="row" style={{ gap: 14 }}><Badge e="S" size={56} /><div className="col" style={{ gap: 2 }}><span style={{ fontSize: fz(20), fontWeight: 800 }}>GPS 러닝</span><span className="muted" style={{ fontSize: fz(13) }}>어디서 뛰어도 거리·시간 자동 기록</span></div></div>
          <div className="col" style={{ gap: 12 }}>{checks.map((c, i) => <div key={i} className="row" style={{ gap: 10, alignItems: 'flex-start' }}><span style={{ width: 20, height: 20, borderRadius: 99, background: TINT.S, color: C.S, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}><Icon name="check" size={13} sw={3} /></span><span style={{ fontSize: fz(14), lineHeight: 1.5, color: 'var(--t15)' }}>{c[0] && <b style={{ color: 'var(--tx)' }}>{c[0]}</b>}{c[1]}</span></div>)}</div>
          <div className="row" style={{ gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 14, background: 'rgba(255,179,92,.1)', boxShadow: 'inset 0 0 0 1px rgba(255,179,92,.25)', color: '#FFD29E', fontSize: fz(13), lineHeight: 1.5 }}><span style={{ flexShrink: 0, marginTop: 1 }}><Icon name="warn" size={16} sw={2.2} /></span><span>뛰는 동안 <b>화면을 켜 두고 이 앱을 띄워 두세요.</b> 다른 앱으로 넘어가면 측정이 멈춰요.</span></div>
        </div>
        <div className="row" style={{ gap: 8, padding: '0 4px', fontSize: fz(13) }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: good ? C.S : 'var(--a)', boxShadow: `0 0 0 4px ${good ? 'rgba(95,221,176,.18)' : 'rgba(255,179,92,.18)'}` }} />
          <span style={{ fontWeight: 700 }}>{!gps ? 'GPS 확인 중…' : gps.err ? gps.err : good ? 'GPS 신호 좋음' : 'GPS 신호 약함'}</span>{gps && gps.acc && <span className="muted">· 정확도 ±{gps.acc}m</span>}
        </div>
      </section>
      <div className="pad col" style={{ marginTop: 'auto', paddingTop: 16, gap: 10 }}>
        {se.ok ? <button className="btn s" style={{ height: 60, fontSize: fz(18) }} onClick={() => go('run')}><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z" /></svg>러닝 시작</button>
          : <span className="btn" style={{ height: 60, fontSize: fz(18), background: 'var(--sf2)', color: 'var(--t3)' }}>{se.before ? '러닝 시작 · ' + se.start + '부터' : '시즌 종료'}</span>}
        <span className="dim" style={{ fontSize: fz(12), textAlign: 'center' }}>{se.start ? '시즌 기간: ' + se.start + ' – ' + se.end + ' · ' : ''}앱으로 측정한 러닝 거리만 인정돼요</span>
      </div>
    </div>
  );
}

function liveMeasure(points) {
  let km = 0, ex = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i];
    const d = haversine(a[1], a[2], b[1], b[2]) / 1000, h = (b[0] - a[0]) / 3600000;
    if (h <= 0) continue;
    if (d / h > 20 || b[0] - a[0] > 120000) ex += d; else km += d;
  }
  return { km, ex };
}

function RunScreen({ back, replace }) {
  const saved = useMemo(() => { try { return JSON.parse(store.get('ras_run') || 'null'); } catch (e) { return null; } }, []);
  const [run, setRun] = useState(saved || { startedAt: Date.now(), points: [], paused: false, pausedTotal: 0, pausedAt: null });
  const [acc, setAcc] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);
  const [holding, setHolding] = useState(0);
  const [shortPanel, setShortPanel] = useState(false);
  const runRef = useRef(run); runRef.current = run;
  const wake = useRef(null);
  useEffect(() => {
    const req = () => { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(w => { wake.current = w; }).catch(() => {}); };
    req(); const vis = () => { if (document.visibilityState === 'visible') req(); };
    document.addEventListener('visibilitychange', vis);
    const t = setInterval(() => setNow(Date.now()), 1000);
    let id = null;
    if (navigator.geolocation) id = navigator.geolocation.watchPosition(p => {
      const c = p.coords; setAcc(Math.round(c.accuracy));
      const r = runRef.current; if (r.paused || c.accuracy > 50) return;
      const last = r.points[r.points.length - 1];
      const t = p.timestamp || Date.now();
      if (last && t - last[0] < 3000) return;
      const nr = { ...r, points: r.points.concat([[t, +c.latitude.toFixed(6), +c.longitude.toFixed(6), Math.round(c.accuracy)]]) };
      setRun(nr);
    }, () => {}, { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
    return () => { clearInterval(t); if (id !== null) navigator.geolocation.clearWatch(id); document.removeEventListener('visibilitychange', vis); if (wake.current) wake.current.release().catch(() => {}); };
  }, []);
  useEffect(() => { store.set('ras_run', JSON.stringify(run)); }, [run]);
  const m = liveMeasure(run.points);
  const elapsed = ((run.paused ? run.pausedAt : now) - run.startedAt - run.pausedTotal) / 1000;
  function togglePause() {
    setRun(r => r.paused ? { ...r, paused: false, pausedTotal: r.pausedTotal + (Date.now() - r.pausedAt), pausedAt: null } : { ...r, paused: true, pausedAt: Date.now() });
  }
  const holdT = useRef(null);
  function holdStart() { setHolding(1); const s = Date.now(); holdT.current = setInterval(() => { const p = (Date.now() - s) / 1000; setHolding(1 + p); if (p >= 1) { clearInterval(holdT.current); setHolding(0); finish(); } }, 50); }
  function holdEnd() { clearInterval(holdT.current); setHolding(0); }
  function discard() { store.set('ras_run', null); back(); }
  async function finish() {
    const r = runRef.current;
    const mm = liveMeasure(r.points);
    if (mm.km < 0.5) { if (!r.paused) togglePause(); setShortPanel(true); return; }
    setBusy(true);
    try {
      const res = await api('runSubmit', { points: r.points, startedAt: String(r.startedAt) });
      store.set('ras_run', null);
      replace('runDone', { res, startedAt: r.startedAt });
    } catch (e) {
      toast(e.message);
      if (e.server) { store.set('ras_run', null); back(); }
    }
    setBusy(false);
  }
  const toS = m.km;
  return (
    <div className="app nonav" style={{ padding: 'calc(env(safe-area-inset-top,0px) + 22px) 20px calc(env(safe-area-inset-bottom,0px) + 28px)' }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="row" style={{ gap: 8 }}><span style={{ width: 10, height: 10, borderRadius: 99, background: run.paused ? 'var(--a)' : 'var(--red)', boxShadow: `0 0 0 5px ${run.paused ? 'rgba(255,179,92,.2)' : 'rgba(255,107,90,.2)'}` }} /><span style={{ fontSize: fz(14), fontWeight: 800 }}>{run.paused ? '일시정지' : '측정 중'}</span></div>
        <span className="row" style={{ height: 30, padding: '0 12px', borderRadius: 999, background: 'var(--sf)', boxShadow: 'inset 0 0 0 1px var(--line)', gap: 6, fontSize: fz(12), fontWeight: 600, color: 'var(--t15)' }}><span style={{ width: 6, height: 6, borderRadius: 99, background: acc && acc <= 30 ? C.S : 'var(--a)' }} />GPS {acc ? '±' + acc + 'm' : '찾는 중'} · 화면 켜짐</span>
      </div>
      <div className="col" style={{ paddingTop: 48, alignItems: 'center', gap: 12 }}>
        <Badge e="S" size={36} />
        <DistBig km={toS} />
      </div>
      <div style={{ paddingTop: 36, display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10 }}>
        <div className="card col" style={{ padding: '14px 16px', gap: 2 }}><span className="muted" style={{ fontSize: fz(12) }}>시간</span><span style={{ fontSize: fz(32), fontWeight: 800, letterSpacing: -1 }}>{fmtClock(elapsed)}</span></div>
        <div className="card col" style={{ padding: '14px 16px', gap: 2 }}><span className="muted" style={{ fontSize: fz(12) }}>평균 페이스</span><span style={{ fontSize: fz(32), fontWeight: 800, letterSpacing: -1 }}>{fmtPace(elapsed, toS)}</span></div>
      </div>
      <span className="dim" style={{ fontSize: fz(12), textAlign: 'center', marginTop: 14 }}>{m.ex > 0.01 ? '제외된 구간 ' + Math.round(m.ex * 1000) + 'm · ' : ''}500m 이상 뛰면 기록돼요 · 경로는 저장되지 않아요</span>
      {shortPanel && <div className="col" style={{ margin: '16px 0 0', padding: 16, borderRadius: 20, background: 'rgba(255,179,92,.10)', boxShadow: 'inset 0 0 0 1.5px rgba(255,179,92,.45)', gap: 12 }}>
        <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}><span style={{ flexShrink: 0, marginTop: 2, color: 'var(--a)' }}><Icon name="warn" size={18} sw={2.2} /></span>
          <span style={{ fontSize: fz(14), lineHeight: 1.5 }}><b>500m 미만은 기록으로 남지 않아요.</b><br /><span style={{ color: 'var(--t15)' }}>지금까지 {Math.round(toS * 1000)}m · {Math.max(0, 500 - Math.round(toS * 1000))}m 더 뛰면 기록돼요</span></span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8 }}>
          <button className="btn" style={{ height: 48, borderRadius: 14, fontSize: fz(15) }} onClick={() => { setShortPanel(false); if (runRef.current.paused) togglePause(); }}>계속 뛰기</button>
          <button className="btn ghost" style={{ height: 48, borderRadius: 14, fontSize: fz(15) }} onClick={discard}>기록 없이 종료</button>
        </div></div>}
      <div className="row" style={{ marginTop: 'auto', gap: 12, justifyContent: 'center', paddingTop: 30 }}>
        <button aria-label={run.paused ? '다시 시작' : '일시정지'} onClick={togglePause} style={{ width: 76, height: 76, borderRadius: 999, border: 0, background: 'var(--sf)', boxShadow: 'inset 0 0 0 1px var(--line)', color: 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {run.paused ? <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z" /></svg> : <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>}</button>
        <button onPointerDown={holdStart} onPointerUp={holdEnd} onPointerLeave={holdEnd} onContextMenu={e => e.preventDefault()} style={{ position: 'relative', overflow: 'hidden', height: 76, flexGrow: 1, maxWidth: 230, borderRadius: 999, border: 0, background: 'var(--tx)', color: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none' }}>
          <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: holding ? Math.min(100, (holding - 1) * 100) + '%' : 0, background: 'rgba(255,107,90,.35)' }} />
          <span style={{ position: 'relative', fontSize: fz(18), fontWeight: 800 }}>종료</span><span style={{ position: 'relative', fontSize: fz(11), fontWeight: 600, color: '#5F656E' }}>길게 눌러서 종료</span></button>
      </div>
      <button onClick={discard} style={{ marginTop: 14, alignSelf: 'center', background: 'none', border: 0, fontSize: fz(13), fontWeight: 600, color: 'var(--t2)', textDecoration: 'underline', textUnderlineOffset: 3 }}>기록하지 않고 나가기</button>
      {busy && <Busy text="기록 저장 중" />}
    </div>
  );
}

function RunDoneScreen({ res, startedAt, home }) {
  const t = res.totals, L = res.levels;
  const d = new Date(Number(startedAt));
  const p = n => String(n).padStart(2, '0');
  return (
    <div className="app nonav fade">
      <div className="col" style={{ padding: '44px 20px 0', alignItems: 'center', gap: 12 }}>
        <span className="ras-badge" style={{ width: 72, height: 72, borderRadius: 999, backgroundImage: GRAD.S, boxShadow: `inset 0 1px 0 rgba(255,255,255,.45),0 10px 30px ${GLOW.S}`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={36} sw={3} /></span>
        <span style={{ fontSize: fz(26), fontWeight: 900 }}>러닝 완료</span>
        <span className="muted" style={{ fontSize: fz(13) }}>{d.getMonth() + 1}. {d.getDate()} {p(d.getHours())}:{p(d.getMinutes())} 시작 · 등급에 자동 반영됐어요</span>
      </div>
      <div className="pad col" style={{ paddingTop: 22, gap: 10 }}>
        <div className="card" style={{ padding: '18px 12px', display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', textAlign: 'center' }}>
          <div className="col" style={{ gap: 2 }}><span className="muted" style={{ fontSize: fz(12) }}>거리</span><span style={{ fontSize: fz(28), fontWeight: 800, color: C.S }}>{res.km < 1 ? Math.round(res.km * 1000) : res.km.toFixed(2)}<span style={{ fontSize: fz(13) }}>{res.km < 1 ? 'm' : 'km'}</span></span></div>
          <div className="col" style={{ gap: 2, boxShadow: '-1px 0 0 var(--line)' }}><span className="muted" style={{ fontSize: fz(12) }}>시간</span><span style={{ fontSize: fz(28), fontWeight: 800 }}>{fmtClock(res.seconds)}</span></div>
          <div className="col" style={{ gap: 2, boxShadow: '-1px 0 0 var(--line)' }}><span className="muted" style={{ fontSize: fz(12) }}>페이스</span><span style={{ fontSize: fz(28), fontWeight: 800 }}>{fmtPace(res.seconds, res.km)}</span></div>
        </div>
        <div className="card col" style={{ padding: 18, gap: 12 }}>
          <div className="row" style={{ gap: 12 }}><Badge e="S" size={40} lv={t.lv.S} />
            <div className="col" style={{ flexGrow: 1 }}><span style={{ fontSize: fz(15), fontWeight: 700 }}>러닝 기록</span><span style={{ fontSize: fz(12), fontWeight: 600, color: C.S }}>{t.lv.S ? 'LV.' + t.lv.S + ' ' + L.names[t.lv.S - 1] : '시작 전'}</span></div>
            <span style={{ fontSize: fz(24), fontWeight: 800 }}>{fmtNum(t.S)}<span className="muted" style={{ fontSize: fz(13) }}>km</span></span></div>
          <Segs value={t.S} th={L.S} color={C.S} h={6} />
          {t.lv.S < 5 && <span className="muted" style={{ fontSize: fz(12) }}>LV.{t.lv.S + 1} {L.names[t.lv.S]}까지 {fmtNum(Math.round((L.S[t.lv.S] - t.S) * 100) / 100)}km 남았어요</span>}
        </div>
        {res.excludedKm > 0.01 && <span className="dim" style={{ padding: '0 6px', fontSize: fz(12) }}>빠른 이동·신호 끊김 구간 {Math.round(res.excludedKm * 1000)}m는 제외됐어요</span>}
      </div>
      <div className="pad" style={{ marginTop: 'auto', paddingTop: 20 }}><button className="btn" onClick={home}>홈으로</button></div>
    </div>
  );
}

function IronmanScreen({ back }) {
  const [st] = useAsync(() => api('home'), []);
  if (!st.data) return <div className="app nonav"><div style={{ padding: 60, display: 'flex', justifyContent: 'center' }}><Spinner /></div></div>;
  const d = st.data, t = d.totals;
  return (
    <div className="app nonav fade" style={{ background: 'radial-gradient(60% 40% at 50% 30%, rgba(169,155,255,.18) 0%, rgba(11,12,14,0) 100%)' }}>
      <div className="col" style={{ alignItems: 'center', padding: '40px 24px 0', gap: 20 }}>
        <span style={{ fontSize: fz(12), fontWeight: 700, letterSpacing: 3, color: 'var(--t2)' }}>{d.season.name} · <span className="ras-title" style={{ fontWeight: 900 }}>RAS</span> 철인3종</span>
        <div style={{ position: 'relative' }}><Triangle pct={t.pct} size={240} /></div>
        <div className="col" style={{ alignItems: 'center', gap: 4 }}><span style={{ fontSize: fz(12), fontWeight: 800, letterSpacing: 4, color: 'var(--gold)' }}>IRONMAN</span><span style={{ fontSize: fz(56), fontWeight: 900, letterSpacing: -3 }}>철인</span><span style={{ fontSize: fz(22), fontWeight: 900 }}>{d.profile.nick}</span></div>
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 8 }}>
          {['R', 'A', 'S'].map(e => <div key={e} className="card col" style={{ padding: '14px 8px', alignItems: 'center', gap: 8 }}><Badge e={e} size={32} lv={5} /><span style={{ fontSize: fz(20), fontWeight: 800 }}>{fmtNum(t[e])}{d.levels.unit[e]}</span></div>)}
        </div>
        <span style={{ fontSize: fz(14), lineHeight: 1.6, color: 'var(--t15)', textAlign: 'center' }}>세 종목 모두 LV.5 아이언 달성!<br />이 화면을 캡처해서 친구들에게 자랑해 보세요.</span>
      </div>
      <div className="pad" style={{ marginTop: 'auto', paddingTop: 20 }}><button className="btn ghost" onClick={back}>홈으로</button></div>
    </div>
  );
}

/* ---------------------------------------------------------------- Student app shell */
function StudentApp() {
  const [phase, setPhase] = useState({ s: 'loading' });
  const [stack, setStack] = useState([]);
  const [tab, setTab] = useState('home');
  const [refreshKey, setRefreshKey] = useState(0);
  const check = useCallback(() => {
    if (!store.get('ras_token')) { setPhase({ s: 'join' }); return; }
    api('session').then(r => {
      if (r.status === '승인') { if (r.season) store.set('ras_season', JSON.stringify(r.season)); setPhase({ s: 'main', profile: r.profile }); }
      else if (r.status === '대기') setPhase({ s: 'wait', req: r.request });
      else if (r.status === '반려') setPhase({ s: 'join', rejected: true, prev: r.request });
      else { store.set('ras_token', null); setPhase({ s: 'join' }); }
    }).catch(e => setPhase(p => p.s === 'loading' ? { s: 'error', msg: e.message } : p));
  }, []);
  useEffect(() => { check(); }, []);
  useEffect(() => {
    if (phase.s === 'main' && store.get('ras_run')) go('run');
  }, [phase.s]);
  useEffect(() => {
    const onPop = () => setStack(s => s.slice(0, -1));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const go = useCallback((name, props) => { history.pushState({ d: Date.now() }, ''); setStack(s => s.concat([{ name, props: props || {} }])); }, []);
  const back = useCallback(() => { history.back(); }, []);
  const replace = useCallback((name, props) => setStack(s => s.slice(0, -1).concat([{ name, props: props || {} }])), []);
  const home = useCallback(() => { const n = stack.length; setStack([]); setTab('home'); if (n) history.go(-n); }, [stack.length]);
  useEffect(() => { if (stack.length === 0) setRefreshKey(k => k + 1); }, [stack.length]);

  if (phase.s === 'loading') return <div className="app nonav" style={{ alignItems: 'center', justifyContent: 'center' }}><Logo big /></div>;
  if (phase.s === 'error') return <div className="app nonav"><ErrorBox msg={phase.msg} onRetry={() => { setPhase({ s: 'loading' }); check(); }} /></div>;
  if (phase.s === 'join') return <JoinScreen onDone={check} prev={phase.prev} rejected={phase.rejected} />;
  if (phase.s === 'wait') return <WaitScreen req={phase.req} onCheck={check} onEdit={() => setPhase({ s: 'join', prev: phase.req })} />;

  const top = stack[stack.length - 1];
  if (top) {
    const p = top.props || {};
    const common = { back, go, replace, home };
    switch (top.name) {
      case 'record': return <RecordScreen {...common} item={p} tab={p.tab || store.get('ras_tab') || 'R'} />;
      case 'quiz': return <QuizScreen {...common} book={p.book} />;
      case 'quizResult': return <QuizResultScreen {...common} result={p.result} />;
      case 'bookEssay': return <EssayForm kind="R" back={back} done={() => replace('submitted', { kind: 'R' })} />;
      case 'artEssay': return <EssayForm kind="A" back={back} preset={p.preset} done={() => replace('submitted', { kind: 'A' })} />;
      case 'submitted': return <SubmittedScreen home={home} kind={p.kind} />;
      case 'artCheckin': return <ArtCheckinScreen {...common} checkin={p.checkin} minMinutes={p.minMinutes} />;
      case 'run': return <RunScreen {...common} />;
      case 'runDone': return <RunDoneScreen {...common} res={p.res} startedAt={p.startedAt} />;
      case 'grades': return <GradesScreen back={back} levels={p.levels} />;
      case 'records': return <RecordsScreen back={back} />;
      case 'ironman': return <IronmanScreen back={back} />;
      default: return null;
    }
  }
  return (
    <div className="app">
      {tab === 'home' ? <HomeScreen go={go} refreshKey={refreshKey} /> : <RankingScreen />}
      <nav className="nav">
        <button className={tab === 'home' ? 'on' : ''} onClick={() => setTab('home')}><Icon name="home" />홈</button>
        <button className="plus" aria-label="기록하기" onClick={() => go('record', { tab: store.get('ras_tab') || 'R' })}><Icon name="plus" sw={2.4} /></button>
        <button className={tab === 'rank' ? 'on' : ''} onClick={() => setTab('rank')}><Icon name="trophy" />랭킹</button>
      </nav>
    </div>
  );
}

/* ---------------------------------------------------------------- Admin */
function TextScaleProbe() {
  const [v, setV] = useState(null);
  useEffect(() => { setV(window.RAS_TEXT_SCALE || 1); }, []);
  return (
    <div style={{ marginTop: 16, textAlign: 'center', fontSize: fz(11), color: 'var(--t3)' }}>
      화면 점검 · 브라우저 글자 배율 {v === null ? '-' : Math.round(v * 100) + '%'}{v && Math.abs(v - 1) > 0.02 ? ' → 자동 보정됨' : ''} · 폭 {window.innerWidth}px
    </div>
  );
}

function AdminApp() {
  const [tokenA, setTokenA] = useState(store.sget('ras_admin'));
  const [pw, setPw] = useState('');
  const [tab, setTab] = useState('queue');
  const [sum, setSum] = useState(null);
  const [tick, setTick] = useState(0);
  const call = useCallback((action, data) => api(action, Object.assign({ adminToken: store.sget('ras_admin') }, data || {})).catch(e => { if (/관리자 로그인/.test(e.message)) { store.sset('ras_admin', null); setTokenA(null); } throw e; }), []);
  useEffect(() => { if (tokenA) call('adminSummary').then(setSum).catch(() => {}); }, [tokenA, tick]);
  const refresh = () => setTick(t => t + 1);
  async function login() {
    try { const r = await api('adminLogin', { password: pw }); store.sset('ras_admin', r.adminToken); setTokenA(r.adminToken); } catch (e) { toast(e.message); }
  }
  if (!tokenA) return (
    <div className="app nonav" style={{ justifyContent: 'center', padding: 24 }}>
      <Logo big />
      <div className="card col" style={{ marginTop: 28, padding: 20, gap: 12 }}>
        <span style={{ fontSize: fz(17), fontWeight: 800 }}>교사 관리 화면</span>
        <input id="apw" className="input" type="password" placeholder="관리자 비밀번호" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()} />
        <button className="btn" onClick={login} disabled={!pw}>로그인</button>
      </div>
      <TextScaleProbe />
    </div>
  );
  const tabs = [['queue', '승인함', sum && sum.recordPending], ['join', '가입 승인', sum && sum.joinPending], ['award', '교내 행사 인증'], ['people', '참가자']];
  return (
    <div className="adm fade">
      <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div className="row" style={{ gap: 10, alignItems: 'baseline' }}><span className="ras-title" style={{ fontSize: fz(30), fontWeight: 900, letterSpacing: -1 }}>RAS</span><span style={{ fontSize: fz(17), fontWeight: 800 }}>철인3종</span><span className="dim" style={{ fontSize: fz(12) }}>관리자</span></div>
        <button className="btn sm ghost" onClick={() => { store.sset('ras_admin', null); setTokenA(null); }}>로그아웃</button>
      </div>
      {sum && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10, marginTop: 16 }}>
        {[['참가자', sum.participants, '명'], ['가입 승인 대기', sum.joinPending, '건'], ['기록 승인 대기', sum.recordPending, '건'], ['이번 주 러닝', sum.runsThisWeek, '건'], ['철인 달성', sum.ironmen, '명']].map(([a, b, u]) =>
          <div key={a} className="card col" style={{ padding: '14px 16px', gap: 2 }}><span className="muted" style={{ fontSize: fz(12) }}>{a}</span><span style={{ fontSize: fz(26), fontWeight: 800 }}>{b}<span className="muted" style={{ fontSize: fz(13) }}>{u}</span></span></div>)}
      </div>}
      <div className="tabbar" style={{ marginTop: 16 }}>{tabs.map(([k, n, c]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{n}{c ? <span className="pill">{c}</span> : null}</button>)}</div>
      <div style={{ marginTop: 14 }}>
        {tab === 'queue' && <AdminQueue call={call} onChange={refresh} />}
        {tab === 'join' && <AdminJoin call={call} onChange={refresh} />}
        {tab === 'award' && <AdminAward call={call} onChange={refresh} />}
        {tab === 'people' && <AdminPeople call={call} />}
      </div>
    </div>
  );
}

function AdminJoin({ call, onChange }) {
  const [st, reload] = useAsync(() => call('adminJoinList'), []);
  const [sel, setSel] = useState({});
  const [nicks, setNicks] = useState({});
  const [busy, setBusy] = useState(false);
  async function decide(ids, decision, nick) {
    setBusy(true);
    try { const r = await call('adminJoinDecide', { ids, decision, nick }); toast(r.done + '건 ' + decision + ' 처리했어요'); setSel({}); reload(); onChange(); } catch (e) { toast(e.message); }
    setBusy(false);
  }
  if (st.loading) return <Spinner />;
  if (st.error) return <ErrorBox msg={st.error} onRetry={reload} />;
  const list = st.data.requests;
  const chosen = Object.keys(sel).filter(k => sel[k]);
  return (
    <div className="col" style={{ gap: 10 }}>
      <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span className="muted" style={{ fontSize: fz(13) }}>학생이 입력한 학번·이름이 명렬표와 맞는지만 보고 승인하세요.</span>
        <button className="btn sm s" disabled={!chosen.length || busy} onClick={() => decide(chosen, '승인')}>선택 {chosen.length}건 일괄 승인</button>
      </div>
      {list.length === 0 && <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--t2)' }}>대기 중인 가입 신청이 없어요.</div>}
      {list.map(q => (
        <div key={q.id} className="card" style={{ padding: 14, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', boxShadow: q.warning.indexOf('같은 학번') >= 0 ? 'inset 0 0 0 1.5px rgba(255,107,90,.5)' : undefined }}>
          <input type="checkbox" checked={!!sel[q.id]} onChange={e => setSel(s => ({ ...s, [q.id]: e.target.checked }))} aria-label="선택" />
          <div className="col" style={{ minWidth: 150, flexGrow: 1, gap: 3 }}>
            <span style={{ fontSize: fz(16), fontWeight: 800 }}>{q.hakbun} {q.name}</span>
            <span className="dim" style={{ fontSize: fz(12) }}>{q.time.slice(5, 16)} 신청</span>
            {q.warning && <span style={{ fontSize: fz(12), fontWeight: 700, color: q.warning.indexOf('같은 학번') >= 0 ? 'var(--red)' : 'var(--a)' }}>{q.warning}</span>}
          </div>
          <label className="col" style={{ gap: 4 }}><span className="dim" style={{ fontSize: fz(11) }}>닉네임 (고칠 수 있어요)</span>
            <input className="input" style={{ height: 40, width: 130, fontSize: fz(14) }} maxLength={10} value={nicks[q.id] !== undefined ? nicks[q.id] : q.nick} onChange={e => setNicks(n => ({ ...n, [q.id]: e.target.value.trim() }))} /></label>
          <div className="row" style={{ gap: 6 }}>
            <button className="btn sm ghost" disabled={busy} onClick={() => decide([q.id], '반려')}>반려</button>
            <button className="btn sm" disabled={busy} onClick={() => decide([q.id], '승인', nicks[q.id] !== undefined ? nicks[q.id] : q.nick)}>승인</button>
          </div>
        </div>))}
    </div>
  );
}

function AdminQueue({ call, onChange }) {
  const [st, reload] = useAsync(() => call('adminQueue'), []);
  const [open, setOpen] = useState({});
  const [busy, setBusy] = useState(false);
  async function decide(id, decision) {
    setBusy(true);
    try { await call('adminDecide', { ids: [id], decision }); toast(decision + ' 처리했어요'); reload(); onChange(); } catch (e) { toast(e.message); }
    setBusy(false);
  }
  if (st.loading) return <Spinner />;
  if (st.error) return <ErrorBox msg={st.error} onRetry={reload} />;
  const list = st.data.records;
  return (
    <div className="col" style={{ gap: 10 }}>
      {list.length === 0 && <div className="card" style={{ padding: 20, textAlign: 'center', color: 'var(--t2)' }}>확인할 기록이 없어요. 퀴즈·러닝·체크인은 자동으로 반영돼요.</div>}
      {list.map(r => (
        <div key={r.id} className="card col" style={{ padding: 14, gap: 10 }}>
          <div className="row" style={{ gap: 12, flexWrap: 'wrap' }}>
            <Badge e={r.event} size={32} />
            <div className="col" style={{ flexGrow: 1, minWidth: 180, gap: 2 }}>
              <span style={{ fontSize: fz(15), fontWeight: 800 }}>{r.hakbun} {r.name} · {r.type}</span>
              <span style={{ fontSize: fz(13), color: 'var(--t15)' }}>{r.text}</span>
              <span className="dim" style={{ fontSize: fz(12) }}>{r.time.slice(5, 16)} · {r.memo}</span>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <button className="btn sm ghost" onClick={() => setOpen(o => ({ ...o, [r.id]: !o[r.id] }))}>{open[r.id] ? '접기' : '답 보기'}</button>
              <button className="btn sm ghost" disabled={busy} onClick={() => decide(r.id, '반려')}>반려</button>
              <button className="btn sm" disabled={busy} onClick={() => decide(r.id, '인정')}>인정</button>
            </div>
          </div>
          {open[r.id] && r.detail && <div className="col" style={{ gap: 8, padding: 12, borderRadius: 14, background: 'var(--sf3)', fontSize: fz(14), lineHeight: 1.65 }}>
            {r.detail.sub && <span className="muted">{r.event === 'R' ? '저자' : '장소'}: {r.detail.sub} {r.detail.date ? '· ' + r.detail.date : ''}{r.detail.checkinId ? ' · 체크인 연결됨' : ''}</span>}
            <span><b style={{ color: C[r.event] }}>Q1</b> {r.detail.a1}</span><span><b style={{ color: C[r.event] }}>Q2</b> {r.detail.a2}</span></div>}
        </div>))}
    </div>
  );
}

function AdminAward({ call, onChange }) {
  const [st] = useAsync(() => call('adminParticipants'), []);
  const [kind, setKind] = useState('체험');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10));
  const [q, setQ] = useState('');
  const [sel, setSel] = useState({});
  const [extra, setExtra] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const people = st.data ? st.data.participants : [];
  const shown = people.filter(p => !q || (p.hakbun + p.name + p.nick).indexOf(q) >= 0);
  const hakbuns = Array.from(new Set(Object.keys(sel).filter(k => sel[k]).concat(extra.split(/[\s,]+/).filter(x => /^\d{5}$/.test(x)))));
  async function submit() {
    setBusy(true);
    try { const r = await call('adminAward', { kind, title, date, hakbuns }); setResult(r.results); setSel({}); setExtra(''); onChange(); } catch (e) { toast(e.message); }
    setBusy(false);
  }
  return (
    <div className="col" style={{ gap: 12 }}>
      <div className="card col" style={{ padding: 16, gap: 12 }}>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          {[['체험', '체험 · 동아리 · 방과후 2P'], ['출연', '출연 · 출품 3P']].map(([k, n]) => <button key={k} onClick={() => setKind(k)} className="btn sm" style={{ background: kind === k ? C.A : 'var(--sf2)', color: kind === k ? 'var(--bg)' : 'var(--tx)' }}>{n}</button>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 160px', gap: 8 }}>
          <input className="input" placeholder="행사·활동 이름 (예: 합창 발표회)" value={title} onChange={e => setTitle(e.target.value)} />
          <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <textarea className="ta" rows={2} placeholder="학번을 붙여넣어도 돼요 (예: 20312, 10507)" value={extra} onChange={e => setExtra(e.target.value)} />
        <input className="input" style={{ height: 44 }} placeholder="참가자 검색 (학번·이름·닉네임)" value={q} onChange={e => setQ(e.target.value)} />
        <div style={{ maxHeight: 280, overflow: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))', gap: 6 }}>
          {shown.map(p => <label key={p.hakbun} className="row" style={{ gap: 8, padding: '8px 10px', borderRadius: 12, background: sel[p.hakbun] ? TINT.A : 'var(--sf3)', fontSize: fz(14) }}><input type="checkbox" checked={!!sel[p.hakbun]} onChange={e => setSel(s => ({ ...s, [p.hakbun]: e.target.checked }))} />{p.hakbun} {p.name}</label>)}
        </div>
        <button className="btn" disabled={!title.trim() || !hakbuns.length || busy} onClick={submit}>{hakbuns.length}명에게 {kind === '출연' ? 3 : 2}P 인증하기</button>
        <span className="dim" style={{ fontSize: fz(12) }}>하루 최대 5P를 넘는 부분은 자동으로 빠져요.</span>
      </div>
      {result && <div className="card col" style={{ padding: 14, gap: 6 }}><b>처리 결과</b>{result.map(r => <span key={r.hakbun} style={{ fontSize: fz(13), color: r.ok ? 'var(--t15)' : 'var(--red)' }}>{r.hakbun} · {r.ok ? '+' + r.points + 'P' : ''} {r.note || ''}</span>)}</div>}
    </div>
  );
}

function AdminPeople({ call }) {
  const [st, reload] = useAsync(() => call('adminParticipants'), []);
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState(null);
  async function saveNick(hb, nick) { try { await call('adminSetNick', { hakbun: hb, nick }); toast('닉네임을 바꿨어요'); setEdit(null); reload(); } catch (e) { toast(e.message); } }
  async function logout(hb) { try { await call('adminLogoutStudent', { hakbun: hb }); toast('이 학생의 모든 휴대폰을 로그아웃했어요. 비밀번호로 다시 로그인하면 돼요.'); } catch (e) { toast(e.message); } }
  const [pwFor, setPwFor] = useState(null);
  const [newPw, setNewPw] = useState('');
  async function resetPw() { try { await call('adminSetPassword', { hakbun: pwFor, password: newPw }); toast(pwFor + ' 비밀번호를 바꿨어요. 학생에게 알려주세요.'); setPwFor(null); setNewPw(''); } catch (e) { toast(e.message); } }
  if (st.loading) return <Spinner />;
  if (st.error) return <ErrorBox msg={st.error} onRetry={reload} />;
  const list = st.data.participants.filter(p => !q || (p.hakbun + p.name + p.nick).indexOf(q) >= 0).sort((a, b) => a.hakbun < b.hakbun ? -1 : 1);
  return (
    <div className="col" style={{ gap: 10 }}>
      <input className="input" style={{ height: 44 }} placeholder="검색 (학번·이름·닉네임)" value={q} onChange={e => setQ(e.target.value)} />
      {pwFor && <div className="card row" style={{ padding: 14, gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: fz(14), fontWeight: 700 }}>{pwFor} 새 비밀번호</span>
        <input className="input" style={{ height: 40, width: 160, fontSize: fz(14) }} placeholder="4자 이상" value={newPw} onChange={e => setNewPw(e.target.value.replace(/\s/g, ''))} />
        <button className="btn sm" disabled={newPw.length < 4} onClick={resetPw}>바꾸기</button><button className="btn sm ghost" onClick={() => setPwFor(null)}>취소</button>
        <span className="dim" style={{ fontSize: fz(12), width: '100%' }}>바꾸면 이 학생의 모든 휴대폰이 로그아웃되고, 새 비밀번호로 다시 로그인해야 해요.</span></div>}
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fz(14), minWidth: 620 }}>
          <thead><tr style={{ color: 'var(--t3)', fontSize: fz(12), textAlign: 'left' }}>{['학번', '이름', '닉네임', 'R 권', 'A P', 'S km', '종합', 'RAS', ''].map(h => <th key={h} style={{ padding: '12px 10px', borderBottom: '1px solid var(--line)' }}>{h}</th>)}</tr></thead>
          <tbody>{list.map(p => <tr key={p.hakbun} style={{ borderBottom: '1px solid var(--line)' }}>
            <td style={{ padding: 10, fontWeight: 700 }}>{p.hakbun}</td><td style={{ padding: 10 }}>{p.name}</td>
            <td style={{ padding: 10 }}>{edit && edit.hb === p.hakbun ? <span className="row" style={{ gap: 4 }}><input className="input" style={{ height: 34, width: 110, fontSize: fz(13) }} value={edit.v} maxLength={10} onChange={e => setEdit({ hb: p.hakbun, v: e.target.value.trim() })} /><button className="btn sm" style={{ height: 34 }} onClick={() => saveNick(p.hakbun, edit.v)}>저장</button></span> : <button onClick={() => setEdit({ hb: p.hakbun, v: p.nick })} style={{ background: 'none', border: 0, color: 'var(--tx)', textDecoration: 'underline dotted', fontSize: fz(14) }}>{p.nick}</button>}</td>
            <td style={{ padding: 10, color: C.R }}>{fmtNum(p.R)}</td><td style={{ padding: 10, color: C.A }}>{fmtNum(p.A)}</td><td style={{ padding: 10, color: C.S }}>{fmtNum(p.S)}</td>
            <td style={{ padding: 10 }}>LV.{p.overall}</td><td style={{ padding: 10, fontWeight: 800 }}>{p.ras}</td>
            <td style={{ padding: 10 }}><span className="row" style={{ gap: 4 }}><button className="btn sm ghost" style={{ height: 32, fontSize: fz(12) }} onClick={() => { setPwFor(p.hakbun); setNewPw(''); }}>비밀번호 재설정</button><button className="btn sm ghost" style={{ height: 32, fontSize: fz(12) }} onClick={() => logout(p.hakbun)}>로그아웃</button></span></td></tr>)}</tbody>
        </table>
        {list.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: 'var(--t2)' }}>참가자가 없어요.</div>}
      </div>
    </div>
  );
}

function Root() {
  const [msg, setMsg] = useState(null);
  useEffect(() => { toastSet = m => { setMsg(m); clearTimeout(window.__tt); window.__tt = setTimeout(() => setMsg(null), 3200); }; }, []);
  const isAdmin = !!window.RAS_ADMIN || location.hash.replace('#', '') === 'admin';
  return <>{isAdmin ? <AdminApp /> : <StudentApp />}{msg && <div className="toast fade" role="status">{msg}</div>}</>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js', { scope: './' }).catch(() => {});
