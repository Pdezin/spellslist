// ============= CONFIGURAÇÕES =============
const MAGIAS_POR_CARGA = 30;
const DEBOUNCE_TIME = 300; // ms
let todasMagias = [];
let magiasFiltradas = [];
let carregando = false;
let elementos = {};

function prepararMagia(e) {
    let magiaspreparadas = JSON.parse(window.localStorage.getItem("magiaspreparadas") ?? "[]");

    const magiaId = e.getAttribute("data-magia");

    if (e.classList.contains("badge-preparada")) {
        // Remover magia do array
        magiaspreparadas = magiaspreparadas.filter(m => m !== magiaId);
        window.localStorage.setItem("magiaspreparadas", JSON.stringify(magiaspreparadas));

        e.classList.remove("badge-preparada");

        if (elementos.badge.classList.contains("badge-preparada")) {
            aplicarFiltros();
        }
        
        return;
    }

    // Adicionar magia
    magiaspreparadas.push(magiaId);
    window.localStorage.setItem("magiaspreparadas", JSON.stringify(magiaspreparadas));

    e.classList.add("badge-preparada");
}

// 1. Inicialização
function inicializar() {
    carregarBaseMagias();
    configurarEventListeners();
    aplicarFiltros();
    primeiraCarga = false;
}

// 2. Carrega todas as magias uma vez
function carregarBaseMagias() {
    var magiaspreparadas = JSON.parse(window.localStorage.getItem("magiaspreparadas") ?? "[]");

    todasMagias = Array.from(document.querySelectorAll(".carta-magia"));
    todasMagias.forEach((m) => {
        m.style.display = "none"
        m.querySelectorAll(".magia-nome").forEach(x => {
            x.style.lineheight = 1
            x.innerHTML = x.innerHTML + "<span onclick='prepararMagia(this)' class='badge " + (magiaspreparadas.includes(m.dataset.idmagia) ? "badge-preparada": "") + "' data-magia='" + m.dataset.idmagia + "'>Preparada</span>"
        })
    });
}

// 3. Carregamento progressivo automático
function carregarMagias() {
    if (carregando) return;

    var magiaspreparadas = JSON.parse(window.localStorage.getItem("magiaspreparadas") ?? "[]");

    carregando = true;

    // Simula um pequeno delay para melhor UX
    setTimeout(() => {
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < magiasFiltradas.length; i++) {
            const clone = magiasFiltradas[i].cloneNode(true);
            clone.style.display = "block";

            clone.querySelectorAll(".badge").forEach(x => {
                x.classList.remove("badge-preparada")

                if (magiaspreparadas.includes(clone.dataset.idmagia)) {
                    x.classList.add("badge-preparada")
                }
            })

            fragment.appendChild(clone);
        }

        elementos.listaMagias.appendChild(fragment);
        carregando = false;
    }, 150);
}

// 4. Filtragem otimizada
function aplicarFiltros() {
    const termoBusca = elementos.busca.value.toLowerCase();
    const preparada = !!(elementos.badge.classList.contains("badge-preparada"))
    const magiaspreparadas = JSON.parse(window.localStorage.getItem("magiaspreparadas") ?? "[]");

    magiasFiltradas = todasMagias.filter((magia) => {
        const nome = magia.dataset.nome.toLowerCase();
        const original = magia.dataset.original.toLowerCase();
        const idMagia = magia.dataset.idmagia.toLowerCase();
        return (
            (termoBusca === "" || nome.includes(termoBusca) || original.includes(termoBusca)) &&
            (preparada == false || magiaspreparadas.includes(idMagia))
        );
    });

    // Reseta a paginação
    elementos.listaMagias.innerHTML = "";

    // Ordena e carrega a primeira página
    carregarMagias();
}

// ============= EVENT LISTENERS =============
function configurarEventListeners() {
    // Debounce para busca
    let timeoutBusca;
    elementos.busca.addEventListener("input", () => {
        clearTimeout(timeoutBusca);
        timeoutBusca = setTimeout(aplicarFiltros, DEBOUNCE_TIME);
    });

    document.querySelectorAll(".badgeFiltros").forEach(x => x.addEventListener("click", (e) => {
        e.target.classList.toggle("badge-preparada")

        aplicarFiltros()
    }))

        document.querySelectorAll(".limparDados").forEach(x => x.addEventListener("click", (e) => {
        if (window.confirm("Deseja limpar todos as magias preparadas?")) {
            window.localStorage.setItem("magiaspreparadas", JSON.stringify([]));
            aplicarFiltros()
        }
    }))
}

document.addEventListener("DOMContentLoaded", function () {
    // ============= ELEMENTOS DOM =============
    elementos = {
        listaMagias: document.getElementById("lista-magias"),
        scrollTrigger: document.getElementById("scroll-trigger"),
        busca: document.getElementById("busca"),
        badge: document.getElementById("badgeFiltro")
    };

    // ============= INICIALIZAÇÃO =============
    inicializar();
});
