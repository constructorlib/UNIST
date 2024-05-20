console.log("hello world!"); // You can see this in the browser console if you run the server correctly

d3.csv("data/owid-covid-data.csv")
  .then((data) => {
    // Don't edit code here!!

    var filteredData = data.filter((d) => {
      return (
        d.people_vaccinated_per_hundred &&
        d.people_fully_vaccinated_per_hundred &&
        d.date &&
        d.location &&
        d.population &&
        d.continent == "South America"
      );
    });

    // Parse data into D3 time format & calculate rate
    filteredData = filteredData.map((d) => {
      return {
        location: d.location,
        date: d3.timeParse("%Y-%m-%d")(d.date),
        people_vaccinated: Number(d.people_vaccinated_per_hundred),
        people_fully_vaccinated: Number(d.people_fully_vaccinated_per_hundred),
        people_partially_vaccinated:
          Number(d.people_vaccinated_per_hundred) -
          Number(d.people_fully_vaccinated_per_hundred),
        population: d.population,
        continent: d.continent,
      };
    });

    // Exclude data where the total rate is over 100%
    filteredData = filteredData.filter((d) => {
      return (
        d.people_fully_vaccinated + d.people_partially_vaccinated <= 100 &&
        d.people_fully_vaccinated <= d.people_vaccinated
      );
    });

    // Sort by date (descending)
    filteredData = filteredData.sort((a, b) => b.date - a.date);

    // Get latest datum of each country
    var processedData = [];
    var countryList = [];
    for (var d of filteredData) {
      if (!countryList.includes(d.location)) {
        processedData.push(d);
        countryList.push(d.location);
      }
    }

    // Sort by total rate
    processedData = processedData.sort(
      (a, b) =>
        b.people_fully_vaccinated +
        b.people_partially_vaccinated -
        (a.people_fully_vaccinated + a.people_partially_vaccinated)
    );

    drawBarChart(processedData);
  })
  .catch((error) => {
    console.error(error);
  });

function drawBarChart(data) {
  /*
    Add your code to the part with annotation [your code #]
    Don't edit other parts!
    */

  // Get country name list for y Scale
  const locations = d3.map(data, function (d) {
    return d.location;
  });
  // Define margin,width, and height of the chart
  const margin = { top: 5, right: 30, bottom: 50, left: 120 },
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

  // Define the position of the chart
  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Create x Scale
  const xScale = d3.scaleLinear().domain([0, 100]).range([0, width]);

  // Create y Scale
  const yScale = d3
    .scaleBand()
    .domain(locations)
    .range([0, height])
    .padding(0.2);

  // Tooltip Template
  const tooltip = d3
    .select("#chart")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "gray")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("color", "white")
    .style("display", "inline")
    .style("position", "fixed")
    .style("pointer-events", "none");

  // [your code 1] Define zoom event & Set the area for zoom event

  const zoom = d3
    .zoom()
    .scaleExtent([1, 5]) // Set the scale extent for zooming
    .translateExtent([
      [0, 0],
      [width, height],
    ]) // Set the translation extent
    .on("zoom", zoomed);

  svg.call(zoom);

  function zoomed(event) {
    const transform = event.transform;
    const newXScale = transform.rescaleX(xScale);

    svg
      .selectAll(".bar")
      .attr("x", (d) => newXScale(0))
      .attr(
        "width",
        (d) =>
          newXScale(d.people_fully_vaccinated + d.people_partially_vaccinated) -
          newXScale(0)
      );

    svg.select(".x-axis").call(d3.axisBottom(newXScale));
    // The y-axis doesn't change, so we don't need to update it
  }

  // Draw the bars
  svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", xScale(0))
    .attr("y", (d) => yScale(d.location))
    .attr("width", (d) =>
      xScale(d.people_fully_vaccinated + d.people_partially_vaccinated)
    )
    .attr("height", yScale.bandwidth())
    .attr("fill", "#7bccc4") // Original color
    // [your code 2] Add event listeners for tooltip & toggle color into barChart
    .on("mouseover", function (event, d) {
      d3.select(this).attr("fill", "orange");
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html(
          `Country: ${d.location}<br/>Population: ${parseInt(
            d.population
          ).toLocaleString()}<br/>Fully Vaccinated: ${d.people_fully_vaccinated.toFixed(
            2
          )}%<br/>Partially Vaccinated: ${d.people_partially_vaccinated.toFixed(
            2
          )}%`
        )
        .style("left", event.pageX + 10 + "px") // Positioning tooltip to the bottom right of the cursor
        .style("top", event.pageY + 10 + "px");
    })
    .on("mousemove", function (event, d) {
      tooltip
        .style("left", event.pageX + 10 + "px") // Update position as cursor moves
        .style("top", event.pageY + 10 + "px");
    })
    .on("mouseout", function (event, d) {
      d3.select(this).attr("fill", function () {
        // Revert to original color if not toggled
        return d3.select(this).attr("data-clicked") === "true"
          ? "#2b8cbe"
          : "#7bccc4";
      });
      tooltip.transition().duration(500).style("opacity", 0);
    })
    .on("click", function (event, d) {
      const currentColor = d3.select(this).attr("fill");
      const newColor = currentColor === "#7bccc4" ? "#2b8cbe" : "#7bccc4";
      d3.select(this).attr("fill", newColor);
      // Toggle data-clicked attribute
      d3.select(this).attr(
        "data-clicked",
        newColor === "#2b8cbe" ? "true" : "false"
      );
    });
  // [your code 2] ends here

  // Add the x Axis
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  // Add the y Axis
  svg.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));
}

// [your code 1] ends here

// Set the visible area of bars
const clip = svg
  .append("defs")
  .append("clipPath")
  .attr("id", "clip")
  .append("rect")
  .attr("width", width)
  .attr("height", height);

// Set the clip path
const bar = svg.append("g").attr("clip-path", "url(#clip)");

// Create bars
const barChart = bar
  .selectAll("rect")
  .data(data)
  .enter()
  .append("rect")
  .attr("fill", "#7bccc4")
  .attr("x", 0)
  .attr("y", (d) => yScale(d.location))
  .attr("width", (d) => xScale(d.people_vaccinated))
  .attr("height", yScale.bandwidth());
// [your code 2] Add event listeners for tooltip & toggle color into barChart

// [your code 2] ends here

// Draw axes
const xAxis = svg
  .append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0, ${height})`)
  .call(d3.axisBottom(xScale));

const yAxis = svg.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));

// Indicate the x-axis label
svg
  .append("text")
  .attr("text-anchor", "end")
  .attr("x", width)
  .attr("y", height + 40)
  .attr("font-size", 17)
  .text("Share of people (%)");

// [your code 3] Define function for toggle-color
function toggleColor(event, d) {}

// [your code 3] ends here

// [your code 4] Define
