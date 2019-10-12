const path = require("path");
const express = require("express");
const NotesService = require("./notes-service");
const xss = require("xss");

//Create router:
const notesRouter = express.Router();
const jsonParser = express.json();

// sterilized note:
const sterilizedNote = note => ({
  id: note.id,
  title: xss(note.title),
  content: xss(note.content),
  date_published: note.date_published,
  folder_id: note.folder_id
});

notesRouter.route("/").get((req, res, next) => {
  const knexInstance = req.app.get("db");
  NotesService.getAllNotes(knexInstance)
    .then(notes => {
      res.json(notes.map(sterilizedNote));
    })
    .catch(next);
})
.post(jsonParser, (res, res, next) => {
    const { title, content, folder_id } = req.body;
    const newNote = { title, content };

    for (const [key, value] of Object.defineProperties(newNote)){
        if(value == null){
            return res.status(400).json({
                error: { message: `Missing '${key}' in request body `}
            });
        }
    }
    newNote.folder_id = folder_id;

    NotesService.insertNote(req.app.get('db'), newNote)
        .then(note => {
            res 
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${note.id}`));
        })
        .catch(next);
})

notesRouter
    .route("/:note_id")
    .all((req, res, next) => {
        NotesService.getById(req.app.get('db'), req.params.note_id)
        .then(note => {
            if(!note){
                return res.status(404).json({
                    error: { message: `Note doesn't exist`}
                });
            }
            res.note = note;
        })
        .catch(next);
    })
    .get((req, res, next) => {
        res.json(sterilizedNote(res.note));
    })
    .delete((req, res, next) => {
        NotesService.deleteNote(req.app.get('db'), req.params.note_id)
        .then(() => {
            res.status(204).end();
        })
        .catch(next);
    })
    .patch(jsonParser, (req, res, next) => {
        const { title, content } = req.body;
        const noteToUpdate = { title, content };

        const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;

        if(numberOfValues === 0){
            return res.status(400).json({
                error: { message: `Request body must contain either 'title' or 'content'`}
            });
        }

        NotesService.updateNote(
            req.app.get('db'), req.params.note_id, noteToUpdate
        )
        .then(numberRowsAffect => {
            res.status(204).end();
        })
        .catch(next);
    })

    module.exports = notesRouter;