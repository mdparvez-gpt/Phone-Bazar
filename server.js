const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
app.use(express.json({ limit: '10mb' }));

// Supabase Init with fallback credentials
const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// API Routes
app.get('/api/phones', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/phones', async (req, res) => {
  try {
    const { title, price, brand, image, stock } = req.body;
    const { data, error } = await supabase.from('products').insert([{ title, price, brand, image, stock: stock || 10 }]).select();
    if (error) throw error;
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(data ? data[0] : {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/phones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, brand, image, stock } = req.body;
    const { data, error } = await supabase.from('products').update({ title, price, brand, image, stock }).eq('id', id).select();
    if (error) throw error;
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ success: true, data: data ? data[0] : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/phones/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customer, items, total, paymentMethod } = req.body;
    const { data, error } = await supabase.from('orders').insert([{
      customer, items, total, payment_method: paymentMethod, status: 'Pending'
    }]).select();
    if (error) throw error;
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ success: true, id: data ? data[0].id : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) throw error;
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve Static Frontend Files
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;
