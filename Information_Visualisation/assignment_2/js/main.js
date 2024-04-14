console.log("hello world!");
// You can see this in the browser console if you run the server correctly
// Don't edit skeleton code!!

d3.csv("data/owid-covid-data.csv")
  .then((data) => {
    console.log("CSV Data:", data);

    /*
        -------------------------------------------
        YOUR CODE STARTS HERE

        TASK 1 - Data Processing 

        TO-DO-LIST
        1. Exclude data which contain missing values on columns you need
        2. Exclude data all data except the data where the continent is Asia 
        3. Calculate the rate of fully vaccinated people, partially vaccinated people, and total rate of vaccinated people
        4. Exclude data where total rate of vaccinated people is over 100%
        5. Exclude all data except the latest data for each country
        6. Sort the data with descending order by total reat of vaccinated people
        7. Extract Top 15 countries 
        -------------------------------------------
        */

    // TASK 1 STARTS HERE
    // Step 1: Exclude data with missing values on columns needed
    processedData = data.filter(
      (d) =>
        d.iso_code &&
        d.continent &&
        d.location &&
        d.date &&
        d.population &&
        d.people_vaccinated &&
        d.people_fully_vaccinated
    );
    console.log("Data after Step 1:", processedData);
    // Step 2: Exclude data except for Asian countries
    const asianCountries = processedData.filter((d) => d.continent === "Asia");
    console.log("Data after Step 2:", asianCountries);
    // Step 3: Calculate the rate of vaccinated people
    const asianCountriesWithRates = asianCountries.map((d) => ({
      ...d,
      fully_vaccinated_rate: (d.people_fully_vaccinated / d.population) * 100,
      partially_vaccinated_rate:
        ((d.people_vaccinated - d.people_fully_vaccinated) / d.population) *
        100,
      total_vaccinated_rate: (d.people_vaccinated / d.population) * 100,
    }));
    console.log("Data after Step 3:", asianCountriesWithRates);
    // Step 4: Exclude data where total rate of vaccinated people is over 100%
    const filteredAsianCountries = asianCountriesWithRates.filter(
      (d) => d.total_vaccinated_rate <= 100
    );
    console.log("Data after Step 4:", filteredAsianCountries);
    // Step 5: Exclude all data except the latest data for each country
    const latestDataMap = new Map();
    filteredAsianCountries.forEach((d) => {
      const country = d.location;
      if (
        !latestDataMap.has(country) ||
        d.date > latestDataMap.get(country).date
      ) {
        latestDataMap.set(country, d);
      }
    });
    const latestAsianData = Array.from(latestDataMap.values());
    console.log("Data after Step 5:", latestAsianData);
    // Step 6: Sort the data with descending order by total rate of vaccinated people
    latestAsianData.sort(
      (a, b) => b.total_vaccinated_rate - a.total_vaccinated_rate
    );

    // Step 7: Extract Top 15 countries
    const topCountries = latestAsianData.slice(0, 15);
    console.log("Top 15 Countries:", topCountries);

    /*
        -------------------------------------------
        YOUR CODE ENDS HERE
        -------------------------------------------
        
    */
    drawBarChart(topCountries);
    console.log("Processed Data:", topCountries);
  })
  .catch((error) => {
    console.error(error);
  });
function drawBarChart(topCountries) {
  // Define the screen
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
  /*
    -------------------------------------------
    YOUR CODE STARTS HERE

    TASK 2 - Data processing 

    TO-DO-LIST
    1. Create a scale named xScale for x-axis
    2. Create a scale named yScale for x-axis
    3. Define a scale named cScale for color
    4. Process the data for a stacked bar chart 
    5. Draw Stacked bars
    6. Draw the labels for bars
    -------------------------------------------
    */

  // 1. Create a scale for y-axis (formerly x-axis)
  const yScale = d3
    .scaleBand()
    .domain(topCountries.map((d) => d.location))
    .range([margin.top, height - margin.bottom])
    .padding(0.1);

  // 2. Create a scale for x-axis (formerly y-axis)
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(topCountries, (d) => d.total_vaccinated_rate)])
    .range([margin.left, width - margin.right]);

  // 3. Define a scale for color
  const cScale = d3
    .scaleOrdinal()
    .domain(["fully_vaccinated_rate", "partially_vaccinated_rate"])
    .range(["#7bccc4", "#2b8cbe"]);

  // 4. Process the data for a stacked bar chart
  const stackedData = d3
    .stack()
    .keys(["fully_vaccinated_rate", "partially_vaccinated_rate"])(topCountries);

  // 5. Draw Stacked bars
  svg
    .selectAll("g.bar-group")
    .data(stackedData)
    .enter()
    .append("g")
    .attr("class", "bar-group")
    .attr("fill", (d) => cScale(d.key))
    .selectAll("rect")
    .data((d) => d)
    .enter()
    .append("rect")
    .attr("y", (d, i) => yScale(d.data.location))
    .attr("x", (d) => xScale(d[0]))
    .attr("width", (d) => xScale(d[1]) - xScale(d[0]))
    .attr("height", yScale.bandwidth());

  // 6. Draw the labels for bars
  svg
    .selectAll(".bar-label")
    .data(topCountries)
    .enter()
    .append("text")
    .attr("class", "bar-label")
    .attr("x", (d) => xScale(d.total_vaccinated_rate) + 5) // Adjust position since x and y are swapped
    .attr("y", (d) => yScale(d.location) + yScale.bandwidth() / 2) // Adjust position since x and y are swapped
    .attr("text-anchor", "start") // Adjust alignment since x and y are swapped
    .attr("font-size", "12px")
    .text((d) => `${d.total_vaccinated_rate.toFixed(2)}%`);

  /*
    -------------------------------------------
    YOUR CODE ENDS HERE
    -------------------------------------------
    */

  // Define the position of each axis
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  // Draw axes
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

  svg.append("g").attr("class", "y-axis").call(yAxis);

  // Indicate the x-axis label
  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + 40)
    .attr("font-size", 17)
    .text("Share of people (%)");

  // Draw Legend
  const legend = d3
    .select("#legend")
    .append("svg")
    .attr("width", width)
    .attr("height", 70)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 18)
    .attr("width", 12)
    .attr("height", 12)
    .style("fill", "#7bccc4");
  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 36)
    .attr("width", 12)
    .attr("height", 12)
    .style("fill", "#2b8cbe");
  legend
    .append("text")
    .attr("x", 18)
    .attr("y", 18)
    .text("The rate of fully vaccinated people")
    .style("font-size", "15px")
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "hanging");
  legend
    .append("text")
    .attr("x", 18)
    .attr("y", 36)
    .text("The rate of partially vaccinated people")
    .style("font-size", "15px")
    .attr("text-anchor", "start")
    .attr("alignment-baseline", "hanging");
}
