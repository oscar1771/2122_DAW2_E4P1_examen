const axios = require('axios');

const getAll = async () => {
    return axios.get('https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/all.json')
    
    .then(function (response) {
        return response
    })
    .catch(function (error) {
        // handle error
        console.log(error);
    })
}

const fetchData = async () => {
    try 
    {
        const result = await getAll();
        return result;       
    }
    catch (error)
    {
        console.log(error.message);
    }
}




module.exports = {fetchData};
