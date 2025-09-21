"use strict";
// ================== AUTO FILL (tab aktif) ================== //
function autoFillActiveTab() {
  const R = parseInt(byId("roundCount").value || "10", 10);
  players = Array.from(byId("playersList").querySelectorAll(".player-name"))
    .map((el) => el.textContent.trim())
    .filter(Boolean);
  if (players.length < 4) return;

  const other = activeTab === 1 ? rounds2 : rounds1;
  let target = activeTab === 1 ? rounds1 : rounds2;
  target = [];

  const seenAppear = Object.fromEntries(players.map((p) => [p, 0]));
  function chooseFour(i) {
    const busy = new Set();
    const o = other[i] || {};
    [o?.a1, o?.a2, o?.b1, o?.b2].forEach((x) => x && busy.add(x));
    const cand = players.filter((p) => !busy.has(p));
    cand.sort((a, b) => seenAppear[a] - seenAppear[b] || a.localeCompare(b));
    if (cand.length < 4) return null;
    return [cand[0], cand[1], cand[2], cand[3]];
  }

  for (let i = 0; i < R; i++) {
    let four = chooseFour(i);
    if (!four) {
      const busy = new Set();
      const o = other[i] || {};
      [o?.a1, o?.a2, o?.b1, o?.b2].forEach((x) => x && busy.add(x));
      four = players.filter((p) => !busy.has(p)).slice(0, 4);
      if (four.length < 4) {
        target.push({});
        continue;
      }
    }
    const [A, B, C, D] = four;
    // pasangan boleh sama; cek lawan dilakukan di validateAll per lapangan
    target.push({ a1: A, a2: B, b1: C, b2: D, scoreA: "", scoreB: "" });
    seenAppear[A]++;
    seenAppear[B]++;
    seenAppear[C]++;
    seenAppear[D]++;
  }

  if (activeTab === 1) rounds1 = target;
  else rounds2 = target;
}

function autoFillActiveCourt(){
  const R = parseInt(byId('roundCount').value || '10', 10);
  const pairMode = byId('pairMode') ? byId('pairMode').value : 'free';

  // ambil nama terbaru
  players = Array.from(byId('playersList').querySelectorAll('.player-name'))
            .map(el=>el.textContent.trim()).filter(Boolean);
  if(players.length<4) return;

  const metaOf = p => (playerMeta && playerMeta[p]) ? playerMeta[p] : {};
  const fitsTeamRule=(x,y)=>{
    if (pairMode==='free') return true;
    const mx=metaOf(x), my=metaOf(y);
    if (pairMode==='mixed'){
      if(!mx.gender || !my.gender) return false;
      return mx.gender!==my.gender;
    }
    if (pairMode==='lvl_same'){
      return mx.level && my.level && mx.level===my.level;
    }
    if (pairMode==='lvl_bal'){ return true; } // cek di akhir per-tim
    return true;
  };

  // --- 1) target fairness ----------------------------------------------------
  // base = kemunculan di lapangan lain (karena lapangan aktif akan di-overwrite)
  const base = countAppearAll(activeCourt);
  const totalBase = players.reduce((s,p)=>s+(base[p]||0),0);
  const S = R*4;                                   // slot yang harus diisi di court aktif
  const totalAfter = totalBase + S;
  const minAppear = Math.floor(totalAfter / players.length);
  const remainder = totalAfter % players.length;

  const order = players.slice().sort((a,b)=>{
    const da=(base[a]||0), db=(base[b]||0);
    if(da!==db) return da-db;
    return Math.random()-0.5;                      // tie break acak
  });

  const targetTotal = {};
  order.forEach((p,i)=> targetTotal[p] = minAppear + (i<remainder?1:0));
  const need = Object.fromEntries(players.map(p=>[p,Math.max(0,(targetTotal[p]||0)-(base[p]||0))]));
  // jumlah need dijamin = S

  // --- 2) persiapan jadwal ---------------------------------------------------
  const otherCourts = roundsByCourt.filter((_,i)=>i!==activeCourt);
  const target = new Array(R).fill(null);
  const seenOpp  = new Set(); // hindari lawan sama di court aktif
  const seenMatch= new Set();

  // daftar ronde akan diisi dalam urutan acak
  const roundOrder = shuffleInPlace([...Array(R).keys()]);

  // helper: cari 4 pemain utk ronde i (utamakan yang need besar & tidak bentrok)
  function pickFourForRound(i){
    const busy = new Set();
    otherCourts.forEach(c=>{ const r=c[i]; if(r) [r.a1,r.a2,r.b1,r.b2].forEach(x=>x&&busy.add(x)); });

    const freeAll = players.filter(p=>!busy.has(p));
    if (freeAll.length<4) return null;

    // buat pool dengan bobot "need" agar yang butuh lebih sering terambil
    let pool=[];
    freeAll.forEach(p=>{
      const w=Math.max(1,need[p]);
      for(let k=0;k<w;k++) pool.push(p);
    });
    // sampling beberapa kombinasi unik berbobot need
    const tried=new Set();
    for(let t=0;t<120;t++){
      shuffleInPlace(pool);
      const combo=[];
      for(const x of pool){ if(!combo.includes(x)) combo.push(x); if(combo.length===4) break; }
      if(combo.length<4) break;
      const key=combo.slice().sort().join('|');
      if(tried.has(key)) continue;
      tried.add(key);

      // minimal 3 dari 4 harus "need>0" agar fairness kuat
      const needCount = combo.filter(p=>need[p]>0).length;
      if(needCount>=3) return combo;
    }
    // fallback deterministik: urut by need desc lalu random kecil
    const cand=freeAll.slice().sort((a,b)=>{
      const dv=need[b]-need[a];
      if(dv!==0) return dv;
      return Math.random()-0.5;
    });
    return cand.slice(0,4);
  }

  // helper: bentuk 2 tim dari 4 pemain
  function makeMatch(four){
    const opts = shuffleInPlace([
      {a1:four[0], a2:four[1], b1:four[2], b2:four[3]},
      {a1:four[0], a2:four[2], b1:four[1], b2:four[3]},
      {a1:four[0], a2:four[3], b1:four[1], b2:four[2]},
    ]);

    // 2-phase: (A) strict anti-rematch, (B) longgar anti-rematch jika buntu
    for (const phase of [ 'strict', 'loose' ]){
      for(const o of opts){
        if(!fitsTeamRule(o.a1,o.a2)) continue;
        if(!fitsTeamRule(o.b1,o.b2)) continue;

        if (pairMode==='lvl_bal'){
          const AB=[metaOf(o.a1).level, metaOf(o.a2).level];
          const CD=[metaOf(o.b1).level, metaOf(o.b2).level];
          const okAB = AB.includes('beg') && AB.includes('pro');
          const okCD = CD.includes('beg') && CD.includes('pro');
          if(!(okAB && okCD)) continue;
        }

        const mKey = vsKey(teamKey(o.a1,o.a2), teamKey(o.b1,o.b2));
        if (seenMatch.has(mKey)) continue;

        const oppPairs=[vsKey(o.a1,o.b1),vsKey(o.a1,o.b2),vsKey(o.a2,o.b1),vsKey(o.a2,o.b2)];
        const hasOppRematch = oppPairs.some(k=>seenOpp.has(k));
        if (phase==='strict' && hasOppRematch) continue;

        return o;
      }
    }
    return null;
  }

  for(const i of roundOrder){
    let four = pickFourForRound(i);
    if(!four){ target[i]={}; continue; }

    // coba beberapa kali agar lolos rule pairing + anti-duplikat lawan
    let picked=null;
    for(let t=0;t<10 && !picked; t++){
      shuffleInPlace(four);
      picked = makeMatch(four);
    }
    if(!picked){
      // fallback terakhir: hormati partner rule saja
      const fallback = shuffleInPlace([
        {a1:four[0], a2:four[1], b1:four[2], b2:four[3]},
        {a1:four[0], a2:four[2], b1:four[1], b2:four[3]},
        {a1:four[0], a2:four[3], b1:four[1], b2:four[2]},
      ]).find(o=>fitsTeamRule(o.a1,o.a2)&&fitsTeamRule(o.b1,o.b2)) || 
        {a1:four[0], a2:four[1], b1:four[2], b2:four[3]};
      picked=fallback;
    }

    target[i] = { ...picked, scoreA:'', scoreB:'' };

    // update fairness tracker
    [picked.a1,picked.a2,picked.b1,picked.b2].forEach(p=>{ if(need[p]>0) need[p]--; });

    // update catatan lawan (hindari rematch selanjutnya)
    [ [picked.a1,picked.b1],[picked.a1,picked.b2],[picked.a2,picked.b1],[picked.a2,picked.b2] ]
      .forEach(([x,y])=>seenOpp.add(vsKey(x,y)));
    seenMatch.add(vsKey(teamKey(picked.a1,picked.a2), teamKey(picked.b1,picked.b2)));
  }

  roundsByCourt[activeCourt]=target;

  markDirty(); renderAll(); computeStandings();
  validateAll();
  renderFairnessInfo(); // panel kecil (opsional)
}
