const {watch} = require('chokidar')
const {Collection} = require('discord.js')
const commands = new Collection()

function init(path){
    watch(path)
        .on('add', add)
        .on('change', edit)
        .on('unlink', remove)

    return commands
}

function add(path) {
    const cmd = require('../../' + path)
    cmd.path = path
    cmd.cmd.forEach(alias => {
        console.log("Loaded Command [" + alias + "]")
        commands.set(alias, cmd)
    })
}

function edit(path){
    delete require.cache[require.resolve('../../' + path)]
    const cmd = require('../../' + path)
    cmd.cmd.forEach(alias => {
        console.log("Restarted Command [" + alias + "]")
        commands.set(alias, cmd)
    })
}

function remove(path){
    [commands.filter(cmd => cmd.path === path).keys()]
    .forEach(cmd => {
        console.log("Deleted Command [" + alias + "]")
        commands.delete(cmd)
    })
}

module.exports = init