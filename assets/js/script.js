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
/*DA MODIFICARE: rimossa la variabile vista — ora mostriamo sempre le card, non serve più scegliere*/

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
   // preventDefault blocca il comportamento predefinito del browser.
   // Senza questa riga, quando clicchiamo "Aggiungi" la pagina si ricarica e perdiamo tutti 
   event.preventDefault();

   // Leggiamo quello che l'utente ha scritto nei campi del form con l'id tramite querySelector. Il loro valore diventa la const nome ecc
   const nome = document.querySelector("#inputNome").value;
   const morph = document.querySelector("#inputMorph").value;
   const categoria = document.querySelector("#inputCategoria").value;
   const acquisita = document.querySelector("#inputAcquisita").value;
   const note = document.querySelector("#inputNote").value;

   // Se il nome è vuoto non aggiungiamo niente.
   // Mostriamo un messaggio di errore e usciamo dalla funzione con return.
   if (nome === "") {
      document.querySelector("#erroreForm").textContent = "Il nome è obbligatorio.";
      return;
   }

   // Se siamo arrivati qui il nome c'è percè ha controllato la condizione di if(nome === "") e non trovandola vera è uscito.
   // Puliamo il messaggio di errore nel caso fosse rimasto da prima.
   document.querySelector("#erroreForm").textContent = "";

   // Aggiungiamo un nuovo oggetto all'array rettili con push, man mano che viene compilato il form. questo ogetto viene valoriccato grazie alla funzione function aggiungiRettile(event)
   rettili.push({
      id: Date.now(),// Date.now() genera un numero unico basato sull'ora esatta, così ogni rettile ha un id diverso da tutti gli altri.
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
notifica(nome + " aggiunto alla collezione!");
}


/* INTERAZIONI BASE — eliminare, modificare, contare
   - Elimina: filter per id, render(). Event delegation sul container.
   - Modifica in-place: button "Modifica". Al click il testo diventa <input>,
     si conferma con Invio o blur.
   - Conteggi dinamici dentro render().
*/

function gestisciClick(event) {

   // Risaliamo all'elemento con data-id per sapere di quale rettile stiamo parlando.
   const el = event.target.closest("[data-id]");
   // Se non troviamo nessun elemento con data-id usciamo — il click era fuori dalle card.
   if (el === null) return;
   const id = Number(el.dataset.id);

   // ELIMINA -> in pratica teniamo nell'array tutti i rettili tranne quello cliccato.
   if (event.target.classList.contains("elimina")) {
      const rettile = rettili.find((r) => r.id === id);
      rettili = rettili.filter((r) => r.id !== id);
      render();
      notifica(rettile.nome + " rimosso.");
      return;
   }

   // MODIFICA IN-PLACE
   // Trasformiamo lo span con il nome in un input modificabile.
   // L'utente conferma premendo Invio o cliccando fuori.
   if (event.target.classList.contains("modifica")) {
      const nomeEl = el.querySelector(".itemNome, .cardNome");
      if (nomeEl === null) return;

      const input = document.createElement("input");
      input.type = "text";
      input.value = nomeEl.textContent;
      input.classList.add("inputInline");
      nomeEl.replaceWith(input);
      input.focus();

      const conferma = () => {
         const nuovoNome = input.value;
         if (nuovoNome !== "") {
            const rettile = rettili.find((r) => r.id === id);
            if (rettile) rettile.nome = nuovoNome;
         }
         render();
      };

      input.addEventListener("keydown", (e) => {
         if (e.key === "Enter") conferma();
      });
      input.addEventListener("blur", conferma);
      return;
   }
}
/* RICERCA, FILTRO, ORDINAMENTO
   - Ricerca live: <input> con event "input". Salva in stato e render().
   - Filtro: <select> con event "change". Salva in stato e render().
   - Ordinamento: due button (o select). Salva in stato e render().
   I tre si compongono dentro render() in fila.
*/

 function cercaRettile() {
   ricerca = document.querySelector("#ricerca").value;
   render();
}

function filtraCategoria() {
   filtro = document.querySelector("#filtroCategoria").value;
   render();
}

function cambiaOrdinamento(btn) {
   ordinamento = btn.dataset.ordine;
   document.querySelectorAll(".btnOrdine").forEach((b) => b.classList.remove("attivo"));
   btn.classList.add("attivo");
   render();
}



/* NOTIFICHE TEMPORANEE
   Funzione notifica(testo) che imposta il testo del <div id="notifica">,
   lo mostra (display: block), poi dopo 3000ms (setTimeout) lo nasconde.
*/

// notifica() riceve un testo e lo mostra in fondo alla pagina per 3 secondi.
function notifica(testo) {
//lo valorizziamo quando chiamiamo notifica nella funzione aggiungi rettile (giustamente esce quando premiamo aggiungi)
  // Prendiamo il div #notifica e ci scriviamo dentro il testo ricevuto.
  document.querySelector("#notifica").textContent = testo;

  // Lo mostriamo nel CSS parte come display:none quindi dobbiamo dirgli di apparire.
  document.querySelector("#notifica").style.display = "block";

  // setTimeout esegue una funzione dopo un certo numero di millisecondi.
  // 3000ms = 3 secondi. Dopo 3 secondi nascondiamo di nuovo il div.
  setTimeout(() => {
    document.querySelector("#notifica").style.display = "none";
  }, 3000);
}
/* TEMA CHIARO/SCURO
   Un button che chiama document.body.classList.toggle("dark").
   In CSS scrivi le regole opposte (es. body.dark { background: #111; ... }).
*/
function cambiaTema() {
   // toggle aggiunge o toglie la classe "scuro" dal body e restituisce true o false.
   // true = classe aggiunta (tema scuro attivo), false = classe rimossa (tema chiaro)
   const scuroMode = document.body.classList.toggle("dark");

   // Aggiorniamo il testo del bottone in base al risultato del toggle.
   if (scuroMode) {
      document.querySelector("#btnTema").textContent = "Tema chiaro";
   } else {
      document.querySelector("#btnTema").textContent = "Tema scuro";
   }
}

/* RIORDINO ↑ ↓
   Due button su ogni elemento. Click su ↑ scambia con il precedente nell'array,
   ↓ con il successivo. Event delegation. Poi render().
*/

/* SCRIVI QUI LA TUA RISPOSTA */


/* STATISTICHE GRAFICHE
   Almeno due indicatori: contatori grandi e/o barre orizzontali
   (<div> con width: X% in base al dato). Aggiorna dentro render().
*/

function aggiornaStatistiche() {
   // Aggiorniamo il numero grande con il totale dei rettili.
   document.querySelector("#contatoreTotale").textContent = String(rettili.length);

   // Svuotiamo il contenitore delle barre prima di ridisegnarle.
   const barreContainer = document.querySelector("#barreCategorie");
   while (barreContainer.firstChild) {
      barreContainer.removeChild(barreContainer.firstChild);
   }

   // Per ogni categoria creiamo una riga con etichetta e barra colorata.
   const categorie = ["Piton", "Boa", "Colubride", "Altro"];
   categorie.forEach((cat) => {

      // Contiamo quanti rettili appartengono a questa categoria.
      const count = rettili.filter((r) => r.categoria === cat).length;

      // Calcoliamo la percentuale se non ci sono rettili mettiamo 0.
      const perc = rettili.length > 0 ? Math.round((count / rettili.length) * 100) : 0;

      const riga = document.createElement("div");
      riga.classList.add("barraRiga");

      // Etichetta con nome categoria e conteggio.
      const etichetta = document.createElement("span");
      etichetta.classList.add("barraLabel");
      etichetta.textContent = cat + ": " + count + " (" + perc + "%)";

      // Sfondo grigio della barra.
      const sfondo = document.createElement("div");
      sfondo.classList.add("barraOuter");

      // Riempimento colorato — la larghezza è la percentuale calcolata sopra.
      const riempimento = document.createElement("div");
      riempimento.classList.add("barraInner");
      riempimento.style.width = perc + "%";

      sfondo.appendChild(riempimento);
      riga.appendChild(etichetta);
      riga.appendChild(sfondo);
      barreContainer.appendChild(riga);
   });
}
/* CATEGORIE */
function renderGruppi(visibili) {
   // reduce costruisce un oggetto tipo { "Piton": [...], "Boa": [...] }
   // acc è l'oggetto che si costruisce man mano, r è il rettile corrente.
   const gruppi = visibili.reduce((acc, r) => {
      if (!acc[r.categoria]) acc[r.categoria] = [];
      acc[r.categoria].push(r);
      return acc;
   }, {});

   // Per ogni categoria nell'oggetto gruppi, stampiamo il titolo e le card.
   // "for in" scorre le proprietà dell'oggetto in questo caso le categorie.
   for (const categoria in gruppi) {
      // Prendiamo l'array di rettili di questa categoria.
      const animali = gruppi[categoria];

      // Creiamo il titolo della categoria e lo aggiungiamo al container.
      const titolo = document.createElement("h3");
      titolo.classList.add("headerCategoria");
      titolo.textContent = categoria;
      document.querySelector("#listaRettili").appendChild(titolo);

      // Creiamo un div che conterrà tutte le card di questa categoria.
      const contenitore = document.createElement("div");
      contenitore.classList.add("gridCard");

      // Per ogni rettile della categoria chiamiamo creaCard e lo aggiungiamo al contenitore.
      animali.forEach((r) => {
         const idx = rettili.findIndex((x) => x.id === r.id);
         contenitore.appendChild(creaCard(r, idx));
      });

      // Aggiungiamo il contenitore con tutte le card al container principale.
      document.querySelector("#listaRettili").appendChild(contenitore);
   }
}
/* MULTI-VISTA — CARD
   Una variabile globale "vista" che render() legge per decidere quale HTML
   produrre. Tre button cambiano "vista" e chiamano render().
*/
function creaCard(r, idx) {
   // Creiamo un div che rappresenta la card di un singolo rettile.
   // r è l'oggetto rettile con tutti i suoi dati.
   // dataset.id serve per riconoscere quale rettile è quando clicchiamo un bottone.
   const div = document.createElement("div");
   div.classList.add("cardRettile");
   div.dataset.id = r.id + ""; //r.id è un numero perchè Date.now() restituisce un numero. dataset.id invece vuole una stringa. String() converte il numero in stringa, così i due tipi sono coerenti.

   // Creiamo uno span per il nome e ci scriviamo dentro r.nome.
   const cardNome = document.createElement("span");
   cardNome.classList.add("cardNome");
   cardNome.textContent = r.nome;

   // Creiamo uno span per il morph.
   const cardMorph = document.createElement("span");
   cardMorph.classList.add("cardMorph");
   cardMorph.textContent = r.morph;

   // Creiamo uno span per l'anno di acquisizione.
   const cardAcquisita = document.createElement("span");
   cardAcquisita.classList.add("cardAcquisita");
   cardAcquisita.textContent = "Acquisito: " + r.acquisita;

   // Creiamo uno span per le note.
   const cardNote = document.createElement("span");
   cardNote.classList.add("cardNote");
   cardNote.textContent = r.note;

   // Creiamo un div che conterrà i bottoni di azione.
   const cardAzioni = document.createElement("div");
   cardAzioni.classList.add("cardAzioni");

   // Creiamo il bottone Modifica — la classe "modifica" serve a gestisciClick
   // per sapere che è stato cliccato questo bottone e non un altro.
   const btnModifica = document.createElement("button");
   btnModifica.classList.add("modifica");
   btnModifica.textContent = "Modifica";

   // Creiamo il bottone Elimina con stesso meccanismo.
   const btnElimina = document.createElement("button");
   btnElimina.classList.add("elimina");
   btnElimina.textContent = "Elimina";

   // Mettiamo i bottoni dentro il div azioni.
   cardAzioni.appendChild(btnModifica);
   cardAzioni.appendChild(btnElimina);

   // Mettiamo tutto dentro il div principale della card — prima le info, poi i bottoni.
   div.appendChild(cardNome);
   div.appendChild(cardMorph);
   div.appendChild(cardAcquisita);
   div.appendChild(cardNote);
   div.appendChild(cardAzioni);

   // Restituiamo la const div e ogni volta che chiamiamo creaCard lo aggiunge alla pagina.
   return div;
}


/* ASCOLTATORI */
// Quando si invia il form, chiama aggiungiRettile
document.querySelector("#formRettile").addEventListener("submit", aggiungiRettile); //fatta

// Quando si clicca qualcosa nella lista, chiama gestisciClick
// (elimina, modifica, sono gestiti tutti qui dentro)
document.querySelector("#listaRettili").addEventListener("click", gestisciClick); //da fare

// Quando si digita nella barra di ricerca, chiama cercaRettile
document.querySelector("#ricerca").addEventListener("input", cercaRettile);//da fare

// Quando si sceglie una categoria dal select, chiama filtraCategoria
document.querySelector("#filtroCategoria").addEventListener("change", filtraCategoria); //da fare

// Per ogni bottone di ordinamento, quando si clicca chiama cambiaOrdinamento
document.querySelectorAll(".btnOrdine").forEach((btn) => {
  btn.addEventListener("click", () => cambiaOrdinamento(btn)); //fatta
});


// Quando si clicca il bottone tema, chiama cambiaTema
document.querySelector("#btnTema").addEventListener("click", cambiaTema);//da fare