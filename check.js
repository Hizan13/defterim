
const colors=['green','blue','pink','brown','navy','burgundy','cover1','cover2','cover3'],imgCovers=['cover1','cover2','cover3'],styles=['classic','minimal','antique'];let books=JSON.parse(localStorage.getItem('defterim_real_books')||'[]'),current=null,pageIndex=0,theme='green',coverStyle='classic',editTheme='green',editStyle='classic',savedRange=null;const editor=document.getElementById('editor');let selectedImage=null,dragImage=null,dragOffsetX=0,dragOffsetY=0,currentInk='#30271f',pointerDrag=null;
const $=id=>document.getElementById(id);let activeObjectURLs=[];function persist(){try{localStorage.setItem('defterim_real_books',JSON.stringify(books));return true}catch(e){if($('saveStatus'))$('saveStatus').textContent='Kaydedilemedi: telefon depolama alanı dolu olabilir';return false}}
function isImg(t){return imgCovers.includes(t)}
function screen(id){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));$(id).classList.add('active');$('back').style.visibility=id==='shelf'?'hidden':'visible';[['navShelf','shelf'],['navNew','create'],['navSearch','search'],['navSet','settings']].forEach(([b,s])=>$(b).classList.toggle('active',id===s));scrollTo(0,0)}
function buildChoices(){['newThemes','editThemes'].forEach(id=>$(id).innerHTML=colors.map(c=>`<button class="swatch ${c}" aria-label="${c}" onclick="${id==='newThemes'?'chooseNew':'chooseEdit'}('${c}',this)"></button>`).join(''));['newStyles','editStyles'].forEach(id=>$(id).innerHTML=styles.map(s=>`<button class="style-chip ${s==='classic'?'selected':''}" onclick="${id==='newStyles'?'chooseNewStyle':'chooseEditStyle'}('${s}',this)">${s==='classic'?'Klasik yaldızlı':s==='minimal'?'Sade':'Antika işlemeli'}</button>`).join(''))}
function chooseNew(c,e){theme=c;document.querySelectorAll('#newThemes button').forEach(x=>x.classList.remove('selected'));e.classList.add('selected');updatePreview()}
function chooseNewStyle(s,e){coverStyle=s;document.querySelectorAll('#newStyles button').forEach(x=>x.classList.remove('selected'));e.classList.add('selected');updatePreview()}
function updatePreview(){ $('preview').className='cover-preview '+theme+' '+coverStyle+(isImg(theme)?' cimg':'');$('preview').textContent=$('name').value.trim()||'Yeni Defter'}
function newBook(){theme='green';coverStyle='classic';$('name').value='';buildChoices();document.querySelector('#newThemes .green').classList.add('selected');updatePreview();screen('create')}
$('name').addEventListener('input',updatePreview);
function createBook(){current={id:Date.now(),title:$('name').value.trim()||'Adsız Defter',theme,coverStyle,type:$('type').value,pages:['']};books.push(current);persist();showCover()}
function drawShelf(){let el=$('books');el.innerHTML='';books.forEach(b=>{let d=document.createElement('div');let th=colors.includes(b.theme)?b.theme:'green';d.className='book-card '+th+(isImg(th)?' cimg':'');let title=document.createElement('b');title.textContent=b.title;let small=document.createElement('small');small.textContent='KİŞİSEL DEFTER · '+(b.pages?.length||1)+' SAYFA';d.append(title,small);d.onclick=()=>{current=b;if(!Array.isArray(b.pages))b.pages=[''];showCover()};el.append(d)});let a=document.createElement('button');a.className='add-card';a.innerHTML='＋<br>Yeni defter oluştur';a.onclick=newBook;el.append(a)}
function showCover(){if(!current)return;let th=current.theme||'green';$('bigCover').className='cover '+th+' '+(current.coverStyle||'classic')+(isImg(th)?' cimg':'');$('coverTitle').textContent=current.title;screen('coverScreen')}
function openInside(){pageIndex=0;$('readerName').textContent=current.title;screen('reader');renderPage();let p=$('singlePage');p.classList.remove('opening');void p.offsetWidth;p.classList.add('opening')}
function updateEditorInfo(){let t=(editor.innerText||'').trim(),words=t?t.split(/\s+/u).length:0;$('wordCount').textContent=words+' kelime · '+t.length+' karakter'}
function saveCurrentPage(){if(current){current.pages[pageIndex]=editor.innerHTML;let ok=persist();if($('saveStatus'))$('saveStatus').textContent=ok?'Kaydedildi':'Kaydedilemedi';updateEditorInfo()}}
function historyCommand(cmd){editor.focus();document.execCommand(cmd,false,null);saveCurrentPage()}
document.addEventListener('keydown',e=>{if(!document.getElementById('reader').classList.contains('active'))return;let mod=e.metaKey||e.ctrlKey;if(mod&&e.key.toLowerCase()==='z'){e.preventDefault();historyCommand(e.shiftKey?'redo':'undo')}else if(mod&&e.key.toLowerCase()==='y'){e.preventDefault();historyCommand('redo')}})
function renderPage(){activeObjectURLs.forEach(u=>URL.revokeObjectURL(u));activeObjectURLs=[];selectedImage=null;$('imageTools').classList.remove('visible');let v=current.pages[pageIndex]??'';editor.innerHTML=/<(?:span|div|p|br|b|strong|i|em|u|img|a)\b/i.test(v)?v.replace(/blob:[^"']+/g,'#'):v;updateEditorInfo();$('saveStatus').textContent='Kaydedildi';$('pageNum').textContent=pageIndex+1;$('count').textContent=(pageIndex+1)+' / '+current.pages.length;$('singlePage').className='single-page '+(current.type||'lined')+(turnCls?' '+turnCls:'');$('readerName').textContent=current.title;restoreAttachments()}
editor.addEventListener('beforeinput',e=>{
  if(e.inputType!=='insertText'||!e.data||!currentInk)return;
  const sel=getSelection();if(!sel||!sel.rangeCount||!editor.contains(sel.anchorNode))return;
  e.preventDefault();let range=sel.getRangeAt(0);range.deleteContents();let span=document.createElement('span');span.style.color=currentInk;span.textContent=e.data;range.insertNode(span);range.setStartAfter(span);range.collapse(true);sel.removeAllRanges();sel.addRange(range);savedRange=range.cloneRange();saveCurrentPage();
});
editor.addEventListener('input',saveCurrentPage);
editor.addEventListener('paste',e=>{e.preventDefault();document.execCommand('insertText',false,(e.clipboardData||window.clipboardData).getData('text/plain'));saveCurrentPage()});
let turnCls='',turning=false;
function turn(n){if(turning)return;saveCurrentPage();let next=pageIndex+n;if(next<0||next>=current.pages.length)return;turning=true;let p=$('singlePage');turnCls=n>0?'page-turn':'page-turn-back';p.classList.remove('page-turn','page-turn-back','opening');void p.offsetWidth;p.classList.add(turnCls);setTimeout(()=>{pageIndex=next;renderPage()},210);setTimeout(()=>{turnCls='';turning=false;p.classList.remove('page-turn','page-turn-back')},450)}
function addPage(){saveCurrentPage();current.pages.splice(pageIndex+1,0,'');pageIndex++;persist();renderPage();editor.focus()}
document.addEventListener('selectionchange',()=>{let s=getSelection();if(s?.rangeCount&&editor.contains(s.anchorNode))savedRange=s.getRangeAt(0).cloneRange()});
function restoreSelection(){let s=getSelection();if(savedRange){s.removeAllRanges();s.addRange(savedRange.cloneRange())}}
function setInk(color,el){currentInk=color;document.querySelectorAll('.ink').forEach(x=>x.classList.remove('selected'));el.classList.add('selected');editor.focus({preventScroll:true});restoreSelection();let sel=getSelection();if(sel&&sel.rangeCount&&editor.contains(sel.anchorNode)&&!sel.isCollapsed){document.execCommand('styleWithCSS',false,true);document.execCommand('foreColor',false,color)}savedRange=sel?.rangeCount?sel.getRangeAt(0).cloneRange():savedRange;saveCurrentPage()}
function formatText(cmd){editor.focus();restoreSelection();document.execCommand(cmd,false,null);saveCurrentPage()}
function renameBook(){let n=prompt('Yeni defter adı:',current.title);if(n?.trim()){current.title=n.trim();persist();showCover()}}
function removeBook(){if(confirm('Bu defteri ve sayfalarını silmek istiyor musun?')){deleteFiles(current.pages.flatMap(fileIds));books=books.filter(b=>b.id!==current.id);current=null;goShelf()}}
function editCover(){editTheme=current.theme||'green';editStyle=current.coverStyle||'classic';buildChoices();document.querySelectorAll('#editThemes .swatch').forEach(x=>x.classList.toggle('selected',x.classList.contains(editTheme)));document.querySelectorAll('#editStyles .style-chip').forEach(x=>x.classList.toggle('selected',x.textContent.includes(editStyle==='classic'?'Klasik':editStyle==='minimal'?'Sade':'Antika')));updateEditPreview();screen('coverEdit')}
function chooseEdit(c,e){editTheme=c;document.querySelectorAll('#editThemes button').forEach(x=>x.classList.remove('selected'));e.classList.add('selected');updateEditPreview()}
function chooseEditStyle(s,e){editStyle=s;document.querySelectorAll('#editStyles button').forEach(x=>x.classList.remove('selected'));e.classList.add('selected');updateEditPreview()}
function updateEditPreview(){$('editPreview').className='cover-preview '+editTheme+' '+editStyle+(isImg(editTheme)?' cimg':'');$('editPreview').textContent=current.title}
function saveCoverEdit(){current.theme=editTheme;current.coverStyle=editStyle;persist();showCover()}
function openFilesDB(){return new Promise((ok,no)=>{let r=indexedDB.open('DefterimFiles',1);r.onupgradeneeded=()=>r.result.createObjectStore('files',{keyPath:'id'});r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
async function putFile(file,type){let db=await openFilesDB(),id='file_'+Date.now()+'_'+Math.random().toString(36).slice(2);await new Promise((ok,no)=>{let tx=db.transaction('files','readwrite');tx.objectStore('files').put({id,file,type,name:file.name});tx.oncomplete=ok;tx.onerror=()=>no(tx.error)});db.close();return id}
async function getFile(id){let db=await openFilesDB(),v=await new Promise((ok,no)=>{let r=db.transaction('files').objectStore('files').get(id);r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});db.close();return v}
function insertNode(node){editor.focus();restoreSelection();let s=getSelection();if(s.rangeCount&&editor.contains(s.anchorNode)){let r=s.getRangeAt(0);r.deleteContents();r.insertNode(node);r.setStartAfter(node);r.collapse(true);s.removeAllRanges();s.addRange(r)}else editor.append(node);savedRange=s.rangeCount?s.getRangeAt(0).cloneRange():null;saveCurrentPage()}
function selectImage(img){if(selectedImage)selectedImage.classList.remove('image-selected');selectedImage=img;img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label','Seçili resim. Boyutlandırma ve silme araçları aşağıda.');img.classList.add('image-selected');$('imageTools').classList.add('visible')}
editor.addEventListener('click',e=>{if(e.target.tagName==='IMG'){selectImage(e.target)}else if(!e.target.closest('#imageTools')){if(selectedImage)selectedImage.classList.remove('image-selected');selectedImage=null;$('imageTools').classList.remove('visible')}});
// Dokunulan satıra gerçek imleç yerleştir; boş satırlar gerektiğinde oluşturulur.
function caretRangeAtPoint(x,y){
  if(document.caretPositionFromPoint){let p=document.caretPositionFromPoint(x,y);if(p){let r=document.createRange();r.setStart(p.offsetNode,p.offset);r.collapse(true);return r}}
  return document.caretRangeFromPoint?.(x,y)||null;
}
function placeCaretAtPoint(x,y){
  const rect=editor.getBoundingClientRect();let r=caretRangeAtPoint(x,y);
  if(r&&editor.contains(r.startContainer)){
    // Boş alanın alt satırına dokunulduysa imleci o satıra kadar indir.
    const lineH=32, targetLine=Math.max(0,Math.floor((y-rect.top+4)/lineH));
    let lastLine=Math.max(0,(editor.innerText||'').split('\n').length-1);
    if((r.startContainer===editor||r.startContainer.nodeType===3&&r.startContainer.length===0)&&targetLine>lastLine){
      let tail=editor.lastChild;if(tail&&tail.nodeType===1&&tail.tagName==='BR')tail.remove();
      for(let i=lastLine;i<targetLine;i++)editor.appendChild(document.createElement('br'));
      r=document.createRange();r.selectNodeContents(editor);r.collapse(false);
    }
    editor.focus({preventScroll:true});let sel=getSelection();sel.removeAllRanges();sel.addRange(r);savedRange=r.cloneRange();return true;
  }
  // Sayfanın boş kısmına dokunulduğunda istenen satırı üret.
  let line=Math.max(0,Math.floor((y-rect.top+4)/32));editor.focus({preventScroll:true});
  let existing=(editor.innerText||'').split('\n').length-1;
  if(line>existing){let tail=editor.lastChild;if(tail&&tail.nodeType===1&&tail.tagName==='BR')tail.remove();for(let i=existing;i<line;i++)editor.appendChild(document.createElement('br'));}
  let end=document.createRange();end.selectNodeContents(editor);end.collapse(false);let sel=getSelection();sel.removeAllRanges();sel.addRange(end);savedRange=end.cloneRange();return true;
}
$('singlePage').addEventListener('pointerup',e=>{if(e.target.tagName==='IMG'||e.target.closest('button')||pointerDrag)return;if(!editor.contains(e.target)||e.target===editor){placeCaretAtPoint(e.clientX,e.clientY)}});
function resizeImage(delta){if(!selectedImage)return;let currentWidth=selectedImage.getBoundingClientRect().width||selectedImage.naturalWidth||200;let next=Math.max(60,Math.min(editor.clientWidth-4,currentWidth+delta*3));selectedImage.style.width=next+'px';selectedImage.style.height='auto';saveCurrentPage()}
function alignImage(where){if(!selectedImage)return;selectedImage.style.marginLeft=where==='left'?'0':where==='center'?'auto':'auto';selectedImage.style.marginRight=where==='right'?'0':where==='center'?'auto':'auto';if(where==='right')selectedImage.style.marginLeft='auto';if(where==='left')selectedImage.style.marginRight='auto';saveCurrentPage()}
async function deleteSelectedImage(){if(!selectedImage)return;let id=selectedImage.dataset.fileId;selectedImage.remove();selectedImage=null;$('imageTools').classList.remove('visible');saveCurrentPage();if(id)await deleteFiles([id])}
editor.addEventListener('dragstart',e=>{if(e.target.tagName==='IMG'){dragImage=e.target;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain','defterim-image')}});
// Resmi parmakla sürükle; sağ-alt köşesinden tutarak oranını koruyup boyutlandır.
editor.addEventListener('pointerdown',e=>{
  if(e.target.tagName!=='IMG')return;
  const img=e.target,rect=img.getBoundingClientRect(),resize=Math.abs(e.clientX-rect.right)<26&&Math.abs(e.clientY-rect.bottom)<26;
  selectImage(img);pointerDrag={img,startX:e.clientX,startY:e.clientY,startW:rect.width,startH:rect.height,resize,moved:false,pointerId:e.pointerId};
  e.preventDefault();e.stopPropagation();try{editor.setPointerCapture(e.pointerId)}catch(_){ }
});
editor.addEventListener('pointermove',e=>{
  if(!pointerDrag)return;let st=pointerDrag,dx=e.clientX-st.startX,dy=e.clientY-st.startY;
  if(Math.abs(dx)+Math.abs(dy)>4)st.moved=true;
  if(st.resize){let w=Math.max(48,Math.min(editor.clientWidth-4,st.startW+dx));let ratio=st.startH/Math.max(1,st.startW);st.img.style.width=w+'px';st.img.style.height=(w*ratio)+'px';st.img.style.maxWidth='100%';}
  else if(st.moved){st.img.style.transform=`translate(${dx}px,${dy}px)`;st.img.style.opacity='.78'}
  e.preventDefault();
});
editor.addEventListener('pointerup',e=>{
  if(!pointerDrag)return;let st=pointerDrag;pointerDrag=null;st.img.style.opacity='';
  if(!st.resize&&st.moved){st.img.style.transform='';let range=caretRangeAtPoint(e.clientX,e.clientY);if(range&&editor.contains(range.startContainer)){range.deleteContents();range.insertNode(st.img);let after=document.createRange();after.setStartAfter(st.img);after.collapse(true);let sel=getSelection();sel.removeAllRanges();sel.addRange(after);savedRange=after.cloneRange()}}
  saveCurrentPage();selectImage(st.img);
});
editor.addEventListener('pointercancel',()=>{if(pointerDrag){pointerDrag.img.style.transform='';pointerDrag.img.style.opacity='';pointerDrag=null;saveCurrentPage()}});
editor.addEventListener('dragover',e=>{if(dragImage){e.preventDefault();e.dataTransfer.dropEffect='move'}});
editor.addEventListener('drop',e=>{if(!dragImage)return;e.preventDefault();let range;if(document.caretRangeFromPoint)range=document.caretRangeFromPoint(e.clientX,e.clientY);if(range&&editor.contains(range.startContainer)){range.insertNode(dragImage);saveCurrentPage()}dragImage=null});
async function addImage(input){let f=input.files[0];input.value='';if(!f)return;try{editor.focus({preventScroll:true});restoreSelection();let id=await putFile(f,'image'),img=document.createElement('img');img.dataset.fileId=id;img.alt=f.name;img.src=URL.createObjectURL(f);activeObjectURLs.push(img.src);insertNode(img);selectImage(img)}catch(e){alert('Resim kaydedilemedi. Depolama alanını kontrol et.')} }
async function addPDF(input){let f=input.files[0];input.value='';if(!f)return;try{let id=await putFile(f,'pdf'),a=document.createElement('a');a.className='pdf-link';a.dataset.fileId=id;a.textContent='📄 '+f.name;a.href='#';a.onclick=async e=>{e.preventDefault();let item=await getFile(id);if(item){let url=URL.createObjectURL(item.file);window.open(url,'_blank')}};insertNode(a)}catch(e){alert('PDF kaydedilemedi. Depolama alanını kontrol et.')} }
async function restoreAttachments(){for(let node of editor.querySelectorAll('[data-file-id]')){let item=await getFile(node.dataset.fileId);if(!item)continue;let url=URL.createObjectURL(item.file);activeObjectURLs.push(url);if(node.tagName==='IMG')node.src=url;else{node.href=url;node.target='_blank';node.onclick=e=>{e.preventDefault();window.open(url,'_blank')}}}}

function goShelf(){persist();drawShelf();screen('shelf')}
function gotoPage(){saveCurrentPage();let n=parseInt(prompt('Hangi sayfaya gidelim? (1-'+current.pages.length+')',pageIndex+1),10);if(n>=1&&n<=current.pages.length){pageIndex=n-1;renderPage()}}
function fileIds(html){return [...String(html||'').matchAll(/data-file-id="([^"]+)"/g)].map(m=>m[1])}
async function deleteFiles(ids){if(!ids.length)return;try{let db=await openFilesDB();await new Promise(ok=>{let tx=db.transaction('files','readwrite');ids.forEach(i=>tx.objectStore('files').delete(i));tx.oncomplete=ok;tx.onerror=ok});db.close()}catch(e){}}
function removePage(){if(!confirm('Bu sayfayı silmek istiyor musun?'))return;deleteFiles(fileIds(current.pages[pageIndex]));if(current.pages.length===1)current.pages[0]='';else{current.pages.splice(pageIndex,1);if(pageIndex>=current.pages.length)pageIndex=current.pages.length-1}persist();renderPage()}
function plain(html){let d=document.createElement('div');d.innerHTML=String(html||'').replace(/<img[^>]*>/gi,' ').replace(/<\/(div|p)>|<br\s*\/?>/gi,' ');return (d.textContent||'').replace(/\s+/g,' ').trim()}
function openSearch(){screen('search');$('q').focus()}
function runSearch(){let q=$('q').value.trim(),box=$('results');box.innerHTML='';if(q.length<2){box.innerHTML='<p class="hint">En az 2 harf yaz.</p>';return}let ql=q.toLocaleLowerCase('tr'),n=0;
books.forEach(b=>(b.pages||[]).forEach((p,i)=>{let t=plain(p),k=t.toLocaleLowerCase('tr').indexOf(ql),inTitle=i===0&&b.title.toLocaleLowerCase('tr').includes(ql);if(k<0&&!inTitle)return;n++;
let r=document.createElement('button'),h=document.createElement('b'),s=document.createElement('small'),pp=document.createElement('p');r.className='result';h.textContent=b.title;s.textContent='Sayfa '+(i+1);
if(k>=0){let a=Math.max(0,k-40),e=Math.min(t.length,k+q.length+60),m=document.createElement('mark');m.textContent=t.slice(k,k+q.length);pp.append((a>0?'…':'')+t.slice(a,k),m,t.slice(k+q.length,e)+(e<t.length?'…':''))}else pp.textContent=t.slice(0,100);
r.append(h,s,pp);r.onclick=()=>{current=b;pageIndex=i;screen('reader');renderPage()};box.append(r)}));
if(!n)box.innerHTML='<p class="hint">Sonuç bulunamadı.</p>'}
$('q').addEventListener('input',runSearch);
function applyTheme(){let v=localStorage.getItem('defterim_dark'),d=v===null?matchMedia('(prefers-color-scheme: dark)').matches:v==='1';document.body.classList.toggle('dark',d);document.querySelector('meta[name=theme-color]').content=d?'#14110d':'#33271f';$('themeBtn').textContent=d?'☀️ Açık temaya geç':'🌙 Koyu temaya geç'}
function toggleDark(){localStorage.setItem('defterim_dark',document.body.classList.contains('dark')?'0':'1');applyTheme()}
function blobToDataURL(b){return new Promise((ok,no)=>{let r=new FileReader();r.onload=()=>ok(r.result);r.onerror=()=>no(r.error);r.readAsDataURL(b)})}
async function exportBackup(){let msg=$('backupMsg');msg.textContent='Yedek hazırlanıyor...';try{saveCurrentPage();let files={};
for(let b of books)for(let p of b.pages||[])for(let id of fileIds(p)){if(files[id])continue;let it=await getFile(id);if(it&&it.file)files[id]={name:it.name,type:it.type,mime:it.file.type,data:await blobToDataURL(it.file)}}
let json=JSON.stringify({app:'defterim',version:1,date:new Date().toISOString(),books,files}),name='defterim-yedek-'+new Date().toISOString().slice(0,10)+'.json',file=new File([json],name,{type:'application/json'});
if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'Defterim yedeği'});msg.textContent='Yedek hazır.';return}catch(e){if(e.name==='AbortError'){msg.textContent='';return}}}
let a=document.createElement('a');a.href=URL.createObjectURL(file);a.download=name;document.body.append(a);a.click();a.remove();msg.textContent='Yedek indirildi ('+books.length+' defter, '+Object.keys(files).length+' ek dosya).'}catch(e){msg.textContent='Yedek alınamadı: '+e.message}}
async function importBackup(input){let f=input.files[0],msg=$('backupMsg');input.value='';if(!f)return;msg.textContent='Yükleniyor...';try{let d=JSON.parse(await f.text());if(!d||!Array.isArray(d.books))throw new Error('Geçersiz yedek dosyası');
let db=await openFilesDB();for(let [id,v] of Object.entries(d.files||{})){let blob=await (await fetch(v.data)).blob(),file=new File([blob],v.name||'dosya',{type:v.mime||blob.type});await new Promise((ok,no)=>{let tx=db.transaction('files','readwrite');tx.objectStore('files').put({id,file,type:v.type,name:v.name});tx.oncomplete=ok;tx.onerror=()=>no(tx.error)})}db.close();
let ids=new Set(books.map(b=>b.id)),added=0,skipped=0;for(let b of d.books){if(!b||!Array.isArray(b.pages))continue;if(ids.has(b.id)){skipped++;continue}books.push(b);added++}
persist();drawShelf();msg.textContent=added+' defter eklendi'+(skipped?', '+skipped+' defter zaten vardı (atlandı).':'.')}catch(e){msg.textContent='Geri yüklenemedi: '+e.message}}
applyTheme();
buildChoices();drawShelf();if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
