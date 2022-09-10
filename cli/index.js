#!/usr/bin/env node
'use strict';
((command = 'start') => {
  if (command) {
    const fs = require('fs');
    const path = require('path');
    const { Flags } = require('./../core');
    const flags = new Flags();
    const mainDir = path.resolve(process.cwd());
    const packagePath = path.join(mainDir, 'package.json');
    const tsConfigPath = path.join(mainDir, 'tsconfig.json');
    const tsconfig = require(tsConfigPath);
    const pack = require(packagePath);
    const external = [...Object.keys(pack.dependencies || { 'bitis': null }), ...Object.keys(pack.devDependencies || { 'bitis': null })];
    const bitisSettings = pack.bitis || {};
    const type = bitisSettings.type || flags.get('type') || 'http';
    const boot = bitisSettings.boot || 'auto';
    const distDir = (command === 'build') ? path.join(mainDir, '.release', 'server') : path.join(mainDir, '.debugger');

    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
    }

    const log = (message) => {
      if (process.stdout.clearLine) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
      }
      if (process.stdout.write) {
        process.stdout.write(message);
      } else {
        console.log(message);
      }
    };

    const modules = [
      { input: path.join(mainDir, 'config', 'index.ts'), output: path.join(distDir, 'configProfiles.js') },
      { input: path.join(mainDir, 'libraries', 'index.ts'), output: path.join(distDir, 'libs.js') },
      { input: path.join(mainDir, 'models', 'index.ts'), output: path.join(distDir, 'models.js') }
    ];

    if (type === 'http' || type === 'http-sockets') {
      modules.push({ input: path.join(mainDir, 'controllers', 'http.ts'), output: path.join(distDir, 'httpControllers.js') });
    }

    if (type === 'sockets' || type === 'http-sockets') {
      modules.push({ input: path.join(mainDir, 'controllers', 'sockets.ts'), output: path.join(distDir, 'socketsControllers.js') });
    }

    if (boot === 'manual') {
      modules.push({ input: path.join(mainDir, 'main.ts'), output: path.join(distDir, 'main.js') });
    }

    modules.forEach(({ input }) => {
      if (!fs.existsSync(input)) {
        console.error(`El modulo ${input.replace(mainDir, '')} no está declarado!`);
        process.exit();
      }
    });

    let compute;
    const initServer = () => {
      log('Iniciando servidor...');
      const { fork } = require('child_process');
      const serverPath = boot === 'auto' ? path.resolve(__dirname, 'server.js') : path.join(distDir, 'main.js');
      compute = fork(serverPath, boot === 'auto' ? ['--type', type, '--mainDir', mainDir, '--sourceDir', mainDir, '--distDir', distDir] : []);
      compute.on('message', log);
      compute.on('error', code => {
        console.error(code);
      });
    };

    const { build } = require('esbuild');

    const builders = modules.map(({ input, output }) => {
      const sm = tsconfig.compilerOptions.sourceMap;
      const sourcemap = sm ? true : false;
      const options = {
        entryPoints: [input],
        outfile: output,
        external,
        bundle: true,
        target: 'node12',
        format: 'cjs',
        platform: 'node',
        tsconfig: tsConfigPath,
      };
      if (command === 'start') {
        options.sourcemap = sourcemap;
        options.watch = {
          onRebuild: (error) => {
            if (compute && !compute.killed) {
              compute.kill();
              log('Servidor detenido!');
            }
            if (!error) {
              initServer();
            }
          }
        };
      } else {
        options.sourcemap = true;
        options.watch = false;
        if (flags.get('m') || flags.get('minify')) {
          options.minify = true;
        }
      }
      return build(options);
    });

    Promise.all(builders).then(() => {
      if (command === 'start') {
        initServer();
      } else {
        const newPackage = {
          name: pack.name || 'gorila-server',
          version: pack.version || '1.0.0',
          description: pack.description || '',
          main: './server/main.js',
          scripts: {
            start: 'node .'
          },
          dependencies: {
            ...(pack.dependencies || {}),
            bitis: 'file:./bitis'
          },
          licence: pack.licence || 'ISC'
        };
        if (type === 'http' || type === 'http-sockets') {
          newPackage.dependencies['express'] = '^4.17.3';
        }
        if (type === 'sockets' || type === 'http-sockets') {
          newPackage.dependencies['socket.io'] = '^4.4.1';
        }
        const rootdir = path.resolve(distDir, '..');
        fs.writeFileSync(path.join(rootdir, 'package.json'), JSON.stringify(newPackage, null, '\t'), { encoding: 'utf8' });
        const bitisPath = path.join(rootdir, 'bitis');
        if (fs.existsSync(bitisPath)) {
          fs.rmSync(bitisPath, { recursive: true, force: true });
        }
        fs.mkdirSync(bitisPath);
        fs.copyFileSync(path.resolve(__dirname, '..', 'core', 'index.js'), path.join(bitisPath, 'core.js'));
        if (type === 'http' || type === 'http-sockets') {
          fs.copyFileSync(path.resolve(__dirname, '..', 'http', 'index.js'), path.join(bitisPath, 'http.js'));
        }
        if (type === 'sockets' || type === 'http-sockets') {
          fs.copyFileSync(path.resolve(__dirname, '..', 'web-sockets', 'index.js'), path.join(bitisPath, 'web-sockets.js'));
        }
        const publicPaths = bitisSettings['public-paths'] || [];
        for (const publicPath of publicPaths) {
          const srcDir = path.join(mainDir, publicPath);
          if (fs.existsSync(srcDir)) {
            const destDir = path.join(rootdir, publicPath);
            fs.cpSync(srcDir, destDir, { recursive: true, force: true });
          }
        }
        if (boot === 'auto') {
          const bootPath = path.join(__dirname, 'boots', `${type}.js`);
          const bootDestDit = path.join(rootdir, 'server', 'main.js');
          fs.copyFileSync(bootPath, bootDestDit);
        }
      }
    })
  } else {
    console.log('Bitis Framework!\n');
  }
})(process.argv.slice(2)[0]);
