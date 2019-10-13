const { expect } = require("chai");
const knex = require("knex");
const app = require("../src/app");
const { makeNotesArray, makeMaliciousNote } = require("./notes.fixtures");
const { makeFoldersArray, makeMaliciousFolder } = require("./folders.fixtures");

let db;

// Create connection to db:
before("make knex instance", () => {
  db = knex({
    client: "pg",
    connection: process.env.TEST_DB_URL
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
describe(`GET /api/notes`, () => {
  context(`Given there are no notes`, () => {
    it(`Responds with 200 and an empty list`, () => {
      return supertest(app)
        .get("/api/notes")
        .expect(200, []);
    });
  });

  context(`Given there are notes`, () => {
    const testFolders = makeFoldersArray();
    const testNotes = makeNotesArray();

    beforeEach("Insert testNotes into test db", () => {
      return db
        .into("noteful_folders")
        .insert(testFolders)
        .then(() => {
          return db.into("noteful_notes").insert(testNotes);
        });
    });

    it(`GET /api/notes responds with 200 and all notes`, () => {
      return supertest(app)
        .get("/api/notes")
        .expect(200, testNotes);
    });
  });
});
