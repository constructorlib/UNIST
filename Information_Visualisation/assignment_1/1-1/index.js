/*
Draw Kirby here!

Color Code 

Body and arms : #ffb4dc
feet : #cf4f99
eyes : #000000 or black
pupils : #ffffff or white
mouth: #ff0000 or red 

*/

// var svg = d3
//   .select(".roundbody")
//   .append("svg")
//   .attr("width", 300)
//   .attr("height", 300);

// svg
//   .append("circle")
//   .attr("cx", svg.attr("width") / 2)
//   .attr("cy", svg.attr("height") / 2)
//   .attr("r", svg.attr("width") / 4)
//   .attr("fill", "#ffb4dc");

// var svg = d3
//   .select(".handr")
//   .append("svg")
//   .attr("width", 150)
//   .attr("height", 80);

// svg
//   .append("rect")
//   .attr("x", 50)
//   .attr("y", 20)
//   .attr("width", 400)
//   .attr("height", 60)
//   .attr("fill", "blue")
//   .attr("rx", 30)
//   .attr("ry", 30);

const width = 500;
const height = 500;
const x0 = width / 2;
const y0 = height / 2;

const kirby = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Arms
kirby
  .append("ellipse") // Left arm
  .attr("cx", x0 - 55)
  .attr("cy", y0 - 25)
  .attr("rx", 80)
  .attr("ry", 40)
  .attr("fill", "#ffb4dc")
  .attr("class", "main-outline")
  .attr("transform", "rotate(65, " + (x0 - 55) + ", " + (y0 - 25) + ")")
  .style("stroke", "black")
  .style("stroke-width", 3);
kirby
  .append("ellipse") // Left arm
  .attr("cx", x0 + 75)
  .attr("cy", y0 - 20)
  .attr("rx", 80)
  .attr("ry", 40)
  .attr("fill", "#ffb4dc")
  .attr("class", "main-outline")
  .attr("transform", "rotate(50, " + (x0 + 55) + ", " + (y0 - 20) + ")")
  .style("stroke", "black")
  .style("stroke-width", 3);
// Feet
kirby
  .append("ellipse") // Left foot
  .attr("cx", x0 - 30)
  .attr("cy", y0 + 70)
  .attr("rx", 80)
  .attr("ry", 40)
  .attr("fill", "#cf4f99")
  .attr("class", "main-outline")
  .attr("transform", "rotate(-30, " + (x0 - 30) + ", " + (y0 + 70) + ")")
  .style("stroke", "black")
  .style("stroke-width", 3);
kirby
  .append("ellipse") // Right foot
  .attr("cx", x0 + 30)
  .attr("cy", y0 + 70)
  .attr("rx", 80)
  .attr("ry", 40)
  .attr("fill", "#cf4f99")
  .attr("class", "main-outline")
  .attr("transform", "rotate(30, " + (x0 + 30) + ", " + (y0 + 70) + ")")
  .style("stroke", "black")
  .style("stroke-width", 3);
// Body
kirby
  .append("circle")
  .attr("cx", x0)
  .attr("cy", y0)
  .attr("r", 100)
  .attr("fill", "#ffb4dc")
  .attr("class", "main-outline")
  .style("stroke", "black")
  .style("stroke-width", 3);
// Mouth
kirby
  .append("polygon")
  .attr("points", `${x0 - 10},${y0} ${x0 + 10},${y0} ${x0},${y0 + 15}`)
  .attr("fill", "#ff0000")
  .attr("stroke", "#000000")
  .attr("stroke-width", 2);
// Eyes
kirby
  .append("ellipse") // Left-eye
  .attr("cx", x0 - 20)
  .attr("cy", y0 - 20)
  .attr("rx", 5)
  .attr("ry", 20)
  .attr("fill", "#000000");
kirby
  .append("ellipse") // Left-pupil
  .attr("cx", x0 - 20)
  .attr("cy", y0 - 30)
  .attr("rx", 2)
  .attr("ry", 7)
  .attr("fill", "#ffffff");
kirby
  .append("ellipse") // Right-eye
  .attr("cx", x0 + 20)
  .attr("cy", y0 - 20)
  .attr("rx", 5)
  .attr("ry", 20)
  .attr("fill", "#000000");
kirby
  .append("ellipse") // Right-pupil
  .attr("cx", x0 + 20)
  .attr("cy", y0 - 30)
  .attr("rx", 2)
  .attr("ry", 7)
  .attr("fill", "#ffffff");

kirby
  .append("image")
  .attr("href", "starrod.svg")
  .attr("x", 127)
  .attr("y", 53)
  .attr("width", 100)
  .attr("height", 180)
  .attr("transform", "rotate(55, 177, 143)");
