/*
REGOLE
- Le risposte vanno scritte in JavaScript sotto questi commenti.
- Pattern fondamentale: stato -> render() -> eventi.
  Tutto cio' che vedi a schermo dipende dallo stato.
  Gli eventi modificano lo stato e poi chiamano render().
- Apri index.html nel browser. Apri la console (DevTools) per gli errori.
- Cerca su MDN solo i concetti dichiarati come "cerca tu":
  localStorage, Blob/URL.createObjectURL, FileReader.
  Tutto il resto e' stato visto in settimana.
- Niente AI per generare codice. Niente template scaricati.
*/


/* STATO
   In cima al file definisci poche variabili globali:
   - un array di oggetti come dato principale (es. libri, ricette, film, ...)
   - una variabile per il filtro corrente
   - una variabile per l'ordinamento corrente
   - una variabile per la stringa di ricerca corrente
*/

let rettili = [];        // array di oggetti, uno per ogni rettile
let filtro = "tutti";   // categoria selezionata nel <select>; "tutti" = nessun filtro attivo
let ordinamento = "nome-az"; // criterio di ordinamento corrente applicato in render()
let ricerca = "";        // stringa vuota x la barra di ricerca 
let vista = "lista";    // modalità di visualizzazione corrente

/* RENDER()
   Una sola funzione che ridipinge la lista. A ogni chiamata:
   1) parte dall'array completo,
   2) filtra,
   3) ordina,
   4) svuota il container DOM,
   5) ricrea gli elementi DOM per gli oggetti risultanti.
   Aggiorna anche conteggi e statistiche.
   Salva lo stato in localStorage in fondo a render() (cerca tu come funziona).
*/

function render() {

  // 1)"visibili" è una copia dell'array rettili tramite spread. Usiamo [...rettili] perché non vogliamo modifico l'originale mentre filtro.
  let visibili = [...rettili];

  // 2)FILTRO PER CATEGORIA
  // Se l'utente ha scelto una categoria specifica (diverso da "tutti"), teniamo solo i rettili che hanno quella categoria. in pratica se filtro ha selezionato qualcosa di diverso da tutti, fammi vedere solo i serpenti inseriti che hannpo quella categoria (selezionata con <select id="inputCategoria">)
  if (filtro !== "tutti") {
    visibili = visibili.filter((rettile) => rettile.categoria === filtro);
  }//filter=crea un nuovo array tenendo solo gli elementi che rispettano la condizione.

  // 2)FILTRO PER RICERCA
  // la barra di ricerca ci restituisce una stringa e teniamo solo i rettili il cui nome o morph contiene quel testo. aggiungiamo un .toLowerCase() per non renderlo case sensitive
  if (ricerca) {
    const search = ricerca.toLowerCase();
    visibili = visibili.filter(
      (r) =>
        r.nome.toLowerCase().includes(search) ||
        r.morph.toLowerCase().includes(search)
    );
  }

  // 3)ORDINAMENTO, stiamo ordinando l'array in pratica
  // uso .sort() che riordina l'array. mentre localeCompare confronta due stringhe: restituisce negativo, zero, o positivo, che è esattamente quello che sort() si aspetta perchè ordina proprio le cose con -1,1,0 
  //cosa dice in pratica? 
 visibili.sort((a, b) => {
  if (ordinamento === "nome-az") {
    return a.nome.localeCompare(b.nome);
  }
  if (ordinamento === "nome-za") {
    return b.nome.localeCompare(a.nome);
  }
  if (ordinamento === "specie") {
    return a.categoria.localeCompare(b.categoria);
  }
  return 0;
});

//4)SVUOTA IL CONTAINER
  //Usiamo un while per spiegargli che deve continuare a rimuovere il primo figlio del container con id lista rettili (rimuovendone sempre uno, il primo sarà sempre quello successivo, scorrono).  Così possiamo ridisegnarlo da zero con i dati aggiornati. In pratica, "mentre: il primo figlio rispetta la condizione espressa in container, rimuovi il primo figlio di container"
  const container = document.querySelector("#listaRettili");
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  //CONTEGGI
  // Se non c'è niente da mostrare, creiamo un p con classe vuoto dentro cui mettiamo una stringa (texCintent) Nessun rettile trovato.
  // Altrimenti chiamiamo renderGruppi() che costruisce la lista vera.
  if (visibili.length === 0) {
    const messaggio = document.createElement("p");
    messaggio.classList.add("vuoto");
    messaggio.textContent = "Nessun rettile trovato.";
    container.appendChild(messaggio);// Attacchiamo il p class vuoto dentro il container.
// appendChild aggiunge un elemento come ultimo figlio.
  } else {
    renderGruppi(visibili); //altrimenti, stampa visibili
  }

  // STATISTICHE
  // Aggiorniamo il contatore e le barre colorate in cima.
  aggiornaStatistiche();
}



/* FORM CON VALIDAZIONE
   addEventListener("submit") sul form.
   event.preventDefault().
   Leggi i valori con .value.trim().
   Se uno dei campi obbligatori e' vuoto, mostra errore e return.
   Altrimenti push allo stato, form.reset(), render().
   Id univoco con Date.now().
*/

function aggiungiRettile(event) {
  // Blocca il comportamento predefinito del browser.
  // Senza questa riga, quando clicchiamo "Aggiungi" la pagina si ricarica.
  event.preventDefault();

  // Leggiamo quello che l'utente ha scritto nei campi del form.
  // .trim() toglie gli spazi accidentali all'inizio e alla fine.
  const nome = document.querySelector("#inputNome").value.trim();
  const morph = document.querySelector("#inputMorph").value.trim();
  const categoria = document.querySelector("#inputCategoria").value;
  const acquisita = document.querySelector("#inputAcquisita").value.trim();
  const note = document.querySelector("#inputNote").value.trim();

  // Se il nome è vuoto non aggiungiamo niente.
  // Mostriamo un messaggio di errore e usciamo dalla funzione con return.
  if (!nome) {
    document.querySelector("#erroreForm").textContent = "Il nome è obbligatorio.";
    return;
  }

  // Se siamo arrivati qui il nome c'è.
  // Puliamo il messaggio di errore nel caso fosse rimasto da prima.
  document.querySelector("#erroreForm").textContent = "";

  // Aggiungiamo un nuovo oggetto all'array rettili.
  // Date.now() genera un numero unico basato sull'ora esatta,
  // così ogni rettile ha un id diverso da tutti gli altri.
  rettili.push({
    id: Date.now(),
    nome,
    morph,
    categoria,
    acquisita,
    note,
  });

  // Svuotiamo il form così i campi tornano vuoti.
  document.querySelector("#formRettile").reset();

  // Ridisegniamo la lista con il nuovo rettile dentro.
  render();
}
/* INTERAZIONI BASE — eliminare, modificare, contare
   - Elimina: filter per id, render(). Event delegation sul container.
   - Modifica in-place: button "Modifica". Al click il testo diventa <input>,
     si conferma con Invio o blur.
   - Conteggi dinamici dentro render().
*/

/* SCRIVI QUI LA TUA RISPOSTA */


/* RICERCA, FILTRO, ORDINAMENTO
   - Ricerca live: <input> con event "input". Salva in stato e render().
   - Filtro: <select> con event "change". Salva in stato e render().
   - Ordinamento: due button (o select). Salva in stato e render().
   I tre si compongono dentro render() in fila.
*/

/* SCRIVI QUI LA TUA RISPOSTA */


/* NOTIFICHE TEMPORANEE
   Funzione notifica(testo) che imposta il testo del <div id="notifica">,
   lo mostra (display: block), poi dopo 3000ms (setTimeout) lo nasconde.
*/

/* SCRIVI QUI LA TUA RISPOSTA */


/* TEMA CHIARO/SCURO
   Un button che chiama document.body.classList.toggle("dark").
   In CSS scrivi le regole opposte (es. body.dark { background: #111; ... }).
*/

/* SCRIVI QUI LA TUA RISPOSTA */


/* PERSISTENZA — localStorage (cerca tu su MDN)
   - In fondo a render(), salva lo stato:
       localStorage.setItem("dati", JSON.stringify(stato));
   - All'avvio, prima della prima render(), carica:
       const salvato = localStorage.getItem("dati");
       if (salvato) stato = JSON.parse(salvato);
*/

/* SCRIVI QUI LA TUA RISPOSTA */


/* RIORDINO ↑ ↓
   Due button su ogni elemento. Click su ↑ scambia con il precedente nell'array,
   ↓ con il successivo. Event delegation. Poi render().
*/

/* SCRIVI QUI LA TUA RISPOSTA */



/* STATISTICHE GRAFICHE
   Almeno due indicatori: contatori grandi e/o barre orizzontali
   (<div> con width: X% in base al dato). Aggiorna dentro render().
*/

/* SCRIVI QUI LA TUA RISPOSTA */


/* MULTI-VISTA — lista / card / tabella
   Una variabile globale "vista" che render() legge per decidere quale HTML
   produrre. Tre button cambiano "vista" e chiamano render().
*/

/* SCRIVI QUI LA TUA RISPOSTA */


/* CATEGORIE
   Aggiungi un campo categoria nello schema. Nel form un <select> per sceglierla.
   In render(), raggruppa con reduce in { categoria: [elementi] } e disegna un
   header per categoria con sotto la lista di quella categoria.
*/

/* SCRIVI QUI LA TUA RISPOSTA */



/*ascoltatori*/
// RICERCA LIVE
// Ogni volta che l'utente digita qualcosa, aggiorniamo la variabile ricerca e ridisegniamo la lista.
document.querySelector("#ricerca").addEventListener("input", () => {
  ricerca = document.querySelector("#ricerca").value;
  render();
});


// FILTRO CATEGORIA
// Quando l'utente sceglie una categoria dal select, aggiorniamo la variabile filtro e ridisegniamo.
document.querySelector("#filtroCategoria").addEventListener("change", () => {
  filtro = document.querySelector("#filtroCategoria").value;
  render();
});


// ORDINAMENTO
// Quando l'utente clicca un bottone di ordinamento, aggiorniamo la variabile ordinamento.
// Togliamo la classe "attivo" da tutti i bottoni e la mettiamo solo su quello cliccato.
document.querySelectorAll(".btnOrdine").forEach((btn) => {
  btn.addEventListener("click", () => {
    ordinamento = btn.dataset.ordine;
    document.querySelectorAll(".btnOrdine").forEach((b) => b.classList.remove("attivo"));
    btn.classList.add("attivo");
    render();
  });
});

//FORM CON VALIDAZIONE
document.querySelector("#formRettile").addEventListener("submit", aggiungiRettile);


// MULTI-VISTA
// Stesso identico meccanismo dell'ordinamento, ma per la vista lista/card.
document.querySelectorAll(".btnVista").forEach((btn) => {
  btn.addEventListener("click", () => {
    vista = btn.dataset.vista;
    document.querySelectorAll(".btnVista").forEach((b) => b.classList.remove("attivo"));
    btn.classList.add("attivo");
    render();
  });
});


// TEMA CHIARO / SCURO
// Aggiunge o toglie la classe "dark" dal body.
document.querySelector("#btnTema").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

