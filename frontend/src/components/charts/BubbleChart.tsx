'use client';
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function BubbleChart({ data, theme }: { data: any[], theme?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const regionData = d3.rollup(
      data.filter(d => d.region),
      v => d3.sum(v, d => d.intensity || 0),
      d => d.region
    );

    const hierarchyData = {
      name: "root",
      children: Array.from(regionData, ([name, value]) => ({ name, value }))
    };

    const root = d3.hierarchy(hierarchyData)
      .sum(d => d.value)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const width = 800;
    const height = 400;

    d3.treemap()
      .size([width, height])
      .paddingInner(4)
      .paddingOuter(4)
      .round(true)(root);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    let tooltip = d3.select("body").select(".d3-tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select("body").append("div").attr("class", "d3-tooltip");
    }

    const leaf = svg.selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

    const color = d3.scaleOrdinal()
      .domain(root.leaves().map(d => d.data.name))
      .range(["var(--card-dark)", "var(--card-green)", "var(--card-purple)", "#EAECE8", "#A3A3A3"]);

    leaf.append("rect")
      .attr("width", d => Math.max(0, d.x1 - d.x0))
      .attr("height", d => Math.max(0, d.y1 - d.y0))
      .attr("fill", d => color(d.data.name) as string)
      .attr("rx", 12)
      .attr("ry", 12)
      .style("transition", "opacity 0.2s")
      .on("mouseover", function(event, d) {
        d3.select(this).style("opacity", 0.7);
        tooltip.style("opacity", 1)
               .html(`<strong>${d.data.name}</strong><br/>Total Intensity: ${d.value}`);
      })
      .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 15) + "px")
               .style("top", (event.pageY - 15) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).style("opacity", 1);
        tooltip.style("opacity", 0);
      });

    // Label only for large enough blocks
    leaf.filter(d => (d.x1 - d.x0) > 60 && (d.y1 - d.y0) > 40)
      .append("text")
      .attr("x", 12)
      .attr("y", 24)
      .style("font-family", "var(--font-body)")
      .style("font-size", "14px")
      .style("font-weight", 600)
      .style("fill", d => {
        const c = color(d.data.name) as string;
        return (c === "var(--card-dark)") ? "var(--text-light)" : "var(--text-dark)";
      })
      .style("pointer-events", "none")
      .text(d => d.data.name.substring(0, 15));

    leaf.filter(d => (d.x1 - d.x0) > 60 && (d.y1 - d.y0) > 60)
      .append("text")
      .attr("x", 12)
      .attr("y", 42)
      .style("font-family", "var(--font-body)")
      .style("font-size", "12px")
      .style("fill", d => {
        const c = color(d.data.name) as string;
        return (c === "var(--card-dark)") ? "var(--text-muted-light)" : "var(--text-muted)";
      })
      .style("pointer-events", "none")
      .text(d => d.value);

  }, [data, theme]);

  return <svg ref={svgRef} style={{ width: '100%', height: 'auto' }}></svg>;
}
