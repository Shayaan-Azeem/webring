import { NextResponse } from 'next/server';

export async function GET() {
  const widgetScript = `
(function() {
  const WEBRING_API = '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}';
  
  function createWebringWidget() {
    const container = document.getElementById('webring-widget');
    if (!container) return;
    
    const currentSite = container.dataset.site;
    const leftSite = container.dataset.left || 'auto';
    const rightSite = container.dataset.right || 'auto';
    const iconUrl = container.dataset.icon || \`\${WEBRING_API}/icon.white.svg\`;
    
    if (!currentSite) {
      console.error('Webring: data-site attribute is required');
      return;
    }
    
    // Create widget HTML
    container.innerHTML = \`
      <div style="display: flex; align-items: center; gap: 8px; font-family: sans-serif;">
        <a href="#" 
           id="webring-prev" 
           style="text-decoration: none; color: #9ca3af; font-size: 18px; cursor: pointer; transition: color 0.2s;"
           onmouseover="this.style.color='#d1d5db'"
           onmouseout="this.style.color='#9ca3af'">
          ←
        </a>
        <a href="\${WEBRING_API}" 
           target="_blank"
           style="opacity: 0.8; transition: opacity 0.2s;"
           onmouseover="this.style.opacity='1'"
           onmouseout="this.style.opacity='0.8'">
          <img 
            src="\${iconUrl}" 
            alt="Webring" 
            style="width: 24px; height: auto; display: block;" 
          />
        </a>
        <a href="#" 
           id="webring-next" 
           style="text-decoration: none; color: #9ca3af; font-size: 18px; cursor: pointer; transition: color 0.2s;"
           onmouseover="this.style.color='#d1d5db'"
           onmouseout="this.style.color='#9ca3af'">
          →
        </a>
      </div>
    \`;
    
    // Add navigation functionality
    document.getElementById('webring-prev').addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        let targetUrl;
        if (leftSite && leftSite !== 'auto') {
          targetUrl = leftSite;
        } else {
          const response = await fetch(\`\${WEBRING_API}/api/navigate?site=\${encodeURIComponent(currentSite)}&dir=prev\`);
          const data = await response.json();
          targetUrl = data.member?.website;
        }
        if (targetUrl) {
          window.location.href = targetUrl;
        }
      } catch (error) {
        console.error('Webring navigation error:', error);
      }
    });
    
    document.getElementById('webring-next').addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        let targetUrl;
        if (rightSite && rightSite !== 'auto') {
          targetUrl = rightSite;
        } else {
          const response = await fetch(\`\${WEBRING_API}/api/navigate?site=\${encodeURIComponent(currentSite)}&dir=next\`);
          const data = await response.json();
          targetUrl = data.member?.website;
        }
        if (targetUrl) {
          window.location.href = targetUrl;
        }
      } catch (error) {
        console.error('Webring navigation error:', error);
      }
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWebringWidget);
  } else {
    createWebringWidget();
  }
})();
  `;

  return new NextResponse(widgetScript, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

