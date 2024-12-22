const os = require('os')

const getLocalIPAddress = ()=>{
    //this function returns the current ip address of the system
    const network = os.networkInterfaces();

    for(const interfaceName in network){
        const interfaces = network[interfaceName];
        for(const networkInterface of interfaces){
            if(networkInterface.family === 'IPv4'){
                return networkInterface.address;
            }
        }
    }

    return "IP Address not found :("
}

module.exports = getLocalIPAddress;