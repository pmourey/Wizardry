const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('/Users/display/VSCodeProjects/Wizardry/node_modules/ws');

const SCREENSHOT_DIR = path.resolve(__dirname, '../screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

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

server.listen(4195, '127.0.0.1', async () => {
  console.log('HTTP Server started on http://127.0.0.1:4195');

  const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
    '--headless=new',
    '--remote-debugging-port=9245',
    '--window-size=1600,900',
    '--hide-scrollbars',
    'http://127.0.0.1:4195/'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const list = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:9245/json/list', res => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });

    const target = list.find(t => t.url.includes('4195'));
    if (!target) throw new Error('Game page target not found');

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
      const buf = Buffer.from(res.data, 'base64');
      fs.writeFileSync(localPath, buf);
      console.log(`Saved screenshot: ${filename} (${buf.length} bytes)`);
    };

    // 1. Scenarios Catalogue View
    console.log('1. Capturing Scenarios Menu...');
    await evaluate(`
      localStorage.clear();
      window.location.reload();
    `);
    await new Promise(r => setTimeout(r, 2500));
    // Click scenarios button if not already showing
    await evaluate(`
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('Scénarios') || b.textContent.includes('Scenarios')));
      if (btn) btn.click();
    `);
    await new Promise(r => setTimeout(r, 1500));
    await takeScreenshot('screenshot-scenarios.png');

    // Select scenario #1 (Proving Grounds) to go to Castle
    await evaluate(`
      const selectBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('Lancer') || b.textContent.includes('Play') || b.textContent.includes('Explorer')));
      if (selectBtn) selectBtn.click();
    `);
    await new Promise(r => setTimeout(r, 2000));
    await takeScreenshot('screenshot-castle.png');

    // 2. Boltac's Trading Post
    console.log('2. Opening Boltac Trading Post...');
    await evaluate(`
      const boltac = Array.from(document.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('Boltac') || b.textContent.includes('Comptoir')));
      if (boltac) boltac.click();
    `);
    await new Promise(r => setTimeout(r, 1500));
    await takeScreenshot('screenshot-shop.png');

    // 3. Dungeon Stone Mode
    console.log('3. Entering 3D Stone Dungeon...');
    await evaluate(`
      localStorage.setItem('wiz_minimap_prefs', JSON.stringify({
        hudVisible: true,
        wireframeMode: false,
        modalEnlarged: false,
        modalViewMode: 'full',
        revealAll: true
      }));
      localStorage.setItem('wiz1_dungeon_session', JSON.stringify({
        location: 'MAZE',
        dungeonLevel: 1,
        posX: 0,
        posY: 1,
        direction: 0,
        lightLevel: 15,
        acModifier: 0,
        combatSurprise: 'NONE'
      }));
      window.location.reload();
    `);
    await new Promise(r => setTimeout(r, 3000));
    await takeScreenshot('screenshot-dungeon-stone.png');

    // 4. Retro Wireframe Mode
    console.log('4. Switching to 3D Retro Wireframe Mode...');
    await evaluate(`
      localStorage.setItem('wiz_minimap_prefs', JSON.stringify({
        hudVisible: true,
        wireframeMode: true,
        modalEnlarged: false,
        modalViewMode: 'full',
        revealAll: true
      }));
      window.location.reload();
    `);
    await new Promise(r => setTimeout(r, 3000));
    await takeScreenshot('screenshot-dungeon-wireframe.png');

    // 5. Enlarged Interactive Minimap with D-pad & Live Exploration!
    console.log('5. Opening Enlarged Interactive Minimap with live D-Pad...');
    await evaluate(`
      localStorage.setItem('wiz_minimap_prefs', JSON.stringify({
        hudVisible: true,
        wireframeMode: false,
        modalEnlarged: true,
        modalViewMode: 'full',
        modalShowLegend: true,
        revealAll: true,
        allowCheatMode: true
      }));
      window.location.reload();
    `);
    await new Promise(r => setTimeout(r, 3000));
    await takeScreenshot('screenshot-minimap-enlarged.png');

    // 6. Tactical Combat with Monster Encounter
    console.log('6. Triggering Combat Encounter...');
    await evaluate(`
      const dragon = {
        id: 17,
        name: "DRAGON",
        namePlural: "DRAGONS",
        nameUnknown: "HUGE REPTILE",
        nameUnknownPlural: "HUGE REPTILES",
        picId: 17,
        level: 10,
        ac: -2,
        attackCount: 3,
        attacks: [{ level: 2, hpFac: 10, hpMinAdd: 4 }],
        expReward: 12500,
        monsterClass: 3
      };
      const archer = {
        id: 12,
        name: "HIGH WIZARD",
        namePlural: "HIGH WIZARDS",
        nameUnknown: "MAGICIAN",
        nameUnknownPlural: "MAGICIANS",
        picId: 19,
        level: 8,
        ac: 4,
        attackCount: 1,
        attacks: [{ level: 1, hpFac: 6, hpMinAdd: 2 }],
        expReward: 4200,
        monsterClass: 1
      };

      const groups = [
        {
          monster: dragon,
          identified: true,
          count: 1,
          aliveCount: 1,
          instances: [
            { monsterId: 17, hpLeft: 64, maxHp: 64, status: 'OK', acMod: 0, silencedRounds: 0 }
          ]
        },
        {
          monster: archer,
          identified: true,
          count: 2,
          aliveCount: 2,
          instances: [
            { monsterId: 12, hpLeft: 28, maxHp: 28, status: 'OK', acMod: 0, silencedRounds: 0 },
            { monsterId: 12, hpLeft: 25, maxHp: 25, status: 'OK', acMod: 0, silencedRounds: 0 }
          ]
        }
      ];

      localStorage.setItem('wiz_minimap_prefs', JSON.stringify({
        hudVisible: true,
        wireframeMode: false,
        modalEnlarged: false
      }));
      localStorage.setItem('wiz1_dungeon_session', JSON.stringify({
        location: 'COMBAT',
        dungeonLevel: 4,
        posX: 5,
        posY: 8,
        direction: 1,
        lightLevel: 15,
        acModifier: 0,
        combatSurprise: 'NONE',
        combatGroups: groups
      }));
      window.location.reload();
    `);
    await new Promise(r => setTimeout(r, 3000));
    await takeScreenshot('screenshot-combat.png');

    ws.close();
    chrome.kill();
    server.close();
    console.log('SUCCESS: All latest graphical screenshots captured cleanly!');
    process.exit(0);
  } catch (err) {
    console.error('Fatal capture error:', err);
    chrome.kill();
    server.close();
    process.exit(1);
  }
});
