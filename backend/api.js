const express = require('express');
const router = express.Router();
const db = require('./db');

// Event helper that broadcasts events to the frontend
const notifyClients = (req, eventType, tokenData) => {
    const broadcast = req.app.get('broadcast');
    if (typeof broadcast === 'function') {
        broadcast({ type: eventType, token: tokenData, timestamp: new Date() });
    }
};

// 1. POST /api/tokens/ (Create a new token)
router.post('/tokens', async (req, res) => {
    try {
        const queryText = `
      INSERT INTO tokens (status)
      VALUES ('waiting')
      RETURNING *`;

        const result = await db.query(queryText);
        const newToken = result.rows[0];

        notifyClients(req, 'TOKEN_CREATED', newToken);

        res.status(201).json(newToken);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to create token' });
    }
});

// 2. GET /api/tokens/ (Get all tokens)
router.get('/tokens', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM tokens ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to fetch tokens' });
    }
});

// GET /api/tokens/:id (Get single token by ID)
router.get('/tokens/:id', async (req, res) => {
    try {
        const tokenId = req.params.id;
        const result = await db.query('SELECT * FROM tokens WHERE id = $1', [tokenId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Token not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to fetch token' });
    }
});

// 3. GET /api/tokens/waiting/ (Get all waiting tokens)
router.get('/tokens/waiting', async (req, res) => {
    try {
        const queryText = "SELECT * FROM tokens WHERE status = 'waiting' ORDER BY created_at ASC";
        const result = await db.query(queryText);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to fetch waiting tokens' });
    }
});

// 4. PATCH /api/tokens/{id}/call/ (Change status to calling)
router.patch('/tokens/:id/call', async (req, res) => {
    try {
        const tokenId = req.params.id;

        const queryText = `
      UPDATE tokens 
      SET status = 'calling', updated_at = NOW() 
      WHERE id = $1 
      RETURNING *`;

        const result = await db.query(queryText, [tokenId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Token not found' });
        }

        const updatedToken = result.rows[0];
        notifyClients(req, 'TOKEN_CALLED', updatedToken);

        res.status(200).json({ message: 'Token is being called', token: updatedToken });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to call token' });
    }
});

// 5. POST /api/tokens/{id}/complete/ (Change status to completed)
router.patch('/tokens/:id/complete', async (req, res) => {
    try {
        const tokenId = req.params.id;

        const queryText = `
      UPDATE tokens 
      SET status = 'completed', updated_at = NOW() 
      WHERE id = $1 
      RETURNING *`;

        const result = await db.query(queryText, [tokenId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Token not found' });
        }

        const updatedToken = result.rows[0];
        notifyClients(req, 'TOKEN_COMPLETED', updatedToken);

        res.status(200).json({ message: 'Token completed successfully', token: updatedToken });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Failed to complete token' });
    }
});

module.exports = router;
