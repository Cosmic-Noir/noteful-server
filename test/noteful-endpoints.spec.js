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

    beforeEach("Insert folders and notes", () => {
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

  context(`Given note with XSS attack`, () => {
    const { maliciousNote, expectedNote } = makeMaliciousNote();
    const testFolders = makeFoldersArray();

    beforeEach("Insert malicious note", () => {
      return db
        .into("noteful_folders")
        .insert(testFolders)
        .then(() => {
          return db.into("noteful_notes").insert(maliciousNote);
        });
    });

    it(`Sanitizes note of XSS attack`, () => {
      return supertest(app)
        .get(`/api/notes`)
        .expect(200)
        .expect(res => {
          expect(res.body[0].title).to.eql(expectedNote.title);
          expect(res.body[0].content).to.eql(expectedNote.content);
        });
    });
  });
});

describe(`GET /api/notes/:note_id`, () => {
  context(`Given no notes`, () => {
    it(`Responds with 404`, () => {
      const invalidId = 12345;
      return supertest(app)
        .get(`/api/notes/${invalidId}`)
        .expect(404, { error: { message: `Note doesn't exist` } });
    });
  });

  context(`Given there are notes`, () => {
    const testFolders = makeFoldersArray();
    const testNotes = makeNotesArray();

    beforeEach(`Insert folders and notes`, () => {
      return db
        .into("noteful_folders")
        .insert(testFolders)
        .then(() => {
          return db.into("noteful_notes").insert(testNotes);
        });
    });

    it(`Responds with 200 and specified note`, () => {
      const noteId = 2;
      const expectedNote = testNotes[noteId - 1];
      return supertest(app)
        .get(`/api/notes/${noteId}`)
        .expect(200, expectedNote);
    });
  });

  context(`Given a note with XSS attack`, () => {
    const testFolders = makeFoldersArray();
    const { maliciousNote, expectedNote } = makeMaliciousNote();

    beforeEach(`Insert folders and notes`, () => {
      return db
        .into("noteful_folders")
        .insert(testFolders)
        .then(() => {
          return db.into("noteful_notes").insert(maliciousNote);
        });
    });

    it(`Sanitzes XSS attack from note`, () => {
      return supertest(app)
        .get(`/api/notes/${maliciousNote.id}`)
        .expect(200)
        .expect(res => {
          expect(res.body.title).to.eql(expectedNote.title);
          expect(res.body.content).to.eql(expectedNote.content);
        });
    });
  });
});

describe(`POST /api/notes`, () => {
  it(`Creates note, responds with 201 and new note`, function() {
    this.retries(3);
    const testFolders = makeFoldersArray();

    beforeEach("cleanup", () =>
      db.raw("TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE")
    );
    beforeEach(`Insert test folders`, () => {
      return db.into("noteful_folders").insert(testFolders);
    });

    const newNote = {
      title: "The Newest Note",
      content: "The newest and hippest content",
      folder_id: 2
    };

    return supertest(app)
      .post(`/api/notes`)
      .send(newNote)
      .expect(201)
      .expect(res => {
        expect(res.body.title).to.eql(newNote.title);
        expect(res.body.content).to.eql(newNote.content);
        expect(res.body.folder_id).to.eql(newNote.folder_id);
        expect(res.body).to.have.property("id");
        expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`);
        // const expected = new Date().toLocaleString();
        // const actual = new Date(res.body.date_created).toLocaleString();
        // expect(actual).to.eql(expected);
      });
    // .then(res => supertest(app).get(`/api/notes/${res.body.id}`))
    // .expect(res.body);
  });
});
