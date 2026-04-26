const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        maxOutputTokens: 2048,
        candidateCount: 1,
        temperature: 0.1,
        topP: 0.9,
    },
    systemInstruction: `You are a senior software engineer and code reviewer. Provide a detailed, helpful code review with clear sections, specific issues, concrete improvement suggestions, and a full corrected code example. Always include the improved code and a final code report.`
});

const fallbackModels = [
    genAI.getGenerativeModel({
        model: "gemini-2.5-pro",
        generationConfig: {
            maxOutputTokens: 2048,
            candidateCount: 1,
            temperature: 0.1,
            topP: 0.9,
        },
        systemInstruction: `You are a senior software engineer and code reviewer. Provide a detailed, helpful code review with clear sections, specific issues, concrete improvement suggestions, and a full corrected code example. Always include the improved code and a final code report.`
    }),
    genAI.getGenerativeModel({
        model: "gemini-2.0-flash-lite-001",
        generationConfig: {
            maxOutputTokens: 2048,
            candidateCount: 1,
            temperature: 0.1,
            topP: 0.9,
        },
        systemInstruction: `You are a senior software engineer and code reviewer. Provide a detailed, helpful code review with clear sections, specific issues, concrete improvement suggestions, and a full corrected code example. Always include the improved code and a final code report.`
    }),
];

function shouldFallbackError(error) {
    return error.status === 429 || error?.message?.includes('429') ||
        error?.message?.includes('rate limit') || error?.message?.includes('quota') ||
        error.status === 503 || error?.message?.includes('503') ||
        error?.message?.includes('Service Unavailable');
}

function isReviewComplete(text) {
    const requiredSections = [
        '❌ Bad Code:',
        '🔍 Issues:',
        '✅ Recommended Fix:',
        '💡 Improvements:',
    ];
    return requiredSections.every((section) => text.includes(section));
}

async function buildReviewPrompt(code) {
    return `You are a senior software engineer and code reviewer. Review this code thoroughly and produce the response using the exact structure below. Do not stop early.\n\n❌ Bad Code:\n\`\`\`\n${code}\n\`\`\`\n\n🔍 Issues:\n\t•\tDescribe each problem clearly with bullet points.\n\n✅ Recommended Fix:\nWrite the corrected version in the fenced code block below.\n\`\`\`\n\`\`\`\n\n💡 Improvements:\n\t•\tList the improvements made and why they matter.\n\nUse markdown formatting exactly as shown. If any section is not applicable, explicitly say so. Always include a complete corrected code block in the \"Recommended Fix\" section and include a final summary if possible.\n\nCode to review:\n\n\`\`\`\n${code}\n\`\`\``;
}

async function tryGenerateContent(prompt) {
    const modelQueue = [model, ...fallbackModels];
    let lastError;

    for (const activeModel of modelQueue) {
        try {
            console.log(`Trying model: ${activeModel.model}`);
            const result = await activeModel.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            console.error(`Model ${activeModel.model} error:`, error.message);
            lastError = error;
            if (!shouldFallbackError(error)) {
                throw error;
            }
        }
    }

    throw lastError;
}

async function generateContent(code) {
    const prompt = await buildReviewPrompt(code);
    const firstResponse = await tryGenerateContent(prompt);

    if (!isReviewComplete(firstResponse)) {
        console.warn('Incomplete review detected; retrying to complete the response.');
        const retryPrompt = `${prompt}\n\nThe previous response was incomplete. Please generate the full review again using the exact requested format and include all required sections. Do not stop early.`;
        const secondResponse = await tryGenerateContent(retryPrompt);
        if (isReviewComplete(secondResponse)) {
            return secondResponse;
        }
        return firstResponse;
    }

    return firstResponse;
}

async function tryStreamContent(prompt) {
    const modelQueue = [model, ...fallbackModels];
    let lastError;

    for (const activeModel of modelQueue) {
        try {
            console.log(`Streaming with model: ${activeModel.model}`);
            return await activeModel.generateContentStream(prompt);
        } catch (error) {
            console.error(`Stream model ${activeModel.model} error:`, error.message);
            lastError = error;
            if (!shouldFallbackError(error)) {
                throw error;
            }
        }
    }

    throw lastError;
}

async function streamContent(code) {
    const prompt = await buildReviewPrompt(code);
    return tryStreamContent(prompt);
}

module.exports = {
    generateContent,
    streamContent,
};    