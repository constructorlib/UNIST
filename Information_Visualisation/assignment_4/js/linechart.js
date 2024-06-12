class lineChart {

    constructor() {
        this.data = null;
    }

    initData(data) {
        try {
            // [Your Code Here]
            // Filter the data for the line chart
            var filteredData = data.filter(d => {
                return d.total_cases && d.date && d.location;
            });

            // Parse data into D3 time format
            filteredData = filteredData.map(d => {
                return {
                    location: d.location,
                    date: d3.timeParse("%Y-%m-%d")(d.date),
                    total_cases: Number(d.total_cases)
                };
            });

            // Save the data
            this.data = filteredData;

            // Draw the initial line chart for Afghanistan
            this.drawLineChart('Afghanistan');
        }
        catch (error) {
            console.error(error);
        };
    }

    // [Your Code Here]
    // Implement drawing line chart of selected country
    drawLineChart(selectedCountry) {
        // Filter data for the selected country
        var countryData = this.data.filter(d => d.location === selectedCountry);

        // Define the margins and dimensions
        const margin = { top: 10, right: 30, bottom: 50, left: 120 },
            width = 1800 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // Remove any existing svg to redraw
        d3.select("#linechart").select("svg").remove();

        // Create the svg element
        const svg = d3.select("#linechart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Set up the scales
        const xScale = d3.scaleTime().domain(d3.extent(countryData, d => d.date)).range([0, width]);
        const yScale = d3.scaleLinear().domain([0, d3.max(countryData, d => d.total_cases)]).range([height, 0]);

        // Define the line
        const line = d3.line()
            .x(d => xScale(d.date))
            .y(d => yScale(d.total_cases));

        // Draw the line
        svg.append("path")
            .datum(countryData)
            .attr("fill", "none")
            .attr("stroke", "#8bc3a1")
            .attr("stroke-width", 2)
            .attr("d", line);

        // Add the X Axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale));

        // Add the Y Axis
        svg.append("g")
            .call(d3.axisLeft(yScale));

        // Add X axis label
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + 40)
            .attr("font-size", 17)
            .text("Date");

        // Add Y axis label
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", 0)
            .attr("y", -60)
            .attr("font-size", 17)
            .text("Total Cases")
            .attr("transform", "rotate(-90)");

        // Add Legend
        svg.append("circle")
            .attr("cx", 20)
            .attr("cy", 10)
            .attr("r", 6)
            .style("fill", "#8bc3a1");

        svg.append("text")
            .attr("x", 30)
            .attr("y", 10)
            .attr("alignment-baseline", "middle")
            .text(selectedCountry)
            .attr("font-size", 17)
            .style("fill", "black");
    }

    // [Your Code Here]
    // Implement deleting preveious line chart & re-drawing line chart of selected country
    manageLineChart(selectedCountry) {
        this.drawLineChart(selectedCountry);
    }

}