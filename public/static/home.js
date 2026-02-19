// Home Page - Artist Selection

let artists = [];

// Initialize
async function init() {
  try {
    await loadArtists();
    renderPage();
  } catch (error) {
    showError('Erro ao carregar artistas');
  }
}

// Load artists
async function loadArtists() {
  const response = await axios.get('/api/artists');
  artists = response.data;
}

// Render the page
function renderPage() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container mx-auto px-4 py-16">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <div class="mb-6">
            <i class="fas fa-music text-6xl mb-4 animate-bounce text-yellow-400"></i>
          </div>
          <h1 class="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            TOCA ESSA
          </h1>
          <p class="text-2xl mb-8 text-gray-300">
            Conecte-se com o artista! Peça suas músicas e envie gorjetas.
          </p>
        </div>
        
        <!-- Artists Selection -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
          <h2 class="text-3xl font-bold mb-6 text-center">
            <i class="fas fa-microphone mr-3"></i>
            Qual artista está tocando aqui?
          </h2>
          
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${renderArtists()}
          </div>
        </div>
        
        <!-- Artist Login -->
        <div class="text-center mt-12">
          <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto">
            <i class="fas fa-user-circle text-4xl mb-4"></i>
            <h3 class="text-2xl font-bold mb-4">Você é um artista?</h3>
            <p class="text-gray-300 mb-6">Gerencie seu repertório e receba gorjetas</p>
            <div class="flex gap-3 justify-center">
              <a href="/login" class="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition">
                <i class="fas fa-sign-in-alt mr-2"></i>
                Entrar
              </a>
              <a href="/register" class="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition">
                <i class="fas fa-user-plus mr-2"></i>
                Cadastrar
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Render artists list
function renderArtists() {
  if (artists.length === 0) {
    return `
      <div class="col-span-full text-center py-12">
        <i class="fas fa-music text-4xl text-gray-400 mb-4"></i>
        <p class="text-gray-400 text-xl">Nenhum artista disponível no momento</p>
      </div>
    `;
  }
  
  return artists.map(artist => `
    <a href="/${artist.slug}" class="block group">
      <div class="bg-white/10 hover:bg-white/20 rounded-xl p-6 cursor-pointer transition border-2 border-transparent hover:border-yellow-400 transform hover:scale-105">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
            <i class="fas fa-user text-3xl"></i>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-xl mb-1 truncate group-hover:text-yellow-400 transition">${artist.name}</h3>
            <p class="text-sm text-gray-300 line-clamp-2">${artist.bio || 'Artista ao vivo'}</p>
          </div>
          <div>
            <i class="fas fa-chevron-right text-2xl text-gray-400 group-hover:text-yellow-400 transition"></i>
          </div>
        </div>
      </div>
    </a>
  `).join('');
}

// Show error message
function showError(message) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="container mx-auto px-4 py-16">
      <div class="max-w-md mx-auto text-center">
        <i class="fas fa-exclamation-circle text-6xl text-red-500 mb-4"></i>
        <h2 class="text-2xl font-bold mb-4">Erro</h2>
        <p class="text-gray-300 mb-6">${message}</p>
        <button onclick="location.reload()" class="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition">
          Tentar Novamente
        </button>
      </div>
    </div>
  `;
}

// Initialize on page load
init();
