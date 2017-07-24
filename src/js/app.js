"use strict"

var historyChart = null;
var realTimeChart = null;

var minX = 0;
var maxX = 500;
var Span = 10;
var cache = 100;

function fitToContainer(canvas){
  canvas.style.width='100%';
  canvas.style.height='100%';
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function UpdateRealTimeChart()
{
    realTimeChart.options.scales.xAxes[0].ticks.min = realTimeChart.options.scales.xAxes[0].ticks.min + 1;
    var latest = realTimeChart.options.scales.xAxes[0].ticks.max = realTimeChart.options.scales.xAxes[0].ticks.max + 1;

    var opts = {
        method: 'GET',
        nocache: true,
        url: 'numeric?min=' + latest + '&max=' + (latest+1)
    }
    var request = new PAjaxRequest(opts).Send().then(function(msg){
        var data = JSON.parse(msg);
        var v = data[0];
        realTimeChart.data.datasets[0].data.splice(0, 1);
        realTimeChart.data.datasets[0].data.push(v);
        realTimeChart.update();
    }).catch(function(reason){
        console.error("Getting data error");
        console.error(reason);
    });

    setTimeout(function(){
        UpdateRealTimeChart();
    }, 2000);
}

var actualMinX = maxX - cache;
var actualMaxX = maxX;
var alreadyLoading = false;
//var latestMinShown = maxX - Span + 1;
//var latestMaxShown = maxX;

function afterUpdateHIstory(minShown, maxShown)
{
    /*if (!historyChart)
        return;

    historyChart.config.options.pan.rangeMin.x = actualMinX;
    historyChart.config.options.pan.rangeMax.x = actualMaxX;
    
    latestMinShown = minShown;
	latestMaxShown = maxShown;*/
}

function UpdateHistoryOnPan(minShown, maxShown)
{
    if (!historyChart)
        return;

    //console.log ("Diff " + ((minShown - latestMinShown) > 1 ? true : false));

    let distanceLeft = Math.abs(minShown - actualMinX);
	let distanceRight = Math.abs(maxShown - actualMaxX);

	//near left data
    if (distanceLeft < cache/2 && actualMinX > minX)
    {
        //maxShown+cache < maxX -> don't load near end of axes if I have values

        if (alreadyLoading)
        {
            console.log("Already loading new data");
            return;
        }

        console.log("Near left ... load older data");
        console.log("Loading new values from " + (Math.floor(minShown)-1-cache) + ", to " + Math.floor(maxShown+cache));

        var opts = {
            method: 'GET',
            nocache: true,
            url: 'numeric?min=' + (Math.floor(minShown-1-cache)) + '&max=' + Math.floor(maxShown+cache)
        }
        alreadyLoading = true;
        var request = new PAjaxRequest(opts).Send().then(function(msg){
            var data = JSON.parse(msg);
            if (data.length > 0)
            {
                historyChart.data.datasets[0].data = data;
                actualMinX = data[0].x;
				actualMaxX = data[data.length-1].x;
                historyChart.update();
            }
            alreadyLoading = false;
        }).catch(function(reason){
            console.error("Getting data error");
            console.error(reason);
            alreadyLoading = false;
        });
    }
	else if (distanceRight < cache /2 && actualMaxX < maxX)
	{
        //maxShown+cache < maxX -> don't load near end of axes if I have values

        if (alreadyLoading)
        {
            console.log("Already loading new data");
            return;
        }

        console.log("Near right ... load newer data");
        console.log("Loading new values from " + (Math.floor(minShown)-1-cache) + ", to " + Math.floor(maxShown+cache));

        var opts = {
            method: 'GET',
            nocache: true,
            url: 'numeric?min=' + (Math.floor(minShown-1-cache)) + '&max=' + Math.floor(maxShown+cache)
        }
        alreadyLoading = true;
        var request = new PAjaxRequest(opts).Send().then(function(msg){
            var data = JSON.parse(msg);
            if (data.length > 0)
            {
                historyChart.data.datasets[0].data = data;
                actualMinX = data[0].x;
				actualMaxX = data[data.length-1].x;
                historyChart.update();
            }
            alreadyLoading = false;
        }).catch(function(reason){
            console.error("Getting data error");
            console.error(reason);
            alreadyLoading = false;
        });
	}
	else
	{}
}

function InitApp()
{
    var dataHistory = {
        datasets: [
            {
                label: "History chart numbers",
                data: []
            }
        ]
    };

    var dataRealTime = {
        datasets: [
            {
                label: "Real Time chart numbers",
                backgroundColor: "rgba(220,0,0,0.2)",
                borderColor: "rgba(150,0,0,1)",
                pointHoverBackgroundColor: "rgba(255,0,0,1)",
                pointBorderColor: "rgba(255,0,0,0.8)",
                pointBackgroundColor: "rgba(255,0,0,0.8)",
                data: []
            }
        ]
    };

    for (var i = maxX-Span; i <= maxX; i++)
    {
        dataRealTime.datasets[0].data.push({x:i, y: 0});
    }

    var confH = { 
		type: 'line',
		data: null,
		options: {
            animation: {
                duration: 50
            },
			scales: {
			//responsive: true,
			xAxes: [{
                type: 'linear',
                position: 'bottom',
				scaleLabel: {
					display: true,
					labelString: 'X'
				},
				ticks: {
					maxRotation: 0,
                    stepSize: 1,
                    beginAtZero: true,
                    min: maxX-Span+1,
                    max: maxX
				},
				beforeUpdate: function(evt) {
                    UpdateHistoryOnPan(evt.min, evt.max);
                },
                afterUpdate: function(evt) {
                    afterUpdateHIstory(evt.min, evt.max);
                }
            }],
			yAxes: [{
			    type: 'linear',
                position: 'left',
				scaleLabel: {
					display: true,
					labelString: 'Y'
				},
				ticks: {
					maxRotation: 90,
                    stepSize: 1,
					beginAtZero: true
				}
			}]
        },
		zoom: {
			enabled: true,
			mode: 'x',
			limits: {
				max: 2,
				min: 1
			}
		},
		pan: {
			enabled: true,
            mode: 'x',
            rangeMax: {
                x: maxX
            },
            rangeMin: {
                x: minX
            }
		}
		}
    };

    var confR = { 
		type: 'line',
		data: null,
		options: {
			scales: {
			//responsive: true,
			xAxes: [{
                type: 'linear',
                position: 'bottom',
				scaleLabel: {
					display: true,
					labelString: 'X'
				},
				ticks: {
					maxRotation: 0,
                    stepSize: 1,
                    beginAtZero: true,
                    min: maxX-Span+1,
                    max: maxX
				},
				afterUpdate: function(evt) {
					//console.log("after update scale x: min " + evt.min + ", max " + evt.max);
				}
            }],
			yAxes: [{
			    type: 'linear',
                position: 'left',
				scaleLabel: {
					display: true,
					labelString: 'Y'
				},
				ticks: {
					maxRotation: 90,
                    stepSize: 1,
					beginAtZero: true
				}
			}]
            }
		}
    };
    
    fitToContainer(document.getElementById("historyChart"));
    var ctx = document.getElementById("historyChart").getContext("2d");
    confH.data = dataHistory;
    historyChart = new Chart(ctx, confH);

    confR.data = dataRealTime;
    fitToContainer(document.getElementById("realTimeChart"));
    var ctx = document.getElementById("realTimeChart").getContext("2d");
    realTimeChart = new Chart(ctx, confR);

    //UpdateRealTimeChart();

    var opts = {
        method: 'GET',
        nocache: true,
        url: 'numeric?min='+(maxX-cache)+'&max='+maxX
    }
    var request = new PAjaxRequest(opts).Send().then(function(msg){
        var data = JSON.parse(msg);
        historyChart.data.datasets[0].data = data;
        historyChart.update();
    }).catch(function(reason){
        console.error("Getting data error");
        console.error(reason);
    });
}