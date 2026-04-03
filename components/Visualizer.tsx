import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Mode } from '../types';

interface VisualizerProps {
  fieldsNeeded: number;
  mode: Mode;
}

const Visualizer: React.FC<VisualizerProps> = ({ fieldsNeeded, mode }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 300; // Fixed height for visual consistency
    const svg = d3.select(svgRef.current);

    svg.selectAll("*").remove(); // Clear previous

    // Background - Represents the Goal Area (Abstractly scaled to fit the SVG)
    // We treat the SVG area as the "Goal Area"
    svg.attr("width", width).attr("height", height);

    // Calculate packing
    // We want to visually represent "fieldsNeeded".
    // If fieldsNeeded is huge, we can't draw them all clearly. We need a cap.
    const maxVisualizerItems = 500;
    const visualCount = Math.min(Math.ceil(fieldsNeeded), maxVisualizerItems);
    const isCapped = fieldsNeeded > maxVisualizerItems;

    // Grid layout calculation
    const aspectRatio = width / height;
    const cols = Math.ceil(Math.sqrt(visualCount * aspectRatio));
    const rows = Math.ceil(visualCount / cols);
    
    const cellWidth = width / cols;
    const cellHeight = height / rows;
    
    // Size of the shape within the cell
    const shapeSize = Math.min(cellWidth, cellHeight) * 0.8;

    const group = svg.append("g");

    // Generate data array
    const data = Array.from({ length: visualCount }, (_, i) => i);

    if (mode === Mode.MICROSCOPE) {
      group.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d) => {
          const col = d % cols;
          return col * cellWidth + cellWidth / 2;
        })
        .attr("cy", (d) => {
          const row = Math.floor(d / cols);
          return row * cellHeight + cellHeight / 2;
        })
        .attr("r", shapeSize / 2)
        .attr("fill", "#6366f1") // Indigo-500
        .attr("opacity", 0.6)
        .attr("stroke", "#4338ca")
        .attr("stroke-width", 1);
    } else {
      // Screen - Rectangles
      group.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d) => {
          const col = d % cols;
          return col * cellWidth + (cellWidth - shapeSize) / 2;
        })
        .attr("y", (d) => {
          const row = Math.floor(d / cols);
          return row * cellHeight + (cellHeight - shapeSize) / 2;
        })
        .attr("width", shapeSize)
        .attr("height", shapeSize * 0.75) // Aspect ratio approximation
        .attr("fill", "#10b981") // Emerald-500
        .attr("opacity", 0.6)
        .attr("stroke", "#047857")
        .attr("stroke-width", 1);
    }

    // Overlay text if capped
    if (isCapped) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "16px")
        .attr("font-weight", "bold")
        .style("text-shadow", "0px 1px 4px rgba(0,0,0,0.8)")
        .text(`Visualizing first ${maxVisualizerItems} of ${Math.ceil(fieldsNeeded)} fields`);
    }

  }, [fieldsNeeded, mode]);

  return (
    <div ref={containerRef} className="w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200 mt-4 shadow-inner relative">
       <div className="absolute top-2 left-2 text-xs font-mono text-slate-500 bg-white/80 px-2 py-1 rounded">
        Field Distribution Visualization
       </div>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Visualizer;
