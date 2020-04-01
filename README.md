# worker_shop

## preparation
- chromeBrowser >= 80
- go to chrome://flags/#enable-experimental-web-platform-features and enable it and restart - 
  to be able to use esModules for Workers `new Worker(path, { name, type: 'module' })`
- clone this repo
- navigate into it and start a server of your choice - i used php -S host:port
- open host:port in chromeBrowser
