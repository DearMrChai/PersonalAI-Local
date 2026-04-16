import { LlamaModel, LlamaContext, LlamaChatSession, getLlama } from 'node-llama-cpp';
import path from 'path';
import { fileURLToPath } from 'url';
import { getConfig } from './config.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let llamaInstance;
let modelInstance;
let contextInstance;

// 模型初始化
export const initLlamaModel = async () => {
  if (modelInstance) return modelInstance;

  const config = getConfig();
  llamaInstance = await getLlama();

  modelInstance = await llamaInstance.loadModel({
    modelPath: path.join(__dirname, "../models/Qwen2.5-14B_Uncensored_Instruct-Q4_K_M.gguf"),
    contextSize: 8192,
    threads: 8,
    gpuLayers: 18,
    seed: 42
  });

  return modelInstance;
};

// 构建模型要求的Prompt格式
export const buildModelPrompt = (systemPrompt, userPrompt, roleName, userName) => {
  // 拼接标准格式的Prompt
  return `<|im_start|>system
${systemPrompt}
<|im_end|>
<|im_start|>${userName}
${userPrompt}
<|im_end|>
<|im_start|>${roleName}`;
};

// 创建会话（适配新的Prompt格式）
export const createLlamaChatSession = async (systemPrompt) => {
  const model = await initLlamaModel();
  const context = await model.createContext({
    temperature: 0.6,
    maxTokens: 1024,
    repeatPenalty: 1.15,
    topP: 0.9,
    topK: 40,
    // 调整停止词适配模型格式
    stop: ["<|im_end|>", "<|end_of_text|>"]
  });

  return new LlamaChatSession({
    contextSequence: context.getSequence(),
    systemPrompt: systemPrompt
  });
};

// 流式返回（保持原有逻辑）
export const streamLlamaResponse = async (session, userMsg, res) => {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Access-Control-Allow-Origin', '*');
  console.log("开始生成响应...");
  console.log("用户消息：", userMsg);

  try {
    await session.prompt(userMsg, {
      onTextChunk: (chunk) => {
        console.log("生成的文本块：", chunk);   
        const data = {
          choices: [{ text: chunk }]
        };
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    });

    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (err) {
    console.error("流式响应错误：", err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
};