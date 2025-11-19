
const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const DB_PATH = path.join(__dirname, 'data', 'db.sqlite');
const PORT = process.env.PORT || 3000;

if(!fs.existsSync(path.join(__dirname, 'data'))){
  fs.mkdirSync(path.join(__dirname, 'data'));
}

// ensure DB exists
const initSql = fs.readFileSync(path.join(__dirname, 'db', 'init.sql'), 'utf8');
if(!fs.existsSync(DB_PATH)){
  fs.writeFileSync(DB_PATH, '');
  const dbInit = new sqlite3.Database(DB_PATH);
  dbInit.exec(initSql, (err)=>{
    if(err) console.error('DB init error', err);
    dbInit.close();
  });
}

const db = new sqlite3.Database(DB_PATH);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'static')));

// Auth: simple username/password check (no hashing for prototype)
app.post('/api/login', (req, res) => {
  const {user, pass} = req.body;
  if(!user || !pass) return res.status(400).json({error:'missing'});
  db.get('SELECT user,name,role FROM users WHERE user = ? AND pass = ?', [user, pass], (err, row)=>{
    if(err) return res.status(500).json({error:err.message});
    if(!row) return res.status(401).json({error:'invalid'});
    res.json({user:row.user, name:row.name, role:row.role});
  });
});

// Get orders with optional date range
app.get('/api/orders', (req, res) => {
  const from = req.query.from || '';
  const to = req.query.to || '';
  let q = 'SELECT * FROM orders';
  const params = [];
  if(from || to){
    q += ' WHERE 1=1';
    if(from){ q += ' AND datetime >= ?'; params.push(from); }
    if(to){ q += ' AND datetime <= ?'; params.push(to + ' 23:59:59'); }
  }
  q += ' ORDER BY datetime ASC';
  db.all(q, params, (err, rows)=>{
    if(err) return res.status(500).json({error:err.message});
    res.json(rows);
  });
});

// Get single order
app.get('/api/orders/:id', (req,res)=>{
  db.get('SELECT * FROM orders WHERE id = ?', [req.params.id], (err,row)=>{
    if(err) return res.status(500).json({error:err.message});
    if(!row) return res.status(404).json({error:'not found'});
    res.json(row);
  });
});

// Create or update order
app.post('/api/orders', (req,res)=>{
  const o = req.body;
  if(!o) return res.status(400).json({error:'no data'});
  if(o.id){ // update if exists
    const stmt = `UPDATE orders SET datetime=?, name=?, tel=?, address=?, status=?, service=?, units=?, comment=?, employee=?, price=?, geo=? WHERE id=?`;
    db.run(stmt, [o.datetime,o.name,o.tel,o.address,o.status,o.service,o.units,o.comment,o.employee,o.price,o.geo,o.id], function(err){
      if(err) return res.status(500).json({error:err.message});
      res.json({ok:true, id:o.id});
    });
  } else {
    const newid = Math.floor(Math.random()*90000)+10000;
    const stmt = `INSERT INTO orders(id, datetime, name, tel, address, status, service, units, comment, employee, price, geo, order_time) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))`;
    db.run(stmt, [newid,o.datetime,o.name,o.tel,o.address,o.status,o.service,o.units,o.comment,o.employee,o.price,o.geo], function(err){
      if(err) return res.status(500).json({error:err.message});
      res.json({ok:true, id:newid});
    });
  }
});

// Delete
app.delete('/api/orders/:id', (req,res)=>{
  db.run('DELETE FROM orders WHERE id = ?', [req.params.id], function(err){
    if(err) return res.status(500).json({error:err.message});
    res.json({ok:true});
  });
});

// Report endpoint: simple summary
app.get('/api/report', (req,res)=>{
  const from = req.query.from || '';
  const to = req.query.to || '';
  let q = 'SELECT * FROM orders';
  const params = [];
  if(from || to){
    q += ' WHERE 1=1';
    if(from){ q += ' AND datetime >= ?'; params.push(from); }
    if(to){ q += ' AND datetime <= ?'; params.push(to + ' 23:59:59'); }
  }
  db.all(q, params, (err, rows)=>{
    if(err) return res.status(500).json({error:err.message});
    const total = rows.length;
    const sumPrices = rows.reduce((s,r)=>s+(r.price||0),0);
    const byStatus = rows.reduce((acc,r)=>{ acc[r.status]=(acc[r.status]||0)+1; return acc; }, {});
    const byEmployee = rows.reduce((acc,r)=>{ acc[r.employee]=(acc[r.employee]||0)+1; return acc; }, {});
    res.json({total, sumPrices, byStatus, byEmployee, rows});
  });
});

// Fallback to index.html for SPA
app.get('*', (req,res)=>{
  res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

app.listen(PORT, ()=>{
  console.log('Server started on port', PORT);
});
