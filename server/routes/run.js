// server/routes/run.js
const express = require('express');
const router = express.Router();
const executeCode = require('../utils/executeCode');

router.post('/', async (req, res) => {
    const { language, code, input } = req.body;

    try {
        const result = await executeCode({
            language,
            source_code: code,
            stdin: input || '',
        });

        res.json({
            output: result.output || '',
            stderr: result.stderr || '',
            compile_output: result.compile_output || '',
            status: result.status || { description: 'Unknown' },
            time: result.time || null,
            memory: result.memory || null,
        });
    } catch (err) {
        console.error('[Run Error]', err);
        res.status(500).json({ error: 'Execution failed' });
    }
});

module.exports = router;
