const path = require("path");
const express = require("express");
const FoldersService = require("./folders-service");
const xss = require("xss");

// Create router:
const foldersRouter = express.Router();
const jsonParser = express.json();

// sterilized folder:
const sterilizedFolder = folder => ({
  id: folder.id,
  folder_name: xss(folder.folder_name)
});

foldersRouter
  .route("/")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    FoldersService.getAllFolders(knexInstance)
      .then(folders => {
        res.json(folders.map(sterilizedFolder));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title } = req.body;
    const newFolder = { title };

    // Needs to be tested - may cause issues
    if (!title) {
      return res.status(400).json({
        error: { message: `Title is missing for new folder` }
      });
    }

    FoldersService.insertFolder(req.app.get("db"), newFolder)
      .then(folder => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder_id}`));
      })
      .catch(next);
  });

foldersRouter
  .route("/:folder_id")
  .all((req, res, next) => {
    FoldersService.getById(req.app.get("db"), req.params.folder_id)
      .then(folder => {
        if (!folder) {
          return res.status(400).json({
            error: { message: `Folder doesn't exist` }
          });
        }
        res.folder = folder;
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(sterilizedFolder(res.folder));
  })
  .delete((req, res, next) => {
    FoldersService.deleteFolder(req.app.get("db"), req.params.folder_id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { title } = req.body;
    const folderToUpdate = { title };

    if (!title) {
      return res.status(400).json({
        error: { message: `Request body must contain title of updated Folder` }
      });
    }

    FoldersService.updateFolder(
      req.app.get("db"),
      req.params.folder_id,
      folderToUpdate
    )
      .then(nubmerRowsAffect => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = foldersRouter;
