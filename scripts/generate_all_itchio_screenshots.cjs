const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('/Users/display/VSCodeProjects/Wizardry/node_modules/ws');

const SCREENSHOT_DIR = path.resolve(__dirname, '../screenshots');
const ARTIFACT_DIR = '/Users/display/.gemini/antigravity/brain/c79ed972-154d-4509-aa23-3e9fdf41d783';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// 1. Static HTTP Server for docs/ build
const staticDir = path.resolve(__dirname, '../docs');
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(staticDir, reqPath);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(staticDir, 'index.html')).pipe(res);
  }
});

server.listen(4190, '127.0.0.1', async () => {
  console.log('HTTP Server started on http://127.0.0.1:4190');

  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9240',
    '--window-size=1280,720',
    '--hide-scrollbars',
    'http://127.0.0.1:4190/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const list = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9240/json/list', res => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });

    const target = list.find(t => t.url.includes('4190'));
    if (!target) throw new Error('Game page target not found in Chrome target list');

    console.log('Attaching to page target:', target.title);
    const ws = new WebSocket(target.webSocketDebuggerUrl);

    let id = 1;
    const callbacks = new Map();
    ws.on('message', data => {
      const msg = JSON.parse(data.toString());
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg.result, msg.error);
        callbacks.delete(msg.id);
      }
    });

    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const curId = id++;
      callbacks.set(curId, (res, err) => err ? reject(err) : resolve(res));
      ws.send(JSON.stringify({ id: curId, method, params }));
    });

    await new Promise(r => ws.on('open', r));
    await send('Page.enable');
    await send('Runtime.enable');

    const evaluate = async (expr) => {
      const res = await send('Runtime.evaluate', {
        expression: `(() => { ${expr} })()`,
        returnByValue: true
      });
      return res.result?.value;
    };

    const takeScreenshot = async (filename) => {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      const localPath = path.join(SCREENSHOT_DIR, filename);
      const artifactPath = path.join(ARTIFACT_DIR, filename);
      const buf = Buffer.from(res.data, 'base64');
      fs.writeFileSync(localPath, buf);
      try { fs.writeFileSync(artifactPath, buf); } catch (e) { /* ignore */ }
      console.log(`Saved screenshot: ${filename} (${buf.length} bytes)`);
    };

    // =========================================================================
    // Screenshot 4: Château & Cour (Overlord Trebor's Castle Hub)
    // =========================================================================
    console.log('1. Navigating to Castle & Courtyard...');
    await evaluate(`
      const btns = Array.from(document.querySelectorAll('button'));
      const returnBtn = btns.find(b => b.textContent && (b.textContent.includes('Return') || b.textContent.includes('Retour')));
      if (returnBtn) returnBtn.click();
    `);
    await new Promise(r => setTimeout(r, 1500));
    await takeScreenshot('screenshot-4-castle.png');

    // =========================================================================
    // Screenshot 5: Échoppe de Boltac (Boltac's Trading Post)
    // =========================================================================
    console.log('2. Opening Boltac Trading Post...');
    await evaluate(`
      const btns = Array.from(document.querySelectorAll('button'));
      const boltac = btns.find(b => b.textContent && (b.textContent.includes('Boltac') || b.textContent.includes('Comptoir')));
      if (boltac) boltac.click();
    `);
    await new Promise(r => setTimeout(r, 1500));
    await takeScreenshot('screenshot-5-boltac-trading-post.png');

    // Return to Courtyard
    await evaluate(`
      const btns = Array.from(document.querySelectorAll('button'));
      const court = btns.find(b => b.textContent && (b.textContent.includes('Grande Cour') || b.textContent.includes('Cour')));
      if (court) court.click();
    `);
    await new Promise(r => setTimeout(r, 1000));

    // =========================================================================
    // Screenshot 1: 3D Donjon Pierre (Realistic Stone Dungeon)
    // =========================================================================
    console.log('3. Entering 3D Stone Dungeon...');
    await evaluate(`
      const btns = Array.from(document.querySelectorAll('button'));
      const enter = btns.find(b => b.textContent && (b.textContent.includes('Donjon') || b.textContent.includes('Entrer')));
      if (enter) enter.click();
    `);
    await new Promise(r => setTimeout(r, 2000));

    // Dismiss stairs prompt
    await evaluate(`
      const btns = Array.from(document.querySelectorAll('button'));
      const stay = btns.find(b => b.textContent && (b.textContent.includes('Rester') || b.textContent.includes('(N)')));
      if (stay) stay.click();
    `);
    await new Promise(r => setTimeout(r, 2500));
    await takeScreenshot('screenshot-1-dungeon-stone.png');

    // =========================================================================
    // Screenshot 2: Rétro Vectoriel Fil de Fer (1981 Apple II Wireframe)
    // =========================================================================
    console.log('4. Switching to Retro Wireframe Mode...');
    await evaluate(`
      const btns = Array.from(document.querySelectorAll('button'));
      const toggle = btns.find(b => b.textContent && (b.textContent.includes('Pierre') || b.textContent.includes('Fil de Fer') || b.textContent.includes('Rendu')));
      if (toggle) toggle.click();
    `);
    await new Promise(r => setTimeout(r, 2000));
    await takeScreenshot('screenshot-2-dungeon-wireframe.png');

    // =========================================================================
    // Screenshot 3: Combat Tactique au Tour par Tour (Combat with Bubbly Slimes & Orcs)
    // =========================================================================
    console.log('5. Triggering Tactical Combat Encounter...');
    await evaluate(`
      const slime = {
        id: 0,
        name: "BUBBLY SLIME",
        namePlural: "BUBBLY SLIMES",
        nameUnknown: "SLIME",
        nameUnknownPlural: "SLIMES",
        picId: 0,
        level: 1,
        ac: 12,
        attackCount: 1,
        attacks: [{ level: 1, hpFac: 1, hpMinAdd: 0 }],
        expReward: 55,
        monsterClass: 8
      };
      const orc = {
        id: 1,
        name: "ORC",
        namePlural: "ORCS",
        nameUnknown: "SMALL HUMANOID",
        nameUnknownPlural: "SMALL HUMANOIDS",
        picId: 1,
        level: 1,
        ac: 10,
        attackCount: 1,
        attacks: [{ level: 1, hpFac: 4, hpMinAdd: 0 }],
        expReward: 235,
        monsterClass: 0
      };

      const groups = [
        {
          monster: slime,
          identified: true,
          count: 3,
          aliveCount: 3,
          instances: [
            { monsterId: 0, hpLeft: 4, maxHp: 4, status: 'OK', acMod: 0, silencedRounds: 0 },
            { monsterId: 0, hpLeft: 3, maxHp: 3, status: 'OK', acMod: 0, silencedRounds: 0 },
            { monsterId: 0, hpLeft: 5, maxHp: 5, status: 'OK', acMod: 0, silencedRounds: 0 }
          ]
        },
        {
          monster: orc,
          identified: true,
          count: 2,
          aliveCount: 2,
          instances: [
            { monsterId: 1, hpLeft: 8, maxHp: 8, status: 'OK', acMod: 0, silencedRounds: 0 },
            { monsterId: 1, hpLeft: 7, maxHp: 7, status: 'OK', acMod: 0, silencedRounds: 0 }
          ]
        }
      ];

      localStorage.setItem('wiz1_dungeon_session', JSON.stringify({
        location: 'COMBAT',
        dungeonLevel: 1,
        posX: 0,
        posY: 0,
        direction: 0,
        lightLevel: 15,
        acModifier: 0,
        combatSurprise: 'NONE',
        combatGroups: groups
      }));
      window.location.reload();
    `);
    await new Promise(r => setTimeout(r, 3000));
    await takeScreenshot('screenshot-3-combat.png');

    ws.close();
    chrome.kill();
    server.close();
    console.log('SUCCESS: All 5 itch.io screenshots generated cleanly!');
    process.exit(0);
  } catch (err) {
    console.error('Fatal screenshot error:', err);
    chrome.kill();
    server.close();
    process.exit(1);
  }
});
