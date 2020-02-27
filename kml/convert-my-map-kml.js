/**
 * Convert a KML file into Takeout timeline JSON format.
 */

const fs = require("fs");
const yargs = require("yargs");
const xml_parser = require('fast-xml-parser');
const kml_parser = require('../parsers.js');

const STDOUT = process.stdout;
const STDERR = process.stderr;

const argv = yargs
    .option('input', {
      alias: 'i',
      description: 'Specify the input filename',
      type: 'string',
    })
    .option('output', {
      alias: 'o',
      description: 'Specify the output filename',
      type: 'string',
    })
    .option('pretty', {
      description: 'pretty output',
      type: 'boolean',
    })
    .option('timezone', {
      description: 'Time offset in hours, e.g. 8 for Taiwan, -8 for SFO',
      type: 'number',
    })
    .help().alias('help', 'h')
    .argv;


function main() {
  const input_filename = (argv.input === undefined) ? '/dev/stdin' : argv.input;
  const input_text = fs.readFileSync(input_filename, 'utf-8');

  const ps = kml_parser.parseKml(input_text);
  console.log(`Loaded ${ps.length} points`);

  if (argv.timezone !== undefined) {
    // Time offset in seconds.
    const delta_t = argv.timezone * 60 * 60;

    // We want to revert the timezone different, so our timestamp is UTC+0.
    for (let p of ps) {
      p.begin -= delta_t;
      p.end -= delta_t;
    }
  }

  if (argv.output === undefined) {
    for (let p of ps) {
      console.log(p);
    }
  } else {
    let out_obj = [];
    for (let p of ps) {
      out_obj.push({
        placeVisit: {
          location: {
            latitudeE7: p.lat * 1e7,
            longitudeE7: p.lng * 1e7,
            name: p.name + " " + p.description.split("#!metadata")[0],
          },
          duration: {
            startTimestampMs: p.begin * 1000,
            endTimestampMs: p.end * 1000,
          }
        }
      });
    }

    let space = argv.pretty ? 2 : 0;
    let out_text = JSON.stringify({
      timelineObjects: out_obj,
    }, null, space);
    fs.writeFile(argv.output, out_text, function (err) {
      if (err) throw err;
    });
  }
}

main();
