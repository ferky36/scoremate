"use strict";
// ========== Auth UI bindings ==========
byId('btnLogin')?.addEventListener('click', ()=>{
  const m = byId('loginModal'); if (!m) return; m.classList.remove('hidden');
  const user = null; try{ sb.auth.getUser().then(({data})=>{ if (data?.user?.email) byId('loginEmail').value = data.user.email; }); }catch{}
});
byId('loginBackdrop')?.addEventListener('click', ()=> byId('loginModal').classList.add('hidden'));
byId('loginCancelBtn')?.addEventListener('click', ()=> { byId('loginModal').classList.add('hidden'); const b=byId('loginSendBtn'); if (b) b.textContent='Kirim Link Login'; const m=byId('loginMsg'); if(m) m.textContent=''; });
// Login OTP sederhana (tanpa Edge Function)
byId('loginSendBtn')?.addEventListener('click', async ()=>{
  const email = (byId('loginEmail').value||'').trim();
  const msg = byId('loginMsg'); const btn = byId('loginSendBtn');
  msg.textContent=''; msg.className = 'text-xs text-gray-500 dark:text-gray-300';
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ msg.textContent='Email tidak valid.'; return; }
  btn.disabled = true; btn.textContent='Mengirim…';
  try{
    await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: getAuthRedirectURL(), shouldCreateUser: true } });
    msg.textContent='Cek email Anda untuk magic link.';
    msg.className='text-xs text-green-600 dark:text-green-400';
  }catch(e){ console.error(e); msg.textContent='Gagal mengirim link.'; msg.className='text-xs text-red-600 dark:text-red-400'; }
  finally{ btn.disabled=false; btn.textContent='Kirim Link Login'; }
});
byId('btnLogout')?.addEventListener('click', async ()=>{
  try{ await sb.auth.signOut(); }catch{}
  location.reload();
});
