const slidesContainer = document.getElementById("slides-container");
const btnLance = document.querySelector("#btLance");
const btnLogin = document.getElementById('btCadastro');
const btnCadLeilao = document.getElementById("cadastrar-leilao");

let userName = "";
let userId = -1;

let leiloes = []

btnCadLeilao.addEventListener("click", function(e) {
    e.preventDefault();
    cadastrarLeilao();
    generateCardList();
})

btnLogin.addEventListener("click", async function(event) {
    event.preventDefault();

    const nameInput = document.getElementById('name-input');
    const name = nameInput.value;

    if (name === "") {
        return;
    }

    const response = await cadastrarUsuario(name);

    if (response === undefined) {
        return;
    }

    userId = response.id;
    userName = response.nome;
    
    login()
    generateCardList();
    nameInput.value = "";
});

function login() {
    if (userName === "") {
        return;
    }

    const loginForm = document.getElementById('login-form')
    const title = loginForm.querySelector('#title')
    const nameLabel = loginForm.querySelector('#label-name-input')
    const nameInput = loginForm.querySelector('#name-input')
    const btCadastro = loginForm.querySelector('#btCadastro')

    title.textContent = `Você está conectado como: ${userName}`
    nameLabel.style.display = 'none';
    nameInput.style.display = 'none';
    btCadastro.style.display = 'none';
    btnCadLeilao.disabled = false;
}

async function makeRequest(url, method, data) {
    const base_url = "http://localhost:8080"

    const body = {
        method: method,
        headers: {
            "Content-Type": "application/json"
        }
    }

    if (method === "POST") {
        body['body'] = JSON.stringify(data, null, 4)
    }

    console.log(`Sending request to ${base_url + url}`)

    try {
        return await fetch(base_url + url, body)
        .then(response => response.json())
        .then(data => {
            console.log("Response: " + JSON.stringify(data, null, 4))
            return data
        })
        .catch(error => {
            console.log(error)
        })
    }
    catch(error) {
        console.log("Could not fetch data: " + error)
    }
}

async function cadastrarUsuario(name) {
    
    body = {
        "nome": name
    };

    let response = await makeRequest("/cliente", "POST", body);

    
    const evtSource = new EventSource(`http://localhost:8080/sse/${name}`)

    evtSource.addEventListener("newLeilao", (leilao) => {
        console.log("Event - newLeilao: " + leilao.data);
        newLeilao(JSON.parse(leilao.data))
    })

    evtSource.addEventListener("newLance", (lance) => {
        console.log("Event - newLance: " + lance.data);
        updateCard(JSON.parse(lance.data))
    })

    evtSource.addEventListener("notifyNewLance", (lance) => {
        console.log("Event - notifyNewLance: " + lance.data);
    })

    evtSource.addEventListener("notifyEndLeilao", (leilao) => {
        console.log("Event - notifyEndLeilao: " + leilao.data);
    })
    

    return response;
}

async function cadastrarLeilao() {
    
    let nome = document.getElementById('produto-nome')
    let desc = document.getElementById('produto-descricao')
    let preco = document.getElementById('produto-preco-minimo')
    let duracao = document.getElementById('produto-duracao')

    body = {
        "criador": {
            "id": userId,
            "nome": userName
        },
        "produto": {
            "nome": nome.value,
            "descricao": desc.value,
            "precoMinimo": parseFloat(preco.value)
        },
        "duracao": duracao.value
    }

    nome.value = ''
    desc.value = ''
    preco.value = ''
    duracao.value = ''

    makeRequest("/leilao", "POST", body)
}

async function fetchLeiloes() {
    try {
        const data = await makeRequest("/leilao", "GET")
        return data;
    }
    catch(error) {
        console.log(error)
        throw error;
    }
}

async function darLance(idLeilao, valor) {

    if (valor == "") {
        console.log(`Valor recebido: '${valor}'`);
        return ;
    }

    body = {
        "cliente": {
            "id": userId,
            "nome": userName
        },
        "idLeilao": idLeilao,
        "valor": valor
    }

    console.log("darLance body: " + JSON.stringify(body, null, 4))
    
    makeRequest(`/leilao/${idLeilao}`, "POST", body)
}

function showPopup(leilao) {

    if (userId === -1 || userName === "") {
        return;
    }

    let idLeilao = leilao.leilaoItem.idLeilao;
    let produto = leilao.leilaoItem.produto;

    // Preenche as informações no popup
    
    popup = document.getElementById('popup')
    popupTitle = popup.querySelector('#popup-title')
    popupDesc = popup.querySelector('#popup-description')
    popupValue = popup.querySelector('#popup-lance')
    popupButton = popup.querySelector('#btLance')

    form = popup.querySelector('#lance')

    popupTitle.textContent = produto.nome;
    popupDesc.textContent = produto.descricao;
    popupValue.textContent = leilao.leilaoItem.lanceAtual.valor;

    form.addEventListener("submit", function(event) {
        event.preventDefault()
        valueInput = popup.querySelector('#lance-valor')
        valor = valueInput.value
        darLance(idLeilao, valor)
        popup.style.display = 'none';
        valueInput.value = ''
    })
    // Exibe o popup
    document.getElementById('popup').style.display = 'block';
}

function closePopup() {
    // Fecha o popup
    document.getElementById('lance').value = ''
    document.getElementById('popup').style.display = 'none';
}

async function generateCardList() {

    const cardListTitle = document.getElementById('card-list-title');
    const cardList = document.getElementById('card-list');

    cardList.innerHTML = ''

    const listLeiloes = await fetchLeiloes();

    if (listLeiloes == undefined) {
        return;
    }

    const count = listLeiloes.filter(item => item.leilaoItem.active === true).length;

    if (listLeiloes.length == 0 || count == 0) {
        cardListTitle.textContent = "Não há leilões disponíveis no momento"
        cardList.style.display = 'none'
    }
    else {
        cardListTitle.textContent = "Leilões ativos"
        cardList.style.display = 'grid';
        addCard(listLeiloes);
    }
}

function addCard(listLeiloes) {

    const cardList = document.getElementById('card-list');

    if (listLeiloes == undefined || listLeiloes.length == 0) {
        return;
    }

    listLeiloes.map(leilao => {

        if (leilao.leilaoItem.active == false) {
            return;
        }

        const li = document.createElement('li');
        li.classList.add('card')

        li.onclick = () => {
            showPopup(leilao);
        };

        const h2 = document.createElement('h2');
        h2.classList.add('card-title')
        h2.textContent = leilao.leilaoItem.produto.nome;

        const p1 = document.createElement('p')
        p1.classList.add('card-desc')
        p1.textContent = leilao.leilaoItem.produto.descricao;

        const p2 = document.createElement('p')
        p2.textContent = 'Lance atual:'

        const p3 = document.createElement('p')
        p3.classList.add('card-lance')
        p3.textContent = leilao.leilaoItem.lanceAtual.valor;

        const p4 = document.createElement('p')
        p4.classList.add('card-tempo-restante')
        p4.textContent = `Tempo Restante: ${formatTime(leilao.leilaoItem.duracao)}`;

        li.appendChild(h2);
        li.appendChild(p1);
        li.appendChild(p2);
        li.appendChild(p3);
        li.appendChild(p4);
        cardList.appendChild(li);
        
        countdown(leilao.leilaoItem.duracao, p4, li);
    })

    if (countActive > 0) {
        cardList.style.display = 'grid';
    }
}

function updateCard(lance) {

    const idLeilao = lance.idLeilao
    const valor = lance.valor;
    const cardList = document.getElementById('card-list');
    const card = cardList.children[idLeilao - 1];

    card.querySelector('.card-lance').textContent = valor;
}

function newLeilao(leilao) {
    leiloes.push(leilao)
    addCard([leilao])
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

function countdown(duration, display, element) {
    let timer = duration;

    const countdownInterval = setInterval(function() {
        display.textContent = `Tempo Restante: ${formatTime(timer)}`;
        if (timer <= 0) {
            clearInterval(countdownInterval);
            display.textContent = "Tempo encerrado!";
            element.onclick = null;
            element.disabled = true;
        }
        timer--;
    }, 1000);
}

generateCardList()