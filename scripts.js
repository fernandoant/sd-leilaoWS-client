const slidesContainer = document.getElementById("slides-container");
const btn = document.querySelector("#btLance");

btnLogin = document.getElementById('btCadastro');
btnCadLeilao = document.getElementById("cadastrar-leilao");

let userName = "";
let userId = -1;
let leiloes = [];

btn.addEventListener("click", function(e) {
    e.preventDefault();
    closePopup()
})

btnCadLeilao.addEventListener("click", function(e) {
    e.preventDefault();
    criarLeilao();

})

btnLogin.addEventListener("click", async function(event) {
    event.preventDefault();

    const nameInput = document.getElementById('name-input');
    const name = nameInput.value;
    const response = await cadastrarUsuario(name);

    userId = response.id;
    userName = response.nome;
    
    login()
    
    nameInput.value = "";
});

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

async function criarLeilao() {
    
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

async function cadastrarUsuario(name ) {
    
    body = {
        "nome": name
    };

    let response = await makeRequest("/cliente", "POST", body);

    // response = JSON.stringify(response);

    return response;
    /*
    const evtSource = new EventSource("http://localhost:8080/stream-sse", {
        headers: {
            "Content-Type": "text/event-stream"
        }
    })

    evtSource.onmessage = (event) => {
        console.log("Received a new message")
        const newElement = document.createElement("li")
        const eventList = document.getElementById("list")

        newElement.textContent = `message: ${event.data}`
        eventList.appendChild(newElement)
    }
    */
    
}

async function fetchLeiloes() {
    const containerLeilao = document.getElementById('slide')

    await makeRequest("/leilao", "GET")
    .then(data => {
        console.log('Make request: ' + data)
        leiloes = JSON.stringify(data, null, 4);
        return data
        // leiloes.push(data);
    })
    .catch(error => {
        console.log(error);
    })
    /*.then(data => {
        data.map(async (element) => {
           const li = document.createElement('li');
           li.classList.add('card')

           li.onclick = function() {
                showPopup(li);
           };

           const h2 = document.createElement('h2');
           h2.classList.add('card-title')
           h2.textContent = element.leilaoItem.produto.nome;

           const p1 = document.createElement('p')
           p1.classList.add('card-desc')
           p1.textContent = element.leilaoItem.produto.descricao;

           const p2 = document.createElement('p')
           p2.classList.add('card-lance')
           p2.textContent = `Lance atual: R$${element.leilaoItem.produto.precoMinimo}`

           li.appendChild(h2);
           li.appendChild(p1);
           li.appendChild(p2);
        
           console.log(li)
           containerLeilao.appendChild(li)
        });
    })
    .catch(error => {
        const li = document.createElement('li')
        li.classList.add('card')
        const title = document.createElement('h2')
        title.classList.add('card-title')
        title.textContent = "Não existem leilões ativos no momento"
        li.appendChild(title)
        containerLeilao.appendChild(li)
    })*/
}

async function darLance() {
    body = {
        "cliente": {
            "id": "1",
            "nome": "Fernando"
        },
        "valor": "15001.05"
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

function login() {
    if (userName === "") {
        return;
    }

    const loginForm = document.getElementById('login-form')
    const title = loginForm.querySelector('#title')
    const nameInput = loginForm.querySelector('#name-input')
    const btCadastro = loginForm.querySelector('#btCadastro')

    title.textContent = `Você está conectado como: ${userName}`
    nameInput.style.display = 'none';
    btCadastro.style.display = 'none';
}

async function listarLeiloes() {
    let cardListTitle = document.getElementById('card-list-title');
    let cardList = document.getElementById('card-list');

    let listLeilao = await fetchLeiloes();

    console.log(leiloes)

    if (leiloes.length == 0) {
        cardListTitle.textContent = "Não há leilões disponíveis no momento"
        cardList.style.display = 'none'
    }
    else {
        cardListTitle.style.display = 'none';
        cardList.style.display = 'grid';
        leiloes.map(leilao => {
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
            containerLeilao.appendChild(li)
        })
    }
}

login()

listarLeiloes()
setInterval(listarLeiloes, 30000)