const CronJob = require('cron').CronJob;
const fetch = require('node-fetch');
const https = require('https');
const fs = require('fs');
const { spawn } = require('child_process');

let bigV = 1;
let curr = 11;
let smallV = 2;
let previousV = 'minecraft_server.' + bigV + '.' + curr + '.' + smallV + '.jar';

let job = new CronJob({
    cronTime: '00 00 03 * * *',
    onTick: function() {
      fetch('https://minecraft.net/en-us/download/server').then(d => d.text()).then(d=> {
        let arr = d.match(/https:\/\/s3.amazonaws.com\/Minecraft\.Download\/versions\/(\d{1,})\.(\d{1,})\.?(\d{1,})?\/minecraft_server\.\d{1,}\.\d{1,}.?\d{1,}?\.jar/);
        let linkToDownload = 'https://s3.amazonaws.com/Minecraft.Download/versions/' + arr[1] + '.' + arr[2] + (isNaN(parseInt(arr[3]))? '' : '.' + arr[3])+ '/minecraft_server.' + arr[1]+ '.' + arr[2] + (isNaN(parseInt(arr[3]))? '' : arr[3]) + '.jar';
          if(smallV !== parseInt(arr[3]) || curr !== parseInt(arr[2])) {
            var file = fs.createWriteStream('minecraft_server.' + arr[1] + '.' + arr[2] + (isNaN(parseInt(arr[3]))? '' : arr[3]) + '.jar');
            var request = https.get(linkToDownload, function(response) {
              response.pipe(file);
              let filePath = './' + previousV;
              let newV = 'minecraft_server.' + arr[1] + '.' + arr[2] + '.' + (isNaN(parseInt(arr[3]))? '' : arr[3]) + '.jar';
              fs.unlink( filePath, function(err){
                    if(err) console.log(err);
                    console.log('Deleted:', filePath);
                    console.log('And Downloaded:', 'minecraft_server.' + arr[1] + '.' + arr[2] + (isNaN(parseInt(arr[3]))? '' : arr[3]) + '.jar');
                    previousV = newV;
                    bigV = parseInt(arr[1]);
                    curr = parseInt(arr[2]);
                    smallV = isNaN(parseInt(arr[3]))? null : parseInt(arr[3]);
                    setTimeout(()=> {
                            console.log('Attempting to restart server...')
                            const mc = spawn('pm2', ['restart', 'mineCraftHue']);
                            mc.stdout.on('data', (data) => {
                                    console.log(`stdout: ${data}`);
                            });
                    },10000)
              });
          });
      }
      console.log(linkToDownload);
    })
  },
  start: false,
  timeZone: 'America/Los_Angeles'
});
job.start();
