const axios = require('axios');
require('dotenv').config();

const JUDGE0_BASE = 'https://judge0-ce.p.rapidapi.com';
const RAPIDAPI_HOST = 'judge0-ce.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

const languageMap = {
    python: 71,
    cpp: 54,
    java: 62,
};

async function executeCode({ language, source_code, expected_output, stdin = '' }) {
    const language_id = languageMap[language];
    if (!language_id) return { error: 'Unsupported language' };

    if (language === 'java') {
        source_code = source_code.replace(/public\s+class\s+\w+/g, 'class Main');
    }

    const encodedSource = Buffer.from(source_code).toString('base64');
    const encodedOutput = expected_output
        ? Buffer.from(expected_output).toString('base64')
        : undefined;
    const encodedInput = stdin
        ? Buffer.from(stdin).toString('base64')
        : undefined;

    const payload = {
        language_id,
        source_code: encodedSource,
        expected_output: encodedOutput,
        stdin: encodedInput,
    };

    try {
        const res = await axios.post(
            `${JUDGE0_BASE}/submissions?base64_encoded=true&wait=true`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-RapidAPI-Host': RAPIDAPI_HOST,
                    'X-RapidAPI-Key': RAPIDAPI_KEY,
                },
            }
        );

        return {
            output: res.data.stdout
                ? Buffer.from(res.data.stdout, 'base64').toString().trim()
                : '',
            stderr: res.data.stderr
                ? Buffer.from(res.data.stderr, 'base64').toString()
                : '',
            compile_output: res.data.compile_output
                ? Buffer.from(res.data.compile_output, 'base64').toString()
                : '',
            status: res.data.status,
            time: res.data.time,
            memory: res.data.memory,
        };
    } catch (err) {
        console.error('[Execute Error]', err.response?.data || err.message);
        return { error: 'Execution failed' };
    }
}

module.exports = executeCode;
