// Check if a name is already saved in localStorage
function setUserName() {
    let studentName = localStorage.getItem('studentName');

    if (!studentName) {
        studentName = prompt("Please enter your name:");
        if (studentName) {
            localStorage.setItem('studentName', studentName);
        }
    }

    // Update the title with the student's name
    updateTitle(studentName);
}

function updateTitle(name) {
    const trackerTitle = document.getElementById('tracker-title');
    trackerTitle.textContent = `${name}'s Expense Tracker`;
}

// Call the setUserName function when the page loads
setUserName();






let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let total = expenses.reduce((acc, expense) => acc + expense.amount, 0);

// Load the UI with saved data
updateUI();

function addExpense() {
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const time = document.getElementById('expense-time').value;

    if (description && amount && time) {
        const newExpense = { description, amount, time };
        expenses.push(newExpense);
        total += amount;

        // Save to localStorage
        localStorage.setItem('expenses', JSON.stringify(expenses));

        updateUI();
    } else {
        alert('Please enter valid expense details and time.');
    }
}

function updateUI() {
    const expenseList = document.getElementById('expense-list');
    const totalExpense = document.getElementById('total-expense');

    expenseList.innerHTML = '';
    expenses.forEach((expense, index) => {
        expenseList.innerHTML += `<p>${expense.description}: ₹${expense.amount.toFixed(2)} at ${formatTime(expense.time)} <button onclick="deleteExpense(${index})">Delete</button></p>`;
    });

    totalExpense.textContent = `Total: ₹${total.toFixed(2)}`;
}

function deleteExpense(index) {
    const isConfirmed = confirm("Are you sure you want to delete this expense?");
    if (isConfirmed) {
        total -= expenses[index].amount;
        expenses.splice(index, 1);

        // Update localStorage
        localStorage.setItem('expenses', JSON.stringify(expenses));

        updateUI();
    }
}


   

function formatTime(time) {
    const date = new Date(time);
    return date.toLocaleString();
}

function showMonthlyExpenses() {
    const monthlyExpenses = {};
    expenses.forEach(expense => {
        const date = new Date(expense.time);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;

        if (!monthlyExpenses[monthYear]) {
            monthlyExpenses[monthYear] = 0;
        }
        monthlyExpenses[monthYear] += expense.amount;
    });

    const monthlyExpenseList = document.getElementById('monthly-expense-list');
    monthlyExpenseList.innerHTML = '<h3>Monthly Expenses</h3>'; 

    for (const [monthYear, total] of Object.entries(monthlyExpenses)) {
        monthlyExpenseList.innerHTML += `<p>${monthYear}: ₹${total.toFixed(2)}</p>`;
    }
}


function showDetailedMonthlyExpenses() {
    const selectedMonth = document.getElementById('month-select').value;
    if (selectedMonth === "") {
        alert("Please select a month.");
        return;
    }

    const detailedMonthlyExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.time);
        return expenseDate.getMonth() === parseInt(selectedMonth);
    });

    const detailedMonthlyExpenseList = document.getElementById('detailed-monthly-expense-list');
    detailedMonthlyExpenseList.innerHTML = '<h3>Detailed Expenses</h3>';

    if (detailedMonthlyExpenses.length === 0) {
        detailedMonthlyExpenseList.innerHTML += '<p>No expenses found for this month.</p>';
        return;
    }

    detailedMonthlyExpenses.forEach(expense => {
        const expenseDate = new Date(expense.time).toLocaleDateString();
        detailedMonthlyExpenseList.innerHTML += `<p>${expenseDate}: ${expense.description} - ₹${expense.amount.toFixed(2)}</p>`;
    });
}



// download
function downloadData() {
    // Check if there are expenses to download
    if (expenses.length === 0) {
        alert("No data to download.");
        return;
    }

    // Convert the expenses array to CSV format
    const csvContent = "Description,Amount,Time\n" + expenses.map(exp => 
        `${exp.description},${exp.amount},${exp.time}`).join("\n");

    // Create a Blob with the CSV data
    const blob = new Blob([csvContent], { type: 'text/csv' });

    // Create a temporary link element to trigger the download
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "expense_data.csv"; // Name of the downloaded file

    // Trigger the click event to download the file
    link.click();
}



//download in excell

function downloadExcelData() {
    // Check if there are expenses to download
    if (expenses.length === 0) {
        alert("No data to download.");
        return;
    }

    // Prepare the data in a format that SheetJS can work with
    const ws_data = [["Description", "Amount", "Time"]]; // Headers
    expenses.forEach(exp => {
        ws_data.push([exp.description, exp.amount, exp.time]); // Data rows
    });

    // Create a worksheet from the data
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Create a new workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");

    // Trigger the download of the workbook as an .xlsx file
    XLSX.writeFile(wb, "expense_data.xlsx");
}
