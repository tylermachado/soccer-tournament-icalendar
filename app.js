const fs = require('fs');
const ics = require('ics');
const csv = require('csv-parser');

const matches = [];

fs.createReadStream('data/wwc.csv')
  .pipe(csv())
  .on('data', (row) => {
    var match = new Object();
    match.title = row.home_team + " v " + row.away_team;
    match.start = [parseInt(row.date.split("-")[0]), parseInt(row.date.split("-")[1]), parseInt(row.date.split("-")[2]), parseInt(row.time.split(":")[0])-parseInt(row.tz.split("C")[1]), parseInt(row.time.split(":")[1])];
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

      fs.writeFile('dist/calendar.ics', value, (err) => {
        if (err) throw err;
        console.log('.ics calendar file saved');
      });
  });
