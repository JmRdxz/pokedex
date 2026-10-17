function saludar() {
    alert("Me has clickeado!")
}

(function(){
    obtenerPokemones();
})();

async function obtenerPokemones() {
    let url = "https://pokeapi.co/api/v2/pokemon";
    const response = await fetch(url);
    const data = await response.json()

    console.log(data);
    let inicio_html = `<div id="container-grid">`;
    let contenido_html = "";        
    let fin_html = "</div>";

    let indice = 1;
    data.results.forEach(pokemon => {
        //console.log(indice);
        contenido_html += `<div id="item-grid"><div>${pokemon.name}</div><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${indice}.png" alt=""></div>`;
        indice++;
    });

    let resultado = inicio_html + contenido_html + fin_html;

    document.getElementById('contenido').innerHTML = resultado;

}
