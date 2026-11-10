const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const PORTA = Number(process.env.PORTA) || 3000;
const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

const tokens = new Map();

function lerJson(req) {
  return new Promise((resolve, reject) => {
    let corpo = '';
    req.on('data', (pedaco) => (corpo += pedaco));
    req.on('end', () => {
      try {
        resolve(corpo ? JSON.parse(corpo) : {});
      } catch (erro) {
        reject(erro);
      }
    });
  });
}

function responder(res, status, dados) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(dados));
}

function cadastrarToken(dados) {
  if (!/^Expo(nent)?PushToken\[.+\]$/.test(dados.token || '')) {
    return false;
  }
  tokens.set(dados.token, dados.aparelho || 'aparelho sem nome');
  console.log(`+ token cadastrado: ${tokens.get(dados.token)} (${tokens.size} no total)`);
  return true;
}

async function enviarPara(token, titulo, corpo) {
  const aparelho = tokens.get(token);
  const resposta = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      to: token,
      title: titulo,
      body: corpo,
      sound: 'default',
      data: { enviadaEm: new Date().toISOString() },
    }),
  });
  const json = await resposta.json();
  const ticket = json.data || { status: 'error', message: JSON.stringify(json.errors) };

  if (ticket.details && ticket.details.error === 'DeviceNotRegistered') {
    console.log(`- token inválido removido: ${aparelho}`);
    tokens.delete(token);
  }
  return { aparelho, ...ticket };
}

function enviarParaTodos(titulo, corpo) {
  return Promise.all([...tokens.keys()].map((token) => enviarPara(token, titulo, corpo)));
}

const servidor = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(path.join(__dirname, 'painel.html')));
    } else if (req.method === 'GET' && req.url === '/tokens') {
      responder(res, 200, [...tokens].map(([token, aparelho]) => ({ token, aparelho })));
    } else if (req.method === 'POST' && req.url === '/tokens') {
      const ok = cadastrarToken(await lerJson(req));
      responder(res, ok ? 201 : 400, { ok });
    } else if (req.method === 'POST' && req.url === '/enviar') {
      const { titulo, corpo } = await lerJson(req);
      responder(res, 200, await enviarParaTodos(titulo, corpo));
    } else {
      responder(res, 404, { erro: 'rota não encontrada' });
    }
  } catch (erro) {
    responder(res, 500, { erro: erro.message });
  }
});

servidor.on('error', (erro) => {
  console.log(`Não deu para abrir a porta ${PORTA} (${erro.code}). Escolha outra na variável PORTA.`);
});

servidor.listen(PORTA, () => {
  console.log(`Painel: http://localhost:${PORTA}`);
  Object.values(os.networkInterfaces()).flat().forEach((rede) => {
    if (rede.family === 'IPv4' && !rede.internal) {
      console.log(`No celular, use: http://${rede.address}:${PORTA}`);
    }
  });
});
