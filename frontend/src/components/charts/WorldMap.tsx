'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export default function WorldMap({ data, theme }: { data: any[], theme?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    // Fetch world geojson
    fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Error loading geojson", err));
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current || !geoData) return;

    // Aggregate intensity by country
    const countryData = d3.rollup(
      data.filter(d => d.country),
      v => d3.sum(v, d => d.intensity || 0),
      d => d.country
    );

    const width = 450;
    const height = 350;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    let tooltip: any = d3.select("body").select(".d3-tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select("body").append("div").attr("class", "d3-tooltip");
    }

    // 3D Orthographic Projection (Globe)
    const projection = d3.geoOrthographic()
      .scale(160)
      .translate([width / 2, height / 2])
      .clipAngle(90)
      .precision(0.1);

    const path = d3.geoPath().projection(projection);

    // Color Scale for the Heatmap - use 95th percentile to prevent outliers from washing out the colors
    const values = Array.from(countryData.values()).sort(d3.ascending);
    const p95 = d3.quantile(values, 0.95) || 100;
    
    const colorScale = d3.scaleSequential(
      theme === 'dark' ? d3.interpolateGreens : d3.interpolateBlues
    ).domain([0, p95]);

    // 3D Sphere Gradient for volume
    const defs = svg.append("defs");
    const gradient = defs.append("radialGradient")
      .attr("id", "globe-gradient")
      .attr("cx", "30%") // Offset light source to top-left
      .attr("cy", "30%")
      .attr("r", "70%");
    
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", theme === 'dark' ? "#1A1A1A" : "#FFFFFF");
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", theme === 'dark' ? "#050505" : "#D4E6F1");

    // Globe Drop Shadow
    const filter = defs.append("filter").attr("id", "drop-shadow");
    filter.append("feDropShadow").attr("dx", "0").attr("dy", "10").attr("stdDeviation", "15").attr("flood-opacity", "0.1");

    // Draw ocean/background globe
    svg.append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", 160)
      .attr("fill", "url(#globe-gradient)")
      .attr("stroke", theme === 'dark' ? '#333333' : '#B0D0E6')
      .attr("stroke-width", 1)
      .style("filter", "url(#drop-shadow)");

    // Draw Graticule (Lat/Lon grid)
    const graticule = d3.geoGraticule();
    const graticulePath = svg.append("path")
      .datum(graticule)
      .attr("class", "graticule")
      .attr("fill", "none")
      .attr("stroke", theme === 'dark' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)")
      .attr("stroke-width", 0.5)
      .attr("d", path as any);

    // Draw Countries
    const mapGroup = svg.append("g");

    const countries = mapGroup.selectAll("path")
      .data(geoData.features)
      .join("path")
      .attr("d", path as any)
      .attr("fill", (d: any) => {
        let countryName = d.properties.name;
        if (countryName === "USA") countryName = "United States of America";
        if (countryName === "England") countryName = "United Kingdom";

        const val = countryData.get(countryName) || countryData.get(d.properties.name);
        if (val) return colorScale(val) as string;
        // Make empty land clearly visible
        return theme === 'dark' ? '#2A2A2A' : '#CFD8DC'; 
      })
      .attr("stroke", theme === 'dark' ? '#161616' : '#FFFFFF') // Crisp borders
      .attr("stroke-width", 0.5)
      .on("mouseover", function(event, d: any) {
        let countryName = d.properties.name;
        if (countryName === "USA") countryName = "United States of America";
        
        const val = countryData.get(countryName) || countryData.get(d.properties.name);
        d3.select(this).attr("stroke", "var(--card-green)").attr("stroke-width", 1.5).raise();
        
        tooltip.style("opacity", 1)
               .html(`<strong>${d.properties.name}</strong><br/>Total Intensity: ${val || 0}`);
      })
      .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 15) + "px")
               .style("top", (event.pageY - 15) + "px");
      })
      .on("mouseout", function() {
        d3.select(this).attr("stroke", theme === 'dark' ? '#161616' : '#FFFFFF').attr("stroke-width", 0.5);
        tooltip.style("opacity", 0);
      });

    // Auto-rotation
    let rotation = 0;
    const timer = d3.timer(() => {
      rotation += 0.5;
      projection.rotate([rotation, -10]);
      countries.attr("d", path as any);
      graticulePath.attr("d", path as any);
    });

    // Drag behavior for manual rotation
    const drag = d3.drag<SVGSVGElement, unknown>()
      .on("start", () => timer.stop())
      .on("drag", (event) => {
        const rotate = projection.rotate();
        const k = 75 / projection.scale();
        projection.rotate([
          rotate[0] + event.dx * k,
          rotate[1] - event.dy * k
        ]);
        countries.attr("d", path as any);
        graticulePath.attr("d", path as any);
      });
      
    svg.call(drag);

    return () => {
      timer.stop();
    };
  }, [data, theme, geoData]);

  if (!geoData) {
    return <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading Globe Data...</div>;
  }

  return <svg ref={svgRef} style={{ width: '100%', height: 'auto', cursor: 'grab' }}></svg>;
}
