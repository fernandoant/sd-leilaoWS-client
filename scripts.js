const slidesContainer = document.getElementById("slides-container");
const slide = document.querySelector(".slide");
const prevButton = document.getElementById("slide-arrow-prev");
const nextButton = document.getElementById("slide-arrow-next");

nextButton.addEventListener("click", () => {
    const slideWidth = slide.clientWidth;
    slidesContainer.scrollLeft += slideWidth;
});

prevButton.addEventListener("click", () => {
    const slideWidth = slide.clientWidth;
    slidesContainer.scrollLeft -= slideWidth;
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
        fetch(base_url + url, body)
        .then(response => response.json())
        .then(data => {
            console.log("Response: " + JSON.stringify(data, null, 4))
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
        "duracao": "5"
    }

    makeRequest("/leilao", "POST", body)
}

async function cadastrarUsuario() {
    body = {
        "nome": "Fernando"
    };

    makeRequest("/cliente", "POST", body);

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
    
}

async function listarLeiloes() {
    makeRequest("/leilao", "GET")
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