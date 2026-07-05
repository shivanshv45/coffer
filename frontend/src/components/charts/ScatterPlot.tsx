'use client';
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function ScatterPlot({ data, theme }: { data: any[], theme?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const filteredData = data.filter(d => d.likelihood != null && d.relevance != null);

    // Group data by exact (likelihood, relevance) coordinate
    const grouped = d3.rollup(
      filteredData,
      v => ({
        count: v.length,
        avgIntensity: d3.mean(v, d => d.intensity || 0) || 0,
        topSector: d3.rollup(v, g => g.length, d => d.sector)
      }),
      d => d.likelihood,
      d => d.relevance
    );

    const binnedData: any[] = [];
    for (const [likelihood, relMap] of grouped) {
      for (const [relevance, stats] of relMap) {
        // Find most common sector in this bin
        let topSector = 'N/A';
        let maxCount = 0;
        for (const [sector, count] of stats.topSector) {
          if (sector && count > maxCount) { maxCount = count; topSector = sector; }
        }
        binnedData.push({ likelihood, relevance, count: stats.count, avgIntensity: stats.avgIntensity, topSector });
      }
    }

    const width = 450;
    const height = 350;
    const margin = { top: 30, right: 30, bottom: 40, left: 40 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    let tooltip: any = d3.select("body").select(".d3-tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select("body").append("div").attr("class", "d3-tooltip");
    }

    const x = d3.scaleLinear()
      .domain([0, d3.max(binnedData, d => d.likelihood) || 5]).nice()
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(binnedData, d => d.relevance) || 7]).nice()
      .range([height - margin.bottom, margin.top]);

    // Use scaleSqrt for area-accurate bubble sizes
    const size = d3.scaleSqrt()
      .domain([0, d3.max(binnedData, d => d.count) || 1])
      .range([4, 25]);

    // Color scale based on Average Intensity of that cluster
    const colorScale = d3.scaleSequential(
      theme === 'dark' ? d3.interpolateGreens : d3.interpolateBlues
    ).domain([0, d3.max(binnedData, d => d.avgIntensity) || 100]);

    const textColor = theme === 'dark' ? 'var(--text-muted-light)' : 'var(--text-muted)';
    const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';

    // Gridlines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(-(height - margin.top - margin.bottom)).tickFormat(() => ""))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").attr("stroke", gridColor).attr("stroke-dasharray", "3,3"));

    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSize(-(width - margin.left - margin.right)).tickFormat(() => ""))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").attr("stroke", gridColor).attr("stroke-dasharray", "3,3"));

    // Binned Dots
    svg.append("g")
      .attr("stroke", theme === 'dark' ? 'var(--card-dark)' : 'var(--card-light)')
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(binnedData)
      .join("circle")
      .attr("cx", d => x(d.likelihood))
      .attr("cy", d => y(d.relevance))
      .attr("r", d => size(d.count))
      .attr("fill", d => colorScale(d.avgIntensity) as string)
      .attr("opacity", 0.9)
      .on("mouseover", function(event, d) {
        d3.select(this).attr("stroke-width", 2.5);
        tooltip.style("opacity", 1)
               .html(`<strong>Coordinate: [${d.likelihood}, ${d.relevance}]</strong><br/>Total Insights: ${d.count}<br/>Avg Intensity: ${d.avgIntensity.toFixed(1)}<br/>Top Sector: ${d.topSector}`);
      })
      .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 15) + "px")
               .style("top", (event.pageY - 15) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("stroke-width", 1.5);
        tooltip.style("opacity", 0);
      });

    // Axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(0))
      .call(g => g.select(".domain").remove())
      .selectAll("text").style("font-family", "var(--font-body)").style("fill", textColor);

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickSize(0))
      .call(g => g.select(".domain").remove())
      .selectAll("text").style("font-family", "var(--font-body)").style("fill", textColor);

    // Labels
    svg.append("text")
      .attr("x", width - margin.right)
      .attr("y", height - 5)
      .attr("text-anchor", "end")
      .style("font-family", "var(--font-body)")
      .style("font-size", "10px")
      .style("fill", textColor)
      .text("LIKELIHOOD");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -margin.top)
      .attr("y", 15)
      .attr("text-anchor", "end")
      .style("font-family", "var(--font-body)")
      .style("font-size", "10px")
      .style("fill", textColor)
      .text("RELEVANCE");

  }, [data, theme]);

  return <svg ref={svgRef} style={{ width: '100%', height: 'auto', overflow: 'visible' }}></svg>;
}
