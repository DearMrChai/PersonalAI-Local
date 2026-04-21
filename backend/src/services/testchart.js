// test-service.js
import { generateStreamResponse } from './chat.service.js';

async function test() {
  const stream = generateStreamResponse({
    characterId: 1,
    message: "你好",
    history: [],
    userName: "TestUser"
  });
  
  for await (const chunk of stream) {
    process.stdout.write(chunk);
  }
}
test();