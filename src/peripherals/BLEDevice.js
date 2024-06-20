/**
* Oct. 2023
* Adaptation from https://www.youtube.com/watch?v=TsXUcAKi790. Nice site: https://hutscape.com/
* This example initially used the library p5.ble.js https://github.com/ITPNYU/p5.ble.js. 
* but it was withdrawn because it does not offer flexibility with multiple services. 
* The documentation is available at https://itpnyu.github.io/p5ble-website/docs/api 
* and an intro is at https://itp.nyu.edu/physcomp/labs/lab-bluetooth-le-and-p5-ble/
* 
* Notes:
* The technical documentation of the Web Bluetooth is avaiable at https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API
* GREAT EXAMPLES from Google: https://googlechrome.github.io/samples/web-bluetooth/
* Ideas Javascript + CSS + webBLE: https://www.youtube.com/watch?v=XDc5HUVMI5U
*/
class BLEDevice {

    constructor() {
       // this.deviceName = "Attractor" // scripted in the BLE device. See Arduino code.
        this.services = {
            retrievedCount: 0,
            kineService: "d1999a8e-a2df-4743-8071-958b1b20471b",
            attrService: "4948e5b3-22e8-4cd0-8c86-e4b62164e48b",
            senseService: "0cb412d9-8d10-4d98-b2d4-b1069258e9ff"
        }

        this.folSpeedChar = "E07BA7AA-D9B8-4003-BFAE-98C621EA3A23";
        this.cuAccChar = "7B80BE57-8F44-4FAB-8644-3459BD3E0D32";
        this.suAccChar = "FE0C9651-E876-4A7F-BBA4-EB19688150C7";
        this.proxChar = "F293676C-471D-4E77-AA26-DA3EE4405174";
        this.attSpeedChar = "CC628FF4-F8B7-4A39-8146-062EE6C73026";
        this.ledChar = "19B10011-E8F2-537E-4F6C-D104768A1214"; // scripted in the BLE device. See Arduino code. 

        this.deviceDetected;

        this.kineChars = {}
        this.attrChars = {}

        this.options = {
               acceptAllDevices: true
            // filters: [
            //     // { name: 'Attractor' },
            //     { services: [this.services.kineService] },
            //     { services: [this.services.attrService] }
            // ],
            // optionalServices: [this.services.kineService, this.services.attrService, this.services.senseService]
        }

        /** INITIALIZE GUI **/
        GUI.ledSwitchBtn.disabled = true;

    }

    /**
    * Triggers writting function from website to BLE device
    */
    detectAndConnect() {
        if (this.isWebBLEAvailable()) {
            if (!this.deviceDetected) {
                this.detectDeviceAndConnect();
              
            } else {
                if (this.deviceDetected.gatt.connected) {
                    this.deviceDetected.gatt.disconnect();
                    GUI.setBluetoothStatus('disconnected');
                    GUI.switchStatus(GUI.connectPeripheral, bluetoothDevice.deviceDetected.gatt.connected, { t: "Disconnect peripheral", f: "Connect peripheral" }, { t: "btn btn-success btn-lg btn-block", f: "btn btn-warning btn-lg btn-block" })
                } else {
                    this.detectDeviceAndConnect();
                }
            };
        }
    }

    /**
     * Switch device's debugging LED
     */
    switchLED() {
        // Read the current value in the BLE device
        if (this.attrChars.led) {
            this.attrChars.led.readValue().then(val => {
                //val is of type DataView
                let msg = val.getInt8();
                // switch the current led status
                if (msg == 0) { msg = 1 } else { if (msg == 1) msg = 0 }
                // write the new value to BLE device
                this.attrChars.led.writeValue(Uint8Array.of(msg));
            });
        }
    }



    /** FUNCTIONS **/

    /**Check if the browser is web BLE compatible   */
    isWebBLEAvailable() {
        if (!navigator.bluetooth) {
            alert("Web Bluetooth not available in this browser. For Android use Chrome, for iPhone use Bluefy ");
            return false;
        }
        return true;
    }

    /**
     * The main method to conect the peripheral and get its services and characteristics
     */
    detectDeviceAndConnect() {

        BLEUtils.writeLog("requesting BLE device info...");
        GUI.setBluetoothStatus('searching');
        console.log(this.options)

        navigator.bluetooth.requestDevice(this.options).then(device => {

            this.deviceDetected = device;
            BLEUtils.writeLog("Name: " + device.name);

            let rtn;

            if (this.deviceDetected != undefined) {
                BLEUtils.writeLog('Paired with: ' + device.name)
                rtn = Promise.resolve();
                GUI.switchStatus(GUI.connectPeripheral, true, { t: "Disconnect peripheral", f: "Connect peripheral" }, { t: "btn btn-success btn-lg btn-block", f: "btn btn-warning btn-lg btn-block" })

            } else {
                this.detectDeviceAndConnect();

            }

            return rtn.then(this.connectGATT())

        }).catch(error => {
            console.log("Request device error: " + error)
        })


    }

    connectGATT() {
        let rtn;
        if (this.deviceDetected.gatt.connected && this.services.retrievedCount >= 2) {
            BLEUtils.writeLog('GATT2 Promise resolved ...')
            return Promise.resolve();
        } else {
            BLEUtils.writeLog('Connecting GATT ...')
            this.deviceDetected.gatt.connect()
                .then(server => {
                    BLEUtils.writeLog('Getting GATT Service ...');
                    GUI.setBluetoothStatus('connected');
                    // getting the attractor services
                    rtn = server.getPrimaryService(this.services.attrService)
                        // getting the characteristics of attractor service
                        .then(service => {
                            this.retrieveCharacteristics(service)
                            BLEUtils.writeLog('Getting the characteristics of attractor service ...')
                        })
                        // getting the kinetics services
                        .then(server.getPrimaryService(this.services.kineService)
                            // getting the characteristics of kinects service
                            .then(service => {
                                this.retrieveCharacteristics(service);
                                BLEUtils.writeLog('Getting the characteristics of kinects service ...')
                            }));
                })
        }

        return rtn;
    }

    retrieveCharacteristics(service) {
        BLEUtils.writeLog('Service UUID: ' + service.uuid + '.\nGetting GATT Characteristic ...')
        let rtn = service.getCharacteristics().then(characteristics => {

            for (const instance of characteristics) {
                //console.log(instance.uuid);
                // store characteristics in their objects for earch service. 
                // There is an object for kinematics and another for attributes.

                switch (instance.uuid.toLowerCase()) {
                    case this.folSpeedChar.toLowerCase():
                        this.kineChars.followerSpeed = instance;
                        BLEUtils.writeLog('Follower Speed Characteristic found');
                        break;
                    case this.cuAccChar.toLowerCase():
                        this.kineChars.currentAcceleration = instance;
                        BLEUtils.writeLog('Follower Current acceleration Characteristic found');
                        break;
                    case this.suAccChar.toLowerCase():
                        this.kineChars.suggestedAcceleration = instance;
                        // sendStringBtn.disabled = false;
                        BLEUtils.writeLog('Suggested Acceleration Characteristic found');
                        break;


                    case this.proxChar.toLowerCase():
                        this.attrChars.proximity = instance;
                        BLEUtils.writeLog('Proximity Characteristic found');
                        break;
                    case this.attSpeedChar.toLowerCase():
                        this.attrChars.attractorSpeed = instance;
                        BLEUtils.writeLog('Attractor Speed Characteristic found');
                        break;
                    case this.ledChar.toLowerCase():
                        this.attrChars.led = instance;
                        GUI.ledSwitchBtn.disabled = false;
                        BLEUtils.writeLog('Led Characteristic found');
                        break;

                    default:
                        BLEUtils.writeLog('Not stored in object: ' + instance.uuid.toLowerCase())
                        break;
                }
            }
        })
        this.services.retrievedCount++;
        BLEUtils.writeLog("Characteristics comparison done!");
        return rtn;
    }
}