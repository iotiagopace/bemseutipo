/* ===== NAV SCROLL ===== */
(function(){
  var nav = document.querySelector('nav');
  window.addEventListener('scroll', function(){
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, {passive:true});
})();

/* ===== WHATSAPP FLOAT DELAY ===== */
setTimeout(function(){
  var wa = document.querySelector('.whatsapp-float');
  if(wa) wa.classList.add('visible');
}, 3000);

/* ===== COUNTER ANIMATION ===== */
function animateCounter(el){
  var target = parseFloat(el.dataset.target);
  var suffix = el.dataset.suffix || '';
  var prefix = el.dataset.prefix || '';
  var duration = 1800;
  var start = null;
  function step(ts){
    if(!start) start = ts;
    var progress = Math.min((ts - start) / duration, 1);
    var ease = 1 - Math.pow(1 - progress, 3);
    var value = target * ease;
    el.textContent = prefix + (Number.isInteger(target) ? Math.floor(value) : value.toFixed(1)) + suffix;
    if(progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
var metObs = new IntersectionObserver(function(entries){
  entries.forEach(function(e){
    if(e.isIntersecting){
      animateCounter(e.target);
      metObs.unobserve(e.target);
    }
  });
}, {threshold:.4});
document.querySelectorAll('.met-num[data-target]').forEach(function(el){
  metObs.observe(el);
});

const obs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => { if(e.isIntersecting){ setTimeout(()=>e.target.classList.add('visible'), i*55); obs.unobserve(e.target) } });
}, {threshold:.08});
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
function toggleFaq(el){ const item=el.parentElement; const o=item.classList.contains('open'); document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open')); if(!o)item.classList.add('open'); }
function toggleMenu(){ const l=document.querySelector('.nav-links'); l.style.display=l.style.display==='flex'?'none':'flex'; if(l.style.display==='flex') l.style.cssText='display:flex;flex-direction:column;position:fixed;top:62px;left:0;right:0;background:#0E1420;padding:22px 5%;gap:16px;z-index:999;border-top:1px solid rgba(255,255,255,.06)'; }

/* ===== FUNIL ===== */
var dadosFunil = {};

function abrirFunil(e){
  if(e) e.preventDefault();
  document.getElementById('modalFunil').classList.add('active');
  document.body.style.overflow='hidden';
  mostrarPasso('passo1');
}
function fecharFunil(){
  document.getElementById('modalFunil').classList.remove('active');
  document.body.style.overflow='';
}
function fecharModalFora(e){
  if(e.target === document.getElementById('modalFunil')) fecharFunil();
}
function mostrarPasso(id){
  document.querySelectorAll('.modal-step').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function semInstagram(){
  var inp = document.getElementById('f-insta');
  inp.value = 'Não tenho Instagram';
  inp.style.color='rgba(255,255,255,.35)';
}
function selecionarOpt(btn, grupo){
  var grid = document.getElementById(grupo+'-grid') || btn.closest('.opt-grid');
  grid.querySelectorAll('.opt-btn').forEach(b=>b.classList.remove('selected'));
  btn.classList.add('selected');
  dadosFunil[grupo] = btn.textContent.trim();
}

/* Máscara de telefone — aceita nacional (+55 (XX) XXXXX-XXXX) e internacional (+XX ...) */
function mascaraTelefone(inp){
  inp.addEventListener('input', function(){
    var v = this.value.replace(/\D/g,'');
    var r = '';
    // Se começou com 55 e tem pelo menos 12 dígitos = Brasil
    if(v.startsWith('55') && v.length >= 10){
      var n = v.slice(2); // remove 55
      if(n.length <= 10){
        r = '+55 (' + n.slice(0,2) + ') ' + n.slice(2,6) + (n.length>6?'-'+n.slice(6):'');
      } else {
        r = '+55 (' + n.slice(0,2) + ') ' + n.slice(2,7) + (n.length>7?'-'+n.slice(7,11):'');
      }
    } else if(v.length <= 11){
      // Formato nacional sem código de país
      if(v.length <= 2) r = v;
      else if(v.length <= 6) r = '(' + v.slice(0,2) + ') ' + v.slice(2);
      else if(v.length <= 10) r = '(' + v.slice(0,2) + ') ' + v.slice(2,6) + '-' + v.slice(6);
      else r = '(' + v.slice(0,2) + ') ' + v.slice(2,7) + '-' + v.slice(7,11);
    } else {
      // Internacional genérico — mantém raw com + na frente
      r = '+' + v.slice(0, 14);
    }
    this.value = r;
  });
}

/* Validação de e-mail */
function validarEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/* Validação de telefone — mínimo 8 dígitos numéricos */
function validarTelefone(tel){
  return tel.replace(/\D/g,'').length >= 8;
}

function irPasso2(){
  var nome    = document.getElementById('f-nome').value.trim();
  var wp      = document.getElementById('f-wp').value.trim();
  var email   = document.getElementById('f-email').value.trim();
  var empresa = document.getElementById('f-empresa').value.trim();
  var ok = true;
  document.querySelectorAll('.error-msg').forEach(function(e){ e.style.display='none'; });

  if(!nome){
    document.getElementById('err-nome').style.display='block'; ok=false;
  }
  if(!validarTelefone(wp)){
    document.getElementById('err-wp').style.display='block'; ok=false;
  }
  if(!validarEmail(email)){
    document.getElementById('err-email').style.display='block'; ok=false;
  }
  if(!empresa){
    document.getElementById('err-empresa').style.display='block'; ok=false;
  }
  if(!ok) return;

  dadosFunil.nome    = nome;
  dadosFunil.wp      = wp;
  dadosFunil.email   = email;
  dadosFunil.empresa = empresa;
  dadosFunil.insta   = document.getElementById('f-insta').value.trim() || 'Não informado';
  mostrarPasso('passo2');
}

/* Captura UTMs e IDs de clique ao carregar a página */
var utmData = {};
(function(){
  var params = new URLSearchParams(window.location.search);
  var campos = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid'];
  campos.forEach(function(c){
    var v = params.get(c);
    if(v) utmData[c] = v;
    if(v) sessionStorage.setItem(c, v);
    else if(sessionStorage.getItem(c)) utmData[c] = sessionStorage.getItem(c);
  });
})();

function enviarFormulario(){
  if(!dadosFunil.fat || !dadosFunil.traf){
    document.getElementById('err-fat').style.display='block';
    return;
  }
  document.getElementById('err-fat').style.display='none';
  var btn = document.getElementById('btn-enviar');
  btn.disabled = true;
  btn.innerHTML = 'Enviando...<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="animation:spin .8s linear infinite"><path d="M12 2a10 10 0 0 1 10 10"/></svg>';

  var msgWa = encodeURIComponent(
    'Olá! Acabei de preencher o formulário no site da BST.\n' +
    'Meu nome é ' + dadosFunil.nome + ', sou da empresa ' + dadosFunil.empresa + '.\n' +
    'Gostaria de conversar com um especialista!'
  );
  document.getElementById('wa-link').href = 'https://wa.me/5517981108073?text=' + msgWa;

  var formData = new FormData();
  formData.append('nome',    dadosFunil.nome);
  formData.append('wp',      dadosFunil.wp);
  formData.append('email',   dadosFunil.email);
  formData.append('empresa', dadosFunil.empresa);
  formData.append('insta',   dadosFunil.insta);
  formData.append('fat',     dadosFunil.fat);
  formData.append('traf',    dadosFunil.traf);

  fetch('enviar.php', { method:'POST', body:formData })
    .then(function(r){ return r.json(); })
    .then(function(){ window.location.href = '/obrigado'; })
    .catch(function(){ window.location.href = '/obrigado'; });
}

/* Ativa máscara após DOM pronto */
document.addEventListener('DOMContentLoaded', function(){
  mascaraTelefone(document.getElementById('f-wp'));
});
document.addEventListener('keydown', function(e){ if(e.key==='Escape') fecharFunil(); });
