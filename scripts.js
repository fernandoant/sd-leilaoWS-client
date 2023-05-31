const slidesContainer = document.getElementById("slides-container");
const btnLance = document.querySelector("#btLance");
const btnLogin = document.getElementById('btCadastro');
const btnCadLeilao = document.getElementById("cadastrar-leilao");

let userName = "";
let userId = -1;

btnLance.addEventListener("click", function(e) {
    e.preventDefault();
    closePopup()
})

btnCadLeilao.addEventListener("click", function(e) {
    e.preventDefault();
    cadastrarLeilao();
})

btnLogin.addEventListener("click", async function(event) {
    event.preventDefault();

    const nameInput = document.getElementById('name-input');
    const name = nameInput.value;

    const response = await cadastrarUsuario(name);

    if (response === undefined) {
        return;
    }

    userId = response.id;
    userName = response.nome;
    
    login()
    
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

    
    const evtSource = new EventSource(`http://localhost:8080/sse/${name}`, {
        headers: {
            "Content-Type": "text/event-stream"
        }
    })

    evtSource.addEventListener("newLeilao", (leilao) => {
        console.log("Event - newLeilao: " + leilao.data);
        generateCardList()
    })

    evtSource.addEventListener("newLance", (lance) => {
        console.log("Event - newLance: " + lance.data);
    })

    evtSource.addEventListener("endLeilao", (leilao) => {
        console.log("Event - endLeilao: " + leilao.data);
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
        //return JSON.stringify(data, null, 4);
    }
    catch(error) {
        console.log(error)
        throw error;
    }
    
    
    /*.then(data => {
        return JSON.stringify(data, null, 4);
    })
    .catch(error => {
        console.log(error);
    })*/
}

// TODO: Dar lance
async function darLance(card) {
    body = {
        "cliente": {
            "id": userId,
            "nome": userName
        },
        "valor": ""
    }
    
    makeRequest("/leilao/1", "POST", body)
}

function showPopup(card) {
    // Preenche as informações no popup
    cardTitle = card.querySelector('.card-title').textContent
    cardDesc = card.querySelector('.card-desc').textContent
    cardValue = card.querySelector('.card-lance').textContent
    
    popup = document.getElementById('popup')
    popupTitle = popup.querySelector('#popup-title')
    popupDesc = popup.querySelector('#popup-description')
    popupValue = popup.querySelector('#popup-lance')

    popupTitle.textContent = cardTitle
    popupDesc.textContent = cardDesc
    popupValue.textContent = cardValue

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

    leiloes = await fetchLeiloes();

    if (leiloes == undefined) {
        return;
    }

    if (leiloes.length == 0) {
        cardListTitle.textContent = "Não há leilões disponíveis no momento"
        cardList.style.display = 'none'
    }
    else {
        cardListTitle.style.display = 'none';
        cardList.style.display = 'grid';
        
        console.log(leiloes)
        console.log(typeof leiloes)

        listLeiloes = leiloes

        listLeiloes.map(leilao => {
            const li = document.createElement('li');
            li.classList.add('card')

            li.onclick = function() {
                    showPopup(li);
            };

            const h2 = document.createElement('h2');
            h2.classList.add('card-title')
            h2.textContent = leilao.leilaoItem.produto.nome;

            const p1 = document.createElement('p')
            p1.classList.add('card-desc')
            p1.textContent = leilao.leilaoItem.produto.descricao;

            const p2 = document.createElement('p')
            p2.classList.add('card-lance')
            p2.textContent = `Lance atual: R$${leilao.leilaoItem.produto.precoMinimo}`

            li.appendChild(h2);
            li.appendChild(p1);
            li.appendChild(p2);
            
            console.log(li)
            cardList.appendChild(li)
        })
    }
}

generateCardList()

//setInterval(listarLeiloes, 30000)