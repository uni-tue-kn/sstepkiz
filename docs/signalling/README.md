# Documentation: Signalling

## 1. Terminology

- **Client**: An application that is connected to a **Signalling Server** and can act as a **Caller** or a **Callee**. In terms of a Peer-to-Peer connection also known as **Peer**.
- **Caller**: A **Client** that calls a **Callee**.
- **Callee**: A **Client** that is called by a **Caller**.
- **Peer**: An application that is a participant of a Peer-to-Peer connection and acts as a **Caller** or a **Callee**. In terms of a Client-to-Server connection also known as **Client**.
- **Signalling Server**: The server application that exchanges information between **Client**s so that they can connect to each other directly with a Peer-to-Peer connection.
- **Subscriber**: A **Client** that listens to the availability state of another **Client**. E.g.: A **Receiver** is a **Subscriber** of a **Sender**.
- **Receiver**: A **Client** (typically of a therapist), that is receiving streams of sensor data. E.g.: The [Therapist UI](../../frontends/projects/therapist-ui/README.md).
- **Sender**: A **Client** (typically of a patient), that is generating sensor data out of the sensors and provides it to other **Client**s. E.g.: The aggregator software on the tablet of -he patient.
- **Monitor**: A **Client** (typically of a patient), that is monitoring the recording and streaming state of a **Sender**. E.g.: The [Patient UI](../../frontends/projects/patient-ui/README.md).

## 2. Registration

The Registration process between a Client and a [Signalling Server](../../backends/apps/signalling/README.md) is described here:

![Registration process](./res/signalling_connect.svg)

### 2.1. Connection to Signalling Server

First, the Client connects to the [Signalling Server](../../backends/apps/signalling/README.md) using a [WebSocket](https://tools.ietf.org/html/rfc6455) connection.
In the connection request URL, the Client uses query parameters to send a [`ConnectionRequest`](../../shared/src/signalling/connection-request.interface.ts), which contains the required parameter `mode`, to indicate its preferred [`DeviceType`](../../shared/src/signalling/device-type.enum.ts) to register as.
Since the [Signalling Server](../../backends/apps/signalling/README.md)'s [WebSocket](https://tools.ietf.org/html/rfc6455) backend is implemented using the Realtime application framework [Socket.io](https://github.com/socketio/socket.io), the endpoint for the connection request is `/socket.io/` which will be extended by the required query parameter `mode` to f.e. `/socket.io/?mode=receiver`.

The [Signalling Server](../../backends/apps/signalling/README.md) will then offer the supported [`AuthType`](../../shared/src/signalling/auth-type.enum.ts)s in a [`ConnectionResponse`](../../shared/src/signalling/connection-response.interface.ts).
Currently, only the [`AuthType`](../../shared/src/signalling/auth-type.enum.ts) `oauth` is supported, but for later use, more authentication types might be implemented.

### 2.2. Authentication

Normally, the [OAuth Access Token](https://tools.ietf.org/html/rfc6749#section-1.4) should be transferred using the [`Authorization` header](https://tools.ietf.org/html/rfc7235#section-4.2) will be used for this, but due to the poor [WebSocket implementation](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket) in the latest WebAPIs, this cannot be implemented in that standard-conform way.
So the only standard-conform way according to [RFC 6750](https://tools.ietf.org/html/rfc6750#section-2) to transfer the Access Token to the Signalling Server is to send it as the [URI Query Parameter](https://tools.ietf.org/html/rfc6750#section-2.3) `access_token`, which leads to security vulnerabilities.

As a workaround, the transfer of the Access Token is done as a parameter of the [`RegistrationRequest`](../../shared/src/signalling/registration-request.interface.ts) which has to be sent by the Client, before the Signalling Server closes the connection due to a missing registration.
The default time between the [`ConnectionResponse`](../../shared/src/signalling/connection-response.interface.ts) and the closing of the connection by the Signalling Server is 5 seconds, which is defined in the constant [`DEFAULT_REGISTRATION_TIMEOUT`](../../shared/src/signalling/default-timeouts.ts).
To check, if the Client is already registered after this timeout, the Signalling Server looks in the Database, if the Socket is already registered.

After receiving [`RegistrationRequest`](../../shared/src/signalling/registration-request.interface.ts), the SignallingServer validates the `accessToken` using the public key of the [Authorization Server](https://tools.ietf.org/html/rfc6749#section-1.1) (the Keycloak SSO).
This public key is loaded from the .PEM-encoded file, declared in the parameter `OIDC_PUBLIC_KEY_FILE` of the Signalling Server's configuration.

If the Access Token is valid, the Signalling Server registers the Client in the database by its username from the Access Token and the socket ID, which is generated uniquely by [Socket.io](https://github.com/socketio/socket.io) when the WebSocket connection was established.

The Signalling Server also requests all the subscribers from the Database.

#### Permissions

Depending on the `mode`, the following permissions are required:

- In case of `mode=monitor`, the role `patient` and the scope `signalling_monitor` is required.
- In case of `mode=receiver`, the role `therapist` and the scope `signalling_receive` is required.
- In case of `mode=sender`, the role `patient` and the scope `signalling_send` is required.

### 2.3. Registration Response and Status Updates

After a successful registration, the Signalling Server sends a [`UserState` message](../../shared/src/signalling/user-state.interface.ts) to all the Subscribers of the Client, which contains the updated availability state of the Client.
The Subscribers use this information to update their stored state of the Client.

Then, the Signalling Server sends a [`RegistrationResponse`](../../shared/src/signalling/registration-response.interface.ts) to the Client.
In case of a `mode` of `receiver` or `monitor`, this Response contains the Socket IDs and the usernames of the associated Senders.

## 3. Connection Establishment

The establishment of a connection between two peers is done as follows:

![Connection Establishment](./res/signalling_call.svg)

### 3.1. Call Request

The Caller sends a [`Call Request`](../../shared/src/signalling/call-request.interface.ts) to the Signalling Server, containing the Socket ID of the Callee and the `mode` of the requested connection.

The Signalling Server validates, if the Caller is registered with the requested `mode` and if it is permitted to call the Callee and if so, the Database generates a new Session with a unique Session ID.
If the validation fails, no Session is generated and the Caller will receive an error message.

If the validation passes, the Signalling Server sends a [`CallOffer`](../../shared/src/signalling/call-offer.interface.ts) to the Callee containing the requested `mode`, the `sessionId` and the `userId` and `socketId` of the Caller.

From now on, the Callee has by default 30 seconds time to decide, whether to accept or to decline the call. Otherwise the call times out and is handled as if it was declined. The default time is described in the constant [`DEFAULT_RING_TIMEOUT`](../../shared/src/signalling/default-timeouts.ts).

When the Signalling Server sent the `CallOffer` to the Callee, it sends a [`CallResponse`](../../shared/src/signalling/call-response.interface.ts) message to the Caller, containing the generated `sessionId`.

### 3.2. Call Response

When the Callee accepted or declined the call, it sends a [`CallAnswer`](../../shared/src/signalling/call-answer.interface.ts) message to the Signalling server.
This Answer contains a boolean `accepted`, indicating whether the Callee accepted (= `true`) or declined (= `false`) the call.

The Signalling Server validates that `CallAnswer` by checking the parameters in the Database and generates a [`CallAccept`](../../shared/src/signalling/call-accept.interface.ts) or a [`CallDecline`](../../shared/src/signalling/call-decline.interface.ts) message, depending on the `accepted` parameter and sends it to the Caller.

After the Caller received the `CallResponse`, it waits for either a `CallAccept` or a `CallDecline` message from the Signalling Server with the `sessionId` of the `CallResponse` and the `socketId` of the Callee.
If none of them is received within the Ring Timeout (`DEFAULT_RING_TIMEOUT`), the call is traded as if it was declined.

### 3.3. Exchange of Session Descriptions

The exchange of Session Description between two peers is done as follows:

![Exchange of Session Description](./res/signalling_sdp.svg)

Every time a negotiation is needed, which happens when a channel is opened or closed, the Client that recognizes, that a negotiation is needed (in our case Client A), creates a Session Description Offer.
This is done using [the WebRTC API function `createOffer()`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer) and will create a Session Description in terms of the [Session Description Protocol SDP](https://tools.ietf.org/html/rfc4566).
Using [the WebRTC API function `setLocalDescription()`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setLocalDescription), Client A defines its local description.

After that, Client A sends the created offer to the Signalling Server using a [`DescriptionOffer`](../../shared/src/signalling/description-offer.interface.ts).
In this case, the parameter `socketId` is traded as the Socket ID of Client B.

The Signalling Server validates, if Client A and Client B are in session, using the Database.
If valid, the Signalling Server sends a `DescriptionOffer` to Client B.
This time, the parameter `socketId` is traded as the Socket ID of Client A.
If invalid, the Signalling Server responds to Client A with an error message.

When Client B receives the `DescriptionOffer`, it applies the session description of Client A using [the WebRTC API function `setRemoteDescription()`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setRemoteDescription).
After that, it generates a Session Description Answer using [the WebRTC API function `createAnswer()`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer).
The generated Session Description then gets applied using [the WebRTC API function `setLocalDescription()`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setLocalDescription) and sent back to Client A in the same way, as Client A send its Session Description to Client B.

Client A then applies the Session Description of Client B from the received `DescriptionOffer` using [the WebRTC API function `setRemoteDescription()`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setRemoteDescription).

### 3.4. Exchange of ICE Candidates

To establish a Peer-to-Peer connection between two Clients, it is also necessary to exchange connection informations such as IP Addresses.
This is done using the [Interactive Connection Establishment (ICE) protocol](https://tools.ietf.org/html/rfc8445).

Therefore, the WebRTC API initiates the ICE protocol when creating a local description using [the WebRTC API function `setLocalDescription()`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setLocalDescription).
The [RTCPeerConnection class](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection) will then emit the `icecandidate` event, every time it finds a new ICE candidate.

Exchanging this ICE candidate is done equivalent to the exchanging of the Session Description and is depicted in the following:

![ICE candidate exchange](./res/signalling_candidates.svg)

When receiving an ICE candidate, Client A generates a [`CandidateOffer`](../../shared/src/signalling/candidate-offer.interface.ts) and sends it to the Signalling Server.
This time, the parameter `socketId` is treated as the Socket ID of Client B.

The Signalling Server validates the `CandidateOffer` in the same way as the `DescriptionOffer` and then sends a `CandidateOffer` to Client B.
This time, the parameter `socketId` is treated as the Socket ID of Client A.

Client B then stores the `candidate` of the received `CandidateOffer` using [the WebRTC API function `addIceCandidate`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addIceCandidate).

This procedure is done by the Caller and the Callee in the exact same way every time one of them receives an ICE Candidate.

Sending every ICE Candidate to the other Client allows the [ICE trickle technique](https://tools.ietf.org/html/draft-ietf-ice-trickle-21), which allows a faster connection establishment.

## 4. The Peer Protocol

After the exchange of Session Descriptions and suitable ICE Candidates, the WebRTC Peer-to-Peer connection is established automatically.

### 4.1. Authentication

Authentication is done using the native WebRTC authentication mechanism.
It is required to trust the Signalling Server.

### 4.2. Channels

Channels are used to transfer information between two peers.

There are two main types of a [`Channel`](../../shared/src/peer/channel.class.ts): [`TxChannel`](../../shared/src/peer/tx-channel.class.ts)s to send data and [`RxChannel`](../../shared/src/peer/rx-channel.class.ts)s to receive data.

In the SSteP-KiZ project, we have 5 different [`ChannelType`](../../shared/src/peer/channel-type.enum.ts)s:

- `ecg` for [`EcgData`](../../shared/src/sensors/ecg-data.interface.ts).
- `eda` for [`EdgData`](../../shared/src/sensors/eda-data.interface.ts).
- `eyetracking` for [`EyetrackingData`](../../shared/src/sensors/eyetracking-data.interface.ts).
- `monitoring` for [`MonitoringData`](../../shared/src/sensors/monitoring-data.interface.ts).
- `movement` for [`MovementData`](../../shared/src/sensors/movement-data.interface.ts).

For each of them, there is defined a [`TxChannel`](../../shared/src/peer/tx-channel.class.ts) and an [`RxChannel`](../../shared/src/peer/rx-channel.class.ts):

- [`EcgTxChannel`](../../shared/src/peer/ecg-tx-channel.class.ts) and [`EcgRxChannel`](../../shared/src/peer/ecg-rx-channel.class.ts).
- [`EdaTxChannel`](../../shared/src/peer/eda-tx-channel.class.ts) and [`EdaRxChannel`](../../shared/src/peer/eda-rx-channel.class.ts).
- [`EyeTrackingTxChannel`](../../shared/src/peer/eye-tracking-tx-channel.class.ts) and [`EyeTrackingRxChannel`](../../shared/src/peer/eye-tracking-rx-channel.class.ts).
- [`MonitoringTxChannel`](../../shared/src/peer/monitoring-tx-channel.class.ts) and [`MonitoringRxChannel`](../../shared/src/peer/monitoring-rx-channel.class.ts).
- [`MovementTxChannel`](../../shared/src/peer/movement-tx-channel.class.ts) and [`MovementRxChannel`](../../shared/src/peer/movement-rx-channel.class.ts).

**Important**: Keep track, that an instance of a `Channel` is **not exactly** an [`RTCDataChannel`](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel) and also **not always a simple wrapper**.
A `Channel` is more like an abstraction of **a set of `RTCDataChannel`s**.
For example: `EyeTrackingTxChannel` or `EyeTrackingRxChannel` combines an `RTCDataChannel` with a `MediaStreamTrack` to deliver the evaluated x/y/t data and also the field camera video track.

#### 4.2.1. Open Channel

Channels are opened by requesting a Channel from the remote Client.

Technically, this could be done using an in-bound channel connection to the remote Client that could be established at the beginning.
For the following reasons, we are using the Signalling Channel as an out-of-bound channel instead:

- **Logging**: We can log, which therapist requested which sensor data stream at which time.
- **Permissions**: The Signalling Server needs to hold the permissions anyway, so we do not need to care about synchronization of permissions between Client B and the Signalling Server.
- **Trust**: The Signalling Server needs to be trusted blindly anyway, so why do not trust him at this point again?

This is depicted in th following:

![Open Channel](./res/signalling_channel.svg)

Client A sends a [`ChannelRequest`](../../shared/src/signalling/channel-request.interface.ts) to the Signalling Server.
This time, the parameter `socketId` is treated as the Socket ID of Client B.

The Signalling Server validates the `ChannelRequest` in the same way as the `DescriptionOffer` and additionally checks, whether Client A is permitted to receive data of **all** the requested `types`.

If so, the Signalling Server redirects the `ChannelRequest` to Client B.
This time, the parameter `socketId` is treated as the Socket ID of Client B.

Since Client B can trust the Signalling Server, that he will not forward a not permitted `ChannelRequest`, every `ChannelRequest` will be accepted immediately and Client B will open a new Channel to Client A.

*Note: This may require a negotiation of the session, as described in 3.3.*

*Note: Since no Channel is open at the beginning of a connection, WebRTC may not emit any ICE candidate, so it is possible, that the peer-to-peer connection remains "virtually" until the first channel connection is established. This might increase the setup time of the first channel.*

### 4.3. Closing Connection

Since the [RTCDataChannel API](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel) natively implements closing of a data channel from both sides, it is not possible to prevent a malicious Client from closing a Channel without signalling it through the Signalling Server.
Therefore, we did not implement the closing of a Channel via the Signalling Server.

Instead, we use the RTCDataChannel's native implementation of closing the connection.

*Note: If it will become necessary in future, to log the closing of a connection, the most reliant way to do this, is to log the end of the connection on the Clients.*

## 5. Closing Connection

When a Client decides to close the connection to another Client, it also has to close the session.

This is depicted in the following:

![Connection Closing](./res/signalling_close.svg)

Client A sends a [`HangupMessage`](../../shared/src/signalling/hangup-message.interface.ts) to the Signalling Server containing the ID of the Session it wants to close.

The Signalling Server validates, if Client A is part of the specified Session, using the database.
If so, the Signalling Server sends a [`HangupOffer`](../../shared/src/signalling/hangup-offer.interface.ts) to all other participants of the Session and deletes the session.
In this case, the attribute `reason` of the `HangupOffer` has the value `hangup`.

When the Client loses the connection to the Signalling Server, the Signalling Server deletes the Session and sends a `HangupOffer` to the other Clients in the same way.
In that case, the attribute `reason` of the `HangupOffer` has the value `disconnect`.

To receive the `HangupOffer`, all Clients listen to the `SIGNALLING_EVENT_HANGUP_OFFER` event of the [`SignallingChannel`](../../shared/src/signalling/signalling-channel.ts), when they initiate or accept a call.
When they receive one, they close the WebRTC Peer Connection immediately.

## 6. Database Model

The Entity Relation Model looks as follows:

![Entity Relation Model](./res/signalling_erm.svg)

### 6.1. User

Implements the Users.

The User Entity has the following attributes:

#### userId

Type: `VARCHAR(255) NOT NULL`

Represents the username from the Single Sign On.

This is the `PRIMARY KEY` of the User Entity.

### 6.2. Permissions

Implements the permissions of one User towards another User.

The Permissions Entity has the following attributes:

#### subjectUserId

Type: `VARCHAR(255) NOT NULL`

Represents the username of the Subject User, which permits the Target User to access its data streams.

This is a `FOREIGN KEY` that references to the `userId` attribute of the User Entity by a Many-to-One relation.

The combination of the `subjectUserId` and `targetUserId` is `UNIQUE` and forms the `PRIMARY KEY` of the Permissions Entity.

#### targetUserId

Type: `VARCHAR(255) NOT NULL`

Represents the username of the Target User, which is permitted to access the data streams of the Subject User.

This is a `FOREIGN KEY` that references to the `userId` attribute of the User Entity by a Many-to-One relation.

The combination of the `targetUserId` and `subjectUserId` is `UNIQUE` and forms the `PRIMARY KEY` of the Permissions Entity.

#### ecg

Type: `BOOLEAN NOT NULL DEFAULT 0`

Indicates, if the Target User is permitted to access the ECG data stream of the Subject User.

#### eda

Type: `BOOLEAN NOT NULL DEFAULT 0`

Indicates, if the Target User is permitted to access the EDA data stream of the Subject User.

#### eyetracking

Type: `BOOLEAN NOT NULL DEFAULT 0`

Indicates, if the Target User is permitted to access the EyeTracking data and video stream of the Subject User.

#### movement

Type: `BOOLEAN NOT NULL DEFAULT 0`

Indicates, if the Target User is permitted to access the data stream of the movement sensors of the Subject User.

### 6.3. Monitor

Implements a socket registered as a Monitor device.

The Monitor Entity has the following attributes:

#### socketId

Type: `CHAR(20) NOT NULL`

Represents the unique identity of the socket registered as a Monitor.
This identity is generated by Socket.io.

This is the `PRIMARY KEY` of the Monitor Entity.

#### userUserId

Type: `VARCHAR(255) NOT NULL`

Represents the username of the user that owns the Monitor.

This is a `FOREIGN KEY` that references to the `userId` attribute of the User Entity by a Many-to-One relation.

### 6.4. Receiver

Implements a socket registered as a Receiver device.

The Receiver Entity has the following attributes:

#### socketId

Type: `CHAR(20) NOT NULL`

Represents the unique identity of the socket registered as a Receiver.
This identity is generated by Socket.io.

This is the `PRIMARY KEY` of the Receiver Entity.

#### userUserId

Type: `VARCHAR(255) NOT NULL`

Represents the username of the user that owns the Receiver.

This is a `FOREIGN KEY` that references to the `userId` attribute of the User Entity by a Many-to-One relation.

### 6.5. Sender

Implements a socket registered as a Sender device.

The Sender Entity has the following attributes:

#### socketId

Type: `CHAR(20) NOT NULL`

Represents the unique identity of the socket registered as a Sender.
This identity is generated by Socket.io.

This is the `PRIMARY KEY` of the Sender Entity.

#### userUserId

Type: `VARCHAR(255) NOT NULL`

Represents the username of the user that owns the Sender.

This is a `FOREIGN KEY` that references to the `userId` attribute of the User Entity by a Many-to-One relation.

### 6.6. Session

Implements an active Session between two Sockets.

The Session Entity has the following attributes:

#### sessionId

Type: `UUID NOT NULL DEFAULT uuid_generate_v4()`

Represents the universally unique identity of the session.

This is the `PRIMARY KEY` of the Session Entity.

#### monitorSocketId

Type: `CHAR(20)`

Represents the optional socket identity of the socket registered as a Monitor.

This is a `FOREIGN KEY` that references to the `socketId` attribute of the Monitor Entity by a Many-to-One relation.

#### receiverSocketId

Type: `CHAR(20)`

Represents the optional socket identity of the socket registered as a Receiver.

This is a `FOREIGN KEY` that references to the `socketId` attribute of the Receiver Entity by a Many-to-One relation.

#### senderSocketId

Type: `CHAR(20) NOT NULL`

Represents the socket identity of the socket registered as a Sender.

This is a `FOREIGN KEY` that references to the `socketId` attribute of the Sender Entity by a Many-to-One relation.

## 7. REST API

The REST API of the Signalling Server is provided as a .YAML file for [Swagger UI](https://swagger.io/tools/swagger-ui/) in [`/docs/signalling/signalling_api.yaml`](./signalling_api.yaml).
It can be edited using [Swagger Editor](https://editor.swagger.io/).

### 7.1. Security

There is a difference between the Swagger documentation and the implementation:
Additionally to the `scope` of the REST Endpoints, there is also a `role` required.

In case of the REST API for administration, the scope `signalling_admin` and the role `admin` is required.
