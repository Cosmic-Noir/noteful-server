function makeFoldersArray() {
  return [
    {
      id: 1,
      folder_name: "Folder One",
      date_created: "2029-01-22T16:28:32.615Z"
    },
    {
      id: 2,
      folder_name: "Folder Two",
      date_created: "2100-05-22T16:28:32.615Z"
    },
    {
      id: 3,
      folder_name: "Folder Three",
      date_created: "2024-01-21T16:28:32.615Z"
    }
  ];
}

function makeMaliciousFolder() {
  const maliciousFolder = {
    id: 911,
    folder_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    date_created: new Date().toISOString()
  };
  const expectedFolder = {
    ...maliciousFolder,
    folder_name:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;'
  };
  return {
    maliciousFolder,
    expectedFolder
  };
}

module.exports = {
  makeFoldersArray,
  makeMaliciousFolder
};
