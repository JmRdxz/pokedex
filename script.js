
// Configuración de límites por Generación y Región
const generaciones = {
    1: { inicio: 1, fin: 151, region: "kanto" },
    2: { inicio: 152, fin: 251, region: "johto" },
    3: { inicio: 252, fin: 386, region: "hoenn" },
    4: { inicio: 387, fin: 493, region: "sinnoh" },
    5: { inicio: 494, fin: 649, region: "unova" },
    6: { inicio: 650, fin: 721, region: "kalos" },
    7: { inicio: 722, fin: 809, region: "alola" },
    8: { inicio: 810, fin: 905, region: "galar" },
    9: { inicio: 906, fin: 1025, region: "paldea" }
};

let pokemonesCache = [];
let filtroTipoActual = 'todos';
let filtroGenActual = 'todas';
let filtroRegionActual = 'todas';

// Elementos del DOM
const containerGrid = document.getElementById('container-grid');
const mensajeCarga = document.getElementById('mensaje-carga');
const inputBusqueda = document.getElementById('input-busqueda');
const btnBuscar = document.getElementById('btn-buscar');
const selectGeneracion = document.getElementById('select-generacion');
const selectRegion = document.getElementById('select-region');
const tiposBox = document.getElementById('tipos-box');

// Modal Elements
const modal = document.getElementById('modal-pokemon');
const cerrarModal = document.getElementById('cerrar-modal');

document.addEventListener('DOMContentLoaded', () => {
    obtenerTodosLosPokemones();
    configurarEventos();
});

// Cargar todos los Pokémon de la PokeAPI
async function obtenerTodosLosPokemones() {
    mostrarCargando(true);
    try {
        // Obtenemos la lista principal
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const data = await response.json();
        
        // Obtenemos los detalles de tipo por lotes para un rendimiento óptimo
        const promesasDetalles = data.results.map(p => fetch(p.url).then(res => res.json()));
        const detalles = await Promise.all(promesasDetalles);

        pokemonesCache = detalles.map(p => {
            const tipos = p.types.map(t => t.type.name);
            return {
                id: p.id,
                name: p.name,
                image: p.sprites.other['official-artwork'].front_default || p.sprites.front_default,
                types: tipos,
                primaryType: tipos[0] // Primer elemento para definir el color de la tarjeta
            };
        });

        renderizarPokemones(pokemonesCache);
    } catch (error) {
        console.error("Error cargando Pokémon:", error);
    } finally {
        mostrarCargando(false);
    }
}

// "Cargando pokemon..."
function mostrarCargando(mostrar) {
    if (mostrar) {
        mensajeCarga.classList.remove('oculto');
    } else {
        mensajeCarga.classList.add('oculto');
    }
}

// Renderizar la lista de tarjetas con elementos y color de fondo
function renderizarPokemones(lista) {
    containerGrid.innerHTML = '';
    
    if (lista.length === 0) {
        containerGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">No se encontraron Pokémon.</p>';
        return;
    }

    lista.forEach(pokemon => {
        const card = document.createElement('div');
        card.id = 'item-grid';
        
        // Se añade la clase CSS correspondiente al elemento principal (ej. bg-fire, bg-water)
        card.classList.add(`bg-${pokemon.primaryType}`);

        // Crear las etiquetas HTML para los tipos/elementos
        const tiposHTML = pokemon.types
            .map(t => `<span class="card-tipo-tag">${t}</span>`)
            .join('');

        card.innerHTML = `
            <img src="${pokemon.image}" alt="${pokemon.name}" loading="lazy" onError="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png'">
            <p>${pokemon.name}</p>
            <div class="card-tipos">
                ${tiposHTML}
            </div>
        `;

        card.addEventListener('click', () => abrirModalPokemon(pokemon.id));
        containerGrid.appendChild(card);
    });
}

// Configuración de filtros y búsqueda
function configurarEventos() {
    btnBuscar.addEventListener('click', aplicarFiltros);
    inputBusqueda.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') aplicarFiltros();
    });

    // Filtro por elemento / tipo
    tiposBox.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            document.querySelectorAll('.btn-tipo').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filtroTipoActual = e.target.dataset.type;
            aplicarFiltros();
        }
    });

    // Filtro por generación
    selectGeneracion.addEventListener('change', (e) => {
        filtroGenActual = e.target.value;
        if (filtroGenActual !== 'todas') {
            filtroRegionActual = generaciones[filtroGenActual].region;
            selectRegion.value = filtroRegionActual;
        } else {
            filtroRegionActual = 'todas';
            selectRegion.value = 'todas';
        }
        aplicarFiltros();
    });

    // Filtro por región
    selectRegion.addEventListener('change', (e) => {
        filtroRegionActual = e.target.value;
        if (filtroRegionActual !== 'todas') {
            const genEncontrada = Object.keys(generaciones).find(
                gen => generaciones[gen].region === filtroRegionActual
            );
            filtroGenActual = genEncontrada || 'todas';
            selectGeneracion.value = filtroGenActual;
        } else {
            filtroGenActual = 'todas';
            selectGeneracion.value = 'todas';
        }
        aplicarFiltros();
    });

    // Cerrar modal
    cerrarModal.addEventListener('click', () => modal.classList.add('oculto'));
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('oculto');
    });
}

// Aplicar combinaciones de filtros 
function aplicarFiltros() {
    const texto = inputBusqueda.value.toLowerCase().trim();

    let resultado = [...pokemonesCache];

    // 1. Filtrar por búsqueda (Texto)
    if (texto !== '') {
        resultado = resultado.filter(p => p.name.toLowerCase().includes(texto));
    }

    // 2. Filtrar por generación / región
    if (filtroGenActual !== 'todas') {
        const { inicio, fin } = generaciones[filtroGenActual];
        resultado = resultado.filter(p => p.id >= inicio && p.id <= fin);
    }

    // 3. Filtrar por tipo / elemento
    if (filtroTipoActual !== 'todos') {
        resultado = resultado.filter(p => p.types.includes(filtroTipoActual));
    }

    renderizarPokemones(resultado);
}

// Abrir modal y mostrar detalles completos
async function abrirModalPokemon(id) {
    mostrarCargando(true);
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();

        document.getElementById('modal-nombre').textContent = data.name;
        document.getElementById('modal-id').textContent = data.id;
        document.getElementById('modal-altura').textContent = data.height / 10;
        document.getElementById('modal-peso').textContent = data.weight / 10;
        
        // Imagen grande
        const imgGrande = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
        document.getElementById('modal-img').src = imgGrande;

        // Tipos
        const tiposContainer = document.getElementById('modal-tipos');
        tiposContainer.innerHTML = data.types
            .map(t => `<span class="badge-tipo">${t.type.name}</span>`)
            .join('');

        // Habilidades
        const habilidades = data.abilities.map(a => a.ability.name).join(', ');
        document.getElementById('modal-habilidades').textContent = habilidades;

        // Estadísticas
        const statsContainer = document.getElementById('modal-stats');
        statsContainer.innerHTML = data.stats.map(s => `
            <div class="stat-row">
                <span style="text-transform:capitalize;">${s.stat.name}</span>
                <strong>${s.base_stat}</strong>
            </div>
        `).join('');

        modal.classList.remove('oculto');
    } catch (error) {
        console.error("Error obteniendo detalles del Pokémon:", error);
    } finally {
        mostrarCargando(false);
    }
}
