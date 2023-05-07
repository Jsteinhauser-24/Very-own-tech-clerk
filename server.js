const express = require('express');
const path = require('path');
const app = express();
const dbData = require('./db/db.json');
const PORT = 3001;
const fs = require('fs');
const uuid = require('uuid')

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);

//get /api/notes should read db.json
app.get('/api/notes', (req, res) => res.json(dbData));
//post /api/notes should receive new note to save on body, add to db.json then return new note
app.post('/api/notes', (req, res) => {
    //res.json(`${req.method} request received`);
    //console.info(req.rawHeaders);
    console.info(`${req.method} request received to add note`);
    const { noteTitle, noteText } = req.body;
    if (noteTitle && noteText) {
        const newNote = {
            noteTitle,
            noteText,
            note_id: uuid(),
        };

        fs.readFile('./db/dbData.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
            } else {
                const parsedNotes = JSON.parse(data);

                parsedNotes.push(newNote)

                const noteString = JSON.stringify(newNote)
                fs.writeFile(`./db/${newNote.noteTitle}.json`, noteString, (err) =>
                    err
                        ? console.error(err)
                        : console.log(`${newNote.noteTitle} has been written to JSON file`));
            }
        })
        const result = {
            status: 'success',
            body: newNote,
        };

        console.log(result);
        res.status(201).json(result);
    } else {
        res.status(500).json('Error in posting review');
    }
});


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.listen(PORT, () =>
    console.log(`check http://localhost:${PORT}`)
);