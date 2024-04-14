console.log("hello world!");
// You can see this in the browser console if you run the server correctly
// Don't edit skeleton code!!

d3.csv("data/owid-covid-data.csv")
  .then((data) => {
    // Task 1 - Data Processing

    // 1. Exclude data with missing values on columns needed
    const columnsNeeded = [
      "total_cases",
      "new_cases",
      "total_deaths",
      "new_deaths",
      "total_cases_per_million",
      "new_cases_per_million",
      "total_deaths_per_million",
      "new_deaths_per_million",
      "reproduction_rate",
      "icu_patients",
      "icu_patients_per_million",
      "hosp_patients",
      "hosp_patients_per_million",
      "weekly_icu_admissions",
      "weekly_icu_admissions_per_million",
      "weekly_hosp_admissions",
      "weekly_hosp_admissions_per_million",
      "total_tests",
      "new_tests",
      "total_tests_per_thousand",
      "new_tests_per_thousand",
      "new_tests_smoothed",
      "new_tests_smoothed_per_thousand",
      "positive_rate",
      "tests_per_case",
      "total_vaccinations",
      "people_vaccinated",
      "people_fully_vaccinated",
      "total_boosters",
      "new_vaccinations",
      "new_vaccinations_smoothed",
      "total_vaccinations_per_hundred",
      "people_vaccinated_per_hundred",
      "people_fully_vaccinated_per_hundred",
      "total_boosters_per_hundred",
      "new_vaccinations_smoothed_per_million",
      "new_people_vaccinated_smoothed",
      "new_people_vaccinated_smoothed_per_hundred",
      "stringency_index",
      "population_density",
      "median_age",
      "aged_65_older",
      "aged_70_older",
      "gdp_per_capita",
      "extreme_poverty",
      "cardiovasc_death_rate",
      "diabetes_prevalence",
      "female_smokers",
      "male_smokers",
      "handwashing_facilities",
      "hospital_beds_per_thousand",
      "life_expectancy",
      "human_development_index",
      "population",
      "excess_mortality_cumulative_absolute",
      "excess_mortality_cumulative",
      "excess_mortality",
      "excess_mortality_cumulative_per_million",
    ];

    data = data.filter((d) => columnsNeeded.every((col) => !isNaN(d[col])));

    // 2. Exclude data except for Asian countries
    data = data.filter((d) => d.continent === "Asia");

    // 3. Calculate the rate of vaccinated people
    data.forEach((d) => {
      d.total_vaccinated_rate =
        ((+d.people_fully_vaccinated + +d.people_vaccinated) / +d.population) *
        100;
      d.fully_vaccinated_rate =
        (+d.people_fully_vaccinated / +d.population) * 100;
      d.partially_vaccinated_rate =
        (+d.people_vaccinated / +d.population) * 100;
    });

    // 4. Exclude data where total rate of vaccinated people is over 100%
    data = data.filter((d) => d.total_vaccinated_rate <= 100);

    // 5. Exclude all data except the latest data for each country
    const latestDataMap = new Map();
    data.forEach((d) => {
      const country = d.location;
      if (
        !latestDataMap.has(country) ||
        d.date > latestDataMap.get(country).date
      ) {
        latestDataMap.set(country, d);
      }
    });
    data = Array.from(latestDataMap.values());

    // 6. Sort the data with descending order by total rate of vaccinated people
    data.sort((a, b) => b.total_vaccinated_rate - a.total_vaccinated_rate);

    // 7. Extract Top 15 countries
    const processedData = data.slice(0, 15);

    drawBarChart(processedData);
    console.log("Processed Data:", processedData);
  })
  .catch((error) => {
    console.error(error);
  });
function drawBarChart(data) {
  console.log("Data received by drawBarChart:", data);
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
      2. Create a scale named yScale for y-axis
      3. Define a scale named cScale for color
      4. Process the data for a stacked bar chart 
      5. Draw Stacked bars
      6. Draw the labels for bars
      -------------------------------------------
      */

  // Step 1: Create a scale for x-axis
  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d.location))
    .range([0, width])
    .padding(0.1);

  // Step 2: Create a scale for y-axis
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.total_rate)])
    .range([height, 0]);

  // Step 3: Define a scale for color
  const cScale = d3
    .scaleOrdinal()
    .domain(["fully_vaccinated_rate", "partially_vaccinated_rate"])
    .range(["#7bccc4", "#2b8cbe"]);

  const stackedData = d3
    .stack()
    .keys(["fully_vaccinated_rate", "partially_vaccinated_rate"])
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone)(data);

  // Step 5: Draw Stacked bars
  svg
    .selectAll(".bar")
    .data(stackedData)
    .enter()
    .append("g")
    .attr("fill", (d) => cScale(d.key))
    .selectAll("rect")
    .data((d) => d)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.data.location))
    .attr("y", (d) => yScale(d[1]))
    .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
    .attr("width", xScale.bandwidth());

  // Step 6: Draw the labels for bars
  svg
    .selectAll(".label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", (d) => xScale(d.location) + xScale.bandwidth() / 2)
    .attr("y", (d) => yScale(d.total_rate) - 5)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .text((d) => d.location);
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
