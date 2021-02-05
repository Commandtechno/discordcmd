const {watch} = require('chokidar')
const {Collection} = require('discord.js')
const commands = new Collection()

function init(path, options = {}){
    options = {
        logging: options.hasOwnProperty('logging') ? options.logging : `{Event} Command [{name}]`,
        name: typeof options.name === 'string' ? options.name : 'name',
        alias: typeof options.alias === 'string' ? options.alias : 'aliases'
    }

    watch(path)
        .on('add', path => add(path, options))
        .on('change', path => edit(path, options))
        .on('unlink', path => remove(path, options))

    return commands
}

function add(path, options) {
    if(!path.endsWith('.js')) return;

    const cmd = require('../../' + path)
    cmd.path = path

    cmd[options.alias]?.forEach(alias => register(alias, cmd, 'Loaded', options))
    if(typeof cmd[options.name] === 'string') register(cmd[options.name], cmd, 'Loaded', options)
}

function edit(path, options){
    if(!path.endsWith('.js')) return;

    delete require.cache[require.resolve('../../' + path)]

    const cmd = require('../../' + path)
    cmd.path = path

    cmd[options.alias]?.forEach(alias => register(alias, cmd, 'Reloaded', options))
    if(typeof cmd[options.name] === 'string') register(cmd[options.name], cmd, 'Reloaded', options)
}

function remove(path, options){
    if(!path.endsWith('.js')) return;
    
    [commands.filter(cmd => cmd.path === path).keys()]
    .forEach(cmd => {
        log(cmd, 'Deleted', options)
        commands.delete(cmd)
    })
}

function register(key, value, event, options){
    commands.set(key, value)
    log(key, event, options)
}

function log(key, event, options) {
    if(typeof options.logging === 'string') console.log(
        options.logging
        .replace(/[^\\]\{event\}/gi, event)
        .replace(/[^\\]\{name\}/gi, key)
    )
}

module.exports = init