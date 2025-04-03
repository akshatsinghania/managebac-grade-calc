function runScript() {
    let data = {};
    let assignments = {};

    // Extract category weightage
    document.querySelectorAll("#categories-table .list-item").forEach(item => {
        let category = item.querySelector(".label")?.innerText.trim();
        let weightText = item.querySelector(".cell:last-child")?.innerText.trim();

        if (category && weightText) {
            data[category] = parseFloat(weightText.replace('%', ''));
        }
    });

    // Extract assignments and their corresponding marks
    document.querySelectorAll(".fusion-card-item").forEach(item => {
        let titleElement = item.querySelector(".title a");
        let title = titleElement ? titleElement.innerText.trim() : "Unknown";

        let labels = Array.from(item.querySelectorAll(".labels-set .label")).map(label => label.innerText.trim());
        let category = labels.find(label => data.hasOwnProperty(label)) || "Unknown";

        let scoreElement = item.querySelector(".points");
        let scoreText = scoreElement ? scoreElement.innerText.trim() : "Not Graded";

        let score = scoreText.match(/(\d+)\s*\/\s*(\d+)/);
        if (score) {
            let obtained = parseFloat(score[1]);
            let total = parseFloat(score[2]);
            let percentage = (obtained / total) * 100;

            if (!assignments[category]) {
                assignments[category] = [];
            }
            assignments[category].push({ title, obtained, total, percentage });
        }
    });

    let contentWrapper = document.querySelector(".content-wrapper");
    if (contentWrapper) {
        let existingTable = document.querySelector(".mb-table");
        if (existingTable) existingTable.remove(); // Prevent duplicate tables

        // Create a custom data structure to track values
        const gradeData = {};
        Object.keys(assignments).forEach(category => {
            gradeData[category] = {
                weightage: data[category] || 0,
                assignments: assignments[category].map(a => ({
                    title: a.title,
                    obtained: a.obtained,
                    total: a.total,
                    percentage: a.percentage
                }))
            };
        });

        let table = document.createElement("table");
        table.className = "mb-table";
        table.innerHTML = `<tr>
            <th>Category</th>
            <th>Weightage</th>
            <th>Average Score (%)</th>
            <th>Weightage Contribution</th>
            <th>Individual Scores</th>
        </tr>`;

        let finalScore = 0;

        Object.keys(gradeData).forEach(category => {
            let categoryData = gradeData[category];
            let weightage = categoryData.weightage;
            let scores = categoryData.assignments.map(a => a.percentage);
            let avgPercentage = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
            let contribution = (avgPercentage * weightage) / 100;
            finalScore += contribution;

            let individualScoresHTML = categoryData.assignments
                .map((a, index) => `<div class="score-container">
                    <span class="score-title">${a.title}</span>: 
                    <span contenteditable="true" class="editable-obtained" data-category="${category}" data-index="${index}">${a.obtained}</span>
                    / 
                    <span contenteditable="true" class="editable-total" data-category="${category}" data-index="${index}">${a.total}</span>
                    (<span class="score-percentage">${a.percentage.toFixed(2)}%</span>)
                </div>`)
                .join("");

            table.innerHTML += `<tr>
                <td>${category}</td>
                <td contenteditable="true" class="editable-weightage" data-category="${category}">${weightage}%</td>
                <td class="average-score">${avgPercentage.toFixed(2)}%</td>
                <td class="contribution">${contribution.toFixed(2)}%</td>
                <td>${individualScoresHTML}</td>
            </tr>`;
        });

        table.innerHTML += `<tr class="final-score-row">
            <td colspan="3"><strong>Final Score</strong></td>
            <td colspan="2"><strong id="final-score">${finalScore.toFixed(2)}%</strong></td>
        </tr>`;

        contentWrapper.appendChild(table);

        // Handle editing of values
        document.querySelectorAll(".editable-obtained").forEach(cell => {
            cell.addEventListener("blur", function() {
                const category = this.dataset.category;
                const index = parseInt(this.dataset.index);
                const value = parseFloat(this.innerText) || 0;
                
                // Update our data structure
                gradeData[category].assignments[index].obtained = value;
                gradeData[category].assignments[index].percentage = 
                    (value / gradeData[category].assignments[index].total) * 100;
                
                // Recalculate everything
                updateDisplay();
            });
        });

        document.querySelectorAll(".editable-total").forEach(cell => {
            cell.addEventListener("blur", function() {
                const category = this.dataset.category;
                const index = parseInt(this.dataset.index);
                const value = parseFloat(this.innerText) || 1; // Avoid division by zero
                
                // Update our data structure
                gradeData[category].assignments[index].total = value;
                gradeData[category].assignments[index].percentage = 
                    (gradeData[category].assignments[index].obtained / value) * 100;
                
                // Recalculate everything
                updateDisplay();
            });
        });

        document.querySelectorAll(".editable-weightage").forEach(cell => {
            cell.addEventListener("blur", function() {
                const category = this.dataset.category;
                const value = parseFloat(this.innerText.replace('%', '')) || 0;
                
                // Update our data structure
                gradeData[category].weightage = value;
                
                // Recalculate everything
                updateDisplay();
            });
        });

        function updateDisplay() {
            let finalScore = 0;

            Object.keys(gradeData).forEach(category => {
                const categoryData = gradeData[category];
                const scores = categoryData.assignments.map(a => a.percentage);
                const avgPercentage = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
                const contribution = (avgPercentage * categoryData.weightage) / 100;
                
                finalScore += contribution;

                // Update UI
                const rows = Array.from(document.querySelectorAll(".mb-table tr:not(:first-child):not(.final-score-row)"));
                const row = rows.find(r => r.cells[0].innerText.trim() === category);
                
                if (row) {
                    // Update average score and contribution
                    row.cells[2].innerText = `${avgPercentage.toFixed(2)}%`;
                    row.cells[3].innerText = `${contribution.toFixed(2)}%`;
                    
                    // Update percentage displays for each assignment
                    const percentageElements = row.querySelectorAll(".score-percentage");
                    categoryData.assignments.forEach((assignment, idx) => {
                        if (percentageElements[idx]) {
                            percentageElements[idx].innerText = `${assignment.percentage.toFixed(2)}%`;
                        }
                    });
                }
            });

            // Update final score
            document.getElementById("final-score").innerText = `${finalScore.toFixed(2)}%`;
        }

        // Inject ManageBac-Like Styles
        let style = document.createElement("style");
        style.innerHTML = `
            .mb-table {
                width: 100%;
                border-collapse: collapse;
                background: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                margin-top: 20px;
            }
            .mb-table th, .mb-table td {
                padding: 12px 15px;
                text-align: left;
                border-bottom: 1px solid #ddd;
                vertical-align: top;
            }
            .mb-table th {
                background: #F8FAFC;
                color: #4A5568;
                font-weight: 600;
            }
            .score-container {
                margin-bottom: 8px;
                padding: 4px;
                background-color: #f8f9fa;
                border-radius: 4px;
            }
            .score-title {
                font-weight: 500;
                margin-right: 4px;
            }
            .editable-obtained, .editable-total, .editable-weightage {
                cursor: text;
                background-color: #edf2f7;
                border-radius: 4px;
                padding: 2px 4px;
                display: inline-block;
                min-width: 30px;
            }
            .editable-obtained:focus, .editable-total:focus, .editable-weightage:focus {
                outline: 2px solid #4299E1;
                background-color: #ffffff;
            }
            .final-score-row {
                background: #EDF2F7;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);
    }
}
runScript();