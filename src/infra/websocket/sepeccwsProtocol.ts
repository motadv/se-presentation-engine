type SEPECCWSMessage = SEPECCWSRequestCapabilities | SEPECCWSResponseCapabilities | SEPECCWSAction;
// This type represents the different types of messages that can be sent over the SEPECC WebSocket connection.

interface SEPECCWSRequestCapabilities {
    command: "requestCapabilities"; // The command is a string that indicates the type of message
    body: string; // The body is a stringified JSON object
}

interface SEPECCWSResponseCapabilities {
    command: "responseCapabilities"; // The command is a string that indicates the type of message
    body: string; // The body is a stringified JSON object
}

interface SEPECCWSAction {
    command: "action"; // The command is a string that indicates the type of message
    body: string; // The body is a stringified JSON object
}