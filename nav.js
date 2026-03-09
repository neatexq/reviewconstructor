/**
 * nav.js — вертикальный левый навбар для основных страниц
 * В конструкторах не подключается
 */
(function(){

const CSS = `
:root { --nav-w: 200px; }
.rc-nav {
  position: fixed; top: 0; left: 0; bottom: 0;
  width: var(--nav-w);
  background: rgba(10,10,15,.97);
  backdrop-filter: blur(18px);
  border-right: 1px solid #252530;
  display: flex; flex-direction: column;
  padding: 20px 12px 24px;
  gap: 4px;
  z-index: 200;
  font-family: 'Space Mono', monospace;
}
.rc-nav-logo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 22px; letter-spacing: 3px; color: #c8a96e;
  text-decoration: none; padding: 4px 10px 16px;
  display: block;
}
.rc-nav-link {
  display: flex; align-items: center; gap: 9px;
  font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
  color: #5a5060; padding: 9px 12px; border-radius: 8px;
  text-decoration: none; transition: all .2s; text-transform: uppercase;
  cursor: pointer; border: none; background: transparent;
  font-family: 'Space Mono', monospace; width: 100%; text-align: left;
}
.rc-nav-link:hover { color: #c8a96e; background: rgba(200,169,110,.07); }
.rc-nav-link.rc-active { color: #c8a96e; background: rgba(200,169,110,.1); }
.rc-nav-link .rc-nav-ico { font-size: 14px; width: 18px; text-align: center; flex-shrink: 0; }
.rc-nav-spacer { flex: 1; }
.rc-nav-nick-btn {
  display: block; padding: 9px 12px; border-radius: 8px;
  font-size: 10px; font-weight: 700; letter-spacing: 1px;
  border: 1px solid #c8a96e; background: #c8a96e; color: #1a1005;
  text-decoration: none; text-align: center;
  transition: all .2s; font-family: 'Space Mono', monospace;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.rc-nav-nick-btn:hover { background: #b8996e; border-color: #b8996e; }
.rc-nav-login-btn {
  display: block; padding: 9px 12px; border-radius: 8px;
  font-size: 10px; font-weight: 700; letter-spacing: 1px;
  border: 1px solid #252530; background: transparent; color: #5a5060;
  text-decoration: none; text-align: center; transition: all .2s;
  font-family: 'Space Mono', monospace;
}
.rc-nav-login-btn:hover { border-color: #c8a96e; color: #c8a96e; }
/* Push page content right */
.rc-page-offset { margin-left: var(--nav-w) !important; }
/* Mobile */
@media (max-width: 700px) {
  :root { --nav-w: 0px; }
  .rc-nav { width: 54px; padding: 14px 8px; }
  .rc-nav-logo { font-size: 18px; padding: 2px 8px 14px; letter-spacing: 2px; }
  .rc-nav-link { padding: 9px; justify-content: center; gap: 0; }
  .rc-nav-link span:not(.rc-nav-ico) { display: none; }
  .rc-nav-nick-btn { padding: 9px 4px; font-size: 8px; letter-spacing: 0; }
  .rc-nav-login-btn { padding: 9px 4px; font-size: 8px; }
  .rc-page-offset { margin-left: 54px !important; }
}
`;

const styleEl = document.createElement('style');
styleEl.textContent = CSS;
document.head.appendChild(styleEl);

window.initNav = function(activePage) {
  const session = JSON.parse(localStorage.getItem('rc_session')||'null');
  const nick = session ? session.nick : null;

  const nav = document.createElement('nav');
  nav.className = 'rc-nav';
  nav.id = 'rcNav';

  const links = [
    {id:'feed',     href:'feed.html',     ico:'🌐', label:'Лента'},
    {id:'create',   href:'index.html',    ico:'✦',  label:'Создать'},
    {id:'profile',  href:'profile.html',  ico:'👤', label:'Профиль'},
    {id:'messages', href:'messages.html', ico:'💬', label:'Сообщения'},
  ];

  let html = `<a href="index.html" class="rc-nav-logo">◈</a>`;
  links.forEach(function(p) {
    const active = p.id === activePage ? ' rc-active' : '';
    html += `<a href="${p.href}" class="rc-nav-link${active}"><span class="rc-nav-ico">${p.ico}</span><span>${p.label}</span></a>`;
  });

  html += `<div class="rc-nav-spacer"></div>`;
  if(nick){
    html += `<a href="profile.html" class="rc-nav-nick-btn">@${nick}</a>`;
  } else {
    html += `<a href="profile.html" class="rc-nav-login-btn">Войти</a>`;
  }

  nav.innerHTML = html;
  document.body.insertBefore(nav, document.body.firstChild);

  // Offset page body
  const main = document.body.children[1]; // first child after nav
  if(main) main.classList.add('rc-page-offset');
};

})();
