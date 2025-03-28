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

    // ✅ Extract assignments and their corresponding marks
    document.querySelectorAll(".fusion-card-item").forEach(item => {
        let titleElement = item.querySelector(".title a");
        let title = titleElement ? titleElement.innerText.trim() : "Unknown";

        // Extract all labels from the assignment
        let labels = Array.from(item.querySelectorAll(".labels-set .label")).map(label => label.innerText.trim());
        
        // Find the first label that matches a category in data
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
            assignments[category].push(percentage);
        }
    });

    let contentWrapper = document.querySelector(".content-wrapper");
    if (contentWrapper) {
        let existingTable = document.querySelector(".mb-table");
        if (existingTable) existingTable.remove(); // Prevent duplicate tables

        let table = document.createElement("table");
        table.className = "mb-table"; // Apply ManageBac-like styles
        table.innerHTML = `<tr>
            <th>Category</th>
            <th>Weightage</th>
            <th>Average Score (%)</th>
            <th>Weightage Contribution</th>
        </tr>`;
        
        let finalScore = 0;
        Object.keys(assignments).forEach(category => {
            let weightage = data[category] || 0;
            let avgPercentage = assignments[category].reduce((a, b) => a + b, 0) / assignments[category].length;
            let contribution = (avgPercentage * weightage) / 100;
            finalScore += contribution;
            
            table.innerHTML += `<tr>
                <td>${category}</td>
                <td>${weightage}%</td>
                <td>${avgPercentage.toFixed(2)}%</td>
                <td>${contribution.toFixed(2)}%</td>
            </tr>`;
        });

        table.innerHTML += `<tr class="final-score-row">
            <td colspan="3"><strong>Final Score</strong></td>
            <td><strong>${finalScore.toFixed(2)}%</strong></td>
        </tr>`;

        contentWrapper.appendChild(table);

        // ✅ Inject ManageBac-Like Styles
        let style = document.createElement("style");
        style.innerHTML = `
            .mb-table {
                width: 100%;
                border-collapse: collapse;
                background: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .mb-table th, .mb-table td {
                padding: 12px 15px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            .mb-table th {
                background: #F8FAFC;
                color: #4A5568;
                font-weight: 600;
            }
            .mb-badge {
                display: inline-block;
                padding: 5px 10px;
                border-radius: 20px;
                background: #E2E8F0;
                color: #2D3748;
                font-size: 0.9rem;
            }
            .mb-table{
                font-size: 1.5rem !important;
                margin-bottom:30px !important;
            }
            .final-score-row {
                background: #EDF2F7;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);
    }
}
runScript()
