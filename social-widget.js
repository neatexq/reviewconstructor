/**
 * social-widget.js
 * Добавляет кнопку "Выложить рецензию" + шестерёнку приватности
 * в каждый конструктор. Подключается после html2canvas.
 *
 * Использование в конструкторе:
 *   1. <script src="social-widget.js"></script>  (после html2canvas)
 *   2. Вызвать injectPublishBtn() в конце body
 *   3. В функции save() добавить вызов captureAndPublish(type, title)
 */

(function(){
  // ── стили ──
  const style = document.createElement('style');
  style.textContent=`
  .sw-row{display:flex;gap:6px;margin-top:6px}
  .sw-pub{flex:1;padding:10px;border:none;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;background:linear-gradient(90deg,#c8a96e,#7c5c2e);color:#1a1005;font-family:'Space Mono',monospace;letter-spacing:1px;transition:opacity .2s}
  .sw-pub:hover{opacity:.85}
  .sw-gear{width:38px;height:38px;border-radius:7px;border:1px solid #252530;background:#18181f;display:flex;align-items:center;justify-content:center;font-size:15px;cursor:pointer;transition:all .2s;flex-shrink:0}
  .sw-gear:hover{border-color:#c8a96e}
  .sw-priv-pill{font-size:9px;padding:2px 7px;background:rgba(200,169,110,.12);border:1px solid rgba(200,169,110,.25);border-radius:20px;color:#c8a96e;letter-spacing:1px;margin-left:auto;white-space:nowrap;align-self:center}

  .sw-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:9998;display:none;align-items:center;justify-content:center}
  .sw-overlay.show{display:flex}
  .sw-box{background:#111118;border:1px solid #252530;border-radius:14px;width:300px;padding:18px;position:relative}
  .sw-box-title{font-size:10px;font-weight:700;letter-spacing:2px;color:#6b5f4a;text-transform:uppercase;margin-bottom:12px;font-family:'Space Mono',monospace}
  .sw-opt{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;cursor:pointer;border:1px solid transparent;transition:background .15s;margin-bottom:4px}
  .sw-opt:hover{background:#18181f}
  .sw-opt.sel{background:rgba(200,169,110,.08);border-color:rgba(200,169,110,.22)}
  .sw-opt-ico{font-size:17px;width:28px;text-align:center}
  .sw-opt-info b{display:block;font-size:11px;color:#ddd;font-family:'Space Mono',monospace}
  .sw-opt-info span{font-size:9px;color:#6b5f4a;letter-spacing:.5px;font-family:'Space Mono',monospace}
  .sw-flist{padding:6px 12px;max-height:160px;overflow-y:auto;display:none;flex-direction:column;gap:4px}
  .sw-fchk{display:flex;align-items:center;gap:8px;font-size:11px;color:#bbb;padding:3px 0;cursor:pointer;font-family:'Space Mono',monospace}
  .sw-fchk input{accent-color:#c8a96e}
  .sw-done{width:100%;padding:9px;background:#c8a96e;border:none;border-radius:7px;color:#1a1005;font-size:11px;font-weight:700;cursor:pointer;font-family:'Space Mono',monospace;letter-spacing:1px;margin-top:10px}

  .sw-toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%) translateY(60px);background:#111118;border:1px solid #252530;border-radius:10px;padding:10px 18px;font-size:11px;color:#e8e0d0;z-index:9999;transition:transform .3s;font-family:'Space Mono',monospace;white-space:nowrap;box-shadow:0 6px 24px rgba(0,0,0,.6)}
  .sw-toast.show{transform:translateX(-50%) translateY(0)}
  .sw-toast.ok{border-color:#22c55e;color:#22c55e}
  .sw-toast.err{border-color:#ef4444;color:#ef4444}
  `;
  document.head.appendChild(style);

  // ── state ──
  let privacy = 'public';
  let selectedFriends = new Set();
  const PRIV_LABELS = {public:'🌍 Публично', friends:'👥 Друзьям', selected:'👤 Избранным'};

  // ── privacy modal ──
  const overlay = document.createElement('div'); overlay.className='sw-overlay'; overlay.id='swOverlay';
  overlay.innerHTML=`
    <div class="sw-box">
      <div class="sw-box-title">Видимость рецензии</div>
      <div class="sw-opt sel" id="swOptPublic" onclick="window._swSelectPriv('public')">
        <div class="sw-opt-ico">🌍</div><div class="sw-opt-info"><b>Публично</b><span>Видят все</span></div>
      </div>
      <div class="sw-opt" id="swOptFriends" onclick="window._swSelectPriv('friends')">
        <div class="sw-opt-ico">👥</div><div class="sw-opt-info"><b>Только друзья</b><span>Видят твои друзья</span></div>
      </div>
      <div class="sw-opt" id="swOptSelected" onclick="window._swSelectPriv('selected')">
        <div class="sw-opt-ico">👤</div><div class="sw-opt-info"><b>Выбрать друзей</b><span>Конкретные люди</span></div>
      </div>
      <div class="sw-flist" id="swFriendList"></div>
      <button class="sw-done" onclick="window._swClosePriv()">Готово ✓</button>
    </div>`;
  document.body.appendChild(overlay);

  // ── toast ──
  const toastEl = document.createElement('div'); toastEl.className='sw-toast'; toastEl.id='swToast';
  document.body.appendChild(toastEl);

  window._swToast = function(msg, type=''){
    toastEl.textContent=msg; toastEl.className='sw-toast show '+(type||'');
    clearTimeout(toastEl._t); toastEl._t=setTimeout(()=>toastEl.classList.remove('show'),3200);
  };
  window._swSelectPriv = function(p){
    privacy=p;
    ['Public','Friends','Selected'].forEach(k=>document.getElementById('swOpt'+k).classList.toggle('sel',k.toLowerCase()===p));
    document.getElementById('swFriendList').style.display=p==='selected'?'flex':'none';
    // update pill label everywhere
    document.querySelectorAll('.sw-priv-pill').forEach(el=>el.textContent=PRIV_LABELS[p]);
  };
  window._swClosePriv = function(){ overlay.classList.remove('show') };
  window._swOpenPriv = async function(){
    // try to load friends from profile page session (cross-page via localStorage)
    const session = JSON.parse(localStorage.getItem('rc_session')||'null');
    if(!session){ window._swToast('Войди чтобы настроить приватность','err'); return }
    // load friends from firebase if available
    overlay.classList.add('show');
    const flist = document.getElementById('swFriendList'); flist.innerHTML='';
    // friends stored in localStorage cache set by profile.html
    const fcache = JSON.parse(localStorage.getItem('rc_friends_cache')||'[]');
    fcache.forEach(f=>{
      const lbl=document.createElement('label'); lbl.className='sw-fchk';
      lbl.innerHTML=`<input type="checkbox" value="${f.uid}" ${selectedFriends.has(f.uid)?'checked':''}> @${f.nick}`;
      lbl.querySelector('input').onchange=e=>{
        if(e.target.checked) selectedFriends.add(f.uid); else selectedFriends.delete(f.uid);
      };
      flist.appendChild(lbl);
    });
    if(!fcache.length) flist.innerHTML='<div style="font-size:10px;color:#6b5f4a;padding:4px 0">Нет друзей</div>';
  };

  // ── inject button ──
  window.injectPublishBtn = function(containerSelector){
    // find the savebtn and inject after it
    const saveBtn = document.querySelector('.savebtn');
    if(!saveBtn) return;
    const row = document.createElement('div'); row.className='sw-row';
    const pill = document.createElement('div'); pill.className='sw-priv-pill'; pill.textContent='🌍 Публично';
    const pubBtn = document.createElement('button'); pubBtn.className='sw-pub'; pubBtn.textContent='📤 ВЫЛОЖИТЬ';
    pubBtn.onclick = ()=>window._swPublish();
    const gear = document.createElement('div'); gear.className='sw-gear'; gear.title='Настройки приватности';
    gear.innerHTML='⚙️'; gear.onclick=()=>window._swOpenPriv();
    row.appendChild(pubBtn); row.appendChild(gear);
    saveBtn.insertAdjacentElement('afterend', row);
    saveBtn.insertAdjacentElement('afterend', pill);
  };

  // ── publish ──
  window._swPublish = async function(){
    const session = JSON.parse(localStorage.getItem('rc_session')||'null');
    if(!session){
      window._swToast('Нужно войти в аккаунт 👆','err');
      // redirect to profile with message
      setTimeout(()=>{ window.location.href='profile.html' }, 1500);
      return;
    }
    // capture card
    const card = document.getElementById('card');
    if(!card){ window._swToast('Карточка не найдена','err'); return }
    window._swToast('Публикуем...','');
    try{
      const canvas = await html2canvas(card,{scale:2,useCORS:true,allowTaint:true,backgroundColor:null,logging:false});
      const fullDataUrl = canvas.toDataURL('image/png');
      // thumb
      const th=document.createElement('canvas'); const sc=200/canvas.width;
      th.width=200; th.height=Math.round(canvas.height*sc);
      th.getContext('2d').drawImage(canvas,0,0,th.width,th.height);
      const thumbDataUrl=th.toDataURL('image/jpeg',.75);
      // get title hint from inputs
      const titleEl = document.querySelector('#bkTitle,#anTitle,#gTitle,#mTitle,#filmTitle');
      const title = titleEl?.value || 'Рецензия';
      // detect type from page
      const pageMap={'books':'📚 Книги','anime':'🎌 Аниме','games':'🎮 Игры','music':'🎵 Музыка','cinema':'🎬 Кино'};
      const page = location.pathname.split('/').pop().replace('.html','');
      const type = pageMap[page]||'Рецензия';
      // store in localStorage queue, profile.html will upload
      const queue = JSON.parse(localStorage.getItem('rc_publish_queue')||'[]');
      queue.push({thumbDataUrl, fullDataUrl, type, title, privacy, privacyFriends:[...selectedFriends], queuedAt:Date.now()});
      localStorage.setItem('rc_publish_queue', JSON.stringify(queue));
      window._swToast('Рецензия сохранена! Открой профиль для публикации 🎉','ok');
    }catch(e){
      console.error(e);
      window._swToast('Ошибка при сохранении','err');
    }
  };

})();
