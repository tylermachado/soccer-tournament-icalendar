const path = require('path');
const fs = require('fs');
const ics = require('ics');
const csv = require('csv-parser');


const directoryPath = path.join(__dirname, 'data');

fs.readdir(directoryPath, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }

    files.forEach(function (file) {
        const matches = [];

        var filename = file.split(".")[0];
        var initials = filename.match(/\b(\w)/g).join('');

        fs.createReadStream(directoryPath + "/" + file)
          .pipe(csv())
          .on('data', (row) => {
            var match = new Object();
            var matchMonth = parseInt(row.date.split("-")[1]);
            var matchDate = parseInt(row.date.split("-")[2]);
            var matchHour = (parseInt(row.time.split(":")[0]) - (parseFloat(row.tz.split("C")[1])));

            if (matchHour > 23) {
                matchHour = matchHour-24;
                matchDate = matchDate + 1;
                if (matchDate > 30) {
                    matchDate = matchDate - 30;
                    matchMonth = matchMonth + 1;
                }
            }

            match.title = "[" + initials + "] " + row.home_team + " v " + row.away_team;
            match.start = [parseInt(row.date.split("-")[0]), matchMonth, matchDate, matchHour, parseInt(row.time.split(":")[1])];
            match.duration = {hours: 2};
            match.description = row.phase + "\nMatch " + row.id;

            matches.push(match);
          })
          .on('end', () => {
              const { error, value } = ics.createEvents(matches)

              if (error) {
                console.log(error)
                return
              } else {
                console.log('.csv file processed');
              }

              fs.writeFile('dist/' + filename + '.ics', value, (err) => {
                if (err) throw err;
                console.log('.ics calendar file saved');
              });
          });
    });
});
