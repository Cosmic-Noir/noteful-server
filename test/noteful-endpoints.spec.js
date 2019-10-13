const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const { makeNotesArray, makeMaliciousNote } = require("./notes.fixtures");
const { makeFoldersArray } = require("./folders.fixtures");

let db;

// Create connection to db:
before("make knex instance", () => {
  db = knex({
    client: "pg",
    connection: ProcessingInstruction.env.TEST_DB_URL
  });
  app.set("db", db);
});

// Disconnect and clear the table for testing, use .raw to truncate multiple tables
after("Disconnect from db", () => db.destroy());

before("Clear the table", () =>
  db.raw("TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE")
);

afterEach("cleanup", () =>
  db.raw("TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE")
);

// GET
