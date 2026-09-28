const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json({ limit: '10mb' }));

// Supabase Init
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

const supabase = (SUPABASE_URL && SUPABASE_KEY) ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Helper to check Supabase
const checkSupabase = (res) => {
  if (!supabase) {
    res.status(500).json({ error: 'Supabase URL and Key missing in Vercel Environment Variables' });
    return false;
  }
  return true;
};

// API Routes
app.get('/api/phones', async (req, res) => {
  try {
    if (!checkSupabase(res)) return;
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/phones', async (req, res) => {
  try {
    if (!checkSupabase(res)) return;
    const { title, price, brand, image, stock } = req.body;
    const { data, error } = await supabase.from('products').insert([{ title, price, brand, image, stock: stock || 10 }]).select();
    if (error) throw error;
    res.json(data ? data[0] : {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/phones/:id', async (req, res) => {
  try {
    if (!checkSupabase(res)) return;
    const { id } = req.params;
    const { title, price, brand, image, stock } = req.body;
    const { data, error } = await supabase.from('products').update({ title, price, brand, image, stock }).eq('id', id).select();
    if (error) throw error;
    res.json({ success: true, data: data ? data[0] : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/phones/:id', async (req, res) => {
  try {
    if (!checkSupabase(res)) return;
    const { id } = req.params;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    if (!checkSupabase(res)) return;
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    if (!checkSupabase(res)) return;
    const { customer, items, total, paymentMethod } = req.body;
    const { data, error } = await supabase.from('orders').insert([{
      customer, items, total, payment_method: paymentMethod, status: 'Pending'
    }]).select();
    if (error) throw error;
    res.json({ success: true, id: data ? data[0].id : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/orders/:id', async (req, res) => {
  try {
    if (!checkSupabase(res)) return;
    const { id } = req.params;
    const { status } = req.body;
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
