import * as d3 from "d3";
import * as topojson from "topojson-client";
const spainjson = require("./spain.json");
const d3Composite = require("d3-composite-projections");
import { latLongCommunities } from "./communities";
import { stats,statscoro2203,ResultEntry } from "./stats";


const svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1024)
  .attr("height", 800)
  .attr("style", "background-color: #FBFAF0");


const div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);


const aProjection = d3Composite
  .geoConicConformalSpain()
  .scale(3300)
  .translate([500, 400]);

const geoPath = d3.geoPath().projection(aProjection);
const geojson = topojson.feature(spainjson, spainjson.objects.ESP_adm1);



const updatecircles = (data: ResultEntry[]) => {
  const maxAffected = data.reduce(
    (max, item) => (item.value > max ? item.value : max),
    0
  );

const Escalacolores = d3
  .scaleLinear()
  .domain([0, maxAffected])
  .range([20, 95]); 
const affectedRadiusScale = d3
  .scaleLinear()
  .domain([0, maxAffected])
  .range([5, 28]);

const calculateRadiusBasedOnAffectedCases = (comunidad: string) => {
  const entry = data.find(item => item.name === comunidad);
  
    return entry ? affectedRadiusScale(entry.value) : 0 };

const colorporcomunidad = (d) => {
 const item = data.find(item => item.name == d)
    const color = item ? 100 -  Escalacolores(item.value) :100;
      return `hsla(250,90%,${color}%,1)`;
    };
  
 
    svg
    .selectAll("path")
    .data(geojson["features"])
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("fill", d => colorporcomunidad(d["properties"]["NAME_1"]))
    .attr("d", geoPath as any)
    .merge(svg.selectAll("path") as any)
    .transition()
    .duration(500)
    .attr("fill", d => colorporcomunidad(d["properties"]["NAME_1"]));
      
    const circles = svg.selectAll("circle");
    
    circles
      .data(latLongCommunities)
      .enter()
      .append("circle")
      .attr("class", "affected-marker")
      .attr("r", d => calculateRadiusBasedOnAffectedCases(d.name))
      .attr("cx", d => aProjection([d.long, d.lat])[0])
      .attr("cy", d => aProjection([d.long, d.lat])[1])
      .on("mouseover", function(d, i) {
        d3.select(this)
          .transition()
          .duration(500)
         ;
    
        div
          .transition()
          .duration(200)
          .style("opacity", 0.9);
        const portadores = data.find(entry => entry.name === d.name).value
        const tooltipContent = `<span>${d.name} : ${portadores} </span>`; 
        
        div
          .html(tooltipContent)
          .style("left", `${d3.event.pageX}px`)
          .style("top", `${d3.event.pageY - 28}px`);
      })
      .on("mouseout", function(d, i) {
        d3.select(this)
          .transition()
          .duration(500)
          .attr("transform", ``);
        div
          .transition()
          .duration(500)
          .style("opacity", 0);
    })
      .merge(circles as any)
      .transition()
      .duration(500)
      .attr("r", d => calculateRadiusBasedOnAffectedCases(d.name))
    
    }

document
.getElementById("stats")
.addEventListener("click", function handleStats() {
  updatecircles(stats);
});

document
.getElementById("statscoro2203")
.addEventListener("click", function handleStatscoro2203() {
  updatecircles(statscoro2203);
 
});
updatecircles(statscoro2203);
    
 



