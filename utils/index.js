module.exports = {

    // i didn't use this 
    searchTextForKeywords: function (text, keywords) { 
        return keywords.some(keyword => text.includes(keyword))
    },

    // probably a better way to do this  
    getFilteredBio: async function(data, keywords) { 
        let dataCopy = await data.filter(element => searchTextForKeywords(element.bio, keywords) === true);
        return dataCopy;
    },

    getFilteredLocation: async function(data, keywords) { 
        let dataCopy = await data.filter(element => searchTextForKeywords(element.location, keywords) === true);
        return dataCopy;
    },

    // convert an array of objects to a csv-formatted string
    arrayOfObjectsToCSV: function(arr) {
        const csvString = [
            [
            'Name',
            'Email',
            'Username',
            'Company',
            'Location',
            'Bio',
            ],
            ...arr.map(e => [
            e.name.replaceAll(',', ''),
            e.email,
            e.username,
            e.company.replaceAll(',', ';'),
            e.location.replaceAll(',', ''),
            e.bio.replaceAll('\n', '').replaceAll(',', ';')
            ])
        ].map((item) => item.join(',')).join('\n');
        return csvString;
    },

    getHrefFromAnchor: async function(context, selector) { 
        const queryResponse = await context.$(selector);
        if (!queryResponse) { 
            return null;
        }
        const hrefObject = await queryResponse.getProperty("href");
        const url = await hrefObject.jsonValue();
        return new Promise((resolve, reject) => { 
            if (!url) { 
                reject(new Error("can't get an href!"))
            }
            resolve(url)
        })
    
    },

    calculateWeightedCandidateScore: function(candidate) { 

    }
};
