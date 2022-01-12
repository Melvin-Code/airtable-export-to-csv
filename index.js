const PORT = process.env.PORT || 8000;
const csv = require("export-to-csv");
const express = require("express");
const ObjectsToCsv = require("objects-to-csv");
var path = require("path");

const app = express();
const air = require("airtable");
let rec = [];

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // console.log(rec[0]);
});
// create get request that responds the variable rec
app.get("/auth/:key/:base/:table", (req, res) => {
  var base = new air({ apiKey: `${req.params.key}` }).base(
    `${req.params.base}`
  );
  let fieldsArray = [];
  let fieldObj = [];
  let dataContainer = [];
  base(`${req.params.table}`)
    .select({
      maxRecords: 100,
      view: "Grid view",
    })
    .eachPage(
      async function page(records, fetchNextPage) {
        records.forEach(function (record) {
          // rec.push(Object.keys(record.fields));

          let fields = Object.keys(record.fields);
          let final = fields.map(function (field) {
            return [field, record.get(field)];
          });
          final = Object.fromEntries(final);
          fieldObj.push(final);
        });

        const csv = new ObjectsToCsv(fieldObj);
        var options = {
          root: path.join(__dirname, "/"),
        };
        await csv.toDisk("./air.csv");
        res.sendFile("air.csv", options, function (err) {
          if (err) {
            next(err);
          } else {
            console.log("Sent:", "air.csv");
          }
        });
        fetchNextPage();
      },
      function done(err) {
        if (err) {
          console.error(err);
          return;
        }
      }
    );
});
