/*
*
* refreshVelocity() Takes an array of github issues and calculates daily and weekly velocity
*
* Arguments:
* - mongoSelector: MongoDb query selector
* - cfgIssues: Minimongo instance
*/
export const refreshVelocity = (issues) => {

    // Isolate closed issues and sort by closedAt (from oldest to most recent)
    const closedIssues = issues
        .filter(issue => issue.closedAt !== null)
        .sort((a, b) => {
            if (a < b) {
                return 1;
            }
            if (a > b) {
                return -1;
            }
            // names must be equal
            return 0;
        });

    // Isolate opened issues and sort by closedAt (from oldest to most recent)
    const openedIssues = issues
        .filter(issue => issue.closedAt === null)
        .sort((a, b) => {
            if (a < b) {
                return 1;
            }
            if (a > b) {
                return -1;
            }
            // names must be equal
            return 0;
        });

    let firstDay = getFirstDay(closedIssues);
    let lastDay = new Date();

    let dataObject = initObject(firstDay, lastDay); // Build an object of all days and weeks between two dates
    dataObject = populateObject(dataObject, closedIssues); // Populate the object with count of days and weeks
    dataObject = populateOpen(dataObject, openedIssues); // Populate remaining issues count and remaining points
    dataObject = populateClosed(dataObject, closedIssues); // Populate closed issues count and points
    dataObject = populateTicketsPerDay(dataObject);
    dataObject = populateTicketsPerWeek(dataObject);

    console.log(dataObject);
    console.log('+++++++++');

    return dataObject;
};

/*
*
* formatDate() Take out hours, minutes and seconds from a date string and return date object
*
* Arguments:
* - dateString: Date string
*/
const formatDate = (dateString) => {
    let day = new Date(dateString);
    day.setUTCHours(0);
    day.setUTCMinutes(0);
    day.setUTCSeconds(0);
    return day
};

/*
*
* getFirstDay() Return the first day from an array of issues (previously sorted)
*
* Arguments:
* - issues: Array of issues
*/
const getFirstDay = (issues) => {
    if (issues.length > 0) {
        let firstDay = formatDate(issues[issues.length-1].closedAt);
        firstDay.setDate(firstDay.getDate() - 1);
        return firstDay
    } else {
        return new Date() - 1;
    }
};

/*
*
* initObject() Initialize an object containing indices for all days between two dates
*
* Arguments:
* - firstDay: first day in the object
* - lastDay: last day in the object
*/
const initObject = (firstDay, lastDay) => {
    let initObject = {days: {}, weeks: {}};
    let currentDate = firstDay;
    while(currentDate < lastDay) {
        currentDate.setDate(currentDate.getDate() + 1);
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
            initObject['days'][currentDate.toJSON().slice(0, 10)] = {
                date: currentDate.toJSON(),
                issues: {count: 0, velocity: 0},
                completion: {
                    issues: {count: 0, velocity: 0},
                }
            };
        }

        let currentMonthDay = currentDate.getDate();
        if (currentDate.getDay() !== 0) {currentMonthDay = currentMonthDay - currentDate.getDay();}
        let currentWeekYear = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentMonthDay );

        if(typeof initObject['weeks'][currentWeekYear] === 'undefined') {
            //console.log(currentWeekYear);
            initObject['weeks'][currentWeekYear] = {
                //weekStart: currentDate.toJSON(),
                weekStart: currentWeekYear.toJSON(),
                completion: {
                    issues: {count: 0, velocity: 0},
                }
            };
        }
    }
    return initObject;
};

/*
*
* calculateAverageVelocity()
*
* Arguments:
* - array:
* - indexValue:
*/
const calculateAverageVelocity = (array, category, indexValue) => {
    return array
        .map(values => values[category][indexValue]['count'])
        .reduce((accumulator, currentValue, currentIndex, array) => {
            accumulator += currentValue;
            if (currentIndex === array.length-1) {
                return accumulator/array.length;
            } else {
                return accumulator
            }
        });
};

/*
*
* populateObject() Populate an object with issues by day and weeks
*
* Arguments:
* - dataObject: Object to populate
* - issues: Array of issues
*/
const populateObject = (dataObject, issues) => {
    issues.forEach((issue) => {
        if (dataObject['days'][issue.closedAt.slice(0, 10)] !== undefined) {
            dataObject['days'][issue.closedAt.slice(0, 10)]['completion']['issues']['count']++;
        }
        if (issue.closedAt !== null) {
            let closedDate = new Date(issue.closedAt);
            let closedMonthDay = closedDate.getDate();
            if (closedDate.getDay() !== 0) {closedMonthDay = closedMonthDay - closedDate.getDay();}
            //let closedWeek = new Date(closedDate.getFullYear(), closedDate.getMonth(), closedDate.getDate() + (closedDate.getDay() == 0?0:7)-closedDate.getDay() ); //TODO - This is incorrect
            let closedWeek = new Date(closedDate.getFullYear(), closedDate.getMonth(), closedMonthDay );
            if (dataObject['weeks'][closedWeek] !== undefined) {
                dataObject['weeks'][closedWeek]['completion']['issues']['count']++;
            }
        }
    });
    return dataObject;
};

/*
*
* populateTicketsPerDay()
*
* Arguments:
* - dataObject:
*/
const populateTicketsPerDay = (dataObject) => {
    let ticketsPerDay = Object.values(dataObject['days']);
    let startIdx = 0;
    ticketsPerDay.map(function(value, idx) {
        if (idx <=20) {startIdx = 0;}
        else {startIdx = idx - 20;}
        if (idx !== 0) {
            let currentWindowIssues = ticketsPerDay.slice(startIdx, idx); // This limits the window or velocity calculation to 20 days (4 weeks).
            ticketsPerDay[idx]['completion']['issues']['velocity'] = calculateAverageVelocity(currentWindowIssues, 'completion', 'issues');
        }
    });
    return {...dataObject, days: ticketsPerDay};
};

/*
*
* populateTicketsPerWeek()
*
* Arguments:
* - dataObject
*/
const populateTicketsPerWeek = (dataObject) => {
//    console.log('populateTicketsPerWeek');
    let completionVelocities = [];
    let remainingIssuesCount = dataObject.open.issues.length;
    let remainingPoints = dataObject.open.issues
        .filter(issue => issue.points !== null)
        .map(issue => issue.points)
        .reduce((acc, points) => acc + points, 0);

    let ticketsPerWeek = Object.values(dataObject['weeks']);
    let defaultVelocity = 'all';
    ticketsPerWeek.map(function(value, idx) {
        let startIdx = 0;
        if (idx <=4) {startIdx = 0;}
        else {startIdx = idx - 4;}
        if (idx !== 0) {
            let currentWindowIssues = ticketsPerWeek.slice(startIdx, idx);
            ticketsPerWeek[idx]['completion']['issues']['velocity'] = calculateAverageVelocity(currentWindowIssues, 'completion', 'issues');
        }
        if (idx == ticketsPerWeek.length-1) {
            //This is the last date of the sprint, calculate velocity on various timeframes
            let currentCompletion = { // All Time
                'range': 'all',
                'completion': {
                    'issues': {'velocity': calculateAverageVelocity(ticketsPerWeek, 'completion', 'issues')},
                }
            };
            currentCompletion['completion']['issues']['effort'] = Math.round(remainingIssuesCount / currentCompletion['completion']['issues']['velocity'] * 5,3); //Multiplies by 5 as per 5 days in work week
            completionVelocities.push(currentCompletion);

            if (idx >= 4) { // 4 weeks
                let currentWindowIssues = ticketsPerWeek.slice(idx-4, idx);
                let currentCompletion = {
                    'range': '4w',
                    'completion': {
                        'issues': {'velocity': calculateAverageVelocity(currentWindowIssues, 'completion', 'issues')},
                    },
                };
                currentCompletion['completion']['issues']['effort'] = Math.round(remainingIssuesCount / currentCompletion['completion']['issues']['velocity'] * 5,3);
                completionVelocities.push(currentCompletion);
                defaultVelocity = '4w';
            }
            if (idx >= 8) { // 8 weeks
                let currentWindowIssues = ticketsPerWeek.slice(idx-8, idx);
                let currentCompletion = {
                    'range': '8w',
                    'completion': {
                        'issues': {'velocity': calculateAverageVelocity(currentWindowIssues, 'completion', 'issues')},
                    }
                };
                currentCompletion['completion']['issues']['effort'] = Math.round(remainingIssuesCount / currentCompletion['completion']['issues']['velocity']*5,3);
                completionVelocities.push(currentCompletion);
            }
            if (idx >= 12) { // 12 weeks
                let currentWindowIssues = ticketsPerWeek.slice(idx-12, idx);
                let currentCompletion = {
                    'range': '12w',
                    'completion': {
                        'issues': {'velocity': calculateAverageVelocity(currentWindowIssues, 'completion', 'issues')},
                    }
                };
                currentCompletion['completion']['issues']['effort'] = Math.round(remainingIssuesCount / currentCompletion['completion']['issues']['velocity']*5,3);
                completionVelocities.push(currentCompletion);
            }
        }
    });
    return {...dataObject, weeks: ticketsPerWeek, velocity: completionVelocities, defaultVelocity: defaultVelocity};
};

/*
 *
 * populateOpen()
 *
 * Arguments:
 * - issues
 */
const populateOpen = (dataObject, openIssues) => {
    const remainingPoints = openIssues
        .filter(issue => issue.points !== null)
        .map(issue => issue.points)
        .reduce((acc, points) => acc + points, 0);
    return {...dataObject, open: {'issues': openIssues, 'points': remainingPoints}};
};

/*
 *
 * populateClosed()
 *
 * Arguments:
 * - issues
 */
const populateClosed = (dataObject, closedIssues) => {
    const completedPoints = closedIssues
        .filter(issue => issue.points !== null)
        .map(issue => issue.points)
        .reduce((acc, points) => acc + points, 0);
    return {...dataObject, closed: {'issues': closedIssues, 'points': completedPoints}};
};
