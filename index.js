let stuff = null;

const { watch } = require('chokidar');
const { Collection } = require('discord.js');
const { readdirSync } = require('fs')

const types = {
    'collection': Collection,
    'json': Object,
    'class': Collection
};

const register = {
    json(key, value, event, options) {
        stuff[key] = value;
        log(key, event, options);
    },

    collection(key, value, event, options) {
        stuff.set(key, value);
        log(key, event, options);
    },

    class(key, value, event, options) {
        stuff.set(key, value);
        log(key, event, options);
    }
}

const unregister = {
    json(key, event, options) {
        delete stuff[key];
        log(key, event, options);
    },

    collection(key, event, options) {
        stuff.delete(key);
        log(key, event, options);
    },

    class(key, event, options) {
        stuff.delete(key);
        log(key, event, options);
    }
}

/**
 * 
 * @param {Object} options Options
 * @param {string} options.type Type of command handler (collection, class, json) [Default = collection]
 * @param {string} options.path Path to your commands folder relative to entry point [Default = ./commands]
 * @param {string} options.name The exported name variable for your commands, set to null for none [Default = name]
 * @param {string} options.alias The exported alias array variable for your commands, set to null for none [Default = aliases]
 * @param {string} options.logging The logging format, set to null for none (Variables: {event}, {name}) [Default = {event} Command [{name}]]
 * @param {string} options.static Whether it detects when a file is modified (Disable for deployment) [Default = false]
 * 
 * @example discordcmd({
 *      type: "collection",
 *      path: "./cmds",
 *      name: "trigger",
 *      alias: "alias",
 *      logging: "Command {name} has been {event}",
 *      static: false
 * })
 */

function init(options = {}) {
    if (typeof options === 'string') options = { path: options }
    options = {
        type: types[options.type] ? options.type : 'collection',
        path: typeof options.path === 'string' ? options.path : './commands',
        name: typeof options.name === 'string' ? options.name : 'name',
        alias: typeof options.alias === 'string' ? options.alias : 'aliases',
        logging: typeof options.logging === 'string' ? options.logging : '{event} Command [{name}]',
        static: options.static === true ? true : false
    };

    stuff = new types[options.type]

    if (options.static) load(options.path, options);
    else watch(path)
        .on('add', path => add(path, options))
        .on('change', path => edit(path, options))
        .on('unlink', path => remove(path, options))
        .on('error', () => log('Unknown Error', 'Error', options))

    return stuff;
}

function add(path, options) {
    if (!path.endsWith('.js')) return;

    try {
        const cmd = require('../../' + path);
    } catch {
        return log(path.replace(/^.+[\/\\]/, '').replace(/\.js$/, ''), 'Error', options)
    }

    cmd.path = '../../' + path;

    register[options.type](cmd[options.name] || path.replace(/^.+[\/\\]/, '').replace(/\.js$/, ''), cmd, 'Loaded', options);
    if (Array.isArray(cmd[options.alias])) cmd[options.alias].forEach(alias => register[options.type](alias, cmd, 'Loaded', options));
}

function edit(path, options) {
    if (!path.endsWith('.js')) return;

    delete require.cache[require.resolve('../../' + path)];
    try {
        const cmd = require('../../' + path);
    } catch {
        return log(path.replace(/^.+[\/\\]/, '').replace(/\.js$/, ''), 'Error', options)
    }

    if (Array.isArray(cmd[options.alias])) cmd[options.alias]
        .forEach(alias => register[options.type]
            (alias, cmd, 'Loaded', options));

    if (typeof cmd[options.name] === 'string') register[options.type]
        (cmd[options.name], cmd, 'Reloaded', options);
}

function remove(path, options) {
    if (!path.endsWith('.js')) return;

    [...stuff
        .filter(cmd => cmd.path.endsWith(path))
        .keys()
    ]
        .forEach(cmd => unregister[options.type](cmd, 'Deleted', options));
}

function log(key, event, options) {
    if (typeof options.logging === 'string') console.log(
        options.logging
            .replace(/\{event\}/gi, event)
            .replace(/\{name\}/gi, key)
    );
}

function load(path, options) {
    readdirSync(path)
        .forEach(file => {
            if (file.endsWith('.js')) add(path + '/' + file, options)
            else if (!file.includes('.')) load(path + '/' + file, options)
        })
}

module.exports = init;
