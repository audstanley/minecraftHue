const prompt = require("prompt");
const hue = require("node-hue-api");
const fs = require("fs");
const request = require("request");

console.log("\n--------------------------------------------------------");
console.log("MineCraft Hue Setup");
console.log("--------------------------------------------------------");
console.log("This is so you can set up your hur bridge for minecraft.");
console.log("After you enter your username, you will need to run over");
console.log("to your hue bridge and hit the button on the bridge");
console.log("You will have 20 seconds to hit the button on the bridge.");
console.log("Enter the username that you use for minecraft.\n")
prompt.message = "MineCraft";

fs.writeFile('eula.txt', "eula=true", 
	(err)=> { 
	if(err) throw err;
	else console.log("Successfully wrote to philipsHue.json.")
	});

hue.nupnpSearch().then((bridge)=> {
	let hueIp = bridge[0].ipaddress;
	console.log("Hue bridge found at: " + hueIp);
	prompt.start();
	prompt.get(['username'], function (err, result) {
		let c = 20; 
		console.log("Please go push the button on your hue bridge NOW.  You have 20 seconds...");
		let counter = setInterval(()=> {
			console.log(c);
			--c;
		}, 1000);
		setTimeout(()=>{
			clearInterval(counter);
			request({
					method: 'POST', 
					uri: 'http://' + hueIp + '/api', 
					json: {"devicetype":"my_hue_app#minecraft " + result.username}
					},
				(e, r, b)=> {
					if(e) throw e;
					else {
						if(b[0].error !== undefined) {
							console.log("There was a problem: " + b[0].error.description);
							console.log("Please re-run The setup.");
							console.log("Status: FAIL");
						}
						else if(b[0].success !== undefined){
							console.log("Status: SUCCESS!");
							fs.writeFile('philipsHue.json', JSON.stringify({
									username: result.username,
									hueUser: b[0].success.username,
									pushoverAPI: '',
									pushoverAPP: ''
									}, 
								null, 4), 
							(err)=> { 
							if(err) throw err;
							else {
								console.log("Successfully wrote to philipsHue.json.");
								console.log("Don't close this window.");
								console.log("The windows will launch the server in a few seconds AUTOMATICALLY.");
							}
							});
						}
					}
			})
		}, 22000)
		
		//console.log('Command-line input received:');
		//console.log('  username: ' + result.username);
	  });
  }).done();