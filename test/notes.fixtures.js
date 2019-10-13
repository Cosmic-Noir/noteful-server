function makeNotesArray() {
  return [
    {
      id: 1,
      date_published: "2029-01-22T16:28:32.615Z",
      title: "Test Note 1",
      content: "Content of stuff and things",
      folder_id: 1
    },
    {
      id: 2,
      date_published: "2029-01-22T16:28:32.615Z",
      title: "Test Note 2",
      content: "All of the stuff are belong to us",
      folder_id: 2
    },
    {
      id: 3,
      date_published: "2029-01-22T16:28:32.615Z",
      title: "Test Note 3",
      content: "Brian is cute",
      folder_id: 3
    },
    {
      id: 4,
      date_published: "2029-01-22T16:28:32.615Z",
      title: "Test Note 4",
      content: "Testing, one, two, testing...",
      folder_id: 1
    },
    {
      id: 5,
      date_published: "2029-01-22T16:28:32.615Z",
      title: "Test Note 5",
      content: "All of the testing of notes.",
      folder_id: 2
    }
  ];
}

function makeMaliciousNote() {
  const maliciousNote = {
    id: 911,
    date_published: new Date().toISOString(),
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
  };
  const expectedNote = {
    ...maliciousNote,
    title:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
  };
  return {
    maliciousNote,
    expectedNote
  };
}

module.exports = { makeNotesArray, makeMaliciousNote };
