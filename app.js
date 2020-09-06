const fetch = require('node-fetch');
const hue = require("node-hue-api");
const http = require('http');
const request = require('request');
const LineByLineReader = require('line-by-line');
const fs = require('fs');
const child = require('child_process').spawn;
const userInfo = require('./philipsHue.json');
let mcFileRe = (e) => { return /minecraft_server/.test(e); }
let hueUser = userInfo.hueUser;

if(userInfo === undefined) {
	console.log("You need to run the mineCraftHueSetup.bat FIRST.");
}
else {
	hue.nupnpSearch().then((bridge)=> {
		let hueIp = bridge[0].ipaddress;
		console.log("Hue Bridge Found at: " + hueIp + "\n");
		fs.readdir("./", (e, f) => {
			const mc = child('java', ['-Xmx1024M', '-Xms1024M', '-jar', 'server.jar', 'nogui']);
			const push = require('pushover-notifications');
			mc.stdin.setEncoding('utf-8');
			let p = new push({
				user: userInfo.pushoverAPI,		// user API key
				token: userInfo.pushoverAPP,	// token/APP API key
			});

			let userName = userInfo.username;
			let uNameRegex = RegExp(userName);
			let wholeThing = /\[\d{2}:\d{2}:\d{2}\] \[Server thread\/INFO\]: [\[<](@|\w+)[\]>] (\w+)\s?(\d{1,})?/;
			let joined = /(\w+) joined the game/;
			
			mc.stdout.on('data', (d) => {
				let str = d.toString();
				let wholeArray = wholeThing.exec(str);
				let isWholeThing = wholeThing.test(str);
				let rJoinedGame = /(\w+) joined the game/.exec(str);
				let isJoinedGame = /(\w+) joined the game/.test(str);
				
				//The moment the map finishes generating:
				if(/\[\d{2}:\d{2}:\d{2}\] \[Server thread\/INFO\]: Done/.test(str)) {
					let lr = new LineByLineReader('server.properties');
					let linedFile = "";
					lr.on('error', function (err) {
						console.log("There was a problem opening: server.properties");
					});
					lr.on('line', function (line) {
						linedFile += line.replace(/enable-command-block=false/, "enable-command-block=true") + "\n";
					});
					setTimeout(()=> {
						fs.writeFile('server.properties', linedFile), 
							(err)=> { 
							if(err) throw err;
							else console.log("Successfully enabled the command block in server.properties.");
							}
					}, 3000);
					
					setTimeout(()=> {
						mc.stdin.write( "/say Welcome To " + userName + "'s server\r\n" );
						mc.stdin.write("/op " + userName + "\r\n");
						mc.stdin.write("/gamerule commandBlockOutput false\r\n");
						console.log("trying to op...");
					}, 6000);	
				}
				// once we have captured the data (d), and parsed the buffer to a string.
				// we run a regular expression on the string to capture WHO, prefix, and number
				//wholeThing[0] = "a username";
				//wholeThing[1] = "some-prefix-command"  such as turnOn or turnOff.
				//wholeThing[2] = "number" or "location" for phillips hue bulb string location if !number.
				if(isWholeThing) {
					let pathToHue = '/api/' + hueUser + '/lights/' + wholeArray[3] + '/state/'
					if(/[tT]urn[oO]n/.test(wholeArray[2])) {
						console.log(hueIp + pathToHue);
						request({
							method: 'PUT',
							uri: 'http://' + hueIp + pathToHue,
							json: {"on":true, "bri":255}
						},	(e, r, b) => {
							if(e)return console.error("problem connecting to Hue at: http://" + hueIp + pathToHue);
							console.log("Success: " + JSON.stringify(b[0].success));
							}
						);
					}
					else if(/[tT]urn[oO]ff/.test(wholeArray[2])) {
						console.log(hueIp + pathToHue);
						request({
							method: 'PUT',
							uri: 'http://' + hueIp + pathToHue,
							json: {"on":false}
						},	(e, r, b) => {
							if(e)return console.error("problem connecting to Hue at: http://" + hueIp + pathToHue);
							console.log("Success: " + JSON.stringify(b[0].success));
							}
						);
					}
					else if(/command_block/.test(wholeArray[2]) && RegExp(userName).test(wholeArray[1])) {
						console.log("Here is your command block " + userName);
						mc.stdin.write('/give ' + userName + ' minecraft:command_block\r\n');
					}
				}
				else if(isJoinedGame && !(RegExp(userName).test(rJoinedGame[1]))) {
					let msg = {
						message: rJoinedGame[1],
						title: 'mineCraft Server'
					}
					console.log("Sending push notification that: " + rJoinedGame[1] + " has logged on.");
					p.send(msg, function(err, result) {if(err) throw err; console.log(result);});
				}
				else console.log(str);
			   
			});
			mc.stderr.on('data', (data) => {
			  console.log(`stderr: ${data}`);
			});

			mc.on('close', (code) => {
			  console.log(`child process exited with code ${code}`);
			});
			
		}); //end of file read
	}).catch((e) => console.log("\n\nERROR: could not connect to the phillips hue bridge. " +
					"\nIs there a philips hue bridge on your network?\nAnd are you connected to the same network?")).done(); //end of hue promise
} //end of else



