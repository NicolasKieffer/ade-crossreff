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
  'extended': true
};

// Si le chemin est relatif, on génère le chemin absolu
if (dois[0] !== '/') {
  dois = path.join(__dirname, dois);
}

var input = require(dois);

// Variable l'entête du fichier csv
var header = [
  'doi-DOI',
  'doi-publication-title',
  'doi-publication-date-year',
  'doi-publisher',
  'doi-type',
  'doi-ISSN',
  'doi-subject',
  'doi-author',
  'hasORCID',
  'doi-license-content-version',
  'doi-license-URL',
  '\n'
];

// Écriture de l'entête du fichier CSV
fs.writeFileSync(output, header.join(SEPARATOR));

// Pour chaque DOI, un appel vers l'API est fait de manière synchrone
async.eachSeries(input,
  function(doi, callback) {
    metadoi.resolve(doi, options, function(err, item) {
      if (err) {
        console.error(err);
        callback(err);
      }
      if (item) {
        fs.appendFile(output, [
            item['doi-DOI'],
            item['doi-publication-title'],
            item['doi-publication-date-year'],
            item['doi-publisher'],
            item['doi-type'],
            item['doi-ISSN'],
            item['doi-subject'],
            stringifyAuthors(item['doi-author']),
            hasORCID(item['doi-author']),
            item['doi-license-content-version'],
            item['doi-license-URL'],
            '\n'
          ].join(SEPARATOR),
          function(err) {
            if (err) {
              console.log(err);
            }
          });
        callback();
      }
    });
  },
  function(err) {
    // Affichage de l'erreur dans la console
    if (err) {
      console.log(err);
    }
  });

// Stringify les données principales des auteurs
function stringifyAuthors(authors) {
  var result = [];
  if (authors) {
    for (var i = 0; i < authors.length; i++) {
      result.push([authors[i]['family'], ' ', authors[i]['given'], '\n'].join('').trim());
    };
  }
  return result.join();
}

// Vérifier la présence des ORCID dans une liste d'auteurs
function hasORCID(authors) {
  if (authors) {
    for (var i = 0; i < authors.length; i++) {
      if (authors[i]['ORCID']) {
        return true;
      }
    }
  }
  return false;
}