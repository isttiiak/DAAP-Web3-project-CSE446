const PatientManagementSystem = artifacts.require("PatientManagementSystem");

module.exports = function (deployer) {
    deployer.deploy(PatientManagementSystem);
};
