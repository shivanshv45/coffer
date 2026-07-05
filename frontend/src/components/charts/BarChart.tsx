'use client';
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function BarChart({ data, theme }: { data: any[], theme?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;
    
    const topicCounts = d3.rollup(
      data.filter(d => d.topic),
      v => d3.sum(v, d => d.intensity || 0),
      d => d.topic
    );
    
    // Sort and get top 10
    const sortedData = Array.from(topicCounts, ([topic, intensity]) => ({ topic, intensity }))
      .sort((a, b) => b.intensity - a.intensity)
      .slice(0, 10)
      .reverse(); // Reverse for horizontal display (top item at the top)

    const width = 800;
    const height = 350;
    const margin = { top: 20, right: 30, bottom: 40, left: 150 }; // Larger left margin for topic names

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create Tooltip if it doesn't exist
    let tooltip = d3.select("body").select(".d3-tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select("body").append("div").attr("class", "d3-tooltip");
    }

    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const x = d3.scaleLinear()
      .domain([0, d3.max(sortedData, d => d.intensity) || 0]).nice()
      .range([margin.left, width - margin.right]);

    const y = d3.scaleBand()
      .domain(sortedData.map(d => d.topic))
      .range([height - margin.bottom, margin.top])
      .padding(0.3);

    const barColor = theme === 'purple' ? '#FFFFFF' : 'var(--text-dark)';
    const textColor = theme === 'purple' ? 'var(--text-dark)' : 'var(--text-muted)';
    const gridColor = theme === 'purple' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)';

    // X-axis Grid Lines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSize(-(height - margin.top - margin.bottom)).tickFormat(() => ""))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").attr("stroke", gridColor).attr("stroke-dasharray", "4,4"));

    // Bars
    svg.append("g")
      .attr("fill", barColor)
      .selectAll("rect")
      .data(sortedData)
      .join("rect")
      .attr("x", margin.left)
      .attr("y", d => y(d.topic)!)
      .attr("width", d => x(d.intensity) - margin.left)
      .attr("height", y.bandwidth())
      .attr("rx", 6)
      .attr("ry", 6)
      .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 0.8);
        tooltip.style("opacity", 1)
               .html(`<strong>${d.topic}</strong><br/>Intensity: ${d.intensity}`);
      })
      .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 15) + "px")
               .style("top", (event.pageY - 15) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("opacity", 1);
        tooltip.style("opacity", 0);
      });

    // Y Axis (Topics)
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .call(g => g.select(".domain").remove())
      .selectAll("text")
      .style("font-family", "var(--font-body)")
      .style("font-weight", 500)
      .style("font-size", "13px")
      .style("fill", textColor);

    // X Axis (Values)
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(0))
      .call(g => g.select(".domain").remove())
      .selectAll("text")
      .style("font-family", "var(--font-body)")
      .style("font-size", "12px")
      .style("fill", textColor);

  }, [data, theme]);

  return <svg ref={svgRef} style={{ width: '100%', height: 'auto', overflow: 'visible' }}></svg>;
}
