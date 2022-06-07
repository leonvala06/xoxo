const express = require('express');
const mongoose = require('mongoose');
const path_react_app = 'C:/Users/Tristan/Documents/Stratego/alattaque/client_3000/build';
//const stuffRoutes = require('./routes/stuff');
const app = express();
const Board = require('../model/Board');

// A SUPPRIMER QUAND LA FONCTION INIT EST AU POINT
const firstBoard = new Board({
  cases: Array(9).fill(null),
  tour: 0,
  issue: null
});
firstBoard.idPrecedent = firstBoard._id;
firstBoard.save()
.then(() => console.log('plateau initialisé'))
.catch(error => console.log(error));
console.log('PREMIER PLATEAU: ' + firstBoard);

let idBoard = firstBoard._id;
let tour = 0;
let issue = firstBoard.issue;

// URL de la db en local
const url = "mongodb://localhost:27017/"

/* URL de la db sur le cloud Atlas
const url = "mongodb+srv://napoleon:alattaque@cluster0.k7gtbcl.mongodb.net/?retryWrites=true&w=majority"
*/

// Connection de la base de donnée MongoDB
mongoose.connect(url,  
{
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to the database !"));


// Création d'une version statique de React
app.use(express.static(path_react_app))

// Conversion en JSON
app.use(express.json());

// Eviter les problèmes de connection que l'utilisateur peut rencontrer pour des raisons de sécurité
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

//app.use('/api/stuff', stuffRoutes);

/////  FONCTIONS  /////

// Création & récupération du plateau de jeu
function initialiseBoard(init) {
  if (init === true) {
    const firstBoard = new Board({
      cases: Array(9).fill(null),
      tour: 0
    });
    firstBoard.idPrecedent = firstBoard._id;
    firstBoard.save()
    .then(() => console.log('plateau initialisé'))
    .catch(error => console.log(error));
    console.log('PREMIER PLATEAU: ' + firstBoard);
    
    let idBoard = firstBoard._id;
    let tour = 0;
    
    return board;
  }
}

function getBoard(idPlateau) {
  Board.findOne({ _id: idPlateau })
    .then(board => { 
      console.log('plateau récupéré' + board);
      return board;
    })
    .catch(err => console.log('erreur de récupération : ' + err));
}

// Validation de cette phase de jeu
function getIssueVerification(issuePlateau) {
  if(issuePlateau == null) {
    return true
  } else {
    return false
  }
}

// Enregistrement de cette phase de jeu
function getAttribute(attribut) {
  if (attribut === true) {
    return 'X';
  } else {
    return 'O'
  }
}

function updateBoard(casesDuJeu, tourDuJeu, idBoard, caseSelectionnee, attribut) { 
  const newPlateau = new Board({
    cases: casesDuJeu,
    tour: tourDuJeu,
    joueur: getAttribute(attribut),
    idPrecedent: idBoard
  });

  newPlateau.cases[caseSelectionnee] = getAttribute(attribut);
  console.log('plateau mis à jour');
  
  return newPlateau;
}

function saveBoard(newPlateau) {
  newPlateau.save()
  .then(() => console.log('plateau sauvegardé !'))
  .catch(error => console.log(error));
}

// Préparation de la prochaine phase de jeu
function changePlayer(attribut) {
  return !(attribut);
}

function gameIssue(newPlateau) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  // 1er cas : il y a un vainqueur
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (newPlateau.cases[a] && newPlateau.cases[a] === newPlateau.cases[b] && newPlateau.cases[a] === newPlateau.cases[c]) {
      newPlateau.issue = newPlateau.cases[a];
      return newPlateau
    }
  };
  
  // 2e cas : il n'y a pas de vainqueur et toujours des cases vides.
  for (let i = 0; i < 9; i++) {
    if (newPlateau.cases[i] == null) {
      newPlateau.issue = null;
      return newPlateau
    }
  };

  // 3e cas : il n'y a pas de vainqueur mais le plateau est rempli.
  newPlateau.issue = 'égalité';
  return newPlateau
}

// Fin du jeu
function deleteBoard(idDernierPlateau) {
    Board.deleteOne({ _id: idDernierPlateau })
      .then(() => console.log('plateau supprimé'))
      .catch((err) => console.log(err))
}

/////  ROUTES FONCTIONNELLES  /////

app.get('/', (req, res, next) => {
  console.log('get reçu');
  //console.log('CORPS DE LA REQUETE :');
  //console.log(req.body);

  res.send(getBoard(idBoard))
});


app.post('/', (req, res, next) => {
  console.log('post reçu');
  //console.log('CORPS DE LA REQUETE :');
  //console.log(req.body);

  // Création & Récupération du plateau de jeu
  /*const init = initialiseBoard(req.body.init);
  console.log('INITIALISATION : ' + init);*/

  // Validation de cette phase de jeu
  let tourValide = getIssueVerification(issue);
  tour += 1;

  if (tourValide == true) {
    // Enregistrement de cette phase de jeu
    const newBoard = updateBoard(req.body.casesDuJeu, tour, idBoard, req.body.caseSelectionnee, req.body.joueur);
    const finalBoard = gameIssue(newBoard);
    issue = finalBoard.issue;
    saveBoard(finalBoard);
    idBoard = newBoard._id;

    // Préparation de la prochaine phase de jeu
    const xIsNext = changePlayer(req.body.joueur);     // Changer l'attribut du joueur

    // Réponse
    res.send()

  }
});

app.delete('/', (req, res, next) => {
  console.log('delete reçu');
  console.log('CORPS DE LA REQUETE :');
  console.log(req.body);

  deleteBoard(firstBoard._id)

  res.send('Terminator')
});


module.exports = app;