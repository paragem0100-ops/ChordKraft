import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

function saveSongPlugin() {
  return {
    name: 'save-song-plugin',
    configureServer(server) {
      server.middlewares.use('/api/save-song', (req, res, next) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const song = data.song;
              if (!song || !song.title) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Falta el título de la canción' }));
                return;
              }

              // Normalizar el nombre del archivo según el título de la canción
              const safeTitle = song.title.replace(/[^a-zA-Z0-9\s-_]/g, '').trim().replace(/\s+/g, '_');
              const fileName = `${safeTitle}.json`;
              const songsDir = path.resolve(process.cwd(), 'songs');
              const filePath = path.resolve(songsDir, fileName);

              if (!fs.existsSync(songsDir)) {
                fs.mkdirSync(songsDir, { recursive: true });
              }

              // Guardar la canción en el archivo JSON
              fs.writeFileSync(filePath, JSON.stringify(song, null, 2), 'utf-8');
              console.log(`[SaveSongPlugin] Canción guardada localmente: ${filePath}`);

              // Push automático a GitHub usando el token temporal autenticado en el entorno
              const token = process.env.GITHUB_TOKEN;
              const gitCmd = token 
                ? `git remote set-url origin https://${token}@github.com/paragem0100-ops/ChordKraft.git && git add "${filePath}" && git commit -m "chore: save song ${song.title}" && git push origin main && git remote set-url origin https://github.com/paragem0100-ops/ChordKraft`
                : `git add "${filePath}" && git commit -m "chore: save song ${song.title}" && git push origin main`;
              
              exec(gitCmd, { cwd: process.cwd() }, (err, stdout, stderr) => {
                if (err) {
                  console.error('[SaveSongPlugin] Error al subir a GitHub:', err);
                  console.error('[SaveSongPlugin] Stderr:', stderr);
                } else {
                  console.log('[SaveSongPlugin] Canción subida a GitHub con éxito:', stdout);
                }
              });

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, fileName }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig({
  root: './',
  publicDir: 'public',
  plugins: [saveSongPlugin()],
  server: {
    port: 8000,
    host: true,
    open: false
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true
  }
});
