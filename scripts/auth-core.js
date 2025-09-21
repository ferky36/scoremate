"use strict";
// ========== Auth helpers ==========
async function handleAuthRedirect(){
  try{
    showLoading('Memproses login…');
    const hash = location.hash || '';
    const hasCode = /[?#&](code|access_token)=/.test(location.href) || hash.includes('type=recovery');
    if (hasCode && sb?.auth?.exchangeCodeForSession) {
      await sb.auth.exchangeCodeForSession(window.location.href);
      history.replaceState({}, '', location.pathname + location.search);
    }
  }catch(e){ console.warn('auth redirect handling failed', e); }
  finally { hideLoading(); }
}

async function getCurrentUser(){
  try{ const { data } = await sb.auth.getUser(); return data?.user || null; }catch{ return null; }
}

async function updateAuthUI(){
  const user = await getCurrentUser();
  const loginBtn = byId('btnLogin'); const logoutBtn = byId('btnLogout'); const info = byId('authInfo'); const email = byId('authUserEmail');
  if (user){
    loginBtn?.classList.add('hidden');
    logoutBtn?.classList.remove('hidden');
    info?.classList.remove('hidden');
    if (email) email.textContent = user.email || user.id;
  } else {
    loginBtn?.classList.remove('hidden');
    logoutBtn?.classList.add('hidden');
    info?.classList.add('hidden');
  }
}

function ensureAuthButtons(){
  const bar = byId('hdrControls'); if (!bar) return;
  if (!byId('authInfo')){
    const span = document.createElement('span'); span.id='authInfo'; span.className='text-xs px-2 py-1 bg-white/10 rounded hidden';
    const se = document.createElement('span'); se.id='authUserEmail'; span.innerHTML = 'Signed in: ';
    span.appendChild(se);
    bar.appendChild(span);
  }
  if (!byId('btnLogin')){
    const b = document.createElement('button'); b.id='btnLogin'; b.className='px-3 py-2 rounded-xl bg-white text-indigo-700 font-semibold shadow hover:opacity-90'; b.textContent='Login';
    bar.appendChild(b);
    b.addEventListener('click', ()=>{
      const m = byId('loginModal'); if (!m) return; m.classList.remove('hidden');
      try{ sb.auth.getUser().then(({data})=>{ if (data?.user?.email) byId('loginEmail').value = data.user.email; }); }catch{}
    });
  }
  if (!byId('btnLogout')){
    const b = document.createElement('button'); b.id='btnLogout'; b.className='px-3 py-2 rounded-xl bg-white text-indigo-700 font-semibold shadow hover:opacity-90 hidden'; b.textContent='Logout';
    bar.appendChild(b);
    b.addEventListener('click', async ()=>{ try{ await sb.auth.signOut(); }catch{} location.reload(); });
  }
}
