(function() {
    let data = {};
    let assignments = {};
    
    // Extract category weightage
    document.querySelectorAll("#categories-table .list-item").forEach(item => {
        let category = item.querySelector(".label")?.innerText.trim();
        let weight = item.querySelector(".cell:last-child")?.innerText.trim();
        
        if (category && weight) {
            data[category] = parseFloat(weight.replace('%', ''));
        }
    });

    // Extract assignments and their corresponding marks
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
            assignments[title] = { category, percentage };
        }
    });

    let contentWrapper = document.querySelector(".content-wrapper");
    if (contentWrapper) {
        let table = document.createElement("table");
        table.style.border = "1px solid black";
        table.style.width = "100%";
        table.innerHTML = `<tr>
            <th>Assignment Name</th>
            <th>Category</th>
            <th>Weightage</th>
            <th>Points Scored (%)</th>
            <th>Weightage Contribution</th>
        </tr>`;
        
        let finalScore = 0;
        Object.keys(assignments).forEach(title => {
            let { category, percentage } = assignments[title];
            let weightage = data[category] || 0;
            let contribution = (percentage * weightage) / 100;
            finalScore += contribution;
            
            table.innerHTML += `<tr>
                <td>${title}</td>
                <td>${category}</td>
                <td>${weightage}%</td>
                <td>${percentage.toFixed(2)}%</td>
                <td>${contribution.toFixed(2)}%</td>
            </tr>`;
        });

        table.innerHTML += `<tr><td colspan="4"><strong>Final Score</strong></td><td><strong>${finalScore.toFixed(2)}%</strong></td></tr>`;

        contentWrapper.appendChild(table);
    }
})();
