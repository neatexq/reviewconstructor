/**
 * templates.js
 * Универсальная система шаблонов для конструкторов рецензий.
 * Подключается после html2canvas в каждом конструкторе.
 *
 * Использование:
 *   1. <script src="templates.js"></script>
 *   2. Вызвать injectTemplateBtn(AS_KEY, collectDraft, applyDraft) в конце body
 */

(function(){

const style = document.createElement('style');
style.textContent = `
/* ── TEMPLATE BUTTON ── */
.tpl-row{display:flex;gap:6px;margin-top:6px}
.tpl-save-btn{flex:1;padding:9px;border:1px solid rgba(255,255,255,.12);border-radius:7px;font-size:11px;font-weight:700;cursor:pointer;background:transparent;color:rgba(255,255,255,.4);font-family:'Space Mono',monospace;letter-spacing:1px;transition:all .2s}
.tpl-save-btn:hover{border-color:rgba(255,255,255,.3);color:rgba(255,255,255,.7)}
.tpl-load-btn{padding:9px 13px;border:1px solid rgba(255,255,255,.12);border-radius:7px;font-size:13px;cursor:pointer;background:transparent;color:rgba(255,255,255,.4);transition:all .2s;flex-shrink:0}
.tpl-load-btn:hover{border-color:rgba(255,255,255,.3);color:rgba(255,255,255,.7)}

/* ── TEMPLATE OVERLAY ── */
.tpl-overlay{position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:9997;display:none;align-items:center;justify-content:center;padding:16px}
.tpl-overlay.show{display:flex}
.tpl-box{background:#111118;border:1px solid #252530;border-radius:16px;width:100%;max-width:480px;max-height:85vh;overflow-y:auto;padding:22px;position:relative;font-family:'Space Mono',monospace}
.tpl-box-title{font-size:10px;font-weight:700;letter-spacing:2px;color:#6b5f4a;text-transform:uppercase;margin-bottom:16px}
.tpl-list{display:flex;flex-direction:column;gap:8px}
.tpl-item{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid #252530;border-radius:10px;cursor:pointer;transition:all .18s}
.tpl-item:hover{border-color:#c8a96e;background:rgba(200,169,110,.05)}
.tpl-thumb{width:44px;height:60px;object-fit:cover;border-radius:5px;background:#1a1a24;flex-shrink:0}
.tpl-info{flex:1;min-width:0}
.tpl-name{font-size:12px;font-weight:700;color:#ddd;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tpl-saved-at{font-size:9px;color:#6b5f4a;margin-top:3px;letter-spacing:.5px}
.tpl-item-del{width:26px;height:26px;border-radius:50%;border:1px solid #333;background:transparent;display:flex;align-items:center;justify-content:center;font-size:11px;cursor:pointer;color:#555;flex-shrink:0;transition:all .2s}
.tpl-item-del:hover{border-color:#ef4444;color:#ef4444;background:rgba(239,68,68,.08)}
.tpl-empty{text-align:center;padding:32px 16px;color:#6b5f4a;font-size:11px;line-height:1.8}
.tpl-empty span{font-size:28px;display:block;margin-bottom:10px;opacity:.4}
.tpl-close-btn{position:absolute;top:14px;right:14px;width:28px;height:28px;border-radius:50%;border:1px solid #252530;background:#18181f;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:13px;color:#555;transition:all .2s}
.tpl-close-btn:hover{border-color:#c8a96e;color:#c8a96e}

/* ── SAVE NAME MODAL ── */
.tpl-name-overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9998;display:none;align-items:center;justify-content:center;padding:16px}
.tpl-name-overlay.show{display:flex}
.tpl-name-box{background:#111118;border:1px solid #252530;border-radius:14px;width:100%;max-width:340px;padding:22px;font-family:'Space Mono',monospace}
.tpl-name-title{font-size:10px;font-weight:700;letter-spacing:2px;color:#6b5f4a;text-transform:uppercase;margin-bottom:14px}
.tpl-name-inp{width:100%;padding:10px 12px;background:#0d0d14;border:1px solid #252530;border-radius:8px;font-size:13px;color:#e8e0d0;font-family:'Space Mono',monospace;outline:none;transition:border-color .2s;margin-bottom:12px}
.tpl-name-inp:focus{border-color:#c8a96e}
.tpl-name-btns{display:flex;gap:8px}
.tpl-name-ok{flex:1;padding:9px;background:#c8a96e;border:none;border-radius:7px;font-size:11px;font-weight:700;cursor:pointer;font-family:'Space Mono',monospace;color:#1a1005;letter-spacing:1px}
.tpl-name-cancel{padding:9px 14px;border:1px solid #252530;border-radius:7px;font-size:11px;font-weight:700;cursor:pointer;font-family:'Space Mono',monospace;color:#6b5f4a;background:transparent}

/* ── TOAST (shared if not already defined) ── */
.tpl-toast{position:fixed;bottom:76px;left:50%;transform:translateX(-50%) translateY(60px);background:#111118;border:1px solid #252530;border-radius:10px;padding:10px 18px;font-size:11px;color:#e8e0d0;z-index:9999;transition:transform .3s;font-family:'Space Mono',monospace;white-space:nowrap;box-shadow:0 6px 24px rgba(0,0,0,.6);pointer-events:none}
.tpl-toast.show{transform:translateX(-50%) translateY(0)}
.tpl-toast.ok{border-color:#22c55e;color:#22c55e}
`;
document.head.appendChild(style);

// ── OVERLAY HTML ──
const overlay = document.createElement('div');
overlay.className = 'tpl-overlay';
overlay.id = 'tplOverlay';
overlay.innerHTML = `
  <div class="tpl-box">
    <div class="tpl-box-title">📂 Мои шаблоны</div>
    <div class="tpl-close-btn" onclick="window._tplClose()">✕</div>
    <div class="tpl-list" id="tplList"></div>
  </div>`;
document.body.appendChild(overlay);
overlay.addEventListener('click', e => { if(e.target===overlay) window._tplClose(); });

// ── NAME MODAL ──
const nameModal = document.createElement('div');
nameModal.className = 'tpl-name-overlay';
nameModal.id = 'tplNameOverlay';
nameModal.innerHTML = `
  <div class="tpl-name-box">
    <div class="tpl-name-title">Название шаблона</div>
    <input class="tpl-name-inp" id="tplNameInp" placeholder="Например: Тёмная карточка" maxlength="40">
    <div class="tpl-name-btns">
      <button class="tpl-name-cancel" onclick="window._tplCancelSave()">Отмена</button>
      <button class="tpl-name-ok" onclick="window._tplConfirmSave()">Сохранить ✓</button>
    </div>
  </div>`;
document.body.appendChild(nameModal);
document.getElementById('tplNameInp').addEventListener('keydown', e => {
  if(e.key==='Enter') window._tplConfirmSave();
  if(e.key==='Escape') window._tplCancelSave();
});

// ── TOAST ──
const toast = document.createElement('div');
toast.id = 'tplToast'; toast.className = 'tpl-toast';
document.body.appendChild(toast);
function tplToast(msg, type=''){
  toast.textContent = msg; toast.className = 'tpl-toast show '+(type||'');
  clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── STATE ──
let _AS_KEY = '';
let _collectFn = null;
let _applyFn = null;
let _pendingSave = null;

function getStorageKey(){ return 'rc_templates_' + (_AS_KEY||'default') }

function loadTemplates(){
  try{ return JSON.parse(localStorage.getItem(getStorageKey())||'[]') }
  catch(e){ return [] }
}
function saveTemplates(list){
  try{ localStorage.setItem(getStorageKey(), JSON.stringify(list)) }
  catch(e){ tplToast('Ошибка сохранения','err') }
}

// ── OPEN TEMPLATE LIST ──
window._tplOpen = function(){
  const list = loadTemplates();
  const el = document.getElementById('tplList');
  if(!list.length){
    el.innerHTML = `<div class="tpl-empty"><span>📂</span>Нет сохранённых шаблонов.<br>Нажми «⭐ Сохранить шаблон»<br>чтобы сохранить текущий стиль.</div>`;
  } else {
    el.innerHTML = '';
    list.forEach((tpl, idx) => {
      const item = document.createElement('div'); item.className = 'tpl-item';
      const savedDate = new Date(tpl.savedAt).toLocaleDateString('ru-RU', {day:'numeric',month:'short',year:'numeric'});
      item.innerHTML = `
        ${tpl.thumb ? `<img class="tpl-thumb" src="${tpl.thumb}" alt="">` : `<div class="tpl-thumb" style="display:flex;align-items:center;justify-content:center;font-size:22px">📄</div>`}
        <div class="tpl-info">
          <div class="tpl-name">${tpl.name}</div>
          <div class="tpl-saved-at">Сохранено ${savedDate}</div>
        </div>
        <div class="tpl-item-del" onclick="_tplDelete(${idx},event)" title="Удалить">✕</div>`;
      item.addEventListener('click', () => _tplApply(idx));
      el.appendChild(item);
    });
  }
  document.getElementById('tplOverlay').classList.add('show');
};

window._tplClose = function(){
  document.getElementById('tplOverlay').classList.remove('show');
};

window._tplApply = function(idx){
  const list = loadTemplates();
  const tpl = list[idx];
  if(!tpl || !_applyFn){ tplToast('Ошибка применения','err'); return; }
  try{
    _applyFn(tpl.draft);
    window._tplClose();
    tplToast('Шаблон «'+tpl.name+'» применён ✓', 'ok');
  }catch(e){
    tplToast('Не удалось применить шаблон','err');
  }
};

window._tplDelete = function(idx, e){
  e && e.stopPropagation();
  const list = loadTemplates();
  list.splice(idx, 1);
  saveTemplates(list);
  window._tplOpen(); // re-render
  tplToast('Шаблон удалён','');
};

// ── START SAVE FLOW ──
window._tplStartSave = async function(){
  if(!_collectFn){ tplToast('Ошибка: нет функции сохранения','err'); return; }
  _pendingSave = _collectFn();
  // try to get current card thumbnail
  const card = document.getElementById('card');
  if(card){
    try{
      const cv = await html2canvas(card,{scale:.5,useCORS:true,allowTaint:true,backgroundColor:null,logging:false});
      _pendingSave._thumb = cv.toDataURL('image/jpeg', .6);
    }catch(e){ _pendingSave._thumb = null; }
  }
  // show name modal
  const inp = document.getElementById('tplNameInp');
  inp.value = '';
  document.getElementById('tplNameOverlay').classList.add('show');
  setTimeout(()=>inp.focus(), 120);
};

window._tplConfirmSave = function(){
  const name = document.getElementById('tplNameInp').value.trim();
  if(!name){ document.getElementById('tplNameInp').style.borderColor='#ef4444'; return; }
  document.getElementById('tplNameInp').style.borderColor='';
  document.getElementById('tplNameOverlay').classList.remove('show');
  if(!_pendingSave){ return; }
  const list = loadTemplates();
  list.unshift({ name, draft: _pendingSave, thumb: _pendingSave._thumb||null, savedAt: Date.now() });
  // keep max 20 templates per constructor
  if(list.length > 20) list.length = 20;
  saveTemplates(list);
  _pendingSave = null;
  tplToast('Шаблон «'+name+'» сохранён ⭐', 'ok');
};

window._tplCancelSave = function(){
  document.getElementById('tplNameOverlay').classList.remove('show');
  _pendingSave = null;
};

// ── INJECT BUTTON (call after savebtn) ──
window.injectTemplateBtn = function(asKey, collectFn, applyFn){
  _AS_KEY = asKey;
  _collectFn = collectFn;
  _applyFn = applyFn;

  const saveBtn = document.querySelector('.savebtn');
  if(!saveBtn) return;

  const row = document.createElement('div'); row.className = 'tpl-row';

  const saveTPLBtn = document.createElement('button'); saveTPLBtn.className = 'tpl-save-btn';
  saveTPLBtn.innerHTML = '⭐ Сохранить шаблон';
  saveTPLBtn.onclick = () => window._tplStartSave();

  const loadTPLBtn = document.createElement('button'); loadTPLBtn.className = 'tpl-load-btn';
  loadTPLBtn.title = 'Загрузить шаблон';
  loadTPLBtn.innerHTML = '📂';
  loadTPLBtn.onclick = () => window._tplOpen();

  row.appendChild(saveTPLBtn);
  row.appendChild(loadTPLBtn);
  saveBtn.insertAdjacentElement('afterend', row);
};

})();
