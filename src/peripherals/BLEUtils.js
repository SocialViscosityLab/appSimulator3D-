class BLEUtils {
    static writeLog(message) {
        GUI.error.innerHTML = GUI.error.innerHTML + '<br>' + '> ' + message;
    }

    static writeStringToBLE(characteristic, inputValue) {
        if (!characteristic || !characteristic.uuid) console.error('The characteristic does not exist.');

        let bufferToSend = null;
        if (typeof inputValue === 'string') {
            bufferToSend = BLEUtils.stringToArrayBuffer(inputValue);
        } else {
            BLEUtils.writeLog(inputValue + " not a type of string")
        }
        //BLEUtils.writeLog('Sent: ' + BLEUtils.bytesToString(bufferToSend))
        try {
            return characteristic.writeValue(bufferToSend);
        } catch (error) {
            
        }
        
    }

    /**
     * Source Make:Bluetooth
     * @param {*} str 
     */
    static stringToArrayBuffer(str) {
        // assuming 8 bits
        let ret = new Uint8Array(str.length);
        for (let i = 0; i < str.length; i++) {
            ret[i] = str.charCodeAt(i);
            //BLEUtils.writeLog(ret[i]);
        }
        return ret.buffer;
    }

    /**
     * Source Make:Bluetooth
     * @param {*} buffer 
     */
    static bytesToString(buffer) {
        return String.fromCharCode.apply(null, new Uint8Array(buffer));
    }
}