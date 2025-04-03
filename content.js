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

        Object.keys(assignments).forEach(category => {
            let weightage = data[category] || 0;
            let scores = assignments[category].map(a => a.percentage);
            let avgPercentage = scores.reduce((a, b) => a + b, 0) / scores.length;
            let contribution = (avgPercentage * weightage) / 100;
            finalScore += contribution;

            let individualScoresHTML = assignments[category]
                .map(a => `<div class="score-container">
                    <span class="score-title">${a.title}</span>: 
                    <span contenteditable="true" class="editable-obtained" data-category="${category}">${a.obtained}</span>
                    / 
                    <span contenteditable="true" class="editable-total" data-category="${category}">${a.total}</span>
                    (<span class="score-percentage">${a.percentage.toFixed(2)}%</span>)
                </div>`)
                .join("");

            table.innerHTML += `<tr>
                <td>${category}</td>
                <td contenteditable="true" class="editable-weightage">${weightage}%</td>
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

        // Make table values dynamic
        document.querySelectorAll(".editable-obtained, .editable-total, .editable-weightage").forEach(cell => {
            cell.addEventListener("input", () => recalculateScores());
        });

        function recalculateScores() {
            let finalScore = 0;

            document.querySelectorAll(".mb-table tr:not(.final-score-row)").forEach(row => {
                let category = row.children[0].innerText.trim();
                let weightageCell = row.children[1];
                let avgScoreCell = row.children[2];
                let contributionCell = row.children[3];
                let scoreContainers = row.children[4].querySelectorAll(".score-container");

                let weightage = parseFloat(weightageCell.innerText.replace('%', '')) || 0;
                
                // Calculate scores based on obtained/total values
                let percentages = [];
                scoreContainers.forEach(container => {
                    let obtainedElement = container.querySelector(".editable-obtained");
                    let totalElement = container.querySelector(".editable-total");
                    let percentageElement = container.querySelector(".score-percentage");
                    
                    let obtained = parseFloat(obtainedElement.innerText) || 0;
                    let total = parseFloat(totalElement.innerText) || 1; // Avoid division by zero
                    
                    let percentage = (obtained / total) * 100;
                    percentageElement.innerText = `${percentage.toFixed(2)}%`;
                    percentages.push(percentage);
                });
                
                let avgScore = percentages.length > 0 ? percentages.reduce((a, b) => a + b, 0) / percentages.length : 0;
                let contribution = (avgScore * weightage) / 100;

                avgScoreCell.innerText = `${avgScore.toFixed(2)}%`;
                contributionCell.innerText = `${contribution.toFixed(2)}%`;
                
                finalScore += contribution;
            });

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