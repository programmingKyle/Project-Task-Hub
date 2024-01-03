async function getLast12Months() {
    var currentDate = new Date();
    var last12Months = [];
  
    // Loop to get the last 12 months including the current month
    for (var i = 0; i < 13; i++) {
      // Format the current date as "yyyy-mm"
      var formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
      
      // Add the formatted date to the array if it's not already present
      if (!last12Months.includes(formattedDate)) {
        last12Months.unshift(formattedDate);
      }
  
      // Move to the previous month
      currentDate.setMonth(currentDate.getMonth() - 1);
    }
    return last12Months;
}

async function getLast12MonthsHours(last12Months){
    var last12MonthHours = [];
    for (const formattedDate of last12Months){
      const monthsHours = await api.getTimeHandle({ requestTime: 'Month', month: formattedDate });
      last12MonthHours.push(monthsHours);
    }
    return last12MonthHours;
}

function getCurrentMonth() {
    const months = [
      'January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ];
  
    const currentDate = new Date();
    const monthIndex = currentDate.getMonth();
    const monthName = months[monthIndex];
  
    return monthName;
}

async function convertToMonthLabels(last12Months) {
    monthLabels = [];
    for (const yearMonth of last12Months) {
      const fullDate = new Date(yearMonth + "-01");
      const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(fullDate);
  
      monthLabels.push(monthLabel);
    }
  
    return monthLabels;
  }
  
  

let annualBarGraph; // Declare the chart variable outside the function

async function plotAnnualBarGraph(last12Months, last12MonthHours) {
    const currentMonth = getCurrentMonth();
    if (!annualBarGraph) {
      // If the chart doesn't exist, create a new one
      annualBarGraph = new Chart("annualBarGraph", {
        type: "bar",
        data: {
          labels: last12Months,
          datasets: [{
            backgroundColor: last12Months.map(month => (month === currentMonth) ? '#F1F1F1' : '#9593D9'),
            data: last12MonthHours,
          }]
        },
        options: {
          legend: { display: false },
          responsive: true, // Make the chart responsive
          maintainAspectRatio: false, // Allow the aspect ratio to change
          scales: {
            yAxes: [{
              gridLines: {
                display: false,
              },
              ticks: {
                beginAtZero: true,
                display: true,
                fontColor: '#9593D9',
                stepSize: 1,
              }
            }],
            xAxes: [{
              gridLines: {
                display: false
              },
              ticks: {
                display: true,
                fontColor: '#9593D9',
                callback: function (value, index, values) {
                  return value.substring(0, 3);
                },
                maxRotation: 0,              
              },
              barPercentage: 0.8,              
            }]
          }
        }
      });
    } else {
      // If the chart exists, update its data
      annualBarGraph.data.labels = last12Months;
      annualBarGraph.data.datasets[0].data = last12MonthHours;
      annualBarGraph.update(); // Update the chart
    }
}

async function grabCurrentDate(){
    const currentDate = new Date();
    var  date = currentDate.toLocaleDateString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
    var year = date.split('/')[2];
    var month = date.split('/')[0].padStart(2, '0');
    var day = date.split('/')[1].padStart(2, '0');
    date = `${year}-${month}-${day}`;
    return date;
}
 

let monthlyLineGraph; // Declare the chart variable outside the function

async function plotMonthlyLineGraph(last30Days, last30DayCompletedTasks) {
    const today = await grabCurrentDate();
    if (!monthlyLineGraph) {
      // If the chart doesn't exist, create a new one
      monthlyLineGraph = new Chart("monthlyLineGraph", {
        type: "bar",
        data: {
          labels: last30Days,
          datasets: [{
            backgroundColor: last30Days.map(date => (date === today) ? '#F1F1F1' : '#9593D9'),
            data: last30DayCompletedTasks,
          }]
        },
        options: {
          legend: { display: false },
          responsive: true, // Make the chart responsive
          maintainAspectRatio: false, // Allow the aspect ratio to change
          scales: {
            yAxes: [{
              gridLines: {
                display: false,
              },
              ticks: {
                beginAtZero: true,
                display: true,
                fontColor: '#9593D9',
                stepSize: 1,
              }
            }],
            xAxes: [{
              gridLines: {
                display: false
              },
              ticks: {
                display: false
              }
            }]
          }
        }
      });
    } else {
      // If the chart exists, update its data
      monthlyLineGraph.data.labels = last30DayCompletedTasks;
      monthlyLineGraph.data.datasets[0].data = last30DayCompletedTasks;
      monthlyLineGraph.update(); // Update the chart
    }
}



async function getLast30Days() {
    var currentDate = new Date();
    var last30Days = [];
  
    // Loop to get the last 30 dates
    for (var i = 0; i < 30; i++) {
      // Format the current date as "yyyy-mm-dd" in the local time zone
      var formattedDate = currentDate.toLocaleDateString('en-US', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone });
      
      // Extract year, month, and day components
      var year = formattedDate.split('/')[2];
      var month = formattedDate.split('/')[0].padStart(2, '0');
      var day = formattedDate.split('/')[1].padStart(2, '0');
      
      // Form the date string as "yyyy-mm-dd"
      formattedDate = `${year}-${month}-${day}`;
  
      // Add the formatted date to the array
      last30Days.push(formattedDate);
  
      // Move to the previous day
      currentDate.setDate(currentDate.getDate() - 1);
    }
    return last30Days; // Reverse the array to get dates in descending order
}
  








  
document.addEventListener('DOMContentLoaded', async () => {
    var last12Months = await getLast12Months();
    var last12MonthsTaskCount = await api.graphCounts({request: 'MonthlyCompleteTaskCount', months: last12Months});
    var monthLabels = await convertToMonthLabels(last12Months);
    last12MonthsTaskCount.reverse();
    monthLabels.reverse();
    await plotAnnualBarGraph(monthLabels, last12MonthsTaskCount);

    var last30Days = await getLast30Days();
    var last30DaysTaskCount = await api.graphCounts({request: 'DailyCompleteTaskCount', days: last30Days});
    await plotMonthlyLineGraph(last30Days, last30DaysTaskCount);
});




/*
async function measureExecutionTime(callback) {
    const startTime = performance.now();
    callback();
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`Execution time: ${duration} milliseconds`);
}

// example:

await measureExecutionTime(async () => {
    var last12MonthsTaskCount = await api.graphCounts({request: 'MonthlyTaskCount', months: last12Months});
    console.log(last12MonthsTaskCount);
});
*/