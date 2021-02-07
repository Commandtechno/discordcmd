# Installation
```
npm install discordcmd --no-optional
```

# Introduction

The most advanced Discord command handler which is easy to setup with a lot of configurations. Its also the first command handler (That I know off, and i don't know much, so I'm probably wrong) that automatically reloads, and deletes commands while they're modified without having the bot restart

# Usage

```js
const handler = require("discordcmd")

handler({
	type: "collection", // Type of command handler (collection, class, json)
	path: "./commands", // Path to your commands folder relative to entry point
	name: "name" // The exported name variable for your commands, set to null for none
	alias: "aliases" //The exported alias array variable for your commands, set to null for none 
	logging: "{event} Command [{name}]", // The logging format, set to null for none (Variables: {Event}, {name})
	static: false // Whether it detects when a file is modified (Disable for deployment)
}
```

# Contribution
If you would like to contribute in any way including suggestions, bug reports, or adding on to the package DM me on Discord at **Commandtechno#0841**! All contribution is appreciated to making this package better.