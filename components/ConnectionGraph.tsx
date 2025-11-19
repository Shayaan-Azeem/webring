'use client';

import { useEffect, useRef, useState } from 'react';

interface Member {
  id: number;
  name: string;
  website: string;
  year: number;
}

interface ConnectionGraphProps {
  members: Member[];
}

export default function ConnectionGraph({ members }: ConnectionGraphProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || members.length === 0) return;

    const container = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Clear existing content
    container.innerHTML = '';

    // Create nodes with scattered positioning (using golden angle spiral)
    const nodes = members.map((member, i) => {
      const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees
      const radius = Math.sqrt(i + 0.5) * (Math.min(width, height) / (2.5 * Math.sqrt(members.length)));
      const angle = i * goldenAngle;
      
      return {
        ...member,
        x: width / 2 + radius * Math.cos(angle),
        y: height / 2 + radius * Math.sin(angle),
        nextIndex: (i + 1) % members.length,
      };
    });

    // Create SVG for connections
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    container.appendChild(svg);

    // Draw connection lines
    nodes.forEach((node, i) => {
      const nextNode = nodes[node.nextIndex];
      
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', node.x.toString());
      line.setAttribute('y1', node.y.toString());
      line.setAttribute('x2', nextNode.x.toString());
      line.setAttribute('y2', nextNode.y.toString());
      line.setAttribute('stroke', 'currentColor');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('opacity', '0.2');
      line.style.color = 'rgba(255, 255, 255, 0.3)';
      
      svg.appendChild(line);
    });

    // Create node elements
    nodes.forEach((node) => {
      const nodeDiv = document.createElement('div');
      nodeDiv.style.position = 'absolute';
      nodeDiv.style.left = `${node.x}px`;
      nodeDiv.style.top = `${node.y}px`;
      nodeDiv.style.transform = 'translate(-50%, -50%)';
      nodeDiv.style.display = 'flex';
      nodeDiv.style.alignItems = 'center';
      nodeDiv.style.gap = '6px';
      nodeDiv.style.cursor = 'pointer';
      nodeDiv.style.transition = 'all 0.2s';
      
      // Circle
      const circle = document.createElement('div');
      circle.style.width = '8px';
      circle.style.height = '8px';
      circle.style.borderRadius = '50%';
      circle.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
      circle.style.border = '2px solid rgba(255, 255, 255, 0.4)';
      circle.style.flexShrink = '0';
      
      // Label with URL
      const label = document.createElement('span');
      label.style.fontSize = '11px';
      label.style.color = 'rgba(255, 255, 255, 0.5)';
      label.style.fontFamily = 'monospace';
      label.style.whiteSpace = 'nowrap';
      label.textContent = node.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
      
      nodeDiv.appendChild(circle);
      nodeDiv.appendChild(label);
      
      // Hover effect
      nodeDiv.addEventListener('mouseenter', () => {
        circle.style.backgroundColor = 'rgba(255, 255, 255, 1)';
        label.style.color = 'rgba(255, 255, 255, 1)';
      });
      
      nodeDiv.addEventListener('mouseleave', () => {
        circle.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
        label.style.color = 'rgba(255, 255, 255, 0.5)';
      });
      
      // Click to visit site
      nodeDiv.addEventListener('click', () => {
        window.open(node.website, '_blank');
      });
      
      container.appendChild(nodeDiv);
    });

  }, [members]);

  if (members.length === 0) return null;

  return (
    <div className="w-full h-full flex flex-col">
      <div 
        ref={canvasRef}
        className="w-full flex-1 relative"
        style={{ minHeight: '600px' }}
      />
      <div className="text-sm italic mt-4" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
        Sites: {members.length}
      </div>
    </div>
  );
}

