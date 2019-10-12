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
    const { folder_name } = req.body;
    const newFolder = { folder_name };

    // Needs to be tested - may cause issues
    if (!folder_name) {
      return res.status(400).json({
        error: { message: `folder_name is missing for new folder` }
      });
    }

    FoldersService.insertFolder(req.app.get("db"), newFolder)
      .then(folder => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(sterilizedFolder(folder));
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
        next();
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
    const { folder_name } = req.body;
    const folderToUpdate = { folder_name };

    if (!folder_name) {
      return res.status(400).json({
        error: {
          message: `Request body must contain folder_name of updated Folder`
        }
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
