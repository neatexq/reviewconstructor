/**
 * nav.js — единый навбар для всех страниц Reviews
 * Подключается в <head> или начале <body>.
 * Вызов: initNav('feed') | 'create' | 'profile' | 'messages'
 */
(function(){

const NAV_CSS = `
.rc-nav{position:sticky;top:0;z-index:200;background:rgba(10,10,15,.96);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid #252530;height:52px;display:flex;align-items:center;padding:0 20px;gap:4px;font-family:'Space Mono',monospace}
.rc-nav-logo{font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:3px;color:#c8a96e;text-decoration:none;margin-right:10px;flex-shrink:0}
.rc-nav-link{font-size:10px;font-weight:700;letter-spacing:1.5px;color:#5a5060;padding:6px 12px;border-radius:7px;text-decoration:none;transition:all .2s;text-transform:uppercase;white-space:nowrap;cursor:pointer;border:none;background:transparent;font-family:'Space Mono',monospace}
.rc-nav-link:hover{color:#c8a96e;background:rgba(200,169,110,.07)}
.rc-nav-link.rc-active{color:#c8a96e;background:rgba(200,169,110,.1)}
.rc-nav-right{margin-left:auto;display:flex;align-items:center;gap:8px}
.rc-nav-nick-btn{padding:6px 16px;border-radius:7px;font-size:10px;font-weight:700;cursor:pointer;font-family:'Space Mono',monospace;letter-spacing:1px;border:1px solid #c8a96e;background:#c8a96e;color:#1a1005;text-decoration:none;white-space:nowrap;transition:all .2s}
.rc-nav-nick-btn:hover{background:#b8996e;border-color:#b8996e}
.rc-nav-login-btn{padding:6px 14px;border-radius:7px;font-size:10px;font-weight:700;cursor:pointer;font-family:'Space Mono',monospace;letter-spacing:1px;border:1px solid #252530;background:transparent;color:#5a5060;text-decoration:none;transition:all .2s}
.rc-nav-login-btn:hover{border-color:#c8a96e;color:#c8a96e}
.rc-nav-msgs-badge{position:relative}
.rc-nav-msgs-dot{position:absolute;top:-1px;right:-1px;width:7px;height:7px;background:#ef4444;border-radius:50%;border:2px solid #0a0a0f;display:none}
@media(max-width:600px){
  .rc-nav{padding:0 12px;gap:2px}
  .rc-nav-link{font-size:9px;padding:5px 7px;letter-spacing:.5px}
  .rc-nav-logo{font-size:18px;margin-right:4px}
}
@media(max-width:420px){
  .rc-nav-link[data-hide-sm]{display:none}
}
`;

const styleEl = document.createElement('style');
styleEl.textContent = NAV_CSS;
document.head.appendChild(styleEl);

window.initNav = function(activePage) {
  // Remove any existing nav placed by page HTML (old navs)
  // We insert at top of body
  const nav = document.createElement('nav');
  nav.className = 'rc-nav';
  nav.id = 'rcNav';

  const session = JSON.parse(localStorage.getItem('rc_session')||'null');
  const nick = session ? session.nick : null;

  const pages = [
    {id:'feed',   href:'feed.html',     label:'Лента'},
    {id:'create', href:'index.html',    label:'Создать'},
    {id:'profile',href:'profile.html',  label:'Профиль', hideSm: true},
    {id:'messages',href:'messages.html',label:'Сообщения', hideSm: true},
  ];

  let html = `<a href="index.html" class="rc-nav-logo">◈</a>`;
  pages.forEach(p => {
    const active = p.id === activePage ? ' rc-active' : '';
    const hide = p.hideSm ? ' data-hide-sm' : '';
    html += `<a href="${p.href}" class="rc-nav-link${active}"${hide}>${p.label}</a>`;
  });

  html += `<div class="rc-nav-right">`;
  if(nick){
    html += `<a href="profile.html" class="rc-nav-nick-btn" id="rcNavNickBtn">@${nick}</a>`;
  } else {
    html += `<a href="profile.html" class="rc-nav-login-btn">Войти</a>`;
  }
  html += `</div>`;

  nav.innerHTML = html;

  // Insert as first child of body
  document.body.insertBefore(nav, document.body.firstChild);

  // Watch for unread messages to show dot
  if(nick && session){
    // Simple check via localStorage cached count
    try{
      const unread = parseInt(localStorage.getItem('rc_unread_msgs')||'0');
      if(unread > 0){
        const msgsLink = nav.querySelector('[href="messages.html"]');
        if(msgsLink){
          msgsLink.style.position='relative';
          const dot = document.createElement('span');
          dot.style.cssText='position:absolute;top:3px;right:3px;width:6px;height:6px;background:#ef4444;border-radius:50%;border:1px solid #0a0a0f';
          msgsLink.appendChild(dot);
        }
      }
    }catch(e){}
  }
};

})();
