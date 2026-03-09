/**
 * nav.js — горизонтальный навбар сверху
 */
(function(){

const CSS = `
.rc-nav {
  position: sticky; top: 0; left: 0; right: 0;
  height: 52px;
  background: rgba(10,10,15,.97);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid #252530;
  display: flex; align-items: center;
  padding: 0 20px; gap: 6px;
  z-index: 200;
  font-family: 'Space Mono', monospace;
}
.rc-nav-logo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 22px; letter-spacing: 3px; color: #c8a96e;
  text-decoration: none; margin-right: 12px; flex-shrink: 0;
}
.rc-nav-link {
  font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
  color: #5a5060; padding: 6px 12px; border-radius: 7px;
  text-decoration: none; transition: all .2s; text-transform: uppercase;
  cursor: pointer; border: none; background: transparent;
  font-family: 'Space Mono', monospace; white-space: nowrap;
}
.rc-nav-link:hover { color: #c8a96e; background: rgba(200,169,110,.07); }
.rc-nav-link.rc-active { color: #c8a96e; background: rgba(200,169,110,.1); }
.rc-nav-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }
.rc-nav-nick-btn {
  padding: 6px 16px; border-radius: 7px;
  font-size: 10px; font-weight: 700; letter-spacing: 1px;
  border: 1px solid #c8a96e; background: #c8a96e; color: #1a1005;
  text-decoration: none; white-space: nowrap; transition: all .2s;
  font-family: 'Space Mono', monospace;
}
.rc-nav-nick-btn:hover { background: #b8996e; border-color: #b8996e; }
.rc-nav-login-btn {
  padding: 6px 14px; border-radius: 7px;
  font-size: 10px; font-weight: 700; letter-spacing: 1px;
  border: 1px solid #252530; background: transparent; color: #5a5060;
  text-decoration: none; transition: all .2s;
  font-family: 'Space Mono', monospace;
}
.rc-nav-login-btn:hover { border-color: #c8a96e; color: #c8a96e; }
@media (max-width: 500px) {
  .rc-nav { padding: 0 12px; gap: 2px; }
  .rc-nav-link { font-size: 9px; padding: 5px 7px; letter-spacing: .5px; }
  .rc-nav-logo { font-size: 18px; margin-right: 6px; }
  .rc-nav-link[data-hide-sm] { display: none; }
}
`;

const styleEl = document.createElement('style');
styleEl.textContent = CSS;
document.head.appendChild(styleEl);

window.initNav = function(activePage) {
  // Remove any old nav injected previously
  const old = document.getElementById('rcNav');
  if(old) old.remove();

  const session = JSON.parse(localStorage.getItem('rc_session')||'null');
  const nick = session ? session.nick : null;

  const nav = document.createElement('nav');
  nav.className = 'rc-nav';
  nav.id = 'rcNav';

  const links = [
    {id:'feed',     href:'feed.html',     label:'Лента'},
    {id:'create',   href:'index.html',    label:'Создать'},
    {id:'profile',  href:'profile.html',  label:'Профиль'},
    {id:'messages', href:'messages.html', label:'Сообщения', hideSm: true},
  ];

  let html = `<a href="index.html" class="rc-nav-logo">◈</a>`;
  links.forEach(function(p) {
    const active = p.id === activePage ? ' rc-active' : '';
    const hide = p.hideSm ? ' data-hide-sm' : '';
    html += `<a href="${p.href}" class="rc-nav-link${active}"${hide}>${p.label}</a>`;
  });

  html += `<div class="rc-nav-right">`;
  if(nick){
    html += `<a href="profile.html" class="rc-nav-nick-btn">@${nick}</a>`;
  } else {
    html += `<a href="profile.html" class="rc-nav-login-btn">Войти</a>`;
  }
  html += `</div>`;

  nav.innerHTML = html;
  document.body.insertBefore(nav, document.body.firstChild);
};

})();
