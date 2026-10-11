// Keyless end-to-end smoke for the AIX server path: an OpenAI-compatible vendor that lists one model and
// streams a fixed reply. Add it in the app as LocalAI with URL http://localhost:11435 ("Via server" on), list
// models, send any message: the reply must read "MOCK STREAM OK". Non-stream requests (auto-title) get JSON.
//   node tools/develop/aix-mock-vendor/mock-openai.mjs [port]
import http from 'node:http';

const port = Number(process.argv[2] || 11435);
const model = { id: 'mock-echo', object: 'model', created: 0, owned_by: 'mock' };
const words = ['MOCK', ' STREAM', ' OK'];
const usage = { prompt_tokens: 5, completion_tokens: 3, total_tokens: 8 };
const chunk = (delta, finish_reason) => JSON.stringify({ id: 'mock', object: 'chat.completion.chunk', created: 0, model: model.id, choices: [{ index: 0, delta, finish_reason }], ...(finish_reason && { usage }) });

http.createServer((req, res) => {
  console.log(req.method, req.url);
  if (req.method === 'GET' && req.url.endsWith('/models')) {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ object: 'list', data: [model] }));
  }
  if (req.method === 'POST' && req.url.endsWith('/chat/completions')) {
    let body = '';
    req.on('data', (d) => body += d);
    req.on('end', () => {
      if (!JSON.parse(body).stream) {
        res.writeHead(200, { 'content-type': 'application/json' });
        return res.end(JSON.stringify({ id: 'mock', object: 'chat.completion', created: 0, model: model.id, choices: [{ index: 0, message: { role: 'assistant', content: words.join('') }, finish_reason: 'stop' }], usage }));
      }
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' });
      let i = 0;
      const tick = () => {
        if (i < words.length) {
          res.write(`data: ${chunk({ content: words[i++] }, null)}\n\n`);
          return setTimeout(tick, 150);
        }
        res.write(`data: ${chunk({}, 'stop')}\n\ndata: [DONE]\n\n`);
        res.end();
      };
      tick();
    });
    return;
  }
  res.writeHead(404);
  res.end();
}).listen(port, () => console.log(`mock vendor on http://localhost:${port}`));
