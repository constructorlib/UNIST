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
    // Step 1: Exclude data with missing values on columns needed
    data = data.filter(
      (d) =>
        !isNaN(d.total_cases) &&
        !isNaN(d.new_cases) &&
        !isNaN(d.total_deaths) &&
        !isNaN(d.new_deaths) &&
        !isNaN(d.total_cases_per_million) &&
        !isNaN(d.new_cases_per_million) &&
        !isNaN(d.total_deaths_per_million) &&
        !isNaN(d.new_deaths_per_million) &&
        !isNaN(d.reproduction_rate) &&
        !isNaN(d.icu_patients) &&
        !isNaN(d.icu_patients_per_million) &&
        !isNaN(d.hosp_patients) &&
        !isNaN(d.hosp_patients_per_million) &&
        !isNaN(d.weekly_icu_admissions) &&
        !isNaN(d.weekly_icu_admissions_per_million) &&
        !isNaN(d.weekly_hosp_admissions) &&
        !isNaN(d.weekly_hosp_admissions_per_million) &&
        !isNaN(d.total_tests) &&
        !isNaN(d.new_tests) &&
        !isNaN(d.total_tests_per_thousand) &&
        !isNaN(d.new_tests_per_thousand) &&
        !isNaN(d.new_tests_smoothed) &&
        !isNaN(d.new_tests_smoothed_per_thousand) &&
        !isNaN(d.positive_rate) &&
        !isNaN(d.tests_per_case) &&
        !isNaN(d.total_vaccinations) &&
        !isNaN(d.people_vaccinated) &&
        !isNaN(d.people_fully_vaccinated) &&
        !isNaN(d.total_boosters) &&
        !isNaN(d.new_vaccinations) &&
        !isNaN(d.new_vaccinations_smoothed) &&
        !isNaN(d.total_vaccinations_per_hundred) &&
        !isNaN(d.people_vaccinated_per_hundred) &&
        !isNaN(d.people_fully_vaccinated_per_hundred) &&
        !isNaN(d.total_boosters_per_hundred) &&
        !isNaN(d.new_vaccinations_smoothed_per_million) &&
        !isNaN(d.new_people_vaccinated_smoothed) &&
        !isNaN(d.new_people_vaccinated_smoothed_per_hundred) &&
        !isNaN(d.stringency_index) &&
        !isNaN(d.population_density) &&
        !isNaN(d.median_age) &&
        !isNaN(d.aged_65_older) &&
        !isNaN(d.aged_70_older) &&
        !isNaN(d.gdp_per_capita) &&
        !isNaN(d.extreme_poverty) &&
        !isNaN(d.cardiovasc_death_rate) &&
        !isNaN(d.diabetes_prevalence) &&
        !isNaN(d.female_smokers) &&
        !isNaN(d.male_smokers) &&
        !isNaN(d.handwashing_facilities) &&
        !isNaN(d.hospital_beds_per_thousand) &&
        !isNaN(d.life_expectancy) &&
        !isNaN(d.human_development_index) &&
        !isNaN(d.population) &&
        !isNaN(d.excess_mortality_cumulative_absolute) &&
        !isNaN(d.excess_mortality_cumulative) &&
        !isNaN(d.excess_mortality) &&
        !isNaN(d.excess_mortality_cumulative_per_million)
    );
    console.log("Data after Step 1:", data);

    // Step 2: Exclude data except for Asian countries
    data = data.filter((d) => d.continent === "Asia");

    // Step 3: Calculate the rate of vaccinated people
    data.forEach((d) => {
      d.total_vaccinated_rate =
        ((+d.fully_vaccinated + +d.partially_vaccinated) / +d.population) * 100;
      d.fully_vaccinated_rate = (+d.fully_vaccinated / +d.population) * 100;
      d.partially_vaccinated_rate =
        (+d.partially_vaccinated / +d.population) * 100;
    });

    // Step 4: Exclude data where total rate of vaccinated people is over 100%
    data = data.filter((d) => d.total_vaccinated_rate <= 100);

    // Step 5: Exclude all data except the latest data for each country
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

    // Step 6: Sort the data with descending order by total rate of vaccinated people
    data.sort((a, b) => b.total_vaccinated_rate - a.total_vaccinated_rate);

    // Step 7: Extract Top 15 countries
    const processedData = data.slice(0, 15);
    console.log(processedData);

    /*
        -------------------------------------------
        YOUR CODE ENDS HERE
        -------------------------------------------
        */

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
