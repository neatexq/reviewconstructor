(function(){

const CSS = `
#rcNav {
  position: sticky !important;
  top: 0 !important; left: 0 !important; right: 0 !important;
  bottom: auto !important;
  width: 100% !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
  align-self: stretch !important;
  height: 52px !important;
  background: rgba(10,10,15,.97);
  backdrop-filter: blur(18px);
  border-bottom: 1px solid #252530;
  border-right: none !important;
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
  padding: 0 20px !important;
  gap: 4px !important;
  z-index: 200;
  font-family: 'Space Mono', monospace;
}
#rcNav .rc-nav-logo {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 22px; letter-spacing: 3px; color: #c8a96e;
  text-decoration: none; margin-right: 12px; flex-shrink: 0;
}
#rcNav .rc-nav-link {
  font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
  color: #5a5060; padding: 6px 12px; border-radius: 7px;
  text-decoration: none; transition: all .2s; text-transform: uppercase;
  white-space: nowrap;
}
#rcNav .rc-nav-link:hover { color: #c8a96e; background: rgba(200,169,110,.07); }
#rcNav .rc-nav-link.rc-active { color: #c8a96e; background: rgba(200,169,110,.1); }
#rcNav .rc-nav-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }
#rcNav .rc-nav-nick-btn {
  padding: 6px 16px; border-radius: 7px;
  font-size: 10px; font-weight: 700; letter-spacing: 1px;
  border: 1px solid #c8a96e; background: #c8a96e; color: #1a1005;
  text-decoration: none; white-space: nowrap; transition: all .2s;
  font-family: 'Space Mono', monospace;
}
#rcNav .rc-nav-nick-btn:hover { background: #b8996e; }
#rcNav .rc-nav-login-btn {
  padding: 6px 14px; border-radius: 7px;
  font-size: 10px; font-weight: 700; letter-spacing: 1px;
  border: 1px solid #252530; background: transparent; color: #5a5060;
  text-decoration: none; transition: all .2s;
  font-family: 'Space Mono', monospace;
}
#rcNav .rc-nav-login-btn:hover { border-color: #c8a96e; color: #c8a96e; }
@media (max-width: 500px) {
  #rcNav { padding: 0 10px !important; }
  #rcNav .rc-nav-link { font-size: 9px; padding: 5px 6px; }
  #rcNav .rc-nav-logo { font-size: 18px; margin-right: 4px; }
}

/* ── MESSAGE NOTIFICATION TOAST ── */
#rcMsgToast {
  position: fixed;
  top: 64px; right: 16px;
  max-width: 300px; min-width: 220px;
  background: #18181f;
  border: 1px solid rgba(200,169,110,.35);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex; align-items: center; gap: 10px;
  z-index: 9999;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(0,0,0,.7);
  font-family: 'Space Mono', monospace;
  transform: translateX(calc(100% + 24px));
  transition: transform .35s cubic-bezier(.22,1,.36,1), opacity .35s;
  opacity: 0;
}
#rcMsgToast.rc-toast-show {
  transform: translateX(0);
  opacity: 1;
}
#rcMsgToast.rc-toast-hide {
  transform: translateX(calc(100% + 24px));
  opacity: 0;
}
#rcMsgToast .rc-mt-av {
  width: 36px; height: 36px; border-radius: 50%;
  object-fit: cover; flex-shrink: 0;
  border: 2px solid rgba(200,169,110,.3);
  background: #252530;
}
#rcMsgToast .rc-mt-body { flex: 1; min-width: 0; }
#rcMsgToast .rc-mt-nick {
  font-size: 10px; font-weight: 700; letter-spacing: 1px;
  color: #c8a96e; margin-bottom: 3px;
}
#rcMsgToast .rc-mt-text {
  font-size: 11px; color: #bbb;
  overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
}
#rcMsgToast .rc-mt-close {
  width: 20px; height: 20px; flex-shrink: 0;
  background: rgba(255,255,255,.06); border: none; border-radius: 50%;
  color: #666; cursor: pointer; font-size: 10px;
  display: flex; align-items: center; justify-content: center;
  transition: background .2s;
}
#rcMsgToast .rc-mt-close:hover { background: rgba(255,255,255,.12); }
`;

const styleEl = document.createElement('style');
styleEl.textContent = CSS;
document.head.appendChild(styleEl);

window.initNav = function(activePage) {
  const old = document.getElementById('rcNav');
  if(old) old.remove();

  const session = JSON.parse(localStorage.getItem('rc_session')||'null');
  const nick = session ? session.nick : null;

  const nav = document.createElement('nav');
  nav.id = 'rcNav';

  const links = [
    {id:'feed',     href:'feed.html',     label:'Лента'},
    {id:'create',   href:'index.html',    label:'Создать'},
    {id:'profile',  href:'profile.html',  label:'Профиль'},
    {id:'messages', href:'messages.html', label:'Сообщения'},
  ];

  let html = '<a href="index.html" class="rc-nav-logo">◈</a>';
  links.forEach(function(p) {
    const active = p.id === activePage ? ' rc-active' : '';
    html += '<a href="' + p.href + '" class="rc-nav-link' + active + '">' + p.label + '</a>';
  });

  html += '<div class="rc-nav-right">';
  if(nick){
    html += '<a href="profile.html" class="rc-nav-nick-btn">@' + nick + '</a>';
  } else {
    html += '<a href="profile.html" class="rc-nav-login-btn">Войти</a>';
  }
  html += '</div>';

  nav.innerHTML = html;
  document.body.insertBefore(nav, document.body.firstChild);

  // Start message listener if logged in (not on messages page)
  if(nick && activePage !== 'messages') {
    _startMsgListener(session);
  }
};

// ── MESSAGE NOTIFICATION LISTENER ──
var _msgUnsub = null;
var _msgToastTimer = null;
var _lastSeenMsgAt = parseInt(localStorage.getItem('rc_last_msg_at')||'0');

function _startMsgListener(session) {
  if(!session || !session.uid) return;
  // Dynamically load Firebase to listen for new messages
  Promise.all([
    import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js')
  ]).then(function(mods) {
    var initializeApp = mods[0].initializeApp;
    var getApps = mods[0].getApps;
    var getDatabase = mods[1].getDatabase;
    var ref = mods[1].ref;
    var query = mods[1].query;
    var orderByChild = mods[1].orderByChild;
    var limitToLast = mods[1].limitToLast;
    var onValue = mods[1].onValue;
    var get = mods[1].get;

    var cfg = {
      apiKey:"AIzaSyANeIRqb_oUJSUq2PsU1xGzOJKV29QOY74",
      databaseURL:"https://reviewconstructor-8d391-default-rtdb.europe-west1.firebasedatabase.app",
      projectId:"reviewconstructor-8d391",
      appId:"1:722321589337:web:81098aec4a3d9e9db21d48"
    };
    var app = getApps().length ? getApps()[0] : initializeApp(cfg);
    var db = getDatabase(app);

    // Get friends to know whose chats to watch
    get(ref(db, 'friends/' + session.uid)).then(function(snap) {
      if(!snap.exists()) return;
      var friends = snap.val();
      Object.keys(friends).forEach(function(friendUid) {
        var friendData = friends[friendUid];
        var ids = [session.uid, friendUid].sort();
        var chatId = ids[0] + '_' + ids[1];
        var msgRef = query(ref(db, 'chats/' + chatId + '/messages'), orderByChild('at'), limitToLast(1));
        onValue(msgRef, function(msgSnap) {
          if(!msgSnap.exists()) return;
          var msgs = msgSnap.val();
          var lastKey = Object.keys(msgs)[0];
          var lastMsg = msgs[lastKey];
          // Only show if: from friend, newer than last seen, not current page
          if(lastMsg.uid !== session.uid && lastMsg.at > _lastSeenMsgAt) {
            _lastSeenMsgAt = lastMsg.at;
            localStorage.setItem('rc_last_msg_at', String(lastMsg.at));
            var senderNick = friendData.nick || friendUid;
            var avatarUrl = friendData.avatarUrl || '';
            _showMsgToast(senderNick, friendUid, lastMsg.text || '📎', avatarUrl);
          }
        });
      });
    }).catch(function(){});
  }).catch(function(){});
}

function _showMsgToast(nick, uid, text, avatarUrl) {
  var existing = document.getElementById('rcMsgToast');
  if(existing) existing.remove();

  var toast = document.createElement('div');
  toast.id = 'rcMsgToast';
  toast.innerHTML =
    '<img class="rc-mt-av" src="' + (avatarUrl||'') + '" onerror="this.src=\'data:image/svg+xml,%3Csvg xmlns=\\\'http://www.w3.org/2000/svg\\\' viewBox=\\\'0 0 36 36\\\'%3E%3Crect width=\\\'36\\\' height=\\\'36\\\' fill=\\\'%2318181f\\\'/%3E%3C/svg%3E\'">' +
    '<div class="rc-mt-body">' +
      '<div class="rc-mt-nick">@' + nick + '</div>' +
      '<div class="rc-mt-text">' + String(text).slice(0,60) + '</div>' +
    '</div>' +
    '<button class="rc-mt-close" id="rcMsgToastClose">✕</button>';

  document.body.appendChild(toast);

  // Slide in
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      toast.classList.add('rc-toast-show');
    });
  });

  // Click on toast body → open chat
  toast.addEventListener('click', function(e) {
    if(e.target.id === 'rcMsgToastClose') {
      _dismissMsgToast(toast);
      return;
    }
    window.location.href = 'messages.html?u=' + encodeURIComponent(nick);
  });

  // Auto dismiss after 5s
  if(_msgToastTimer) clearTimeout(_msgToastTimer);
  _msgToastTimer = setTimeout(function() {
    _dismissMsgToast(toast);
  }, 5000);
}

function _dismissMsgToast(toast) {
  if(!toast) toast = document.getElementById('rcMsgToast');
  if(!toast) return;
  toast.classList.remove('rc-toast-show');
  toast.classList.add('rc-toast-hide');
  setTimeout(function() { if(toast.parentNode) toast.remove(); }, 400);
}

})();
