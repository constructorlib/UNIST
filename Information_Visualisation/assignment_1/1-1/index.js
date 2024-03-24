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

const w = 500;
const h = 500;
const centerX = w / 2;
const centerY = h / 2;

const svg = d3.select("body").append("svg").attr("width", w).attr("height", h);

// Arms
function drawArm(cx, cy, angle, fillColor) {
  svg
    .append("ellipse")
    .attr("cx", cx)
    .attr("cy", cy)
    .attr("rx", 80)
    .attr("ry", 40)
    .attr("fill", fillColor)
    .attr("class", "body-part") // Consider a more descriptive class name
    .attr("transform", `rotate(${angle}, ${cx}, ${cy})`)
    .style("stroke", "black")
    .style("stroke-width", 3);
}

drawArm(centerX - 55, centerY - 25, 65, "#ffb4dc");
drawArm(centerX + 75, centerY - 20, 50, "#ffb4dc");

// Feet
function drawFoot(cx, cy, angle, fillColor) {
  svg
    .append("ellipse")
    .attr("cx", cx)
    .attr("cy", cy)
    .attr("rx", 80)
    .attr("ry", 40)
    .attr("fill", fillColor)
    .attr("class", "body-part")
    .attr("transform", `rotate(${angle}, ${cx}, ${cy})`)
    .style("stroke", "black")
    .style("stroke-width", 3);
}

drawFoot(centerX - 30, centerY + 70, -30, "#cf4f99");
drawFoot(centerX + 30, centerY + 70, 30, "#cf4f99");

// Body
svg
  .append("circle")
  .attr("cx", centerX)
  .attr("cy", centerY)
  .attr("r", 100)
  .attr("fill", "#ffb4dc")
  .attr("class", "body-part")
  .style("stroke", "black")
  .style("stroke-width", 3);

// Mouth
svg
  .append("polygon")
  .attr(
    "points",
    `${centerX - 10},${centerY} ${centerX + 10},${centerY} ${centerX},${
      centerY + 15
    }`
  )
  .attr("fill", "red")
  .attr("stroke", "black")
  .attr("stroke-width", 2);

// Eyes
function drawEye(cx, cy) {
  svg
    .append("ellipse")
    .attr("cx", cx)
    .attr("cy", cy)
    .attr("rx", 5)
    .attr("ry", 20)
    .attr("fill", "black");

  svg
    .append("ellipse")
    .attr("cx", cx)
    .attr("cy", cy + 10)
    .attr("rx", 2)
    .attr("ry", 7)
    .attr("fill", "white");
}

drawEye(centerX - 20, centerY - 20);
drawEye(centerX + 20, centerY - 20);
svg
  .append("image")
  .attr("href", "starrod.svg")
  .attr("x", 130)
  .attr("y", 55)
  .attr("width", 90)
  .attr("height", 170)
  .attr("transform", "rotate(55, 177, 143)");
