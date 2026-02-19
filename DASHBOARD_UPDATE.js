// Script para atualizar dashboard.js com destaque de gorjetas
// Este arquivo deve ser mesclado com dashboard.js

// Adicione esta função após updateRequestsDisplay
function updateRequestsDisplay() {
  const container = document.getElementById('requestsContainer');
  
  if (!container) return;
  
  // Update stats
  const pending = requests.filter(r => r.status === 'pending').length;
  const accepted = requests.filter(r => r.status === 'accepted').length;
  const played = requests.filter(r => r.status === 'played').length;
  
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statAccepted').textContent = accepted;
  document.getElementById('statPlayed').textContent = played;
  
  if (requests.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-400 py-8">Nenhum pedido ainda</p>';
    return;
  }
  
  // Apply filter
  const activeFilter = document.querySelector('.filter-btn.active').id.replace('filter', '').toLowerCase();
  const filteredRequests = activeFilter === 'all' 
    ? requests 
    : requests.filter(r => r.status === activeFilter);
  
  container.innerHTML = filteredRequests.map(request => {
    const statusColors = {
      pending: 'bg-yellow-600',
      accepted: 'bg-blue-600',
      played: 'bg-green-600',
      rejected: 'bg-red-600'
    };
    
    const statusLabels = {
      pending: 'Pendente',
      accepted: 'Aceito',
      played: 'Tocada',
      rejected: 'Recusado'
    };
    
    const hasTip = request.tip_amount && request.tip_amount > 0;
    const borderClass = hasTip ? 'ring-4 ring-yellow-400 shadow-xl shadow-yellow-400/30' : '';
    
    return `
      <div class="bg-gray-700 rounded-lg p-4 border-l-4 ${statusColors[request.status]} ${borderClass} relative">
        ${hasTip ? `
          <div class="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
            <i class="fas fa-star"></i>
            <span>Gorjeta R$ ${parseFloat(request.tip_amount).toFixed(2)}</span>
          </div>
        ` : ''}
        
        <div class="flex justify-between items-start mb-2 ${hasTip ? 'pr-28' : ''}">
          <div class="flex-1">
            ${hasTip ? '<i class="fas fa-crown text-yellow-400 mr-2"></i>' : ''}
            <h4 class="font-bold text-lg inline">${request.song_title}</h4>
            <p class="text-sm text-gray-300">${request.song_artist}</p>
            ${request.song_genre ? `<span class="inline-block bg-purple-600 text-xs px-2 py-1 rounded mt-1">${request.song_genre}</span>` : ''}
          </div>
          ${!hasTip ? `
            <span class="text-xs ${statusColors[request.status]} px-2 py-1 rounded font-semibold">
              ${statusLabels[request.status]}
            </span>
          ` : ''}
        </div>
        
        ${hasTip ? `
          <div class="mb-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-3">
            <p class="text-sm text-yellow-300 font-bold flex items-center gap-2">
              <i class="fas fa-fire text-orange-400"></i>
              PEDIDO PRIORITÁRIO - COM GORJETA
              <i class="fas fa-fire text-orange-400"></i>
            </p>
            <p class="text-xs text-yellow-200 mt-1">Este pedido aparece no topo da fila</p>
          </div>
        ` : ''}
        
        <div class="text-sm text-gray-400 mb-2">
          <i class="fas fa-user mr-1"></i>
          ${request.requester_name || 'Anônimo'}
          <span class="mx-2">•</span>
          <i class="fas fa-clock mr-1"></i>
          ${formatTime(request.created_at)}
        </div>
        
        ${request.requester_message ? `
          <div class="text-sm bg-gray-800 rounded-lg p-3 mb-3 italic border-l-2 border-purple-500">
            <i class="fas fa-comment text-purple-400 mr-2"></i>
            "${request.requester_message}"
          </div>
        ` : ''}
        
        <div class="flex gap-2">
          ${request.status === 'pending' ? `
            <button onclick="updateRequestStatus(${request.id}, 'accepted')" class="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm font-semibold transition">
              <i class="fas fa-check mr-1"></i> Aceitar
            </button>
            <button onclick="updateRequestStatus(${request.id}, 'rejected')" class="flex-1 bg-red-600 hover:bg-red-700 px-3 py-2 rounded text-sm font-semibold transition">
              <i class="fas fa-times mr-1"></i> Recusar
            </button>
          ` : ''}
          
          ${request.status === 'accepted' ? `
            <button onclick="updateRequestStatus(${request.id}, 'played')" class="flex-1 bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm font-semibold transition">
              <i class="fas fa-music mr-1"></i> Marcar como Tocada
            </button>
          ` : ''}
          
          ${request.status === 'played' ? `
            <div class="flex-1 text-center text-green-400 text-sm font-semibold py-2">
              <i class="fas fa-check-circle mr-1"></i> Concluído
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}
