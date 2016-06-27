/* global module */
/* jslint node: true */
/* jslint indent: 2 */
'use strict';

/* Module Require */
var parseArgs = require('minimist'),
  process = require('process'),
  metadoi = require('meta-doi'),
  async = require('async'),
  path = require('path'),
  fs = require('fs');

/* Constantes */
var SEPARATOR = ';';

// Command Line arguments
var argv = parseArgs(process.argv.slice(2));
console.dir(argv);

var output = argv.output || './output/crossref.csv', // nom du fichier de sortie
  dois = argv.input || './resources/dois.json'; // nom du fichier contenant les dois

/* Vairables */
var options = {
  'extended': true,
  'auth': ['login', 'password']
};

// Si le chemin est relatif, on génère le chemin absolu
if (dois[0] !== '/') {
  dois = path.join(__dirname, dois);
}

var input = require(dois);

// Pour chaque DOI, un appel vers l'API est fait de manière synchrone
async.eachSeries(input,
  function(doi, callback) {
    metadoi.resolve(doi, options, function(err, item) {
      console.log(item);
      callback();
    });
  }
);