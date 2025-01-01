// Import required libraries
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import PatientManagementSystem from "./PatientManagementSystem.json"; // ABI file


// Main App Component
const App = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [registrationType, setRegistrationType] = useState("patient");
  const [formData, setFormData] = useState({});
  const [patientData, setPatientData] = useState([]);
  const [appointmentData, setAppointmentData] = useState([]);

  useEffect(() => {
    const initBlockchain = async () => {
      try {
        // Initialize Web3
        const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

        // Get network ID and contract details
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = PatientManagementSystem.networks[networkId];

        // Get accounts from MetaMask or Ganache
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]); // Set the first account as the current user

        // Initialize the contract
        if (deployedNetwork) {
          const instance = new web3.eth.Contract(
            PatientManagementSystem.abi,
            deployedNetwork.address
          );
          setContract(instance); // Save the contract instance to state
        } else {
          alert("Contract not deployed to the detected network.");
        }
      } catch (error) {
        console.error("Error initializing blockchain:", error);
        alert("Could not connect to blockchain. Ensure MetaMask or Ganache is running.");
      }
    };

    initBlockchain(); // Call the function when the component is mounted
  }, []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const registerUser = async (e) => {
    e.preventDefault();
    const { id, name, age, gender, district, symptomsDetails } = formData;

    try {
      if (registrationType === "patient") {
        await contract.methods
          .registerPatient(account, id, age, gender, district, symptomsDetails)
          .send({ from: account, gas: 3000000 });
      } else if (registrationType === "doctor") {
        await contract.methods
          .registerDoctor(account, id, name)
          .send({ from: account, gas: 3000000 });
      } else {
        alert("Admin registration not supported in the UI.");
      }

      alert("User registered successfully");
    } catch (error) {
      console.error(error);
      alert("Registration failed.");
    }
  };

  const fetchPatients = async () => {
    try {
      const patients = await contract.methods.getAllPatients().call();
      setPatientData(patients);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch patients.");
    }
  };

  const bookAppointment = async (e) => {
    e.preventDefault();
    const { doctorId, slot, patientId } = formData;

    try {
      await contract.methods
        .bookAppointment(doctorId, slot, patientId)
        .send({ from: account, gas: 3000000, value: Web3.utils.toWei("1", "ether") });
      alert("Appointment booked successfully.");
    } catch (error) {
      console.error(error);
      alert("Booking failed.");
    }
  };

  const fetchAppointments = async () => {
    try {
      const appointments = await contract.methods
        .bookingDetails(formData.doctorId)
        .call();
      setAppointmentData(appointments);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch appointments.");
    }
  };

  return (
    <div>
      <h1>Patient Management System</h1>
      <p>Connected Account: {account}</p>

      <section>
        <h2>Registration</h2>
        <form onSubmit={registerUser}>
          <label>
            Type:
            <select
              value={registrationType}
              onChange={(e) => setRegistrationType(e.target.value)}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </label>
          <input name="id" placeholder="ID" onChange={handleInputChange} />
          {registrationType === "doctor" && (
            <input name="name" placeholder="Name" onChange={handleInputChange} />
          )}
          {registrationType === "patient" && (
            <>
              <input name="age" placeholder="Age" onChange={handleInputChange} />
              <input name="gender" placeholder="Gender" onChange={handleInputChange} />
              <input
                name="district"
                placeholder="District"
                onChange={handleInputChange}
              />
              <input
                name="symptomsDetails"
                placeholder="Symptoms"
                onChange={handleInputChange}
              />
            </>
          )}
          <button type="submit">Register</button>
        </form>
      </section>

      <section>
        <h2>Patient List</h2>
        <button onClick={fetchPatients}>Fetch Patients</button>
        <ul>
          {patientData.map((patient, index) => (
            <li key={index}>{JSON.stringify(patient)}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Book Appointment</h2>
        <form onSubmit={bookAppointment}>
          <input
            name="doctorId"
            placeholder="Doctor ID"
            onChange={handleInputChange}
          />
          <input
            name="slot"
            placeholder="Slot (0-23)"
            onChange={handleInputChange}
          />
          <input
            name="patientId"
            placeholder="Patient ID"
            onChange={handleInputChange}
          />
          <button type="submit">Book Appointment</button>
        </form>
      </section>

      <section>
        <h2>Appointments</h2>
        <input
          name="doctorId"
          placeholder="Doctor ID"
          onChange={handleInputChange}
        />
        <button onClick={fetchAppointments}>Fetch Appointments</button>
        <ul>
          {appointmentData.map((appointment, index) => (
            <li key={index}>{JSON.stringify(appointment)}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default App;
