
const BATCH = 20;
let filtered = [];
let offset = 0;
let loading = false;
let currentForm = null;
let currentSort = 'alpha';

function init(){
  buildForms();
  document.getElementById('searchInput').addEventListener('input', ()=>{ resetAndApply(); });
  document.getElementById('sortSelect').addEventListener('change', (e)=>{ currentSort = e.target.value; resetAndApply(); });
  window.addEventListener('scroll', onWindowScroll);
  resetAndApply();
}

function buildForms(){
  const forms = Array.from(new Set(DATA.map(d=>d.form)));
  const container = document.getElementById('formsList');
  container.innerHTML='';
  const all = document.createElement('div'); all.className='cat-item'; all.textContent='الكل'; all.onclick = ()=>{ currentForm=null; resetAndApply(); }
  container.appendChild(all);
  forms.forEach(f=>{ const el=document.createElement('div'); el.className='cat-item'; el.textContent=f; el.onclick = ()=>{ currentForm=f; resetAndApply(); }; container.appendChild(el); });
}

function applyFilters(reset=false){
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  filtered = DATA.filter(d=>{
    if(currentForm && d.form !== currentForm) return false;
    if(!q) return true;
    return d.name_ar.toLowerCase().includes(q) || d.name_en.toLowerCase().includes(q) || d.active.toLowerCase().includes(q) || d.form.toLowerCase().includes(q);
  });
  sortFiltered();
  if(reset){ offset=0; document.getElementById('resultsGrid').innerHTML=''; }
  loadMore();
}

function resetAndApply(){ offset=0; document.getElementById('resultsGrid').innerHTML=''; applyFilters(true); }

function sortFiltered(){
  if(currentSort === 'alpha') filtered.sort((a,b)=> a.name_ar.localeCompare(b.name_ar,'ar'));
  else if(currentSort === 'alpha_rev') filtered.sort((a,b)=> b.name_ar.localeCompare(a.name_ar,'ar'));
  else if(currentSort === 'form') filtered.sort((a,b)=> a.form.localeCompare(b.form,'ar'));
}

function loadMore(){
  if(loading) return;
  loading = true;
  const grid = document.getElementById('resultsGrid');
  const start = offset;
  const end = Math.min(offset + BATCH, filtered.length);
  const slice = filtered.slice(start, end);
  slice.forEach(d=>{
    const card = document.createElement('article'); card.className = 'card';
    card.innerHTML = `
      <img src="${d.imageUrl}" alt="${d.name_en}" />
      <div style="flex:1">
        <div class="card-title">${d.name_ar} — ${d.name_en}</div>
        <div class="card-sub">${d.activeIngredient} • ${d.form}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <button class="view-btn" data-id="${d.id}">فتح الصفحة</button>
      </div>
    `;
    grid.appendChild(card);
  });
  offset = end;
  loading = false;
  document.getElementById('resultsCount').textContent = `عرض ${filtered.length} نتيجة`;
  // attach click handlers for new buttons
  document.querySelectorAll('.view-btn').forEach(b=> b.onclick = (e)=>{ const id = e.target.getAttribute('data-id'); window.location = 'drug.html?id=' + id; });
  if(offset >= filtered.length){ showEndMarker(); }
}

function showEndMarker(){ if(!document.getElementById('endMarker')){ const m = document.createElement('div'); m.id='endMarker'; m.textContent='لا مزيد من النتائج'; m.style.padding='12px'; document.getElementById('resultsGrid').appendChild(m); } }

function onWindowScroll(){ if((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 900)){ if(offset < filtered.length) loadMore(); } }

window.addEventListener('DOMContentLoaded', init);
