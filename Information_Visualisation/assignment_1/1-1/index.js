/*
Draw Kirby here!

Color Code 

Body and arms : #ffb4dc
feet : #cf4f99
eyes : #000000 or black
pupils : #ffffff or white
mouth: #ff0000 or red 

*/

var svg = d3
  .select(".roundbody")
  .append("svg")
  .attr("width", 300)
  .attr("height", 300);

svg
  .append("circle")
  .attr("cx", svg.attr("width") / 2)
  .attr("cy", svg.attr("height") / 2)
  .attr("r", svg.attr("width") / 4)
  .attr("fill", "#ffb4dc");

var svg = d3
  .select(".handr")
  .append("svg")
  .attr("width", 150)
  .attr("height", 80);

svg
  .append("rect")
  .attr("x", 50)
  .attr("y", 20)
  .attr("width", 400)
  .attr("height", 60)
  .attr("fill", "blue")
  .attr("rx", 30)
  .attr("ry", 30);
