"use strict";
// ========== Auth UI bindings ==========
const __authT = (k,f)=> (window.__i18n_get ? __i18n_get(k,f) : f);

// Main Login Button (in Header)
byId('btnLogin')?.addEventListener('click', ()=>{
  const m = byId('loginModal'); if (!m) return; 
  m.classList.remove('hidden');
  resetLoginModalState();
  try{ 
    sb.auth.getUser().then(({data})=>{ 
      if (data?.user?.email) byId('loginEmail').value = data.user.email; 
    }); 
  }catch{}
});

byId('loginBackdrop')?.addEventListener('click', ()=> byId('loginModal').classList.add('hidden'));
byId('loginCancelBtn')?.addEventListener('click', ()=> byId('loginModal').classList.add('hidden'));

// Login Submit (Password)
byId('loginSubmitBtn')?.addEventListener('click', async ()=>{
  const email = (byId('loginEmail')?.value||'').trim();
  const pass  = (byId('loginPass')?.value||'').trim();
  const btn   = byId('loginSubmitBtn'); 
  const msg   = byId('loginMsg');
  
  if (msg){ msg.textContent=''; msg.className='text-xs text-gray-500 dark:text-gray-300'; }
  
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { 
    if(msg) msg.textContent=__authT('auth.emailInvalid','Email tidak valid.'); 
    return; 
  }
  if (!pass || pass.length<1){ 
    if(msg) msg.textContent=__authT('auth.passwordRequired','Password wajib diisi.'); 
    return; 
  }

  try{
    if (btn) { btn.disabled=true; btn.textContent=__authT('auth.processing','Memproses…'); }
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
    
    if (error){ 
      if(msg){ 
        msg.textContent=__authT('auth.loginFailed','Login gagal. Cek email/password.'); 
        msg.className='text-xs text-red-600 dark:text-red-400'; 
      } 
      return; 
    }
    
    // Sukses
    try{ await updateAuthUI(); }catch{}
    const m = byId('loginModal'); if (m) m.classList.add('hidden');
  }catch(e){ 
    if(msg){ 
      msg.textContent=__authT('auth.error','Terjadi kesalahan.'); 
      msg.className='text-xs text-red-600 dark:text-red-400'; 
    } 
  } finally{ 
    if (btn){ btn.disabled=false; btn.textContent=__authT('login.submit','Login'); } 
  }
});

// Logout
byId('btnLogout')?.addEventListener('click', async ()=>{
  try{ await sb.auth.signOut(); }catch{}
  location.reload();
});


// Forgot Password Flow
byId('btnForgotPassword')?.addEventListener('click', ()=>{
  byId('loginFormSection')?.classList.add('hidden');
  byId('forgotPasswordSection')?.classList.remove('hidden');
  const em = byId('loginEmail')?.value;
  if(em) byId('forgotEmail').value = em;
  byId('forgotMsg').textContent = '';
});

byId('backToLoginBtn')?.addEventListener('click', ()=>{
  byId('forgotPasswordSection')?.classList.add('hidden');
  byId('loginFormSection')?.classList.remove('hidden');
  byId('loginMsg').textContent = '';
});

// --- Forgot Password Logic Split ---

// 1. Switch to Admin Context (Force Reset)
byId('btnSwitchToForceContext')?.addEventListener('click', ()=>{
  byId('forgotStandardView')?.classList.add('hidden');
  byId('forgotAdminAuthView')?.classList.remove('hidden');
  byId('forgotForceView')?.classList.add('hidden');
  byId('forgotMsg').textContent = '';
});

// 2. Cancel / Back to Standard
byId('btnCancelForce')?.addEventListener('click', ()=>{
  byId('forgotAdminAuthView')?.classList.add('hidden');
  byId('forgotForceView')?.classList.add('hidden');
  byId('forgotStandardView')?.classList.remove('hidden');
  byId('forgotMsg').textContent = '';
});

// 3. Admin Login & Check Role
byId('btnAdminAuthSubmit')?.addEventListener('click', async ()=>{
  const email = (byId('adminAuthEmail')?.value||'').trim();
  const pass  = (byId('adminAuthPass')?.value||'').trim();
  const btn   = byId('btnAdminAuthSubmit');
  const msg   = byId('forgotMsg');
  
  msg.textContent = ''; msg.className='text-xs';

  if(!email || !pass) {
    msg.textContent = __authT('auth.credsRequired','Email & Password admin wajib diisi.');
    msg.className = 'text-xs text-red-600 dark:text-red-400';
    return;
  }

  try{
    btn.disabled=true; btn.textContent=__authT('auth.verifying','Verifikasi...');
    
    // Login as Admin
    const { data: authData, error: authError } = await sb.auth.signInWithPassword({ email, password: pass });
    if(authError) throw authError;

    // Check Role (Owner/Admin only)
    const user = authData.user;
    if(!user) throw new Error('No user returned.');

    // Check user_roles table
    const { data: roleData, error: roleError } = await sb.from('user_roles')
      .select('role,is_owner')
      .eq('user_id', user.id)
      .maybeSingle();
      
    // Determine if allowed (is_owner OR role='owner')
    const isOwner = roleData && (roleData.is_owner || roleData.role === 'owner');
    
    if(!isOwner){
      // Logout immediately if not allowed
      try{ await sb.auth.signOut(); }catch{}
      throw new Error(__authT('auth.notAdmin','Akses ditolak. Hanya Owner yang bisa akses.'));
    }

    // Success -> Show Force Form
    byId('forgotAdminAuthView')?.classList.add('hidden');
    byId('forgotForceView')?.classList.remove('hidden');
    // Hide standard back button, we'll use a custom Close/Logout in the force view
    byId('backToLoginBtn')?.classList.add('hidden');
    
    // Show active admin info
    const adminLabel = byId('adminActiveLabel');
    if(adminLabel) adminLabel.textContent = `Admin: ${email}`;

    msg.textContent = __authT('auth.adminVerified', 'Mode Admin Aktif. Silakan reset user.');
    msg.className = 'text-xs text-green-600 dark:text-green-400 font-bold mb-2';

  }catch(e){
    console.warn(e);
    msg.textContent = __authT('auth.error', 'Gagal: ' + (e.message||e));
    msg.className = 'text-xs text-red-600 dark:text-red-400';
  }finally{
    btn.disabled=false; btn.textContent='Verifikasi Admin';
  }
});

// 4. Force Reset Submit (RPC)
byId('btnForceSubmit')?.addEventListener('click', async ()=>{
  const targetEmail = (byId('forceTargetEmail')?.value||'').trim();
  const newPass     = (byId('forceNewPass')?.value||'').trim();
  const btn         = byId('btnForceSubmit');
  const msg         = byId('forgotMsg');

  msg.textContent = ''; msg.className='text-xs';

  if(!targetEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(targetEmail)){
    msg.textContent = __authT('auth.emailInvalid','Email target tidak valid.');
    msg.className = 'text-xs text-red-600 dark:text-red-400';
    return;
  }
  if(!newPass || newPass.length < 6){
    msg.textContent = __authT('auth.passwordMin','Password minimal 6 karakter.');
    msg.className = 'text-xs text-red-600 dark:text-red-400';
    return;
  }

  try{
    btn.disabled=true; btn.textContent=__authT('auth.processing','Memproses...');
    
    const { data, error } = await sb.rpc('force_reset_password', {
      target_email: targetEmail,
      new_password: newPass
    });

    if(error) throw error;
    if(data?.status === 'not_found'){
       throw new Error(__authT('auth.userNotFound','Email tidak ditemukan.'));
    }
    if(data?.status === 'error'){
       throw new Error(data.message || 'RPC Error');
    }

    // Success: STAY ON PAGE
    msg.textContent = __authT('auth.forceSuccess', 'Password berhasil diubah.');
    msg.className = 'text-xs text-green-600 dark:text-green-400 font-bold';
    
    // Clear inputs for next usage
    byId('forceTargetEmail').value = '';
    byId('forceNewPass').value = '';
    byId('forceTargetEmail').focus();

  }catch(e){
    msg.textContent = __authT('auth.forceFail', 'Gagal mengubah password:') + ' ' + (e.message||e);
    msg.className = 'text-xs text-red-600 dark:text-red-400';
  }finally{
    btn.disabled=false; btn.textContent='Force Reset Password';
  }
});

// 5. Exit Admin Mode (Logout & Back)
byId('btnExitAdminMode')?.addEventListener('click', async ()=>{
   // Logout admin session
   try{ await sb.auth.signOut(); }catch{}
   location.reload(); // Reload to clear state completely
});

// 5. Standard Email Reset Submit
byId('forgotSubmitBtn')?.addEventListener('click', async ()=>{
  const email = (byId('forgotEmail')?.value||'').trim();
  const btn = byId('forgotSubmitBtn');
  const msg = byId('forgotMsg');
  
  msg.textContent = ''; msg.className = 'text-xs';
  
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { 
    msg.textContent=__authT('auth.emailInvalid','Email tidak valid.'); 
    msg.className='text-xs text-red-600 dark:text-red-400';
    return; 
  }

  try{
    btn.disabled=true; btn.textContent=__authT('auth.sending','Mengirim…');
    // Standard Supabase Reset
    const { data, error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: (window.location.origin || '') + '/update-password.html'
    });
    
    if (error){
      msg.textContent=__authT('auth.sendError','Gagal mengirim: ') + error.message;
      msg.className='text-xs text-red-600 dark:text-red-400';
    } else {
      msg.textContent=__authT('auth.resetSent','Instruksi reset password telah dikirim ke email Anda (jika email terdaftar).');
      msg.className='text-xs text-green-600 dark:text-green-400';
    }
  }catch(e){
    msg.textContent=__authT('auth.error','Terjadi kesalahan.');
    msg.className='text-xs text-red-600 dark:text-red-400';
  } finally {
    btn.disabled=false; btn.textContent=__authT('login.resetSubmit','Kirim Password Baru ke Email');
  }
});

function resetLoginModalState(){
  byId('loginFormSection')?.classList.remove('hidden');
  byId('forgotPasswordSection')?.classList.add('hidden');
  if(byId('loginMsg')) byId('loginMsg').textContent='';
  if(byId('forgotMsg')) byId('forgotMsg').textContent='';
}
