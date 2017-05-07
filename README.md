
# MineCraft Hue

#### Control Philips Hue bulbs from within minecraft.

First you will need NodeJs installed: [version 6 or 7](https://nodejs.org/en/).

Then you need to get the zip project from [here](https://github.com/audstanley/minecraftHue)

Click the green "Clone or Download" button, and download zip.

Then drag the folder inside the zip to your desktop.
Now, download the [minecraft server.jar](https://minecraft.net/en-us/download/server)

Once you have the minecraft server.jar file, drop it into the minecraftHue-master folder.
Run the minecraft_server.#.##.#.jar file one time.

Open the eula.txt file, and set:

eula=false to eula=true.

Save and exit the eula.txt.

Now, run the **mineCraftHueSetup** file from within the *mineCraftHue-master* folder. 

You will only need to run this **once** if you follow the instructions and get a **"Status: SUCCESS"** after completion.

### You are ready to run the server:

You need to run the "Start MineCraft" file in order to control lights in your house inside minecraft.

#### NOW from within Minecraft:

Connect to your Local running server by going to **Multiplayer**, Add Server, type: **localhost**, and connect.

you can simply type:
**/say turnOn 1**

...and that will turn on the first Hue bulb in your house.

or if you want to get creative, turn on creative mode in minecraft: **/gamemode 1**

then type **/** first, then backspace (so there is no '/' in the message box), then type: 

**command_block**

The server will give you a command block.  Place the command block, right click on the command block,

type **/say turnOn 1.** into the command block.

place another command block, and right click and put in: **/say turnOff 1.**

put pressure plates next to each block, then walk over them.

You should see your lights flicking on and off in the house.

**CONGRATULATIONS!!**

## Optional (Last Step):

If you want to get push notifications every time someone logs onto your minecraft server,
setup and account at [pushover](https://pushover.net/)
after creating a pushover account, you will see "You user Key" with a bunch of random looking letters and numbers.
Copy it, then open philipsHue.json in your mineCraftHue-master folder, 

and paste between quotation marks: "pushoverAPI": "HERE"

```json
{
    "username": "not here",
    "hueUser": "not here",
    "pushoverAPI": "HERE",
    "pushoverAPP": "not here"
}
```

then on pushover.net, go to: "Your Applications (Create an Application/API Token)"
You only need to give the application a name, something like: mineCraftHue.
Copy the api(application) token (also more random looking letters and numbers), 
open philipsHue.json in your mineCraftHue-master folder.

paste the APP token inside the quotation marks: "pushoverAPP": "HERE"

```json
{
    "username": "not here",
    "hueUser": "not here",
    "pushoverAPI": "not here",
    "pushoverAPP": "HERE"
}
```

Save the philipsHue.json file, then you should receive pushover notifications through the pushover application
on Android or IOS everytime someone logs onto your server.  Restart the server: if you made changes to your philipsHue
file while you were running the server. Otherwise, just start the server.