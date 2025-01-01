module.exports = {
    networks: {
        development: {
            host: "127.0.0.1",
            port: 8545, // Default Ganache port
            network_id: "*", // Match any network id
        },
        develop: {
            port: 8545,
        },
    },
    compilers: {
        solc: {
            version: "0.8.4", // Specify Solidity version
        },
    },
};
