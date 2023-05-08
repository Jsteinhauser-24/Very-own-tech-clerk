const express = require('express');
const path = require('path');
const app = express();
const dbData = require('./db/db.json');
const PORT = 3001;
const fs = require('fs');
const { v4: uuidv4 } = require('uuid')

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);

//get /api/notes should read db.json
app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf-8', (err, data) => {
        if(err) {
            console.log(err);
            return res.status(500).json('error');
        }
        res.json(JSON.parse(data));
    });
});
//post /api/notes should receive new note to save on body, add to db.json then return new note
app.post('/api/notes', (req, res) => {
    //res.json(`${req.method} request received`);
    //console.info(req.rawHeaders);
    console.info(`${req.method} request received to add note`);
    const { title, text } = req.body;
    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuidv4(),
        };

        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) {
                console.log(err);
            } else {
                const parsedNotes = JSON.parse(data);

                parsedNotes.push(newNote)

                const noteString = JSON.stringify(parsedNotes)
                fs.writeFile(`./db/db.json`, noteString, (err) =>
                    err
                        ? console.log(err)
                        : console.log(`${newNote.title} note`));
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

app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;

    fs.readFile('./db/db.json', 'utf-8', (err, data) => {
    if (err) {
        console.log(err);
        return res.status(500).json('Error');
    }    
    const parsedNotes = JSON.parse(data);
    const updateNotes = parsedNotes.filter((note) => note.id !== noteId);

    fs.writeFile('./db/db.json', JSON.stringify(updateNotes), (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json
        }
        console.log(`${noteId} has been deleted`);
        res.status(200).json({
            status: 'Success',
            note_id: noteId
        });
    });
});
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.listen(PORT, () =>
    console.log(`check http://localhost:${PORT}`)
);