
const byId = id=>document.getElementById(id);
let currentUser = null;

function api(url, opts={}){
  return fetch('/api'+url, opts).then(r=>{
    if(!r.ok) return r.json().then(e=>{ throw e; });
    return r.json();
  });
}

function init(){
  byId('btn-login').onclick = login;
  byId('btn-logout').onclick = logout;
  byId('btn-filter').onclick = applyFilter;
  byId('btn-reset').onclick = resetFilter;
  byId('btn-new-order').onclick = ()=>openDetail(null);
  byId('btn-back').onclick = ()=>showPanel('orders');
  byId('btn-save-order').onclick = saveOrder;
  byId('btn-delete-order').onclick = deleteOrder;
  byId('btn-reports').onclick = ()=>showPanel('reports');
  byId('btn-rep-back').onclick = ()=>showPanel('orders');
  byId('btn-gen-report').onclick = genReport;
  // try to load orders
  renderOrders();
}

function login(){
  const user = byId('login-user').value.trim();
  const pass = byId('login-pass').value;
  api('/login', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({user,pass})})
    .then(u=>{ currentUser = u; updateUserInfo(); showMain(); renderOrders(); })
    .catch(e=>{ alert('Ошибка входа'); console.error(e); });
}

function logout(){
  currentUser = null; updateUserInfo();
  document.querySelector('#main-section').classList.add('hidden');
  document.querySelector('#login-section').classList.remove('hidden');
}

function showMain(){document.querySelector('#login-section').classList.add('hidden');document.querySelector('#main-section').classList.remove('hidden'); showPanel('orders')}
function updateUserInfo(){ byId('user-info').innerText = currentUser ? (currentUser.name + ' ('+currentUser.user+')') : '' }
function showPanel(name){
  ['orders','detail','reports'].forEach(n=>{
    const el = byId(n+'-panel');
    if(el) el.classList.toggle('hidden', n!==name);
  });
}

function renderOrders(){
  const ffrom = byId('filter-from').value;
  const fto = byId('filter-to').value;
  const qs = new URLSearchParams();
  if(ffrom) qs.set('from', ffrom);
  if(fto) qs.set('to', fto);
  api('/orders?'+qs.toString()).then(data=>{
    const list = byId('orders-list'); list.innerHTML='';
    data.forEach(o=>{
      const row = document.createElement('div');
      row.className = 'order-row order-'+o.status;
      const left = document.createElement('div');
      left.style.display='flex'; left.style.alignItems='center';
      const id = document.createElement('div'); id.className='order-id'; id.innerText = '#'+o.id;
      const main = document.createElement('div'); main.className='order-main';
      main.innerHTML = `<div class="order-meta">${o.datetime} — ${o.name} — ${o.address}</div>`;
      left.appendChild(id); left.appendChild(main);
      const right = document.createElement('div'); right.className='order-actions';
      const btnOpen = document.createElement('button'); btnOpen.className='btn-small'; btnOpen.innerText='Открыть'; btnOpen.onclick = ()=>openDetail(o.id);
      const btnMap = document.createElement('button'); btnMap.className='btn-small'; btnMap.innerText='Карта'; btnMap.onclick = ()=>openMap(o);
      right.appendChild(btnOpen); right.appendChild(btnMap);
      row.appendChild(left); row.appendChild(right);
      list.appendChild(row);
    });
  }).catch(e=>{ console.error(e); });
}

function openMap(o){
  if(!o.geo){ alert('Координаты отсутствуют'); return }
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.geo)}`;
  window.open(url, '_blank');
}

function openDetail(id){
  const dp = byId('detail-panel');
  if(!id){
    byId('detail-id').innerText = 'Новый';
    byId('detail-name').value='';
    byId('detail-tel').value='';
    byId('detail-address').value='';
    byId('detail-datetime').value = new Date().toISOString().slice(0,16);
    byId('detail-status').value='yellow';
    byId('detail-service').value='Cleaning';
    byId('detail-units').value=1;
    byId('detail-comment').value='';
    dp.dataset.editId = '';
  } else {
    api('/orders/'+id).then(o=>{
      dp.dataset.editId = o.id;
      byId('detail-id').innerText = '#'+o.id;
      byId('detail-name').value=o.name;
      byId('detail-tel').value=o.tel;
      byId('detail-address').value=o.address;
      byId('detail-datetime').value = o.datetime.replace(' ','T');
      byId('detail-status').value = o.status;
      byId('detail-service').value = o.service;
      byId('detail-units').value = o.units;
      byId('detail-comment').value = o.comment;
      showPanel('detail');
    }).catch(e=>{ alert('Не удалось загрузить заказ'); });
    return;
  }
  showPanel('detail');
}

function saveOrder(){
  const editId = byId('detail-panel').dataset.editId;
  const data = {
    id: editId ? Number(editId) : undefined,
    datetime: byId('detail-datetime').value.replace('T',' '),
    name: byId('detail-name').value,
    tel: byId('detail-tel').value,
    address: byId('detail-address').value,
    status: byId('detail-status').value,
    service: byId('detail-service').value,
    units: Number(byId('detail-units').value) || 1,
    comment: byId('detail-comment').value,
    employee: currentUser ? currentUser.user : 'unknown',
    price: 0,
    geo: ''
  };
  api('/orders', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)}).then(r=>{
    alert('Сохранено');
    renderOrders();
    showPanel('orders');
  }).catch(e=>{ alert('Ошибка сохранения'); console.error(e); });
}

function deleteOrder(){
  const editId = byId('detail-panel').dataset.editId;
  if(!editId) return alert('Нет сохранённого заказа');
  if(!confirm('Удалить заказ?')) return;
  api('/orders/'+editId, {method:'DELETE'}).then(()=>{ renderOrders(); showPanel('orders'); }).catch(e=>{ alert('Ошибка удаления'); });
}

function applyFilter(){ renderOrders(); }
function resetFilter(){ byId('filter-from').value=''; byId('filter-to').value=''; renderOrders(); }

function genReport(){
  const from = byId('rep-from').value;
  const to = byId('rep-to').value;
  const qs = new URLSearchParams();
  if(from) qs.set('from', from);
  if(to) qs.set('to', to);
  api('/report?'+qs.toString()).then(r=>{
    const html = `<p>За период: <b>${r.total}</b> заказ(ов). Сумма плат: <b>$${r.sumPrices}</b></p>
      <p>По статусам: ${Object.entries(r.byStatus).map(([k,v])=>k+':'+v).join(', ')}</p>
      <p>По сотрудникам: ${Object.entries(r.byEmployee).map(([k,v])=>k+':'+v).join(', ')}</p>`;
    byId('report-result').innerHTML = html + '<h3>Список</h3>' + r.rows.map(o=>`<div class="order-row order-${o.status}"><div class="order-id">#${o.id}</div> ${o.datetime} — ${o.name} — ${o.address}</div>`).join('');
    showPanel('reports');
  }).catch(e=>{ alert('Ошибка формирования отчёта'); });
}

window.addEventListener('load', init);
