const $ = (s, root=document) => root.querySelector(s);
const app = $('#app');
const store = {
 get(key, fallback){try{return JSON.parse(localStorage.getItem('mn_'+key)) ?? fallback}catch{return fallback}},
 set(key,value){try{localStorage.setItem('mn_'+key,JSON.stringify(value));return true}catch(e){console.warn('LocalStorage tidak tersedia',e);return false}}
};
// Katalog lama berisi judul fiktif; hapus referensi ID lama agar tidak tertaut ke buku yang berbeda.
if(localStorage.getItem('mn_catalogVersion')!=='2'){
 ['mn_favorites','mn_history','mn_progress'].forEach(k=>localStorage.removeItem(k));
 localStorage.setItem('mn_catalogVersion','2');
}
let favorites = store.get('favorites',[]), history = store.get('history',{}), progress = store.get('progress',{}), currentFilter='Semua', searchTerm='';
let toastTimer;
var sharedWorks=[],sharedLoaded=false;
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function notify(msg){const el=$('#toast');if(!el)return;el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2400)}
function goTo(h){if(location.hash===h)route();else location.hash=h}
function coverMarkup(book, detail=false){
 const palette=['#8d7058','#586b65','#8d5f55','#5f6176','#9a7b4f','#6b594b','#536a7a'];
 const color=palette[(book.id-1)%palette.length];
 return `<div class="book-cover ${book.cover?'':'cover-fallback'}" style="background:linear-gradient(145deg,${color},#302923)">
 ${book.cover?`<img src="${book.cover}" alt="Sampul ${esc(book.title)}" loading="lazy" onerror="this.style.display='none';this.parentElement.classList.add('cover-fallback')">`:''}
 <span class="cover-kicker">MARI NOVEL · ${esc(book.genre.toUpperCase())}</span><strong>${esc(book.title)}</strong><small>${esc(book.author)}</small><i class="cover-ornament">✳</i></div>`;
}
function bookCard(book){
 const saved=favorites.includes(book.id),pct=progress[book.id]?.percent||0;
 return `<article class="book-card"><button class="cover-button" data-detail="${book.id}" aria-label="Lihat detail ${esc(book.title)}">${coverMarkup(book)}</button>
 <button class="favorite-toggle ${saved?'is-saved':''}" data-fav="${book.id}" aria-label="${saved?'Hapus dari':'Tambah ke'} favorit" title="${saved?'Hapus dari favorit':'Tambah ke favorit'}">${saved?'♥':'♡'}</button>
 <div class="book-info"><button class="book-title" data-detail="${book.id}">${esc(book.title)}</button><span class="book-author">${esc(book.author)}</span>
 <div class="book-meta"><span>${esc(book.genre)}</span></div>${pct?`<div class="mini-progress" aria-label="Progres ${pct}%"><i style="width:${pct}%"></i></div>`:''}</div></article>`;
}
function renderHome(){
 const featured=NOVELS.find(n=>n.id===9), popular=[NOVELS[8],NOVELS[9],NOVELS[10],NOVELS[14],NOVELS[6]], newest=[...NOVELS].slice(-5).reverse();
 app.innerHTML=`<section class="hero container"><div class="hero-copy"><div class="eyebrow"><span></span> PERPUSTAKAAN CERITA DIGITAL</div><h1>Setiap cerita punya<br><em>dunianya sendiri.</em></h1><p>Temukan kisah yang terasa dekat, jelajahi dunia yang belum pernah kamu kenal, dan nikmati setiap halaman dengan caramu sendiri.</p><div class="hero-buttons"><a class="button button-dark" href="#/jelajahi">Jelajahi Novel <span>↗</span></a><a class="text-link" href="#/genre">Genre <span>→</span></a><button class="text-link ghost-btn" data-random>Acak satu cerita ↻</button></div><div class="hero-note"><span><strong>15 novel pilihan</strong><br>untuk mulai dijelajahi</span></div></div>
 <div class="hero-art"><div class="hero-image"></div><a class="hero-book" href="#/novel/${featured.id}" aria-label="Lihat ${esc(featured.title)}">${coverMarkup(featured)}</a><div class="hero-caption"><span>KOLEKSI UNGGULAN</span><strong>${esc(featured.title)}</strong><small>${esc(featured.author)} · ${esc(featured.genre)}</small></div></div></section>
 <section class="container feature-strip"><div><span class="feature-icon">✧</span><p><b>Temukan</b><small>Jelajahi koleksi berdasarkan genre</small></p></div><div><span class="feature-icon">⌕</span><p><b>Pahami</b><small>Baca sinopsis dan detail karya</small></p></div><div><span class="feature-icon">▤</span><p><b>Nikmati</b><small>Simpan progres bacaanmu</small></p></div></section>
 <section class="section container" id="continueSection" ${Object.keys(history).length?'':'hidden'}><div class="section-heading"><div><div class="eyebrow">LANJUTKAN CERITAMU</div><h2>Terakhir kamu baca</h2></div><a class="text-link" href="#/riwayat">Lihat riwayat →</a></div><div id="continueGrid" class="book-grid compact-grid"></div></section>
 <section class="section container"><div class="section-heading"><div><div class="eyebrow">REKOMENDASI PILIHAN</div><h2>Cerita yang layak <em>dibuka.</em></h2><p class="section-desc">Pilihan bacaan dari katalog novel Indonesia.</p></div><a class="text-link" href="#/jelajahi">Lihat semua novel →</a></div><div class="book-grid">${popular.map(bookCard).join('')}</div></section>
 <section class="genre-band"><div class="container genre-band-inner"><div><div class="eyebrow">MULAI DARI SUASANAMU</div><h2>Hari ini ingin membaca<br><em>cerita seperti apa?</em></h2></div><div class="genre-pills">${GENRES.map(g=>`<a class="genre-pill" href="#/genre/${encodeURIComponent(g)}">${esc(g)}<span>↗</span></a>`).join('')}</div></div></section>
 <section class="section container"><div class="section-heading"><div><div class="eyebrow">JELAJAHI LAGI</div><h2>Beragam kisah <em>menanti.</em></h2></div><a class="text-link" href="#/jelajahi">Jelajahi koleksi →</a></div><div class="book-grid">${newest.map(bookCard).join('')}</div></section>
 ${communitySection()}<section class="quote-section container"><span class="quote-mark">“</span><blockquote>Di antara banyak hal yang bisa kita tinggalkan, cerita selalu punya cara untuk tinggal.</blockquote><span class="quote-credit">— CATATAN PEMBACA MARI NOVEL</span></section>`;
 if(Object.keys(history).length){const ids=Object.keys(history).sort((a,b)=>(history[b].time||0)-(history[a].time||0)).slice(0,4);$('#continueGrid').innerHTML=ids.map(id=>NOVELS.find(n=>n.id==id)).filter(Boolean).map(bookCard).join('')}
}
function renderListing(title,desc,books=NOVELS){
 app.innerHTML=`<section class="page-intro container"><div class="eyebrow">JELAJAHI PERPUSTAKAAN</div><h1>${title}</h1><p>${desc}</p></section><section class="container listing-section"><div class="filter-row"><div class="filter-pills"><button class="filter-chip ${currentFilter==='Semua'?'active':''}" data-filter="Semua">Semua</button>${GENRES.map(g=>`<button class="filter-chip ${currentFilter===g?'active':''}" data-filter="${esc(g)}">${esc(g)}</button>`).join('')}</div><select id="sortSelect" aria-label="Urutkan novel"><option value="popular">Urutan katalog</option><option value="az">Judul A–Z</option><option value="author">Penulis A–Z</option></select></div><p class="result-count" id="resultCount"></p><div class="book-grid" id="listingGrid"></div></section>`;
 updateListing(books);
}
function currentListingBase(){
 if(location.hash.startsWith('#/favorit'))return NOVELS.filter(n=>favorites.includes(n.id));
 if(location.hash.startsWith('#/genre/'))return NOVELS.filter(n=>n.genre===decodeURIComponent(location.hash.split('/')[2]));
 return NOVELS;
}
function updateListing(base=NOVELS){
 let list=base.filter(b=>(currentFilter==='Semua'||b.genre===currentFilter)&&(!searchTerm||(b.title+' '+b.author+' '+b.genre).toLowerCase().includes(searchTerm)));
 const sort=$('#sortSelect')?.value||'popular';
 if(sort==='az')list.sort((a,b)=>a.title.localeCompare(b.title));
 if(sort==='author')list.sort((a,b)=>a.author.localeCompare(b.author));
 $('#listingGrid').innerHTML=list.length?list.map(bookCard).join(''):'<div class="empty-state"><span>⌕</span><h3>Belum ada cerita yang cocok</h3><p>Coba kata kunci atau genre lainnya.</p></div>';
 $('#resultCount').textContent=`Menampilkan ${list.length} dari ${base.length} novel`;
}
function renderGenres(){
 app.innerHTML=`<section class="page-intro container"><div class="eyebrow">PILIH SUASANA CERITAMU</div><h1>Jelajahi berdasarkan <em>genre.</em></h1><p>Setiap genre punya rasa dan petualangannya sendiri. Pilih yang paling sesuai dengan suasana hatimu.</p></section><section class="container genre-catalog">${GENRES.map((g,i)=>`<a class="genre-tile genre-${i%7}" href="#/genre/${encodeURIComponent(g)}"><span>0${i+1} / GENRE</span><strong>${esc(g)}</strong><small>${NOVELS.filter(n=>n.genre===g).length} novel</small><i>↗</i></a>`).join('')}</section>`;
}
function renderFavorites(){const list=NOVELS.filter(n=>favorites.includes(n.id));currentFilter='Semua';renderListing('Novel <em>favoritmu.</em>','Kumpulan cerita yang kamu simpan agar mudah ditemukan kembali.',list)}
function renderHistory(){
 const list=Object.keys(history).sort((a,b)=>(history[b].time||0)-(history[a].time||0)).map(id=>NOVELS.find(n=>n.id==id)).filter(Boolean);
 app.innerHTML=`<section class="page-intro container"><div class="eyebrow">JEJAK BACAANMU</div><h1>Perjalanan <em>membaca.</em></h1><p>Temukan kembali cerita dan bagian demonstrasi terakhir yang pernah kamu buka.</p></section><section class="container listing-section"><div class="book-grid">${list.length?list.map(bookCard).join(''):'<div class="empty-state"><span>▤</span><h3>Belum ada riwayat bacaan</h3><p>Novel yang kamu buka akan muncul di sini.</p><a class="button button-dark" href="#/jelajahi">Cari novel</a></div>'}</div></section>`;
}
function renderDetail(id){
 const b=NOVELS.find(n=>n.id===Number(id));if(!b){location.hash='#/jelajahi';return}
 const saved=favorites.includes(b.id),p=progress[b.id]||{chapter:0,percent:0};
 app.innerHTML=`<section class="container detail-page"><a class="back-link" href="#/jelajahi">← Kembali ke koleksi</a><div class="detail-layout"><div class="detail-cover">${coverMarkup(b,true)}<div class="detail-cover-caption">REFERENSI SAMPUL EDISI BUKU · <a href="${b.source}" target="_blank" rel="noopener">SUMBER</a></div></div><div class="detail-copy"><div class="eyebrow">${esc(b.genre.toUpperCase())} · KOLEKSI NOVEL</div><h1>${esc(b.title)}</h1><p class="detail-author">Ditulis oleh <strong>${esc(b.author)}</strong></p><div class="detail-stats"><span><b>${esc(b.genre)}</b></span><span><b>Katalog novel</b></span></div><h3 class="synopsis-label">Sinopsis</h3><p class="detail-synopsis">${esc(b.synopsis)}</p><div class="detail-actions"><button class="button button-dark" data-read="${b.id}">${p.percent?'Lanjutkan Membaca':'Mulai Membaca'} <span>→</span></button><button class="button button-outline" data-fav="${b.id}">${saved?'♥ Tersimpan':'♡ Tambah Favorit'}</button></div><div class="demo-notice"><strong>Catatan ruang baca</strong><p>Bagian yang tersedia di website ini adalah teks demonstrasi original, bukan isi atau bab asli novel. Untuk membaca karya lengkap, kunjungi sumber resmi.</p><a href="${b.source}" target="_blank" rel="noopener">Lihat sumber buku ↗</a></div><div class="detail-divider"></div><div class="chapter-heading"><h3>Bagian demonstrasi</h3><span>${DEMO_CHAPTERS.length} bagian</span></div><div class="chapter-list">${DEMO_CHAPTERS.map((c,i)=>`<button class="chapter-item" data-read="${b.id}" data-chapter="${i}"><span class="chapter-number">${String(i+1).padStart(2,'0')}</span><span><b>${esc(c.title)}</b><small>${i===p.chapter&&p.percent?'Terakhir dibuka':'Teks original demonstrasi'}</small></span><span class="chapter-arrow">→</span></button>`).join('')}</div></div></div></section>`;
}
function renderReader(id,chapter=0){
 const b=NOVELS.find(n=>n.id===Number(id));if(!b)return;
 chapter=Math.max(0,Math.min(Number(chapter)||0,DEMO_CHAPTERS.length-1));
 const c=DEMO_CHAPTERS[chapter],pct=Math.round((chapter+1)/DEMO_CHAPTERS.length*100);
 history[b.id]={chapter,time:Date.now()};progress[b.id]={chapter,percent:pct};store.set('history',history);store.set('progress',progress);
 app.innerHTML=`<section class="reader-shell"><div class="reader-top"><a href="#/novel/${b.id}" class="back-link">← Detail novel</a><div class="reader-tools"><button class="reader-tool" id="fontDown" title="Perkecil tulisan" aria-label="Perkecil tulisan">A−</button><button class="reader-tool" id="fontUp" title="Perbesar tulisan" aria-label="Perbesar tulisan">A+</button><button class="reader-tool" id="readerTheme" title="Ganti tema baca" aria-label="Ganti tema baca">◐</button></div></div><div class="reader-progress"><span style="width:${pct}%"></span></div><article class="reading-paper" id="readingPaper"><div class="eyebrow">${esc(b.title).toUpperCase()} · TEKS DEMONSTRASI</div><h1>${esc(c.title)}</h1><div class="reading-divider"></div><div class="demo-reader-note">Teks berikut ditulis khusus untuk demonstrasi antarmuka. Ini bukan kutipan dari novel ${esc(b.title)}.</div><div class="reading-text" id="readingText">${c.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}</div><div class="reading-end">· · ·</div></article><div class="reader-bottom"><span>Bagian ${chapter+1} dari ${DEMO_CHAPTERS.length}</span><div><button class="button button-outline" data-read="${b.id}" data-chapter="${chapter-1}" ${chapter===0?'disabled':''}>← Sebelumnya</button><button class="button button-dark" data-read="${b.id}" data-chapter="${chapter+1}" ${chapter===DEMO_CHAPTERS.length-1?'disabled':''}>Selanjutnya →</button></div><span>${pct}% progres demo</span></div></section>`;
 let size=Number(store.get('fontSize',19));$('#readingText').style.fontSize=size+'px';
 if(store.get('readerDark',false))$('#readingPaper').classList.add('reader-dark');
 $('#fontDown').onclick=()=>{size=Math.max(15,size-1);$('#readingText').style.fontSize=size+'px';store.set('fontSize',size)};
 $('#fontUp').onclick=()=>{size=Math.min(28,size+1);$('#readingText').style.fontSize=size+'px';store.set('fontSize',size)};
 $('#readerTheme').onclick=()=>{const dark=$('#readingPaper').classList.toggle('reader-dark');store.set('readerDark',dark)};
}

/* Akun lokal: cocok untuk demo tanpa backend. Kredensial tidak dikirim ke server. */
function accounts(){return store.get('accounts',[])}
function activeAccount(){const id=store.get('activeAccount',null);return accounts().find(a=>a.id===id)||null}
async function passwordDigest(value){
  const bytes=new TextEncoder().encode(value);
  if(globalThis.crypto?.subtle){const hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('')}
  return btoa(unescape(encodeURIComponent(value)));
}
function refreshAccountLink(){const a=activeAccount(),el=$('#accountLink');if(el)el.textContent=a?(a.name.split(' ')[0]||'Akun'):'Masuk'}
function renderAccount(){
 const a=activeAccount();
 if(a){
  app.innerHTML=`<section class="page-intro container"><div class="eyebrow">RUANG PRIBADI</div><h1>Halo, <em>${esc(a.name)}.</em></h1><p>Selamat datang kembali di Mari Novel. Kelola profil dan nikmati cerita favoritmu.</p></section>
  <section class="container account-layout"><div class="account-card"><div class="account-avatar">${esc((a.name||'M').trim().charAt(0).toUpperCase())}</div><div><div class="eyebrow">PROFIL PEMBACA</div><h2>${esc(a.name)}</h2><p>${esc(a.email)}</p><span class="account-local-note">Akun tersimpan di browser/perangkat ini</span></div></div>
  <div class="account-stats"><a class="stat-link" href="#/favorit"><b>${favorites.length}</b><span>Favorit</span></a><a class="stat-link" href="#/riwayat"><b>${Object.keys(history).length}</b><span>Riwayat baca</span></a><a class="stat-link" href="#/karya-saya"><b>${userWorks().length}</b><span>Karya saya</span></a></div>
  <nav class="account-menu" aria-label="Menu akun"><a class="menu-tile menu-primary" href="#/karya-saya"><span class="menu-icon">✎</span><span class="menu-text"><b>Karya saya</b><small>${userWorks().length} karya yang kamu unggah</small></span><i>→</i></a><a class="menu-tile" href="#/studio"><span class="menu-icon">✍</span><span class="menu-text"><b>Studio Penulis</b><small>Tulis atau unggah karya baru</small></span><i>→</i></a><a class="menu-tile" href="#/favorit"><span class="menu-icon">♥</span><span class="menu-text"><b>Favorit</b><small>Novel yang kamu simpan</small></span><i>→</i></a><a class="menu-tile" href="#/riwayat"><span class="menu-icon">▤</span><span class="menu-text"><b>Riwayat baca</b><small>Lanjutkan bacaan terakhir</small></span><i>→</i></a></nav>
  <div class="account-actions"><button class="button button-outline" id="logoutBtn">Keluar dari akun</button><button class="text-link" id="deleteAccountBtn">Hapus akun lokal</button></div></section>`;
  $('#logoutBtn').onclick=()=>{store.set('activeAccount',null);refreshAccountLink();notify('Kamu telah keluar');location.hash='#/';};
  $('#deleteAccountBtn').onclick=()=>{if(!confirm('Hapus akun lokal ini? Data akun tidak dapat dipulihkan.'))return;store.set('accounts',accounts().filter(x=>x.id!==a.id));store.set('activeAccount',null);refreshAccountLink();notify('Akun lokal dihapus');location.hash='#/';};
  return;
 }
 app.innerHTML=`<section class="page-intro container"><div class="eyebrow">AKUN MARI NOVEL</div><h1>Masuk ke dunia <em>ceritamu.</em></h1><p>Buat akun lokal untuk menandai profil pembaca di perangkat ini. Tidak perlu database atau server.</p></section>
 <section class="container auth-layout"><div class="auth-card"><div class="auth-tabs"><button class="auth-tab active" data-auth-tab="login">Masuk</button><button class="auth-tab" data-auth-tab="register">Buat akun</button></div>
 <form id="loginForm" class="auth-form"><label>Email<input id="loginEmail" type="email" autocomplete="username" required placeholder="nama@email.com"></label><label>Kata sandi<input id="loginPassword" type="password" autocomplete="current-password" minlength="6" required placeholder="Minimal 6 karakter"></label><button class="button button-dark" type="submit">Masuk ke Mari Novel ↗</button><p class="form-hint">Akun ini hanya berlaku di browser dan perangkat tempat dibuat.</p></form>
 <form id="registerForm" class="auth-form" hidden><label>Nama pengguna<input id="registerName" required maxlength="50" autocomplete="name" placeholder="Nama yang ingin ditampilkan"></label><label>Email<input id="registerEmail" type="email" required autocomplete="email" placeholder="nama@email.com"></label><label>Kata sandi<input id="registerPassword" type="password" minlength="6" required autocomplete="new-password" placeholder="Minimal 6 karakter"></label><label>Ulangi kata sandi<input id="registerConfirm" type="password" minlength="6" required autocomplete="new-password" placeholder="Ketik ulang kata sandi"></label><button class="button button-dark" type="submit">Buat akun ↗</button><p class="form-hint">Gunakan kata sandi demo, jangan gunakan kata sandi penting yang dipakai di layanan lain.</p></form>
 <div class="auth-note"><b>Catatan penyimpanan</b><p>Karena belum memakai database, akun dan aktivitas hanya tersimpan di penyimpanan lokal browser. Menghapus data browser atau berpindah perangkat dapat menghilangkannya. Ini bukan sistem autentikasi aman untuk produksi.</p></div></div></section>`;
 document.querySelectorAll('[data-auth-tab]').forEach(btn=>btn.onclick=()=>{const reg=btn.dataset.authTab==='register';document.querySelectorAll('[data-auth-tab]').forEach(x=>x.classList.toggle('active',x===btn));$('#loginForm').hidden=reg;$('#registerForm').hidden=!reg});
 $('#registerForm').onsubmit=async e=>{e.preventDefault();const name=$('#registerName').value.trim(),email=$('#registerEmail').value.trim().toLowerCase(),pass=$('#registerPassword').value,confirmPass=$('#registerConfirm').value;if(pass!==confirmPass){notify('Konfirmasi kata sandi tidak sama');return}if(accounts().some(x=>x.email===email)){notify('Email sudah terdaftar di browser ini');return}const list=accounts();const account={id:'user_'+Date.now(),name,email,passwordHash:await passwordDigest(pass),createdAt:Date.now()};list.push(account);store.set('accounts',list);store.set('activeAccount',account.id);refreshAccountLink();notify('Akun berhasil dibuat. Selamat datang, '+(name.split(' ')[0]||'Pembaca')+'!');goTo('#/akun')};
 $('#loginForm').onsubmit=async e=>{e.preventDefault();const email=$('#loginEmail').value.trim().toLowerCase(),hash=await passwordDigest($('#loginPassword').value),account=accounts().find(x=>x.email===email&&x.passwordHash===hash);if(!account){notify('Email atau kata sandi tidak cocok');return}store.set('activeAccount',account.id);refreshAccountLink();notify('Berhasil masuk');goTo('#/akun')};
}

function route(){
 refreshAccountLink();
 const parts=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean),page=parts[0]||'home';
 document.querySelectorAll('[data-nav]').forEach(a=>a.classList.toggle('active',({home:'home',jelajahi:'explore',genre:'genre',favorit:'favorites',riwayat:'history',studio:'studio',akun:'account'})[page]===a.dataset.nav));
 $('#favoriteCount').textContent=favorites.length;
 if(page==='home')renderHome();
 else if(page==='jelajahi'){currentFilter='Semua';renderListing('Temukan cerita <em>berikutnya.</em>','Jelajahi koleksi novel nyata, temukan penulis baru, dan pilih cerita yang menarik perhatianmu.',NOVELS)}
 else if(page==='genre'&&parts[1]){currentFilter=decodeURIComponent(parts[1]);renderListing(`Genre <em>${esc(currentFilter)}.</em>`,`Pilihan cerita dalam genre ${esc(currentFilter)}.`,NOVELS.filter(n=>n.genre===currentFilter))}
 else if(page==='genre')renderGenres();
 else if(page==='favorit')renderFavorites();
 else if(page==='riwayat')renderHistory();
 else if(page==='novel')renderDetail(parts[1]);
 else if(page==='baca')renderReader(parts[1],parts[2]||0);
 else if(page==='studio')renderStudio();
 else if(page==='akun')renderAccount();
 else if(page==='karya-saya')renderMyWorks();
 else if(page==='karya')renderUserWork(parts[1]);
 else if(page==='baca-karya')renderUserReader(parts[1]);
 else renderHome();
 window.scrollTo({top:0,behavior:'instant'});$('#mainNav').classList.remove('open');
}
app.addEventListener('click',e=>{
 const fav=e.target.closest('[data-fav]');if(fav){const id=Number(fav.dataset.fav);favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];store.set('favorites',favorites);notify(favorites.includes(id)?'Ditambahkan ke favorit':'Dihapus dari favorit');if(location.hash.startsWith('#/favorit'))renderFavorites();else if(location.hash.startsWith('#/novel/'))renderDetail(location.hash.split('/')[2]);else route();$('#favoriteCount').textContent=favorites.length;return}
 const detail=e.target.closest('[data-detail]');if(detail){location.hash=`#/novel/${detail.dataset.detail}`;return}
 const read=e.target.closest('[data-read]');if(read){const id=read.dataset.read,ch=Number(read.dataset.chapter??progress[id]?.chapter??0);if(ch<0){notify('Kamu sudah berada di bagian pertama');return}if(ch>=DEMO_CHAPTERS.length){notify('Kamu sudah mencapai bagian terakhir');return}location.hash=`#/baca/${id}/${ch}`;return}
 const filter=e.target.closest('[data-filter]');if(filter){currentFilter=filter.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===filter));updateListing(currentListingBase());}
});
app.addEventListener('change',e=>{if(e.target.id==='sortSelect')updateListing(currentListingBase())});
$('#globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){searchTerm=e.target.value.trim().toLowerCase();currentFilter='Semua';location.hash='#/jelajahi';setTimeout(()=>{if($('#listingGrid'))updateListing()},0)}});
$('#globalSearch').addEventListener('input',e=>{if(location.hash.startsWith('#/jelajahi')&&$('#listingGrid')){searchTerm=e.target.value.trim().toLowerCase();updateListing()}});
$('#themeToggle').onclick=()=>{document.body.classList.toggle('dark-theme');const dark=document.body.classList.contains('dark-theme');store.set('dark',dark);$('#themeToggle').textContent=dark?'☀':'☾'};
if(store.get('dark',false)){document.body.classList.add('dark-theme');$('#themeToggle').textContent='☀'}
$('#mobileMenu').onclick=()=>$('#mainNav').classList.toggle('open');
window.addEventListener('hashchange',route);
route();

/* Studio Penulis — karya pengguna disimpan lokal pada perangkat ini. */
function allWorks(){return store.get('userWorks',[])}
function userWorks(){const a=activeAccount();return a?allWorks().filter(w=>w.ownerId===a.id):[]}
function findWork(id){const a=activeAccount();return allWorks().find(w=>w.id===id&&((a&&w.ownerId===a.id)||w.status==='published'))||sharedWorks.find(w=>w.id===id)}
function ownsWork(w){return !!w.ownerId&&activeAccount()?.id===w.ownerId}
function missingWork(){if(!sharedLoaded){app.innerHTML='<section class="container page-intro"><p>Memuat karya…</p></section>';return}location.hash=activeAccount()?'#/karya-saya':'#/'}
function renderStudio(){
 if(!activeAccount()){app.innerHTML=`<section class="page-intro container"><div class="eyebrow">RUANG KREATIF MARI NOVEL</div><h1>Ceritamu layak <em>dibagikan.</em></h1><p>Masuk ke akunmu agar karya yang kamu unggah tersimpan di menu Karya saya.</p></section><section class="container auth-layout"><div class="auth-card studio-lock"><span class="studio-icon">✍</span><h2>Masuk dulu untuk menulis</h2><p>Setiap karya yang kamu unggah akan masuk ke menu <b>Karya saya</b> di akunmu.</p><a class="button button-dark" href="#/akun">Masuk / Buat akun ↗</a></div></section>`;return}
 const works=userWorks();
 app.innerHTML=`<section class="page-intro container"><div class="eyebrow">RUANG KREATIF MARI NOVEL</div><h1>Ceritamu layak <em>dibagikan.</em></h1><p>Tulis karya dari awal, impor naskah teks, simpan sebagai draf, lalu terbitkan ke koleksi pribadimu.</p></section>
 <section class="container studio-layout"><div class="studio-panel"><div class="studio-panel-head"><div><div class="eyebrow">EDITOR NASKAH</div><h2 id="studioFormTitle">Mulai cerita baru</h2></div><span class="studio-icon">✍</span></div>
 <form id="novelForm" class="novel-form"><input type="hidden" id="workId"><label>Judul novel<input id="workTitle" required maxlength="90" placeholder="Contoh: Hujan di Bulan Juni"></label><div class="form-two"><label>Nama penulis<input id="workAuthor" required maxlength="60" placeholder="Nama pena"></label><label>Genre<select id="workGenre"><option>Romance</option><option>Drama</option><option>Fantasy</option><option>Fiksi Sejarah</option><option>Sastra</option><option>Komedi</option><option>Science Fiction</option><option>Misteri</option><option>Petualangan</option></select></label></div>
 <label>Sinopsis<textarea id="workSynopsis" rows="4" maxlength="700" placeholder="Ceritakan gambaran novelmu..." required></textarea></label><label>Judul bab pertama<input id="workChapterTitle" required maxlength="90" value="Bab 1 — Awal Cerita"></label><label>Isi naskah<textarea id="workContent" rows="12" placeholder="Mulai tulis ceritamu di sini..." required></textarea></label><div class="import-row"><label class="file-pick">↥ Impor .TXT / .MD<input id="manuscriptFile" type="file" accept=".txt,.md,text/plain,text/markdown" hidden></label><span id="fileName">Kamu juga bisa mengetik langsung.</span></div><label class="cover-upload">Sampul novel (opsional)<input id="workCover" type="file" accept="image/png,image/jpeg,image/webp"></label><div class="studio-actions"><button class="button button-outline" type="button" id="saveDraft">Simpan Draf</button><button class="button button-dark" type="submit">Terbitkan Karya ↗</button></div><p class="form-hint">Draf dan karya tersimpan di browser perangkat ini. Hindari menutup tab sebelum proses penyimpanan selesai.</p></form></div>
 <aside class="studio-aside"><div class="studio-aside-top"><div class="eyebrow">DASHBOARD PENULIS</div><h2>Karya saya</h2><p>${works.length} karya di akunmu</p><a class="text-link" href="#/karya-saya">Buka halaman Karya saya →</a></div><div id="myWorks" class="my-works">${works.length?works.map(w=>`<article class="my-work"><div class="my-work-cover">${w.cover?`<img src="${w.cover}" alt="">`:'✧'}</div><div class="my-work-info"><b>${esc(w.title)}</b><small>${esc(w.genre)} · ${w.status==='published'?'Diterbitkan':'Draf'}</small><div><button data-edit-work="${w.id}">Edit</button>${w.status==='published'?`<a href="#/karya/${w.id}">Baca</a>`:''}<button data-delete-work="${w.id}" class="danger-link">Hapus</button></div></div></article>`).join(''):'<div class="empty-state compact-empty"><span>✎</span><h3>Belum ada karya</h3><p>Karya yang kamu buat akan muncul di sini.</p></div>'}</div></aside></section>`;
 $('#novelForm').addEventListener('submit',e=>saveWork(e,'published'));
 $('#saveDraft').addEventListener('click',()=>saveWork(null,'draft'));
 $('#manuscriptFile').addEventListener('change',async e=>{const f=e.target.files[0];if(!f)return;$('#fileName').textContent=f.name;$('#workContent').value=await f.text();if(!$('#workTitle').value)$('#workTitle').value=f.name.replace(/\.(txt|md)$/i,'');notify('Naskah berhasil dimuat ke editor')});
 $('#myWorks').addEventListener('click',e=>{const edit=e.target.closest('[data-edit-work]'),del=e.target.closest('[data-delete-work]');if(edit){const w=userWorks().find(x=>x.id===edit.dataset.editWork);if(w){fillWork(w);window.scrollTo({top:300,behavior:'smooth'})}}if(del&&confirm('Hapus karya ini?')){store.set('userWorks',allWorks().filter(x=>x.id!==del.dataset.deleteWork));renderStudio();notify('Karya dihapus')}});
 const em=location.hash.match(/^#\/studio\/edit\/(.+)$/);if(em){const w=userWorks().find(x=>x.id===decodeURIComponent(em[1]));if(w)fillWork(w)}
}
function fillWork(w){$('#workId').value=w.id;$('#workTitle').value=w.title;$('#workAuthor').value=w.author;$('#workGenre').value=w.genre;$('#workSynopsis').value=w.synopsis;$('#workChapterTitle').value=w.chapterTitle;$('#workContent').value=w.content;$('#studioFormTitle').textContent='Edit karya'}
function saveWork(event,status){if(event)event.preventDefault();const title=$('#workTitle').value.trim(),author=$('#workAuthor').value.trim(),content=$('#workContent').value.trim();if(!title||!author||!content){notify('Lengkapi judul, penulis, dan isi naskah');return}const acc=activeAccount();if(!acc){notify('Masuk dulu untuk menyimpan karya');goTo('#/akun');return}const works=allWorks(),id=$('#workId').value||('work_'+Date.now());const old=works.find(w=>w.id===id&&w.ownerId===acc.id);const coverFile=$('#workCover').files[0];const commit=cover=>{const w={id,title,author,genre:$('#workGenre').value,synopsis:$('#workSynopsis').value.trim(),chapterTitle:$('#workChapterTitle').value.trim()||'Bab 1',content,cover:cover||old?.cover||'',status,ownerId:acc.id,updatedAt:Date.now()};const next=works.filter(x=>x.id!==id);next.unshift(w);if(!store.set('userWorks',next)){notify('Penyimpanan penuh. Coba gunakan sampul yang lebih kecil.');return}notify(status==='published'?'Karya berhasil diunggah ke Karya saya':'Draf tersimpan di Karya saya');goTo('#/karya-saya')};if(coverFile){const reader=new FileReader();reader.onload=()=>commit(reader.result);reader.readAsDataURL(coverFile)}else commit(old?.cover||'')}
function renderUserWork(id){const w=findWork(id);if(!w){missingWork();return}app.innerHTML=`<section class="container detail-page"><a class="back-link" href="${ownsWork(w)?'#/karya-saya':'#/'}">← Kembali ke ${ownsWork(w)?'Karya saya':'beranda'}</a><div class="detail-layout"><div class="detail-cover">${w.cover?`<img class="uploaded-cover" src="${w.cover}" alt="Sampul ${esc(w.title)}">`:`<div class="book-cover cover-fallback"><span class="cover-kicker">MARI NOVEL · ${esc(w.genre.toUpperCase())}</span><strong>${esc(w.title)}</strong><small>${esc(w.author)}</small></div>`}</div><div class="detail-copy"><div class="eyebrow">KARYA KOMUNITAS · ${esc(w.genre.toUpperCase())}</div><h1>${esc(w.title)}</h1><p class="detail-author">Ditulis oleh <strong>${esc(w.author)}</strong></p><h3 class="synopsis-label">Tentang cerita ini</h3><p class="detail-synopsis">${esc(w.synopsis||'Belum ada sinopsis.')}</p><div class="detail-actions"><button class="button button-dark" id="readUserWork">Mulai Membaca →</button>${ownsWork(w)?'<a class="button button-outline" href="#/karya-saya">Kelola karya</a>':''}</div><div class="chapter-heading"><h3>Daftar bab</h3><span>1 bab</span></div><div class="chapter-list"><button class="chapter-item" id="readUserWork2"><span class="chapter-number">01</span><span><b>${esc(w.chapterTitle)}</b><small>Karya penulis komunitas</small></span><span class="chapter-arrow">→</span></button></div></div></div></section>`;$('#readUserWork').onclick=$('#readUserWork2').onclick=()=>location.hash=`#/baca-karya/${id}`}
function renderUserReader(id){const w=findWork(id);if(!w){missingWork();return}app.innerHTML=`<section class="reader-shell"><div class="reader-top"><a href="#/karya/${id}" class="back-link">← Detail karya</a><div class="reader-tools"><button class="reader-tool" id="fontDown">A−</button><button class="reader-tool" id="fontUp">A+</button><button class="reader-tool" id="readerTheme">◐</button></div></div><article class="reading-paper" id="readingPaper"><div class="eyebrow">MARI NOVEL · KARYA KOMUNITAS</div><h1>${esc(w.chapterTitle)}</h1><div class="reading-divider"></div><div class="reading-text" id="readingText">${w.content.split(/\n\s*\n/).map(t=>`<p>${esc(t).replace(/\n/g,'<br>')}</p>`).join('')}</div></article></section>`;let size=Number(store.get('fontSize',19));$('#readingText').style.fontSize=size+'px';if(store.get('readerDark',false))$('#readingPaper').classList.add('reader-dark');$('#fontDown').onclick=()=>{size=Math.max(15,size-1);$('#readingText').style.fontSize=size+'px';store.set('fontSize',size)};$('#fontUp').onclick=()=>{size=Math.min(28,size+1);$('#readingText').style.fontSize=size+'px';store.set('fontSize',size)};$('#readerTheme').onclick=()=>{const dark=$('#readingPaper').classList.toggle('reader-dark');store.set('readerDark',dark)}}


/* Penyempurnaan: bacaan serupa, mode baca, navigasi keyboard, animasi masuk */
(function(){
 const _rd=renderDetail,_rr=renderReader,_ru=renderUserReader;
 renderDetail=function(id){_rd(id);const b=NOVELS.find(n=>n.id===Number(id));if(!b||!$('.detail-page'))return;
  const same=NOVELS.filter(n=>n.genre===b.genre&&n.id!==b.id),rest=NOVELS.filter(n=>n.genre!==b.genre&&n.id!==b.id),pool=[...same,...rest].slice(0,5);
  $('.detail-page').insertAdjacentHTML('beforeend',`<div class="related"><div class="section-heading"><div><div class="eyebrow">BACAAN SERUPA</div><h2>Mungkin kamu <em>suka.</em></h2></div></div><div class="book-grid">${pool.map(bookCard).join('')}</div></div>`)};
 function tune(){
  const paper=$('#readingPaper'),tools=$('.reader-tools');if(!paper||!tools)return;
  paper.classList.toggle('reader-sans',store.get('readerSans',false));
  const apply=m=>{paper.classList.remove('reader-dark','reader-sepia');if(m!=='light')paper.classList.add('reader-'+m)};
  apply(store.get('readerMode',store.get('readerDark',false)?'dark':'light'));
  const old=$('#readerTheme'),btn=old.cloneNode(true);old.replaceWith(btn);btn.title='Tema baca: terang / sepia / gelap';
  btn.onclick=()=>{const n=({light:'sepia',sepia:'dark',dark:'light'})[store.get('readerMode','light')]||'sepia';store.set('readerMode',n);apply(n)};
  tools.insertAdjacentHTML('afterbegin','<button class="reader-tool" id="fontFace" title="Ganti jenis huruf" aria-label="Ganti jenis huruf">Aa</button>');
  $('#fontFace').onclick=()=>{store.set('readerSans',paper.classList.toggle('reader-sans'))};
  const w=($('#readingText').textContent.match(/\S+/g)||[]).length;
  $('.reading-paper h1').insertAdjacentHTML('afterend',`<div class="read-meta">${Math.max(1,Math.round(w/200))} menit baca</div>`);
 }
 renderReader=function(a,b){_rr(a,b);tune()};renderUserReader=function(a){_ru(a);tune()};
 document.addEventListener('keydown',e=>{
  const t=document.activeElement.tagName;if(/INPUT|TEXTAREA|SELECT/.test(t)){return}
  if(e.key==='/'){e.preventDefault();$('#globalSearch').focus();return}
  if(!$('#readingPaper'))return;const b=e.key==='ArrowRight'?$('.reader-bottom .button-dark'):e.key==='ArrowLeft'?$('.reader-bottom .button-outline'):null;if(b&&!b.disabled)b.click()});
 app.addEventListener('click',e=>{if(e.target.closest('[data-random]'))location.hash='#/novel/'+NOVELS[Math.floor(Math.random()*NOVELS.length)].id});
 addEventListener('scroll',()=>$('.site-header').classList.toggle('scrolled',scrollY>8),{passive:true});
 const io='IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion:reduce)').matches?new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.06,rootMargin:'0px 0px -24px 0px'}):null;
 let tm;new MutationObserver(()=>{clearTimeout(tm);tm=setTimeout(()=>{if(!io)return;app.querySelectorAll('.book-card,.genre-tile,.section-heading,.quote-section,.studio-panel,.studio-aside,.account-card').forEach((el,i)=>{if(el.dataset.rv)return;el.dataset.rv=1;el.classList.add('rv');el.style.transitionDelay=Math.min(i%5,4)*50+'ms';io.observe(el)})},0)}).observe(app,{childList:true,subtree:true});
 route();
})();


/* Halaman "Karya saya": hanya karya yang diunggah akun yang sedang masuk. */
function workCover(w){const n=Number(String(w.id).replace(/\D/g,'').slice(-3))||1;return coverMarkup({id:n,title:w.title,author:w.author,genre:w.genre,cover:w.cover})}
function workCard(w){
 const pub=w.status==='published',href=pub?`#/karya/${w.id}`:`#/studio/edit/${w.id}`;
 return `<article class="book-card work-card"><a class="cover-button" href="${href}" aria-label="${pub?'Buka':'Edit'} ${esc(w.title)}">${workCover(w)}</a><span class="work-badge ${pub?'is-pub':''}">${pub?'Diterbitkan':'Draf'}</span><div class="book-info"><a class="book-title" href="${href}">${esc(w.title)}</a><span class="book-author">${esc(w.author)}</span><div class="book-meta"><span>${esc(w.genre)}</span></div><div class="work-actions">${pub?`<a href="#/karya/${w.id}">Baca</a>`:''}<a href="#/studio/edit/${w.id}">Edit</a><button data-mw-delete="${w.id}" class="danger-link">Hapus</button></div></div></article>`;
}
function renderMyWorks(){
 const a=activeAccount();
 if(!a){notify('Masuk dulu untuk melihat karya saya');goTo('#/akun');return}
 const works=userWorks().sort((x,y)=>(y.updatedAt||0)-(x.updatedAt||0));
 app.innerHTML=`<section class="page-intro container"><div class="eyebrow">AKUN · ${esc(a.name.toUpperCase())}</div><h1>Karya <em>saya.</em></h1><p>Semua karya yang kamu tulis dan unggah lewat Studio Penulis ada di sini.</p></section>
 <section class="container listing-section"><div class="works-toolbar"><a class="back-link" href="#/akun">← Kembali ke akun</a><div class="toolbar-actions"><button class="button button-outline" data-export-works>↧ Ekspor karya</button><a class="button button-dark" href="#/studio">+ Unggah karya baru</a></div></div><p class="form-hint export-hint">Ekspor menghasilkan file <b>karya.json</b> berisi karya yang berstatus Diterbitkan. Taruh file itu di folder proyek (sejajar dengan index.html) lalu unggah ke GitHub agar karyamu tampil di semua perangkat.</p><p class="result-count">${works.length} karya</p><div class="book-grid">${works.length?works.map(workCard).join(''):'<div class="empty-state"><span>✎</span><h3>Belum ada karya</h3><p>Karya yang kamu unggah akan tampil di sini.</p><a class="button button-dark" href="#/studio">Mulai menulis</a></div>'}</div></section>`;
}
app.addEventListener('click',e=>{const d=e.target.closest('[data-mw-delete]');if(!d)return;if(!confirm('Hapus karya ini?'))return;store.set('userWorks',allWorks().filter(x=>x.id!==d.dataset.mwDelete));notify('Karya dihapus');renderMyWorks()});


/* Karya komunitas di beranda: semua karya berstatus Diterbitkan yang tersimpan di browser ini. */
function publicWorks(){const local=allWorks().filter(w=>w.status==='published'&&w.ownerId),ids=new Set(local.map(w=>w.id));return [...local,...sharedWorks.filter(w=>!ids.has(w.id))].sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0))}
function publicWorkCard(w){
 const mine=ownsWork(w);
 return `<article class="book-card work-card"><a class="cover-button" href="#/karya/${esc(w.id)}" aria-label="Buka ${esc(w.title)}">${workCover(w)}</a>${mine?'<span class="work-badge is-pub">Karyamu</span>':''}<div class="book-info"><a class="book-title" href="#/karya/${esc(w.id)}">${esc(w.title)}</a><span class="book-author">${esc(w.author)}</span><div class="book-meta"><span>${esc(w.genre)}</span></div></div></article>`;
}
function communitySection(){
 const list=publicWorks().slice(0,10);
 if(!list.length)return '';
 return `<section class="section container"><div class="section-heading"><div><div class="eyebrow">KARYA KOMUNITAS</div><h2>Ditulis oleh <em>pengguna.</em></h2><p class="section-desc">Karya yang diterbitkan di Studio Penulis.</p></div>${activeAccount()?'<a class="text-link" href="#/karya-saya">Karya saya →</a>':''}</div><div class="book-grid">${list.map(publicWorkCard).join('')}</div></section>`;
}

/* Ekspor karya -> karya.json, dan baca karya.json yang ada di situs. */
document.addEventListener('click',e=>{
 if(!e.target.closest('[data-export-works]'))return;
 const list=userWorks().filter(w=>w.status==='published').map(({ownerId,status,...w})=>w);
 if(!list.length){notify('Belum ada karya yang diterbitkan untuk diekspor');return}
 const blob=new Blob([JSON.stringify({version:1,exportedAt:Date.now(),works:list})],{type:'application/json'}),a=document.createElement('a');
 a.href=URL.createObjectURL(blob);a.download='karya.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
 notify(list.length+' karya diekspor ke karya.json');
});
function loadShared(){
 return fetch('karya.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>{
  if(d&&Array.isArray(d.works))sharedWorks=d.works.filter(w=>w&&w.id&&w.title&&w.content).map(w=>({id:String(w.id),title:String(w.title),author:String(w.author||''),genre:String(w.genre||'Drama'),synopsis:String(w.synopsis||''),chapterTitle:String(w.chapterTitle||'Bab 1'),content:String(w.content),cover:/^data:image\/(png|jpe?g|webp);base64,/.test(w.cover||'')?w.cover:'',status:'published',updatedAt:Number(w.updatedAt)||0}));
 }).catch(()=>{}).then(()=>{sharedLoaded=true;const h=location.hash;if(!h||h==='#/'||h.startsWith('#/karya/')||h.startsWith('#/baca-karya/'))route()});
}
loadShared();
