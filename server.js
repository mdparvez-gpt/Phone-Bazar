const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Supabase Credentials Connected Directly
const SUPABASE_URL = 'https://ijygpiafxvyydzqsqhzo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_C_In2UGnHsPgbuvgcgc7KQ_sCtHn_FV';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- API ROUTES ---

// 1. Get Phones
app.get('/api/phones', async (req, res) => {
  try {
    const { data, error } = await supabase.from('phones').select('*').order('id', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get Orders (Admin)
app.get('/api/orders', async (req, res) => {
  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    // Format JSON keys to match frontend expectation
    const formattedOrders = (data || []).map(o => ({
      id: o.id,
      customer: o.customer,
      paymentMethod: o.payment_method,
      items: o.items,
      total: o.total,
      status: o.status,
      createdAt: o.created_at
    }));

    res.json(formattedOrders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create Order
app.post('/api/orders', async (req, res) => {
  try {
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const { customer, paymentMethod, items, total } = req.body;

    const { data, error } = await supabase.from('orders').insert([{
      id: orderId,
      customer: customer,
      payment_method: paymentMethod,
      items: items,
      total: total,
      status: 'Pending'
    }]);

    if (error) throw error;
    res.json({ success: true, orderId });
  } catch (err) {
    console.error("Order Insert Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Update Order Status
app.patch('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.listen(PORT, () => console.log(`🚀 Supabase Powered Server Running on http://127.0.0.1:${PORT}`));
module.exports = app;
