/*
*
* getRepoNames() Returns an array of repository names
*
* Arguments:
* - issues: Array of issues
*/
export const getRepoNames = (issues) => {
    console.log(issues);
    /* Quick and dirty way to obtaining all uniques repository names */
    let repoNames = {};
    for (let i=0; i < issues.length; i++) {
        let repoName = issues[i].repo.name;
        repoNames[repoName] = true;
    };
    return Object.keys(repoNames);
};

