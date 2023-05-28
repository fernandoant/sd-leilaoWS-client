const slidesContainer = document.getElementById("slides-container");
const prevButton = document.getElementById("slide-arrow-prev");
const nextButton = document.getElementById("slide-arrow-next");
const btn = document.querySelector("#btLance");

btnLogin = document.getElementById('btCadastro');

let username = "";

btn.addEventListener("click", function(e) {
    e.preventDefault();
    closePopup()
})

nextButton.addEventListener("click", () => {
    const slide = document.querySelector('#slide')
    const slideWidth = slide.clientWidth;
    slidesContainer.scrollLeft += slideWidth;
});

prevButton.addEventListener("click", () => {
    const slideWidth = slide.clientWidth;
    slidesContainer.scrollLeft -= slideWidth;
});

btnLogin.addEventListener("click", async function(event) {
    event.preventDefault();

    const nameInput = document.getElementById('name-input');
    const name = nameInput.value;
    //const response = await cadastrarUsuario(name);

    let response = {
        "id": 1,
        "nome": name
    }

    username = response.nome;
    
    login()
    
    nameInput.value = "";
});

login()
// listarLeiloes()

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
    
    body = {
        "criador": {
            "id": "1",
            "nome": "Fernando"
        },
        "produto": {
            "nome": "Jabulani",
            "descricao": "Bola oficial da Copa do Mundo de 2010",
            "precoMinimo": "15000"
        },
        "duracao": "300"
    }

    body2 = {
        "criador": {
            "id": "1",
            "nome": "Fernando"
        },
        "produto": {
            "nome": "Gol",
            "descricao": "Volkswagen Gol 1.0 5P Flex",
            "precoMinimo": "43000"
        },
        "duracao": "300"
    }

    body3 = {
        "criador": {
            "id": "1",
            "nome": "Fernando"
        },
        "produto": {
            "nome": "Computador",
            "descricao": "Computador Gamer",
            "precoMinimo": "5000"
        },
        "duracao": "300"
    }

    makeRequest("/leilao", "POST", body)
    makeRequest("/leilao", "POST", body2)
    makeRequest("/leilao", "POST", body3)
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

async function listarLeiloes() {
    const containerLeilao = document.getElementById('slide')

    await makeRequest("/leilao", "GET")
    .then(data => {
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
    })
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
    if (username === "") {
        return;
    }

    const loginForm = document.getElementById('login-form')
    const title = loginForm.querySelector('#title')
    const nameInput = loginForm.querySelector('#name-input')
    const btCadastro = loginForm.querySelector('#btCadastro')

    title.textContent = `Você está conectado como: ${username}`
    nameInput.style.display = 'none';
    btCadastro.style.display = 'none';
}