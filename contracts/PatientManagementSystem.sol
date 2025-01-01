// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract PatientManagementSystem {
    enum VaccineStatus { NotVaccinated, OneDose, TwoDose }
    
    struct Patient {
        uint id;
        address patientAddress;
        uint age;
        string gender;
        string district;
        string symptomsDetails;
        bool isDead;
        VaccineStatus vaccineStatus;
    }

    struct Doctor {
        uint id;
        address doctorAddress;
        string name;
        bool[] availableSlots;
    }

    struct Admin {
        uint id;
        string name;
    }

    struct SlotDetail {
        uint doctorId;
        uint patientId;
        uint slot;
    }


    mapping(uint => Patient) public patients;
    mapping(uint => Doctor) public doctors;
    mapping(uint => Admin) public admins;

    mapping(uint => bool) public registeredPatientIDs;
    mapping(address => bool) public registeredPatientAddresses;
    mapping(uint => bool) public registeredDoctorIDs;
    mapping(address => bool) public doctorAddresses;
    mapping(uint => bool) public registeredAdminIDs;
    mapping(address => bool) public registeredAdminAddresses;

    mapping(uint => SlotDetail[]) public bookings;

    uint[] public allPatientIDs; 
    uint[] public allDoctorIDs;  
    
    uint public totalPatients;
    uint public totalDoctors;
    uint public totalAdmins;

    address public admin;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action.");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerPatient(address _addr, uint _id, uint _age, string memory _gender, string memory _district, string memory _symptomsDetails) public {
        require(!registeredPatientIDs[_id], "Patient ID already registered.");
        require(!registeredPatientAddresses[_addr], "This address has already registered as patient.");
        
        patients[_id] = Patient(_id, _addr, _age, _gender, _district, _symptomsDetails, false, VaccineStatus.NotVaccinated);
        registeredPatientIDs[_id] = true;
        registeredPatientAddresses[_addr] = true;
        allPatientIDs.push(_id);
        totalPatients++;
    }

    function registerDoctor(address _addr, uint _id, string memory _name) public onlyAdmin {
        require(!registeredDoctorIDs[_id], "Doctor ID already registered");
        require(!doctorAddresses[_addr], "This address has already registered as doctor.");
        
        Doctor storage doc = doctors[_id];
        doc.id = _id;
        doc.doctorAddress = _addr;
        doc.name = _name;
        doc.availableSlots = new bool[] (24) ;
        for (uint i = 0; i < 24; i++) {
            doc.availableSlots[i] = true;
        }
        
        doctorAddresses[_addr] = true;
        registeredDoctorIDs[_id] = true;
        allDoctorIDs.push(_id);
        totalDoctors++;
    }

    function registerAdmin(address _addr, uint _id, string memory _name) public onlyAdmin {
        require(!registeredAdminIDs[_id], "Admin ID already registered.");
        require(!registeredAdminAddresses[_addr], "This address has already registered as an admin.");
        
        admins[_id] = Admin(_id, _name);
        registeredAdminIDs[_id] = true;
        registeredAdminAddresses[_addr] = true;
        totalAdmins++;
    }

    function updatePatientInfo(uint patientId, VaccineStatus newVaccineStatus, bool isDead) public onlyAdmin {
        require(registeredPatientIDs[patientId], "Patient not registered."); 
        require(!patients[patientId].isDead, "Cannot update information for deceased patients.");

        patients[patientId].vaccineStatus = newVaccineStatus;
        if (isDead) { 
            patients[patientId].isDead = isDead;
        }
    }
    
    function bookAppointment(uint _doctorId, uint _slot, uint _patientId) public payable {
        require(doctors[_doctorId].id != 0, "Doctor not registered.");
        require(_slot < 24 && _slot >= 0, "Invalid slot.");
        require(patients[_patientId].id != 0, "Patient not registered.");
        require(msg.value == 1 ether, "1 ether required to book the appointment");
        
        for (uint i = 0; i < bookings[_doctorId].length; i++) {
            require(!(bookings[_doctorId][i].slot == _slot), "Slot already booked.");
        }

        SlotDetail memory newBooking = SlotDetail({
            doctorId: _doctorId,
            patientId: _patientId,
            slot: _slot
        });
        bookings[_doctorId].push(newBooking);
    }

    function checkAppointmentSchedule(uint doctorId) public view returns (bool[] memory) {
        require(registeredDoctorIDs[doctorId], "Doctor not registered.");
        return doctors[doctorId].availableSlots;
    }

    function getPatientDetails(uint patientId) public view returns (Patient memory) {
        require(registeredPatientIDs[patientId], "Patient not registered.");
        return patients[patientId];
    }

    function getDoctorDetails(uint doctorId) public view returns (Doctor memory) {
        require(registeredDoctorIDs[doctorId], "Doctor not registered.");
        return doctors[doctorId];
    }

    function getAllPatients() public view returns (Patient[] memory) {
        Patient[] memory all = new Patient[](allPatientIDs.length);
        for (uint i = 0; i < allPatientIDs.length; i++) {
            all[i] = patients[allPatientIDs[i]];
        }
        return all;
    }

    function getAllDoctors() public view returns (Doctor[] memory) {
        Doctor[] memory all = new Doctor[](allDoctorIDs.length);
        for (uint i = 0; i < allDoctorIDs.length; i++) {
            all[i] = doctors[allDoctorIDs[i]];
        }
        return all;
    }

    function bookingDetails(uint _doctorId) public view returns (SlotDetail[] memory) {
        return bookings[_doctorId];
    }
}